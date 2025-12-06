import { notFound } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { productsService } from "@/services/product.service";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  try {
    const product = await productsService.getProductDetail(id);
    return <ProductForm product={product} isEditing />;
  } catch (error) {
    notFound();
  }
}
