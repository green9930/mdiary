import CalendarView from "@/components/calendar/CalendarView";
import { convertToKSTStr } from "@/lib/date";
import { requireSessionUser } from "@/server/session";
import { PATHS } from "@/shared/sharedConstants";

interface CalendarPageProps {
  searchParams: Promise<{ month?: string; date?: string }>;
}

// 월간 달력 (화면 명세 SC-03). 쿼리 month·date는 CalendarView가 읽고 고친다
const CalendarPage = async ({ searchParams }: CalendarPageProps) => {
  const query = new URLSearchParams(
    Object.entries(await searchParams).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  ).toString();
  await requireSessionUser(
    query ? `${PATHS.calendar}?${query}` : PATHS.calendar,
  );

  return <CalendarView today={convertToKSTStr()} />;
};

export default CalendarPage;
