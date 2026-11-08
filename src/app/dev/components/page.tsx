import { notFound } from "next/navigation";

import ComponentsPreview from "./ComponentsPreview";

export const metadata = { title: "공통 컴포넌트 견본" };

// 공통 컴포넌트 견본 (F0-2 리뷰·스크린샷·E2E용). 운영 빌드에서는 404
const ComponentsPage = () => {
  if (process.env.NODE_ENV === "production") notFound();
  return <ComponentsPreview />;
};

export default ComponentsPage;
