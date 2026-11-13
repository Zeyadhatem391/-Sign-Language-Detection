
export async function GET() {
  try {
    const response = await fetch(
      "https://api.munsit.com/api/v1/voices",
      {
        headers: {
          "x-api-key": process.env.MUNSIT_API_KEY!,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return Response.json(
        { message: "Failed to fetch voices" },
        { status: response.status }
      );
    }

    const voices = await response.json();

    return Response.json(voices);
  } catch {
    return Response.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
