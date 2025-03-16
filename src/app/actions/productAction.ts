import { api } from "~/trpc/server";

export const fetchProducts = async ({ id }: { id: number }) => {
  const products = await api.product.fetchProductById(id);
  return products;
};
