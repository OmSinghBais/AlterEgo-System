"use client";

import { useEffect, useState } from "react";

type Props = {
  text: string;
  className?: string;
  msPerChar?: number;
  onComplete?: () => void;
};

export default function TypingText({
  text,
  className,
  msPerChar = 28,
  onComplete,
}: Props) {
  const [shownLength, setShownLength] = useState(0);

  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      i += 1;
      setShownLength(Math.min(i, text.length));
      if (i >= text.length) {
        onComplete?.();
        return;
      }
      timer = setTimeout(step, msPerChar);
    };

    timer = setTimeout(step, msPerChar);

    return () => clearTimeout(timer);
  }, [text, msPerChar, onComplete]);

  const shown = text.slice(0, shownLength);

  return (
    <span className={className}>
      {shown}
      <span className="inline-block w-[2px] animate-pulse bg-rose-400/95 align-middle opacity-90 shadow-[0_0_8px_rgba(185,28,28,0.65)]">
        &nbsp;
      </span>
    </span>
  );
}
