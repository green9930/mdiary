import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CategoryIcon from "@/components/category/CategoryIcon";

describe("CategoryIcon (토큰 2-4·2-5·5-4)", () => {
  it.each([
    ["FOOD", "icon_food", "bg-cat-food/15 text-cat-food"],
    ["LIVING", "icon_person", "bg-cat-living/15 text-cat-living"],
    ["ETC", "icon_card", "bg-cat-etc/15 text-cat-etc"],
  ] as const)(
    "%s는 %s 아이콘을 카테고리 색 원 안에 그린다",
    (category, icon, colorClass) => {
      const { container } = render(<CategoryIcon category={category} />);
      const circle = container.firstElementChild;
      expect(circle).toHaveClass(...colorClass.split(" "));
      expect(circle?.querySelector("svg")).toHaveAttribute("data-icon", icon);
    },
  );

  it("스크린 리더는 읽지 않는다 (이름은 옆 글자가 알린다)", () => {
    const { container } = render(<CategoryIcon category="FOOD" />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
