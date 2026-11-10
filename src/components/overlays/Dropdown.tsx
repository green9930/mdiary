"use client";

import { useEffect, useId, useRef, useState } from "react";

import Button from "@/components/elements/Button";
import ArrowDropIcon from "@/assets/icon_arrow_drop_up.svg";

interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string> {
  options: readonly DropdownOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  "aria-label": string;
  /** 메뉴를 버튼의 어느 쪽 끝에 맞출지 */
  align?: "start" | "end";
}

// 드롭다운 (와이어프레임 CG ⑥, 토큰 5-3): 버튼 바로 아래 펼치는 메뉴.
// 항목을 고르거나 바깥을 누르면 닫힌다. 고른 항목은 tint 면 (체크 표시 없음)
const Dropdown = <T extends string>({
  options,
  value,
  onValueChange,
  align = "start",
  "aria-label": ariaLabel,
}: DropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <Button
        variant="line"
        size="sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${ariaLabel}: ${selected?.label ?? ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        {selected?.label}
        <ArrowDropIcon aria-hidden className="-mr-1 size-4 rotate-180" />
      </Button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute top-full z-10 mt-1 min-w-37.5 rounded-lg bg-bg py-1.5 shadow-1 transition-opacity duration-(--duration-dropdown) dark:border dark:border-line starting:opacity-0 ${
            align === "end" ? "right-0" : "left-0"
          }`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className={`flex h-11 cursor-pointer items-center px-4 text-body whitespace-nowrap ${
                  isSelected
                    ? "bg-tint font-bold text-on-tint"
                    : "text-text01 active:bg-surface"
                }`}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
