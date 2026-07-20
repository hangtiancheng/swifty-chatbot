import { useEffect, useRef, useState, type RefObject } from "react";

import Markdown from "@/components/markdown";

interface Props {
  /** Mutable ref holding the latest full streamed text, written outside React. */
  sourceRef: RefObject<string>;
}

/**
 * Frame-rate gate between the SSE hot path and the markdown renderer.
 *
 * Chunks land in `sourceRef` without touching React; this component pulls the
 * latest text into local state at most once per animation frame, so hundreds
 * of chunks per second collapse into ≤60 renders. Streamdown then does the
 * heavy lifting: it splits the text into blocks (marked-based, fence-aware),
 * memoizes every settled block, and only re-parses the trailing incomplete
 * one — rendering cost stays decoupled from total message length, and
 * markdown remains fully rendered throughout the stream.
 */
function StreamingMarkdown({ sourceRef }: Props) {
  const [text, setText] = useState("");
  const lastLengthRef = useRef(0);

  useEffect(() => {
    let rafId = 0;
    const flush = () => {
      const latest = sourceRef.current ?? "";
      if (latest.length !== lastLengthRef.current) {
        lastLengthRef.current = latest.length;
        setText(latest);
      }
      rafId = requestAnimationFrame(flush);
    };
    rafId = requestAnimationFrame(flush);
    return () => cancelAnimationFrame(rafId);
  }, [sourceRef]);

  return (
    <Markdown mode="streaming" isAnimating>
      {text}
    </Markdown>
  );
}

export default StreamingMarkdown;
