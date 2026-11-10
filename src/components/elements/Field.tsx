import type { ReactNode } from "react";

interface FieldProps {
  /** 입력칸의 id. 라벨·보조 문구를 이 id로 잇는다 */
  id: string;
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}

/** 보조 문구(오류·안내)의 id. 입력칸의 aria-describedby에 쓴다 */
export const fieldMessageId = (id: string) => `${id}-message`;

// 라벨 · 입력 · 아래 보조 문구 (토큰 5-2: 라벨과 입력 사이 8, 입력과 보조 문구 사이 4)
const Field = ({ id, label, error, hint, children }: FieldProps) => {
  const message = error ?? hint;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-body text-text01">
          {label}
        </label>
      )}
      <div className="flex flex-col gap-1">
        {children}
        {message && (
          <p
            id={fieldMessageId(id)}
            className={`text-caption ${
              error ? "text-danger-text" : "text-text02"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Field;
