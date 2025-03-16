import CategoryPage from "~/components/CategoryPage";

export default function CategoryPageWrapper({
  params,
}: {
  params: { id: string };
}) {
  return <CategoryPage id={params.id} />;
}
