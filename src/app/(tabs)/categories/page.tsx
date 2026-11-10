import { requireSessionUser } from "@/server/session";
import { PAGE_TITLES, PATHS } from "@/shared/sharedConstants";

// 임시: F7에서 카테고리 화면으로 바꾼다
const CategoriesPage = async () => {
  await requireSessionUser(PATHS.categories);

  return (
    <main className="p-4">
      <h1 className="text-title-lg">{PAGE_TITLES.categories}</h1>
    </main>
  );
};

export default CategoriesPage;
