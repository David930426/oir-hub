import { cn } from "@/lib/utils";

/**
 * The navy band every inner page opens with.
 *
 * The OIR reference is a single page, so it has no inner-page header to copy.
 * This keeps its shape — a full-bleed band, a faint engineering grid, a
 * small-caps eyebrow over the title — painted in the console's brand blue so a
 * list page reads as the same product as /admin.
 */
export function PageBanner({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  /** One short paragraph of intro. Optional. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-linear-to-br from-brand to-brand-dark px-[clamp(1.375rem,8vw,7.75rem)] py-[clamp(3rem,6vw,4.5rem)] text-white",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_right,transparent,black_40%,black)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[140px] -right-[140px] size-[340px] rounded-full bg-brand-tint opacity-20 blur-[1px]"
      />
      <div className="relative z-2">
        <p className="eyebrow mb-4 text-brand-tint">{eyebrow}</p>
        <h1 className="display-lg max-w-[820px]">{title}</h1>
        {children && (
          <div className="on-brand-muted mt-5 max-w-[610px] text-sm leading-relaxed">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
