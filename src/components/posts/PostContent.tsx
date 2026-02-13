"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { useCallback, useState } from "react";

interface PostContentProps {
  content: string;
}

function proxyImageUrl(src: string): string {
  if (src.startsWith("http://")) {
    return `/api/image-proxy?url=${encodeURIComponent(src)}`;
  }
  return src;
}

const LANGUAGE_LABELS: Record<string, string> = {
  js: "JavaScript",
  jsx: "JavaScript (JSX)",
  ts: "TypeScript",
  tsx: "TypeScript (TSX)",
  typescript: "TypeScript",
  javascript: "JavaScript",
  py: "Python",
  python: "Python",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  sql: "SQL",
  yaml: "YAML",
  yml: "YAML",
  md: "Markdown",
  markdown: "Markdown",
  go: "Go",
  rust: "Rust",
  java: "Java",
  c: "C",
  cpp: "C++",
  prisma: "Prisma",
  dockerfile: "Dockerfile",
  nginx: "Nginx",
  xml: "XML",
  graphql: "GraphQL",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (typeof children === "object" && children !== null && "props" in children) {
    return extractText((children as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return "";
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code.replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <button className="copy-button" onClick={handleCopy}>
      {copied ? "복사됨!" : "복사"}
    </button>
  );
}

export default function PostContent({ content }: PostContentProps) {
  return (
    <div className="prose dark:text-gray-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          pre({ children, ...props }) {
            const codeElement = children as React.ReactElement<{
              children?: string;
              className?: string;
            }>;

            const code =
              typeof codeElement === "object" &&
              codeElement !== null &&
              "props" in codeElement
                ? extractText(codeElement.props.children)
                : "";

            const className =
              typeof codeElement === "object" &&
              codeElement !== null &&
              "props" in codeElement
                ? codeElement.props.className || ""
                : "";

            const langMatch = className.match(/language-(\w+)/);
            const langKey = langMatch ? langMatch[1] : "";
            const langLabel = LANGUAGE_LABELS[langKey] || langKey.toUpperCase();

            return (
              <div className="code-block-wrapper">
                <div className="code-block-header">
                  <span className="code-lang-label">
                    {langLabel || "Code"}
                  </span>
                  <CopyButton code={code} />
                </div>
                <pre {...props}>{children}</pre>
              </div>
            );
          },
          h2({ children, ...props }) {
            const text = extractText(children);
            const id = slugify(text);
            return <h2 id={id} {...props}>{children}</h2>;
          },
          h3({ children, ...props }) {
            const text = extractText(children);
            const id = slugify(text);
            return <h3 id={id} {...props}>{children}</h3>;
          },
          h4({ children, ...props }) {
            const text = extractText(children);
            const id = slugify(text);
            return <h4 id={id} {...props}>{children}</h4>;
          },
          img({ src, alt, ...props }) {
            const srcStr = typeof src === "string" ? src : "";
            const proxiedSrc = srcStr ? proxyImageUrl(srcStr) : "";
            return <img src={proxiedSrc} alt={alt || ""} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
