import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RealNodeForm } from "@/components/predict/RealNodeForm";
import { CustomGraphForm } from "@/components/predict/CustomGraphForm";
import { ResultCard } from "@/components/predict/ResultCard";
import { ResultsTable } from "@/components/predict/ResultsTable";
import { useToast } from "@/hooks/use-toast";
import { api, ApiError, type GraphPredictRequest, type PredictionResult } from "@/lib/api";

type ViewMode = "cards" | "table";

export function PredictionTabs() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PredictionResult[] | null>(null);
  const [view, setView] = useState<ViewMode>("cards");
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!results || view !== "cards" || !resultsRef.current) return;
    const cards = resultsRef.current.querySelectorAll<HTMLElement>("[data-result-card]");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || cards.length === 0) return;
    animate(cards, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 500,
      delay: stagger(70),
      easing: "easeOutCubic",
    });
  }, [results, view]);

  async function runPrediction(fn: () => Promise<{ predictions: PredictionResult[] }>) {
    setLoading(true);
    setResults(null);
    try {
      const response = await fn();
      setResults(response.predictions);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.detail
          : "Something went wrong reaching the prediction service.";
      toast({ variant: "destructive", title: "Prediction failed", description: message });
    } finally {
      setLoading(false);
    }
  }

  function handleRealNodes(nodeIndices: number[]) {
    runPrediction(() => api.predictCoraNodes({ node_indices: nodeIndices }));
  }

  function handleCustomGraph(body: GraphPredictRequest) {
    runPrediction(() => api.predictCustomGraph(body));
  }

  return (
    <div>
      <Tabs defaultValue="real">
        <TabsList>
          <TabsTrigger value="real">Predict on real CORA node</TabsTrigger>
          <TabsTrigger value="custom">Predict on custom graph</TabsTrigger>
        </TabsList>

        <TabsContent value="real">
          <RealNodeForm onSubmit={handleRealNodes} loading={loading} />
        </TabsContent>

        <TabsContent value="custom">
          <CustomGraphForm onSubmit={handleCustomGraph} loading={loading} />
        </TabsContent>
      </Tabs>

      <div className="mt-14">
        {loading && (
          <div className="grid sm:grid-cols-2 gap-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border border-black/10 bg-white p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-7 w-28 rounded-full" />
                </div>
                <Skeleton className="h-48 w-full" />
              </div>
            ))}
          </div>
        )}

        {!loading && results && results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-medium">
                {results.length} result{results.length === 1 ? "" : "s"}
              </h2>
              {results.length > 1 && (
                <div className="flex gap-1 border border-black/15 p-0.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={view === "cards" ? "default" : "ghost"}
                    onClick={() => setView("cards")}
                  >
                    Cards
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={view === "table" ? "default" : "ghost"}
                    onClick={() => setView("table")}
                  >
                    Table
                  </Button>
                </div>
              )}
            </div>

            <div ref={resultsRef}>
              {view === "cards" ? (
                <div className="grid sm:grid-cols-2 gap-5">
                  {results.map((r) => (
                    <ResultCard key={r.node_index} result={r} />
                  ))}
                </div>
              ) : (
                <div className="border border-black/10">
                  <ResultsTable results={results} />
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !results && (
          <div className="border border-dashed border-black/15 py-16 text-center">
            <p className="text-black/50">Run a prediction to see results here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
