import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function CtaFooter() {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <section className="bg-brick-600 text-white py-24">
      <div ref={ref} className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <h2 className="font-display text-3xl sm:text-4xl font-medium max-w-md leading-tight">
          Try it on a real paper, or one of your own.
        </h2>
        <Button asChild size="lg" variant="dark">
          <Link to="/predict">Open the prediction workspace</Link>
        </Button>
      </div>
    </section>
  );
}
