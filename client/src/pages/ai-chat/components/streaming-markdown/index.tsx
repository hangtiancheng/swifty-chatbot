import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  /** Mutable ref holding the latest full streamed text, written outside React. */
  sourceRef: RefObject<string>;
}

/**
 * Splits markdown into render-stable blocks at blank-line boundaries.
 * Fenced code blocks (``` or ~~~) are tracked so blank lines inside a fence
 * never split a block prematurely.
 */
function splitIntoBlocks(markdown: string): string[] {
  const blocks: string[] = [];
  let current = "";
  let fence: string | null = null;

  const pushCurrent = () => {
    if (current.trim() !== "") {
      blocks.push(current);
    }
    current = "";
  };

  for (const line of markdown.split("\n")) {
    const fenceMarker = line.match(/^\s*(```|~~~)/)?.[1];
    if (fenceMarker) {
      if (fence === null) {
        fence = fenceMarker;
      } else if (fence === fenceMarker) {
        fence = null;
      }
    }

    if (line.trim() === "" && fence === null) {
      pushCurrent();
    } else {
      current = current === "" ? line : `${current}\n${line}`;
    }
  }
  pushCurrent();

  return blocks;
}

/** Renders a single block; memoized so settled blocks never re-parse or re-diff. */
const MarkdownBlock = memo(function MarkdownBlock({
  content,
}: {
  content: string;
}) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
});

/**
 * Incremental markdown for streaming messages (the Streamdown approach).
 *
 * The latest text is pulled from `sourceRef` at most once per animation frame
 * (SSE chunks never call setState themselves), then split at blank-line
 * boundaries. Since streamed text only grows by appending, every block before
 * the tail is immutable: memoization locks settled blocks out of both
 * re-parsing and reconciliation, so each frame only pays to parse the single
 * trailing block — rendering cost is decoupled from total message length, and
 * markdown stays fully rendered throughout the stream (no visual "pop" when
 * the final content is committed).
 */
function StreamingMarkdown({ sourceRef }: Props) {
  const [text, setText] = useState("");
  const lastLengthRef = useRef(0);

  useEffect(() => {
    let rafId = 0;
    const flush = () => {
      const latest = sourceRef.current ?? "";
      // Frame-rate gate: hundreds of chunks collapse into ≤60 state updates.
      if (latest.length !== lastLengthRef.current) {
        lastLengthRef.current = latest.length;
        setText(latest);
      }
      rafId = requestAnimationFrame(flush);
    };
    rafId = requestAnimationFrame(flush);
    return () => cancelAnimationFrame(rafId);
  }, [sourceRef]);

  const blocks = useMemo(() => splitIntoBlocks(text), [text]);

  return (
    <div className="prose prose-sm [&_code]:bg-background/60 max-w-none text-sm leading-relaxed wrap-break-word [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_pre]:rounded-lg [&_pre]:p-3">
      {blocks.map((block, index) => (
        <MarkdownBlock key={index} content={block} />
      ))}
    </div>
  );
}

export default StreamingMarkdown;
