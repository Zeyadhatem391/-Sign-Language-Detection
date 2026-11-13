
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, speed, stability } = await req.json();

    if (!text?.trim() || !voiceId) {
      return NextResponse.json(
        { message: "Text and voice are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.munsit.com/api/v1/text-to-speech/faseeh-v1-preview",
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.MUNSIT_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          speed: speed ?? 1,
          stability: stability ?? 0.5,
          streaming: false,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();

      return NextResponse.json(error, {
        status: response.status,
      });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
