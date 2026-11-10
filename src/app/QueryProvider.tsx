"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

import { createQueryClient } from "@/lib/queryClient";

interface QueryProviderProps {
  children: ReactNode;
}

// 조회 캐시. 브라우저 탭마다 하나만 만든다
const QueryProvider = ({ children }: QueryProviderProps) => {
  const [client] = useState(createQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default QueryProvider;
