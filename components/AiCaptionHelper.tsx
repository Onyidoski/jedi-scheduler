'use client';

import { useCompletion } from '@ai-sdk/react';
// This line is now fixed (no extra '}')
import React, { useState } from 'react';
import { Wand2 } from 'lucide-react'; // For a nice icon

// Define the props our component will accept
interface AiCaptionHelperProps {
  // This is the 'setCaption' function from your create/page.tsx
  setMainCaption: (caption: string) => void;
}

export function AiCaptionHelper({ setMainCaption }: AiCaptionHelperProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // This new state will hold the clean list of caption strings
  const [parsedCaptions, setParsedCaptions] = useState<string[]>([]);

  const {
    completion,
    input,
    handleInputChange,
    // --- We use 'complete' ---
    complete,
    isLoading,
  } = useCompletion({
    // --- THIS IS THE FIX ---
    // Change this URL to match your API route file path
    api: '/api/generate',
    // --- END FIX ---
    
    onError: (err) => {
      console.error('Error from AI completion:', err);
      setErrorMessage(err.message);
    },
    // This parses the final response
    onFinish: (_prompt, fullCompletion) => {
      // When the AI is done, we parse the text it sent
      const lines = fullCompletion.split('\n');
      const options = lines
        // Find lines that start with a bullet or number
        .filter(line => line.trim().startsWith('*') || /^\d+\./.test(line.trim()))
        // Clean up the string to get just the caption text
        .map(line => 
          line.trim()
              .replace(/^\*|^\d+\./, '') // Remove bullet or number
              .replace(/\*\*([^*]+)\*\*:/i, '') // Remove "**Option 1:**"
              .replace(/"/g, '') // Remove quotation marks
              .replace(/\*/g, '') // Remove inline asterisks
              .trim()
        );
      
      setParsedCaptions(options);
    },
  });

  // --- This is our click handler ---
  const handleGenerateClick = () => {
    setErrorMessage(null);
    setParsedCaptions([]);
    // Call 'complete' with the current prompt text
    complete(input);
  };

  // --- This is our "Enter" key handler ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Stop the form from submitting and reloading the page
      e.preventDefault();
      // Run the same function as the button click
      handleGenerateClick();
    }
  };

  const handleCaptionClick = (caption: string) => {
    // When a user clicks a suggestion, update the main caption state
    setMainCaption(caption);
  };

  return (
    // We remove the border/shadow, as it will live inside your form
    <div className="w-full"> 
      <div className="space-y-3">
        <div>
          <label htmlFor="ai-prompt" className="block text-sm font-medium text-slate-300 mb-3">
            AI Caption Helper
          </label>
          <div className="flex gap-2">
            <input
              id="ai-prompt"
              name="prompt"
              value={input}
              onChange={handleInputChange}
              // --- Add the onKeyDown handler ---
              onKeyDown={handleKeyDown}
              placeholder="e.g., 'A witty caption for a video about tables...'"
              className="flex-1 p-3 rounded-xl border border-white/10 bg-[#141619] text-white placeholder:text-slate-600 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] outline-none transition-all resize-none disabled:opacity-50"
              disabled={isLoading}
            />
            <button
              type="button"
              // --- Update the onClick handler ---
              onClick={handleGenerateClick}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all border-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Wand2 className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {/* Display the error message if it exists */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
          <p className="text-sm font-medium text-red-200">An Error Occurred</p>
          <p className="text-sm text-red-300">{errorMessage}</p>
        </div>
      )}

      {/* This section displays the clickable caption buttons */}
      {parsedCaptions.length > 0 && !errorMessage && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-slate-400">AI Suggestions (Click to use):</h4>
          <div className="flex flex-wrap gap-2">
            {parsedCaptions.map((caption, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleCaptionClick(caption)}
                className="text-left px-3 py-2 bg-[#141619] text-slate-300 rounded-lg border border-white/10 hover:bg-[#8B5CF6]/20 hover:border-[#8B5CF6] transition-all"
              >
                {caption}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}