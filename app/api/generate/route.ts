import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Get the prompt from the user's request
    const { prompt } = await req.json();

    // --- START DEBUGGING ---
    console.log('API Route: /api/generate-caption called.');
    console.log('User prompt:', prompt);

    if (!process.env.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not set in .env.local');
      return new Response(
        'Server error: API key not configured.', 
        { status: 500 }
      );
    }
    // --- END DEBUGGING ---

    // Initialize the Google AI provider
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // --- NEW DIRECT PROMPT ---
    // We combine the instructions and the user's prompt into one.
    // This is more direct and avoids a "chat" response.
    const directPrompt = `
You are an AI social media caption generator.
Your single task is to write a caption based on the following user request.
Do not talk about the request or your role. Just generate the text.
Generate 5 different captions and separate them with bullet points

---
USER REQUEST:
"${prompt}"
---

YOUR GENERATED CAPTION(S):
`;
    // --- END NEW DIRECT PROMPT ---


    // Ask Gemini for a streaming text response
    const result = await streamText({
      model: google('gemini-2.5-flash'),
      prompt: directPrompt, // Use our new combined prompt
      
      // We no longer need the separate 'system' prompt
    });

    // Convert the AI's response to a stream and send it to the frontend
    // THIS IS THE CORRECT FIX:
    return result.toUIMessageStreamResponse();

  } catch (error) {
    // --- START DEBUGGING ---
    console.error('Error in API route:', error);
    
    // Send a structured error response to the client
    // This will trigger the `onError` in `useCompletion`
    return new Response(
      JSON.stringify({ 
        error: "An error occurred on the server.", 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    // --- END DEBUGGING ---
  }
}