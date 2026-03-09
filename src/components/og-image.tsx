export function OgImage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background">
      <div
        id="og-image"
        className="relative flex h-[630px] w-[1200px] flex-col items-center justify-center gap-6 border border-border bg-terminal p-8 text-center shadow-xl"
      >
        {/* Logo */}
        <div className="drop-shadow-glow flex items-center rounded-3xl bg-primary-light/15 p-4 shadow-glow">
          <ILucideBrackets className="size-24 text-primary-light" />
        </div>

        {/* Title */}
        <h1 className="bg-linear-to-br from-foreground/80 via-foreground to-foreground/20 bg-clip-text px-2 text-center text-8xl leading-[1.05] font-semibold tracking-tight text-transparent max-sm:px-4">
          JSON Builder
        </h1>

        {/* Description */}
        <p className="mx-auto max-w-2xl text-lg/relaxed font-medium text-muted-foreground md:text-xl">
          Visual JSON builder with typed properties, nested objects, live preview, drag-to-reorder,
          import/export, PWA support.
        </p>
      </div>
    </div>
  )
}
