import { siteConfig } from "@/config/site";
import { GoogleGenAI } from "@google/genai";
import { createTypedClient } from "@repo/database";
import { NextResponse } from "next/server";

const [url, key] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
];
const supabase = createTypedClient(url, key);

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const embeddingResponse = await genAI.models.embedContent({
      model: "text-embedding-004",
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    const userEmbedding = embeddingResponse.embeddings?.[0]?.values;

    if (!userEmbedding) {
      throw new Error("Failed to generate embedding");
    }

    // Search Supabase
    const { data: products, error } = await supabase.rpc("match_products", {
      // @ts-ignore
      query_embedding: userEmbedding,
      match_threshold: 0.5,
      match_count: 4,
    });

    if (error) {
      console.error("Supase Search Error:", error);
      //   Fallback: If search fails, just chat without product context
    }

    // Construct prompt
    const contextText = products
      ?.map(
        (p) =>
          `Product: ${p.name} | Price: ₦${p.price} | Category: ${p.category} | ID: ${p.id} | Slug: ${p.slug}`
      )
      .join("\n");

    const systemPrompt = `
      You are a helpful AI Shopping Assistant for a store called "${siteConfig.name}" Your name is "Braille".

      Here is the context of products matching the user's query:
      ${contextText || "No relevant products found."}

      Rules:
      1. Only recommend products from the list above.
      2. If you recommend a product, format it strictly as: [Product Name](/product/slug) - so it becomes a clickable link.
      3. Be concise, friendly, and helpful.
      4. If no products match, ask the user clarifying questions.
      5. Do not hallucinate products not in the list.
    `;

    // Generate the Answer
    const chatResponse = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt + "\n\nUser Query: " + message }],
        },
      ],
    });

    return NextResponse.json({
      response: chatResponse.text,
      products: products,
    });
  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" + JSON.parse(error).message },
      { status: 500 }
    );
  }
}
