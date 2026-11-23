import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google"; // 🚀 Next-Gen ultra-lightweight Google Gemini provider
import { streamText } from "ai"; // Core streamlined real-time streaming parser wrapper

// High-Performance Full-Stack Homogeneous Sandbox Route
export async function GET(req: NextRequest) {
  try {
    // 1. Intercept search queries out of the relative url parameters safely
    const { searchParams } = new URL(req.url);
    const clientKeyword =
      searchParams.get("echo") ||
      "Write a one-sentence greeting to an elite fullstack web developer.";

    // 2. Trigger the Vercel AI SDK Core Engine to target 'gemini-2.5-flash'
    // It provides premium inference logic windows and is 100% free to operate
    const responseStream = streamText({
      model: google("gemini-3.8-flash"),
      prompt: clientKeyword,
      temperature: 0.7,
    });

    // 3. Transmit native Server-Sent Events (SSE) text streams back to host origins
    // 🚀 FIXED: Used 'toTextStreamResponse()' to match strict modern Vercel AI SDK TypeScript compiler expectations for pure string streaming
    return responseStream.toTextStreamResponse();
  } catch (error: unknown) {
    // FIXED: Replaced unsafe 'any' with 'unknown' constraint type to comply safely with strict TypeScript audits
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected core system failure occurred.";
    console.error("Critical Exception caught inside test route:", errorMessage);

    return NextResponse.json(
      { error: `Infrastructure Tunnel Fault: ${errorMessage}` },
      { status: 500 },
    );
  }
}
