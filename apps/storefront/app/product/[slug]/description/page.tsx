import { siteConfig } from "@/config/site";
import { createTypedClient } from "@repo/database";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const [url, key] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
];

export default async function ProductDescriptionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = createTypedClient(url, key);
  const { slug } = await params;

  // Fetch only necessary fields
  const { data: product } = await supabase
    .from("products")
    .select("name, description")
    .eq("category", siteConfig.niche)
    .eq("slug", slug)
    .single();

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <div className="mb-6">
        <Link href={`/product/${slug}`}>
          <Button
            variant="ghost"
            className="gap-2 pl-0 hover:pl-2 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Product
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Description: <span className="text-primary">{product.name}</span>
        </h1>

        {/* Using 'prose' (Tailwind Typography) ensures long text 
           is readable with proper line-height and spacing.
           'whitespace-pre-wrap' preserves paragraph breaks from the database.
        */}
        <div className="prose prose-stone dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-foreground/90">
          {product.description}
        </div>
      </div>
    </div>
  );
}
