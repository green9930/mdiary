import { requireSessionUser } from "@/server/session";
import { PAGE_TITLES, PATHS } from "@/shared/sharedConstants";

// 임시: F8에서 검색 화면으로 바꾼다
const SearchPage = async () => {
  await requireSessionUser(PATHS.search);

  return (
    <main className="p-4">
      <h1 className="text-title-l">{PAGE_TITLES.search}</h1>
    </main>
  );
};

export default SearchPage;
