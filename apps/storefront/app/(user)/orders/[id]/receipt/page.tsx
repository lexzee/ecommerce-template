import { siteConfig } from "@/config/site";

import { getUserManually } from "@/lib/supabase/proxy";
import { createClient } from "@/lib/supabase/client";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ReceiptDetails } from "./receipt_details";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReceiptPage({ params }: PageProps) {
  const address = siteConfig.contact.address;
  const { id } = await params;

  const user = await getUserManually();
  if (!user) redirect("/login");

  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      `
                *,
                order_items (
                    *,
                    products (name, attributes)
                )
            `
    )
    .match({ id: id, user_id: user.id })
    .single();

  if (!order) return notFound();

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 min-h-screen text-black">
      <Suspense fallback={<ReceiptSkeleton />}>
        <ReceiptDetails id={id} />
      </Suspense>

      {/* Print Specific CSS Override */}
      <style>{`
        @media print {
          @page { margin: 0.5cm; }
          body { -webkit-print-color-adjust: exact; }
          /* Hide standard Next.js layout elements if they leak in */
          header, footer, nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function ReceiptSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-4 bg-gray-200 w-1/4 mb-4"></div>
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 w-full"></div>
        <div className="h-8 bg-gray-200 w-full"></div>
        <div className="h-8 bg-gray-200 w-full"></div>
      </div>
    </div>
  );
}
