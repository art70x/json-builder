type FooterProperties = {
  propsCount: number;
};

export function Footer({ propsCount }: FooterProperties) {
  const hostname =
    typeof window === "undefined" ? "" : encodeURIComponent(window.location.hostname);

  return (
    <footer
      aria-label="Application footer"
      className="flex items-center justify-between border-t border-border/40 px-4 py-2.5"
    >
      <span className="font-mono text-xs text-muted-foreground/40">
        <span className="text-muted-foreground/25">{"{"}</span>
        <span className="mx-1 text-muted-foreground/60">{propsCount} props</span>
        <span className="text-muted-foreground/25">{"}"}</span>
      </span>

      <a
        href={`https://caffeine.ai?utm_source=footer&utm_medium=referral&utm_content=${hostname}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
      >
        &copy; {new Date().getFullYear()}. Built with ♥ using caffeine.ai
      </a>
    </footer>
  );
}
