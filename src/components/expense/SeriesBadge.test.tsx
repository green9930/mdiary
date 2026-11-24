import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SeriesBadge from "@/components/expense/SeriesBadge";

describe("SeriesBadge (화면 명세 SC-03·04·05 반복 배지)", () => {
  it("정기지출은 계속이든 기간이 있든 '정기'를 보여준다", () => {
    const { rerender } = render(
      <SeriesBadge series={{ type: "RECURRING", seq: 2, totalCount: null }} />,
    );
    expect(screen.getByText("정기")).toBeInTheDocument();
    rerender(
      <SeriesBadge series={{ type: "RECURRING", seq: 2, totalCount: 6 }} />,
    );
    expect(screen.getByText("정기")).toBeInTheDocument();
  });

  it("할부는 회차/총 회차를 보여준다", () => {
    render(
      <SeriesBadge series={{ type: "INSTALLMENT", seq: 3, totalCount: 12 }} />,
    );
    expect(screen.getByText("할부 3/12")).toBeInTheDocument();
  });
});
