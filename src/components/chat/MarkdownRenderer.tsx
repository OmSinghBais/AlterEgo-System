import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export default function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "text";
            
            return !inline ? (
              <div className="my-4 overflow-hidden rounded-lg border border-white/10 bg-[#0d1117] shadow-xl">
                <div className="flex items-center justify-between bg-white/5 px-4 py-2 text-xs text-white/50">
                  <span className="font-mono lowercase">{language}</span>
                </div>
                <SyntaxHighlighter
                  {...props}
                  style={vscDarkPlus as any}
                  language={language}
                  PreTag="div"
                  customStyle={{ margin: 0, padding: "1rem", background: "transparent" }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-200" {...props}>
                {children}
              </code>
            );
          },
          table({ children, ...props }) {
            return (
              <div className="my-4 w-full overflow-x-auto rounded-lg border border-white/10 bg-white/5">
                <table className="w-full text-left text-sm text-white/80" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          th({ children, ...props }) {
            return (
              <th className="border-b border-white/10 bg-white/5 px-4 py-3 font-medium text-white/90" {...props}>
                {children}
              </th>
            );
          },
          td({ children, ...props }) {
            return (
              <td className="border-b border-white/5 px-4 py-3 text-white/70 last:border-0" {...props}>
                {children}
              </td>
            );
          },
          a({ children, href, ...props }) {
            return (
              <a href={href} className="text-cyan-400 underline decoration-cyan-400/30 underline-offset-4 transition-colors hover:text-cyan-300 hover:decoration-cyan-400" target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
          p({ children, ...props }) {
            // Handle streaming cursor injection manually if needed, but since we append it outside usually, p is just p.
            return <p className="mb-4 last:mb-0" {...props}>{children}</p>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="ml-1 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
      )}
    </div>
  );
}
