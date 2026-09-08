import { CORA_CLASSES } from "@/lib/classColors";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

export function TaskExplainer() {
  const ref = useScrollReveal<HTMLDivElement>({ childSelector: "[data-badge]", staggerDelay: 60 });

  return (
    <section className="bg-white border-y border-black/10 py-24 sm:py-28">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight">
            The task: sort each paper into one of seven fields
          </h2>
          <p className="mt-5 text-black/75 leading-relaxed">
            Given a paper's feature vector and the neighbors it cites and is cited by, the
            model predicts which single research area it belongs to. It's a seven-way
            classification problem — pick one label out of the following:
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {CORA_CLASSES.map((cls) => (
            <span
              key={cls.id}
              data-badge
              className={cn(
                "inline-flex items-center px-4 py-2 text-sm font-medium rounded-full",
                cls.bg,
                cls.text
              )}
            >
              {cls.display}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
