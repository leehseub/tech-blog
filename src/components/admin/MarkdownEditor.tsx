"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { EditorView, keymap, placeholder as cmPlaceholder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import PostContent from "@/components/posts/PostContent";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const [showPreview, setShowPreview] = useState(false);

  onChangeRef.current = onChange;

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        markdown(),
        oneDark,
        keymap.of([...defaultKeymap, indentWithTab]),
        cmPlaceholder("마크다운으로 글을 작성하세요..."),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "14px",
          },
          ".cm-scroller": {
            overflow: "auto",
          },
          ".cm-content": {
            fontFamily: "var(--font-geist-mono), monospace",
            padding: "16px",
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleImageUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        alert("업로드 실패");
        return;
      }

      const { url } = await res.json();
      const view = viewRef.current;
      if (view) {
        const pos = view.state.selection.main.head;
        const imageMarkdown = `![${file.name}](${url})`;
        view.dispatch({
          changes: { from: pos, insert: imageMarkdown },
        });
      }
    };
    input.click();
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`text-xs px-3 py-1 rounded ${
            !showPreview
              ? "bg-white dark:bg-gray-800 shadow-sm"
              : "text-gray-500"
          }`}
        >
          편집
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className={`text-xs px-3 py-1 rounded ${
            showPreview
              ? "bg-white dark:bg-gray-800 shadow-sm"
              : "text-gray-500"
          }`}
        >
          미리보기
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleImageUpload}
          className="text-xs px-3 py-1 text-gray-500 hover:text-foreground"
        >
          이미지 업로드
        </button>
      </div>

      {/* Editor / Preview */}
      <div className="h-[500px]">
        {showPreview ? (
          <div className="h-full overflow-auto p-6">
            {value ? (
              <PostContent content={value} />
            ) : (
              <p className="text-gray-400 italic">미리보기할 내용이 없습니다.</p>
            )}
          </div>
        ) : (
          <div ref={editorRef} className="h-full" />
        )}
      </div>
    </div>
  );
}
