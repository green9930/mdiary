"use client";

import { type ReactNode, useState } from "react";

import Badge from "@/components/elements/Badge";
import Button, {
  type TButtonSize,
  type TButtonVariant,
} from "@/components/elements/Button";
import Checkbox from "@/components/elements/Checkbox";
import Chip from "@/components/elements/Chip";
import IconButton from "@/components/elements/IconButton";
import ListItem from "@/components/elements/ListItem";
import NumberInput from "@/components/elements/NumberInput";
import Radio from "@/components/elements/Radio";
import Segment from "@/components/elements/Segment";
import Spinner from "@/components/elements/Spinner";
import TextArea from "@/components/elements/TextArea";
import TextInput from "@/components/elements/TextInput";
import BottomSheet from "@/components/overlays/BottomSheet";
import Dialog from "@/components/overlays/Dialog";
import Dropdown from "@/components/overlays/Dropdown";
import ArrowLeftIcon from "@/assets/icon_arrow_left.svg";
import CardIcon from "@/assets/icon_card.svg";
import CloseIcon from "@/assets/icon_close.svg";
import ElectricalIcon from "@/assets/icon_electrical.svg";
import FoodIcon from "@/assets/icon_food.svg";

const VARIANTS: { variant: TButtonVariant; label: string }[] = [
  { variant: "primary", label: "저장" },
  { variant: "secondary", label: "보조 동작" },
  { variant: "outline", label: "기록 추가하기" },
  { variant: "line", label: "취소" },
  { variant: "text", label: "개인정보처리방침" },
  { variant: "danger", label: "삭제" },
  { variant: "gray", label: "나가기" },
];

const SIZES: TButtonSize[] = ["m", "s"];

const REPEAT_OPTIONS = [
  { value: "none", label: "없음" },
  { value: "monthly", label: "정기지출" },
  { value: "installment", label: "할부" },
] as const;

const PERIOD_OPTIONS = [
  { value: "forever", label: "계속" },
  { value: "months", label: "개월 수" },
] as const;

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "amount", label: "금액 큰 순" },
] as const;

type TOpenDialog = "leave" | "delete" | "alert" | null;

const CHIPS = ["전체", "식비", "가전", "교통", "의료", "의류", "미용"];

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

const Section = ({ id, title, children }: SectionProps) => (
  <section
    id={id}
    className="flex flex-col gap-4 border-b border-line px-4 py-6"
  >
    <h2 className="text-title-m">{title}</h2>
    {children}
  </section>
);

interface CaptionProps {
  children: ReactNode;
}

const Caption = ({ children }: CaptionProps) => (
  <p className="text-caption text-text-sub">{children}</p>
);

