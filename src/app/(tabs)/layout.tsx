import TabBar from "@/components/layout/TabBar";

// 하단 탭 바가 있는 화면: 달력·카테고리·검색·설정 (화면 명세 SC-01)
interface TabsLayoutProps {
  children: React.ReactNode;
}

const TabsLayout = ({ children }: TabsLayoutProps) => {
  return (
    <div className="mx-auto min-h-dvh max-w-120 min-w-80 pb-tab-bar">
      {/* F10: 오프라인 배너 자리 (모든 화면 상단 고정) */}
      {children}
      <TabBar />
    </div>
  );
};

export default TabsLayout;
