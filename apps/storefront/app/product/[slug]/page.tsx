import { Suspense } from "react";
import RenderProductPage from "./render_page";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense>
      <RenderProductPage params={params} />
    </Suspense>
  );
}
