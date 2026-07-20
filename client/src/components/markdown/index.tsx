import { Streamdown } from "streamdown";

interface Props {
  /** Markdown source to render. */
  children: string;
  /** "streaming" enables incomplete-markdown repair and streaming affordances. */
  mode?: "static" | "streaming";
  /** Marks the content as actively streaming (caret + incomplete-code state). */
  isAnimating?: boolean;
}

/**
 * Shared markdown renderer built on Streamdown (Vercel's streaming-native
 * react-markdown replacement). It memoizes parsed blocks internally, repairs
 * unterminated markdown while streaming, and syntax-highlights code with
 * Shiki in dual github-light/github-dark themes that follow our `.dark` class.
 */
function Markdown({ children, mode = "static", isAnimating }: Props) {
  return (
    <Streamdown
      mode={mode}
      isAnimating={isAnimating}
      shikiTheme={["github-light", "github-dark"]}
      className="prose prose-sm max-w-none text-sm leading-relaxed wrap-break-word"
    >
      {children}
    </Streamdown>
  );
}

export default Markdown;
