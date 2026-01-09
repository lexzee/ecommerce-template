import { AddToCartButton } from "@/components/add_to_cart_button";
import { ProductGallery } from "@/components/product_gallery";
import { ProductReviews } from "@/components/reviews/product_reviews";
import { siteConfig } from "@/config/site";
import { createTypedClient } from "@repo/database";
import { Separator } from "@workspace/ui/components/separator";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const [url, key] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
];

export default async function RenderProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = createTypedClient(url, key);
  const { slug } = await params;

  // Fetch Product
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("category", siteConfig.niche)
    .eq("slug", slug)
    .single();

  if (!product) {
    notFound();
  }

  const attributes = product.attributes as Record<string, any>;

  // Helper for price
  const formattedPrice = new Intl.NumberFormat(
    siteConfig.billing.currency.locale,
    {
      style: "currency",
      currency: siteConfig.billing.currency.code,
    }
  ).format(product.price);

  // Truncation Logic
  const DESCRIPTION_LIMIT = 250;
  const isLongDescription = product.description.length > DESCRIPTION_LIMIT;
  const shortDescription = isLongDescription
    ? `${product.description.slice(0, DESCRIPTION_LIMIT).trim()}...`
    : product.description;

  return (
    <div className="container mx-auto px-4 py-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left Column: Gallery */}
        <div className="h-fit lg:sticky lg:top-24">
          <ProductGallery images={product.images || []} />
        </div>

        {/* Right Column: Details */}
        <div className="space-y-8">
          {/* Header Info */}
          <div className="space-y-4">
            <div>
              {attributes.brand && (
                <Link
                  href={`/?brand=${attributes.brand}`}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-2 inline-block"
                >
                  {attributes.brand}
                </Link>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {product.name}
              </h1>
            </div>

            <div className="text-2xl font-bold text-primary">
              {formattedPrice}
            </div>
          </div>

          <Separator />

          {/* Short Description */}
          <div className="space-y-3">
            <div className="prose prose-sm dark:prose-invert text-muted-foreground leading-relaxed">
              <p>{shortDescription}</p>
            </div>

            {isLongDescription && (
              <Link
                href={`/product/${slug}/description`}
                className="inline-flex items-center text-sm font-medium text-primary hover:underline group"
              >
                Read full description
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          {/* Action Area */}
          <div className="pt-4">
            <AddToCartButton product={product} />
          </div>

          {/* Specs / Attributes */}
          {attributes && Object.keys(attributes).length > 0 && (
            <div className="pt-6">
              <h3 className="font-semibold text-foreground mb-4">
                Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
                  >
                    <span className="text-xs text-muted-foreground capitalize font-medium mb-1">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span
                      className="text-sm font-semibold truncate"
                      title={String(value)}
                    >
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <ProductReviews productId={product.id} />
    </div>
  );
}
