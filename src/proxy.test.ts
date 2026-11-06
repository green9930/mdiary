import { describe, expect, it } from "vitest";

import { redirectTarget } from "./proxy";

const url = (path: string) => new URL(path, "http://localhost:3000");

describe("redirectTarget (화면 명세 RT)", () => {
  it("세션 없이 화면에 들어오면 원래 경로를 담아 로그인으로 보낸다", () => {
    expect(redirectTarget(url("/calendar?month=2026-10"), false)).toBe(
      "/login?next=%2Fcalendar%3Fmonth%3D2026-10",
    );
  });

  it("세션이 있으면 그대로 둔다", () => {
    expect(redirectTarget(url("/calendar"), true)).toBeNull();
  });

  it("세션 없이 로그인 화면에 오면 그대로 둔다", () => {
    expect(redirectTarget(url("/login?next=%2Fsearch"), false)).toBeNull();
  });

  it("세션이 있는 채로 로그인 화면에 오면 next로 보낸다", () => {
    expect(redirectTarget(url("/login?next=%2Fsearch"), true)).toBe("/search");
  });

  it("next가 외부 주소면 /로 보낸다", () => {
    expect(redirectTarget(url("/login?next=%2F%2Fevil.example"), true)).toBe(
      "/",
    );
  });

  it("만료·탈퇴로 온 로그인 화면은 쿠키가 남아 있어도 그대로 둔다", () => {
    expect(
      redirectTarget(url("/login?next=%2F&reason=expired"), true),
    ).toBeNull();
    expect(redirectTarget(url("/login?reason=withdrawn"), true)).toBeNull();
  });
});
