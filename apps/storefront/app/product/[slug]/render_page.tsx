import { AddToCartButton } from "@/components/add_to_cart_button";
import { ProductGallery } from "@/components/product_gallery";
import { ProductReviews } from "@/components/reviews/product_reviews";
import { siteConfig } from "@/config/site";
import { createTypedClient } from "@repo/database";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div>
          <ProductGallery images={product.images || []} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="space-y-2">
            {/* <h1 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            <p className="text-muted-foreground capitalize mt-2 text-lg">
              {product.category}
            </p> */}
            <h1 className="text-lg tracking-tight">{product.name}</h1>
            <p className="text-xs">
              Brand:{" "}
              {attributes.brand ? (
                <Link
                  href={`/?brand=${attributes.brand}`}
                  className="text-blue-500"
                >
                  {attributes.brand} | Similar products from {attributes.brand}
                </Link>
              ) : (
                "not available"
              )}
            </p>
            <div className="text-xl font-bold">
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(product.price)}
            </div>
          </div>

          {/* <Card className="prose prose-sm max-w-none text-gray-600"> */}
          <Card className="gap-2">
            <CardHeader className="border-b">
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{product.description.slice(0, 5000)}</p>
            </CardContent>
          </Card>

          {/* Attributes Table */}
          {attributes && Object.keys(attributes).length > 0 && (
            <Card className="border rounded-md bg-gray-50 dark:bg-gray-900/50">
              <CardHeader>
                <CardTitle className="font-semibold mb-3">
                  Product Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                {Object.entries(attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between sm:block border-b-0 sm:border-0 pb-2 sm:pb-0 border-gray-600"
                  >
                    <dt className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </dt>
                    <dd className="text-sm font-semibold">{String(value)}</dd>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Action Area */}
          <div className="pt-6 border-t flex items-center w-full">
            <AddToCartButton product={product} />
            {/* <div className="w-full sm:w-1/2"></div> */}
          </div>
        </div>
      </div>
      <ProductReviews productId={product.id} />
    </div>
  );
}
