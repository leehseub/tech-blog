"use client";

import { useState, useEffect, useCallback } from "react";

interface TocItem {
  id: string;
  text: string;
}

const HEADER_OFFSET = 80;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      const text = match[1].replace(/[`*_~\[\]]/g, "");
      headings.push({ id: slugify(text), text });
    }
  }
  return headings;
}

export default function TableOfContents({ content }: { content: string }) {
  const headings = extractHeadings(content);
  const [activeId, setActiveId] = useState("");

  const handleScroll = useCallback(() => {
    let current = "";
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (!el) continue;
      // heading이 헤더 라인(HEADER_OFFSET + 여유)을 지났으면 active 후보
      if (el.getBoundingClientRect().top <= HEADER_OFFSET + 20) {
        current = h.id;
      }
    }
    setActiveId(current);
  }, [headings]);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (headings.length === 0) return null;

  return (
    <nav className="max-h-[calc(100vh-8rem)] overflow-y-auto text-sm">
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3">목차</p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (el) {
                  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
                  window.scrollTo({ top, behavior: "smooth" });
                  history.replaceState(null, "", `#${h.id}`);
                }
              }}
              className={`block py-0.5 transition-colors leading-snug ${
                activeId === h.id
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
