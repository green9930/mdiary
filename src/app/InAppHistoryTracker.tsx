"use client";

import { useTrackInAppHistory } from "@/hooks/useGoBack";

// 화면 없이 앱 안 이동만 기록한다 (useGoBack)
const InAppHistoryTracker = () => {
  useTrackInAppHistory();
  return null;
};

export default InAppHistoryTracker;
