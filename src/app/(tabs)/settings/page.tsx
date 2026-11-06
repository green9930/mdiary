import { requireSessionUser } from "@/server/session";
import { PAGE_TITLES, PATHS } from "@/shared/sharedConstants";

// 임시: F9에서 설정 화면으로 바꾼다
const SettingsPage = async () => {
  await requireSessionUser(PATHS.settings);

  return (
    <main className="p-4">
      <h1 className="text-title-l">{PAGE_TITLES.settings}</h1>
    </main>
  );
};

export default SettingsPage;
