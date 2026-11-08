"use client";

import Link from "next/link";
import type { FC, SVGProps } from "react";

import { useTabNavigation } from "@/hooks/useTabNavigation";
import {
  PAGE_TITLES,
  PATHS,
  TABS_LIST,
  type TTab,
} from "@/shared/sharedConstants";
import AddIcon from "@/assets/icon_add.svg";
import CalendarIcon from "@/assets/icon_calendar.svg";
import GridIcon from "@/assets/icon_grid.svg";
import SearchIcon from "@/assets/icon_search.svg";
import SettingsIcon from "@/assets/icon_settings.svg";

// 탭 아이콘 (토큰 2-5)
const TAB_ICONS: Record<TTab["path"], FC<SVGProps<SVGSVGElement>>> = {
  [PATHS.calendar]: CalendarIcon,
  [PATHS.categories]: GridIcon,
  [PATHS.search]: SearchIcon,
  [PATHS.settings]: SettingsIcon,
};

// 하단 탭 바 (화면 명세 SC-01, 토큰 5-7)
const TabBar = () => {
  const { current, tabHref, newExpenseHref } = useTabNavigation();

  const [left, right] = [TABS_LIST.slice(0, 2), TABS_LIST.slice(2)];
  const renderTab = (tab: TTab) => {
    const active = tab === current;
    const Icon = TAB_ICONS[tab.path];
    return (
      <Link
        key={tab.path}
        href={tabHref(tab)}
        aria-current={active ? "page" : undefined}
        className={`flex h-full flex-col items-center justify-center gap-0.5 text-micro ${
          active ? "font-bold text-accent" : "text-text-sub"
        }`}
      >
        <Icon className={`size-6 ${active ? "text-brand" : ""}`} />
        {tab.label}
      </Link>
    );
  };

  return (
    <nav
      aria-label="주요 화면"
      className="fixed inset-x-0 bottom-0 mx-auto max-w-120 border-t border-line bg-bg pb-safe"
    >
      <div className="grid h-14 grid-cols-5">
        {left.map(renderTab)}
        <Link
          href={newExpenseHref}
          aria-label={PAGE_TITLES.newExpense}
          className="mx-auto -mt-3 grid size-13 place-items-center self-start rounded-full bg-primary text-on-primary shadow-2 active:bg-primary-pressed dark:border dark:border-line"
        >
          <AddIcon className="size-7" />
        </Link>
        {right.map(renderTab)}
      </div>
    </nav>
  );
};

export default TabBar;
