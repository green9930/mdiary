import { APP_NAME } from "@/shared/sharedConstants";
import type { LogoSizeType } from "@/types/styleTypes";
import PencilIcon from "@/assets/icon_pencil.svg";

// 글자 단계와 연필 아이콘 크기 (토큰 5-7)
const SIZE_CLASSES: Record<LogoSizeType, { text: string; icon: string }> = {
  lg: { text: "text-logo-lg", icon: "size-8" },
  md: { text: "text-logo", icon: "size-4.5" },
};

interface LogoProps {
  size?: LogoSizeType;
}

// 로고: "다씀" + 연필 아이콘, primary 색 (토큰 5-7). 스크린 리더는 "다씀"만 읽는다
const Logo = ({ size = "md" }: LogoProps) => {
  const { text, icon } = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex cursor-default items-center font-logo text-primary ${text}`}
    >
      {APP_NAME.ko}
      <PencilIcon aria-hidden className={icon} />
    </span>
  );
};

export default Logo;
