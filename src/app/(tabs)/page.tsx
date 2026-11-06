import { requireSessionUser } from "@/server/session";
import { PAGE_TITLES, PATHS } from "@/shared/sharedConstants";

// 임시: F3에서 달력 화면으로 바꾼다
const CalendarPage = async () => {
  await requireSessionUser(PATHS.calendar);

  return (
    <main className="p-4">
      <h1 className="text-title-l">{PAGE_TITLES.calendar}</h1>
    </main>
  );
};

export default CalendarPage;
