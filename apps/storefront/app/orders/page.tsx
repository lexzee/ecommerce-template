import { Suspense } from "react";
import RenderOrdersPage from "./render_page";

export default async function OrdersPage() {
  return (
    <Suspense>
      <RenderOrdersPage />
    </Suspense>
  );
}
