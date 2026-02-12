"use client";

import { useState, useRef, useEffect } from "react";
import TagLink from "./TagLink";

export default function HiddenTagsToggle({
  tags,
}: {
  tags: { name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <span ref={ref} className="text-xs text-gray-400 dark:text-gray-500 relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        +{tags.length}
      </button>
      {open && (
        <span className="absolute left-0 bottom-full z-20 pb-1 text-xs whitespace-nowrap">
          <span className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            {tags.map((t) => (
              <TagLink key={t.name} name={t.name} />
            ))}
          </span>
        </span>
      )}
    </span>
  );
}
