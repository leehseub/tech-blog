"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { useCallback } from "react";

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  const handleCopy = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
  }, []);

  return (
    <div className="prose dark:text-gray-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          pre({ children, ...props }) {
            const codeElement = children as React.ReactElement<{
              children?: string;
            }>;
            const code =
              typeof codeElement === "object" &&
              codeElement !== null &&
              "props" in codeElement
                ? String(codeElement.props.children || "")
                : "";

            return (
              <div className="code-block-wrapper">
                <button
                  className="copy-button"
                  onClick={() => handleCopy(code.replace(/\n$/, ""))}
                >
                  복사
                </button>
                <pre {...props}>{children}</pre>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
