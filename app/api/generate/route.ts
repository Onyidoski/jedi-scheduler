import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GOOGLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error.' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

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

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      prompt: directPrompt,
    });

    return result.toUIMessageStreamResponse();

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: "An error occurred generating captions.", 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}