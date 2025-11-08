import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await streamText({
    model: google("gemini-1.5-flash"),
    system: "You are a viral social media expert. You write short, engaging captions for TikTok and Instagram videos. Include 3-5 relevant hashtags at the end. Do not use quotation marks.",
    prompt: prompt,
  });

  // FIX: Changed from toDataStreamResponse() to toTextStreamResponse()
  return result.toTextStreamResponse();
}   