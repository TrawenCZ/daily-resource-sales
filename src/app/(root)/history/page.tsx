"use client";

import LoadingAnimation from "@/components/LoadingAnimation";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

const historyListSchema = z
  .object({ id: z.number(), date: z.coerce.date() })
  .array();

export default function HistoryPage() {
  const [closings, setClosings] = useState<z.infer<
    typeof historyListSchema
  > | null>(null);
  const page = useSearchParams().get("p");

  useEffect(() => {
    axios
      .get(`/api/closing/list/${page}`)
      .then((res) => historyListSchema.safeParseAsync(res.data))
      .then((parseRes) => {
        if (parseRes.success) return setClosings(parseRes.data);
        throw Error(parseRes.error.message);
      })
      .catch((err) => console.error(err));
  }, [page]);

  return (
    <div className="flex justify-center mt-8">
      {closings ? (
        <div className="container flex flex-col">
          <h1 className="font-bold text-4xl mb-4">Uložené uzávěrky</h1>
          <div className="flex gap-y-3 gap-3">
            {closings.map((c) => (
              <Link
                key={c.id}
                href={`/history/${c.id}`}
                className="btn btn-outline"
              >
                {c.date.toLocaleDateString()}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center w-full">
          <LoadingAnimation />
        </div>
      )}
    </div>
  );
}
