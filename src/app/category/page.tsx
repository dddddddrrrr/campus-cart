import { fetchCategories } from "~/app/actions/categoryAction";
import CategoryContent from "~/components/CategoryContent";

const CategoryPage = async () => {
  const categories = await fetchCategories();
  return (
    <div>
      <CategoryContent categories={categories} />
    </div>
  );
};

export default CategoryPage;
