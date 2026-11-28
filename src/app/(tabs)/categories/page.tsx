import CategoriesView from "@/components/categories/CategoriesView";
import { convertToKSTStr } from "@/lib/date";
import { requireSessionUser } from "@/server/session";
import { PATHS } from "@/shared/sharedConstants";

interface CategoriesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// 카테고리별 (화면 명세 SC-04). 쿼리 from·to·category·sort는 CategoriesView가 읽고 고친다
const CategoriesPage = async ({ searchParams }: CategoriesPageProps) => {
  const query = new URLSearchParams(
    Object.entries(await searchParams).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  ).toString();
  await requireSessionUser(
    query ? `${PATHS.categories}?${query}` : PATHS.categories,
  );

  return <CategoriesView today={convertToKSTStr()} />;
};

export default CategoriesPage;
