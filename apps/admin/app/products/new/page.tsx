import { ProductForm } from "@/components/products/ProductForm";

const NewProductPage = () => {
  return (
    <div className="flex-1 space-y-4 p-2 sm:p-8 pt-6">
      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <ProductForm />
      </div>
    </div>
  );
};

export default NewProductPage;