const ComponentsPreview = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("참치김밥 2줄\n회사 앞 분식집");
  const [months, setMonths] = useState("");
  const [repeat, setRepeat] = useState<"none" | "monthly" | "installment">(
    "none",
  );
  const [period, setPeriod] = useState<"forever" | "months">("months");
  const [chip, setChip] = useState("전체");
  const [record, setRecord] = useState(true);
  const [agree, setAgree] = useState(false);
  const [scope, setScope] = useState("this");
  const [sort, setSort] = useState<"latest" | "oldest" | "amount">("latest");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [longSheetOpen, setLongSheetOpen] = useState(false);
  const [dialog, setDialog] = useState<TOpenDialog>(null);
  const [sheetMemo, setSheetMemo] = useState("");
  const closeDialog = () => setDialog(null);

  return (
    <main className="mx-auto min-h-dvh max-w-120 min-w-80 pb-16">
      <h1 className="px-4 pt-6 text-title-l">공통 컴포넌트</h1>

      <Section id="buttons" title="버튼">
        {VARIANTS.map(({ variant, label }) => (
          <div key={variant} className="flex flex-wrap items-center gap-2">
            {SIZES.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {label}
              </Button>
            ))}
            <Button variant={variant} loading>
              {label}
            </Button>
            <Button variant={variant} disabled>
              {label}
            </Button>
          </div>
        ))}
        <Caption>종류별: 기본 M · S · 요청 중 · 비활성</Caption>
        <Button size="l">저장</Button>
        <Button size="l" disabled>
          저장
        </Button>
        <Caption>L (하단 고정, 폭 전체) · 비활성</Caption>
      </Section>

      <Section id="icon-buttons" title="아이콘 버튼 · 스피너">
        <div className="flex items-center gap-2">
          <IconButton aria-label="뒤로">
            <ArrowLeftIcon />
          </IconButton>
          <IconButton aria-label="닫기">
            <CloseIcon />
          </IconButton>
          <IconButton aria-label="뒤로 (비활성)" disabled>
            <ArrowLeftIcon />
          </IconButton>
          <Spinner label="불러오는 중" className="text-text-sub" />
        </div>
      </Section>

      <Section id="inputs" title="입력">
        <TextInput
          label="제목"
          placeholder="제목을 입력해 주세요"
          maxLength={25}
          value={title}
          onValueChange={setTitle}
        />
        <TextInput
          label="제목 (값 있음)"
          maxLength={25}
          value="점심 김밥"
          onValueChange={() => {}}
        />
        <TextInput
          label="제목 (한도)"
          maxLength={25}
          value="가나다라마바사아자차카타파하가나다라마바사아자차카"
          onValueChange={() => {}}
        />
        <TextInput
          label="제목 (오류)"
          placeholder="제목을 입력해 주세요"
          maxLength={25}
          value=""
          error="제목을 입력해 주세요."
          onValueChange={() => {}}
        />
        <TextInput
          label="금액 (단위)"
          inputMode="numeric"
          className="font-num"
          value="8,000"
          unit="원"
          onValueChange={() => {}}
        />
        <TextInput
          label="제목 (비활성)"
          value="월세"
          disabled
          onValueChange={() => {}}
        />
        <TextArea
          label="내용 (선택)"
          placeholder="메모"
          maxLength={200}
          value={memo}
          onValueChange={setMemo}
        />
      </Section>

      <Section id="number-inputs" title="개월 수 · 회차 입력">
        <div className="flex flex-wrap gap-4">
          <NumberInput
            label="기간"
            unit="개월"
            placeholder="2~99"
            value={months}
            onValueChange={setMonths}
          />
          <NumberInput
            label="회차"
            unit="회"
            value="12"
            onValueChange={() => {}}
          />
          <NumberInput
            label="회차 (오류)"
            unit="회"
            value="1"
            error="2부터 입력할 수 있습니다."
            onValueChange={() => {}}
          />
        </div>
      </Section>

      <Section id="selects" title="선택 컨트롤">
        <Segment
          aria-label="반복"
          options={REPEAT_OPTIONS}
          value={repeat}
          onValueChange={setRepeat}
        />
        <Segment
          aria-label="기간"
          options={PERIOD_OPTIONS}
          value={period}
          onValueChange={setPeriod}
        />
        <Segment
          aria-label="반복 (비활성)"
          options={REPEAT_OPTIONS}
          value="monthly"
          onValueChange={() => {}}
          disabled
        />
        <div className="flex gap-1.5 overflow-x-auto py-1.5">
          {CHIPS.map((name) => (
            <Chip
              key={name}
              selected={chip === name}
              onClick={() => setChip(name)}
            >
              {name}
            </Chip>
          ))}
        </div>
        <div>
          <Checkbox checked={record} onCheckedChange={setRecord}>
            계산식을 내용에 기록
          </Checkbox>
          <Checkbox checked={agree} onCheckedChange={setAgree}>
            위 내용을 확인했습니다
          </Checkbox>
          <Checkbox checked={false} onCheckedChange={() => {}} disabled>
            비활성
          </Checkbox>
        </div>
        <div role="radiogroup" aria-label="범위">
          <Radio
            name="scope"
            value="this"
            checked={scope === "this"}
            onSelect={setScope}
          >
            이번 건만
          </Radio>
          <Radio
            name="scope"
            value="after"
            checked={scope === "after"}
            onSelect={setScope}
          >
            이후 전체
          </Radio>
          <Radio
            name="scope"
            value="months"
            checked={scope === "months"}
            onSelect={setScope}
            disabled
            hint="안내 문구 초안: 날짜를 뒤 달로 옮기면 고를 수 없습니다."
          >
            이 건부터 N개월
          </Radio>
        </div>
      </Section>

      <Section id="overlays" title="바텀시트 · 다이얼로그 · 드롭다운">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setSheetOpen(true)}>
            시트 열기
          </Button>
          <Button variant="outline" onClick={() => setLongSheetOpen(true)}>
            스크롤 시트
          </Button>
          <Button variant="line" onClick={() => setDialog("leave")}>
            확인 다이얼로그
          </Button>
          <Button variant="line" onClick={() => setDialog("delete")}>
            삭제 확인
          </Button>
          <Button variant="line" onClick={() => setDialog("alert")}>
            알림 다이얼로그
          </Button>
        </div>
        <div className="flex justify-end">
          <Dropdown
            aria-label="정렬"
            align="end"
            options={SORT_OPTIONS}
            value={sort}
            onValueChange={setSort}
          />
        </div>
        <Caption>드롭다운: 버튼 아래 펼침, 오른쪽 맞춤</Caption>
      </Section>

      <Section id="list" title="목록 항목 · 배지">
        <div>
          <ListItem
            icon={<FoodIcon />}
            iconClassName="bg-cat-food/15 text-cat-food"
            title="점심 김밥"
            amount="8,000원"
          />
          <ListItem
            icon={<CardIcon />}
            iconClassName="bg-cat-etc/15 text-cat-etc"
            title="넷플릭스 스탠다드 요금제 월 구독료"
            badge={<Badge>정기</Badge>}
            amount="13,300원"
          />
          <ListItem
            icon={<ElectricalIcon />}
            iconClassName="bg-cat-appliance/15 text-cat-appliance"
            title="아이패드"
            badge={<Badge>할부 2/3</Badge>}
            subtitle="11.01"
            amount="100,000원"
          />
        </div>
      </Section>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="기간 선택"
        footer={
          <Button size="l" onClick={() => setSheetOpen(false)}>
            적용
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <Segment
            aria-label="기간 끝"
            options={PERIOD_OPTIONS}
            value={period}
            onValueChange={setPeriod}
          />
          <TextInput
            label="메모 (키보드 확인용)"
            maxLength={25}
            value={sheetMemo}
            onValueChange={setSheetMemo}
          />
          <Button variant="danger" onClick={() => setDialog("delete")}>
            시트 위에 다이얼로그
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={longSheetOpen}
        onClose={() => setLongSheetOpen(false)}
        title="긴 내용"
      >
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i} className="py-2">
            {i + 1}번째 줄
          </p>
        ))}
      </BottomSheet>

      <Dialog
        open={dialog === "leave"}
        confirmLabel="나가기"
        confirmVariant="gray"
        onConfirm={closeDialog}
        cancelLabel="계속 작성"
        cancelVariant="primary"
        onCancel={closeDialog}
      >
        작성 중인 내용이 사라집니다.
        <br />
        나가시겠습니까?
      </Dialog>
      <Dialog
        open={dialog === "delete"}
        confirmLabel="삭제"
        confirmVariant="danger"
        onConfirm={closeDialog}
        cancelLabel="취소"
        onCancel={closeDialog}
      >
        이 기록을 삭제하시겠습니까?
      </Dialog>
      <Dialog
        open={dialog === "alert"}
        title="저장하지 못했습니다"
        confirmLabel="확인"
        onConfirm={closeDialog}
      >
        잠시 후 다시 시도해 주세요.
      </Dialog>
    </main>
  );
};

export default ComponentsPreview;
