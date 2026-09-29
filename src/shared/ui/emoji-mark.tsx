export function EmojiMark({ symbol }: { symbol: string }) {
  return (
    <span className="emoji-float text-7xl leading-none" aria-hidden="true">
      {symbol}
    </span>
  );
}
