import { useEffect, useLayoutEffect, useRef } from "react";

// 뒤로 가기로 겹친 화면(바텀시트·다이얼로그)을 다룬다 (화면 명세 공통 규약 · 다이얼로그, 바텀시트).
// 열 때 같은 주소로 기록을 하나 쌓고, 뒤로 가기가 오면 맨 위 층만 반응한다.
// 시트는 닫히고(close), 다이얼로그는 기록을 다시 쌓아 그대로 남는다(block).
// 버튼 등으로 닫으면 쌓았던 기록을 스스로 되돌린다.

const STATE_KEY = "mdiaryLayer";

interface Layer {
  id: number;
  mode: "close" | "block";
  onBack: () => void;
  pushed: boolean;
  popped: boolean;
}

const layers: Layer[] = [];
let nextId = 1;
// 스스로 부른 history.back()의 popstate는 무시한다
let ignoredPops = 0;
let listening = false;

const pushEntry = (id: number) => {
  window.history.pushState({ ...window.history.state, [STATE_KEY]: id }, "");
};

const onPopState = () => {
  if (ignoredPops > 0) {
    ignoredPops -= 1;
    return;
  }
  const top = layers.at(-1);
  if (!top) return;
  if (top.mode === "block") {
    pushEntry(top.id);
    return;
  }
  layers.pop();
  top.popped = true;
  top.onBack();
};

const listen = () => {
  if (listening) return;
  window.addEventListener("popstate", onPopState);
  listening = true;
};

/** 테스트용: 쌓인 층을 비운다 */
export const resetHistoryLayers = () => {
  layers.length = 0;
  ignoredPops = 0;
};

/**
 * open인 동안 뒤로 가기를 가로챈다.
 * - close: 뒤로 가기 → onBack (시트 닫기)
 * - block: 뒤로 가기를 무시한다 (다이얼로그는 버튼으로만 닫힌다)
 */
export const useHistoryLayer = (
  open: boolean,
  mode: Layer["mode"],
  onBack: () => void = () => {},
) => {
  const onBackRef = useRef(onBack);
  useLayoutEffect(() => {
    onBackRef.current = onBack;
  });

  useEffect(() => {
    if (!open) return;
    const layer: Layer = {
      id: nextId++,
      mode,
      onBack: () => onBackRef.current(),
      pushed: false,
      popped: false,
    };
    // 개발 모드(Strict Mode)는 effect를 두 번 실행한다. 다음 틱에 쌓아 기록이 두 개 생기지 않게 한다
    const timer = window.setTimeout(() => {
      listen();
      pushEntry(layer.id);
      layer.pushed = true;
      layers.push(layer);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      const index = layers.indexOf(layer);
      if (index >= 0) layers.splice(index, 1);
      // 화면을 옮겨 닫힌 경우(기록이 이미 다른 주소)는 되돌리지 않는다
      if (
        layer.pushed &&
        !layer.popped &&
        window.history.state?.[STATE_KEY] === layer.id
      ) {
        ignoredPops += 1;
        window.history.back();
      }
    };
  }, [open, mode]);
};
