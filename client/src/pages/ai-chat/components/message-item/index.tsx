import type { Message } from "@/types";
import { Sparkles, User } from "lucide-react";
import { memo, type RefObject } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import StreamingMarkdown from "../streaming-markdown";

interface Props {
  message: Message;
  /** Shared buffer for the in-flight stream; only read while `status === "streaming"`. */
  streamRef: RefObject<string>;
}

/**
 * Memoized on purpose: in a long virtualized conversation, already-settled
 * messages keep a stable object identity, so they are locked out of React's
 * diffing entirely and never re-render due to unrelated streaming activity.
 */
const MessageItem = memo(function MessageItem({ message, streamRef }: Props) {
  const { t } = useTranslation();
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-4", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary" : "bg-primary/10",
        )}
      >
        {isUser ? (
          <User className="text-primary-foreground size-5" />
        ) : (
          <Sparkles className="text-primary size-5" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex-1", isUser && "text-right")}>
        <div className="mb-1 flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              isUser ? "text-primary ml-auto" : "text-foreground",
            )}
          >
            {isUser ? t("chat.you") : t("chat.ai")}
          </span>

          {message.status === "thinking" && (
            <span className="text-primary text-xs">{t("chat.thinking")}</span>
          )}
        </div>
        <div
          className={cn(
            "inline-block max-w-full rounded-2xl px-4 py-3 wrap-break-word",
            isUser
              ? "bg-primary text-primary-foreground text-left"
              : "bg-muted text-foreground",
          )}
        >
          {message.status === "thinking" ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="bg-muted-foreground/40 size-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
              <span className="bg-muted-foreground/40 size-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
              <span className="bg-muted-foreground/20 size-2 animate-bounce rounded-full" />
            </div>
          ) : message.status === "streaming" ? (
            // Incremental block-level markdown — stays fully rendered mid-stream.
            <StreamingMarkdown sourceRef={streamRef} />
          ) : (
            <div className="prose prose-sm [&_code]:bg-background/60 max-w-none text-sm leading-relaxed wrap-break-word [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_pre]:rounded-lg [&_pre]:p-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default MessageItem;
