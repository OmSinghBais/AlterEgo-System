"use client";

type Props = {
  content: string;
  isStreaming?: boolean;
  className?: string;
};

export default function StreamingText({
  content,
  isStreaming,
  className,
}: Props) {
  return (
    <span className={className}>
      {content}
      {isStreaming ? (
        <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-rose-400 align-middle shadow-[0_0_8px_rgba(190,18,60,0.75)]" />
      ) : null}
    </span>
  );
}
