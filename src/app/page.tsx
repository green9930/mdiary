"use client";

import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddExpense = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "무신사",
          content: "후드집업",
          category: "의류",
          amount: 10000,
          userId: "geuna0204@gmail.com",
        }),
      });

      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-8 py-32 px-16">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Expense Test
        </h1>

        <button
          onClick={handleAddExpense}
          disabled={loading}
          className="rounded-full bg-foreground px-8 py-3 text-background font-medium transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          {loading ? "추가 중..." : "TEST"}
        </button>

        {result && (
          <pre className="w-full max-w-md rounded-lg bg-zinc-100 p-4 text-sm text-black dark:bg-zinc-900 dark:text-zinc-50">
            {result}
          </pre>
        )}
      </main>
    </div>
  );
}
