import { GoogleGenAI } from "@google/genai";
import { createTypedClient } from "@repo/database";
import { NextResponse } from "next/server";

const supabase = createTypedClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { id, name, description, category, attributes } = await req.json();

    if (!id || !description) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const textToEmbed = `
        Product: ${name}
        Description: ${description}
        Category: ${category}
        Attributes: ${JSON.stringify(attributes)}
        `.trim();

    const response = await genAI.models.embedContent({
      model: "text-embedding-004",
      contents: [
        {
          role: "user",
          parts: [{ text: textToEmbed }],
        },
      ],
    });

    const embedding = response.embeddings?.[0]?.values;

    if (!embedding) {
      throw new Error("Failed to generate embedding");
    }

    const { error } = await supabase.from("product_embeddings").insert({
      id: id,
      embedding: JSON.stringify(embedding),
    });

    if (error) {
      console.error("Supabase Error: ", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sucess: true }, { status: 200 });
  } catch (e) {
    console.error("Embedding Error: ", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
