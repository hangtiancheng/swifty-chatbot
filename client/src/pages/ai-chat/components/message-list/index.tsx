import { useRef, useEffect, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Sparkles } from "lucide-react";
import type { Message } from "@/types";
import MessageItem from "../message-item";

interface Props {
  messages: Message[];
  /** Shared buffer for the in-flight stream, forwarded to the streaming row. */
  streamRef: RefObject<string>;
}

/** Distance (px) from the bottom within which auto-scroll stays engaged. */
const NEAR_BOTTOM_THRESHOLD = 80;

function MessageList({ messages, streamRef }: Props) {
  "use no memo";
  const { t } = useTranslation();
  const parentRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  // Tracks whether the user is near the bottom — auto-scroll must never
  // hijack the viewport while the user is reading or selecting history.
  const isNearBottomRef = useRef(true);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  const handleScroll = () => {
    const el = parentRef.current;
    if (!el) return;
    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD;
  };

  // Scroll on new messages: always for the user's own message, otherwise only
  // when the user is already near the bottom.
  const lastMessageRole = messages[messages.length - 1]?.role;
  useEffect(() => {
    if (messages.length === 0) return;
    if (lastMessageRole === "user" || isNearBottomRef.current) {
      virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
    }
    // Content growth during streaming is handled by the ResizeObserver below;
    // only a new message (or a role change of the tail) should retrigger this.
  }, [messages.length, lastMessageRole, virtualizer]);

  // Pin to bottom as the total height grows (the streaming bubble expands via
  // direct DOM writes that never touch React state), gated on near-bottom so
  // the user keeps scroll control while reading history.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const observer = new ResizeObserver(() => {
      if (isNearBottomRef.current && messages.length > 0) {
        virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
      }
    });
    observer.observe(body);
    return () => observer.disconnect();
  }, [messages.length, virtualizer]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="bg-primary/10 mb-6 flex size-20 items-center justify-center rounded-full">
          <Sparkles className="text-primary size-10" />
        </div>
        <h2 className="mb-3 text-2xl font-normal">{t("chat.empty_title")}</h2>
        <p className="text-muted-foreground max-w-md">{t("chat.empty_desc")}</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      className="h-full overflow-auto"
    >
      <div
        ref={bodyRef}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            ref={virtualizer.measureElement}
            data-index={virtualRow.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <div className="mx-auto max-w-3xl px-4 pb-6">
              <MessageItem
                message={messages[virtualRow.index]}
                streamRef={streamRef}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MessageList;
