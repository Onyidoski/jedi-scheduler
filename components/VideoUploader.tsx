'use client';

import { createClient } from '@/lib/supabase/client';
import { CloudUpload, Loader2, Video, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import * as tus from 'tus-js-client';

// Props that this component will accept
interface VideoUploaderProps {
  onUploadSuccess: (filePath: string, fileName: string) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}

// These must be set in your .env.local file
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function VideoUploader({ onUploadSuccess, onUploadStart, onUploadEnd }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentUpload, setCurrentUpload] = useState<tus.Upload | null>(null);

  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size (5GB limit)
    if (selectedFile.size > 5 * 1024 * 1024 * 1024) {
      setUploadError("File is too large. Max 5GB.");
      return;
    }

    setFile(selectedFile);
    setUploadError(null);
    setUploadProgress(0);
    startUpload(selectedFile);
  };

  const startUpload = async (fileToUpload: File) => {
    if (!fileToUpload) return;

    onUploadStart();
    setIsUploading(true);
    setUploadError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated for upload.");

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) throw new Error("Could not get user session.");
      const token = sessionData.session.access_token;

      // 1. Create a unique file path
      const fileExt = fileToUpload.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // 2. Create a new Tus upload instance
      const upload = new tus.Upload(fileToUpload, {
        endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${token}`,
          'x-upsert': 'true', // Supabase requires this to overwrite
        },
        uploadDataDuringCreation: true,
        metadata: {
          bucketName: 'Videos',
          objectName: filePath,
          contentType: fileToUpload.type,
          cacheControl: '3600',
        },
        chunkSize: 6 * 1024 * 1024, // 6MB chunks
        onError: (error) => {
          console.error("Failed to upload:", error);
          setUploadError(`Upload failed. Please try again.`);
          setIsUploading(false);
          onUploadEnd();
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setUploadProgress(Number(percentage));
        },
        onSuccess: () => {
          console.log("Upload successful!");
          setIsUploading(false);
          onUploadSuccess(filePath, fileToUpload.name); // Pass the path back
          onUploadEnd();
        },
      });

      // 3. Start the upload
      upload.start();
      setCurrentUpload(upload);

    } catch (error: any) {
      console.error("Error setting up upload:", error);
      setUploadError(`Error: ${error.message}`);
      setIsUploading(false);
      onUploadEnd();
    }
  };

  const cancelUpload = () => {
    if (currentUpload) {
      currentUpload.abort(true); // Abort the upload
      setCurrentUpload(null);
    }
    setFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    onUploadEnd();
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-3 text-slate-300">Video File</label>
      <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-all relative group ${file ? 'border-[#8B5CF6] bg-[#8B5CF6]/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
        
        {!isUploading && !file && (
          <>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-[#141619] text-slate-500 group-hover:text-slate-300 transition-colors">
                <CloudUpload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-300 font-medium text-lg">Drag & drop or click to upload</p>
                <p className="text-sm text-slate-500 mt-1">MP4, MOV. Resumable. (Max 5GB)</p>
              </div>
            </div>
          </>
        )}

        {file && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-[#8B5CF6] text-white">
              <Video className="w-8 h-8" />
            </div>
            <p className="text-white font-medium text-lg">{file.name}</p>
            
            {isUploading && (
              <div className="w-full space-y-2 mt-4">
                <div className="w-full bg-[#141619] rounded-full h-2.5 border border-white/10">
                  <div 
                    className="bg-[#8B5CF6] h-2.5 rounded-full transition-all" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-300">{uploadProgress.toFixed(0)}% complete</p>
              </div>
            )}

            {uploadError && (
              <div className="text-red-400 text-sm p-3 bg-red-900/50 rounded-md mt-4">
                {uploadError}
              </div>
            )}
            
            {/* Show Cancel button only during upload */}
            {isUploading ? (
              <button
                type="button"
                onClick={cancelUpload}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors z-30"
              >
                <XCircle className="w-4 h-4" /> Cancel Upload
              </button>
            ) : (
              // Show "Change file" button if not uploading (or error)
              <button
                type="button"
                onClick={cancelUpload} // 'cancel' just resets the state, which is what we want
                className="mt-4 flex items-center gap-2 px-4 py-2 text-slate-400 hover:bg-slate-700/50 rounded-lg transition-colors z-30"
              >
                <XCircle className="w-4 h-4" /> Remove File
              </button>
            )}
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-[#1A1D21]/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
            <Loader2 className="w-10 h-10 text-[#8B5CF6] animate-spin" />
          </div>
        )}
        
      </div>
    </div>
  );
}