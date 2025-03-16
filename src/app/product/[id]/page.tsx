import ProductDetail from "~/components/ProductDetail";
import { fetchProducts } from "~/app/actions/productAction";

const ProductPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const product = await fetchProducts({ id: parseInt(id) });
  return <ProductDetail product={product} />;
};

export default ProductPage;
