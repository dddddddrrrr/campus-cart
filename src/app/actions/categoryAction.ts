import { api } from "~/trpc/server";

export const fetchCategories = async () => {
  const categories = await api.category.fetchCategories();
  return categories;
};
