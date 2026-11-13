
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { text, source, target } = await req.json();

        if (!text?.trim() || !source || !target) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const params = new URLSearchParams({
            q: text,
            langpair: `${source}|${target}`,
        });

        const response = await fetch(
            `https://api.mymemory.translated.net/get?${params.toString()}`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Translation service failed");
        }

        const data = await response.json();

        if (data.responseStatus !== 200) {
            return NextResponse.json(
                { message: data.responseDetails || "Translation failed" },
                { status: 502 }
            );
        }

        return NextResponse.json({
            translatedText: data.responseData.translatedText,
        });
    } catch {
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}
