import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProbabilityChart } from "@/components/predict/ProbabilityChart";
import { getClassMeta } from "@/lib/classColors";
import { cn } from "@/lib/utils";
import type { PredictionResult } from "@/lib/api";

interface ResultCardProps {
  result: PredictionResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const meta = getClassMeta(result.predicted_class_label);
  const topProb = Math.max(...result.probabilities);

  return (
    <Card data-result-card>
      <CardHeader className="flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <CardTitle className="tabular">Node {result.node_index}</CardTitle>
          <p className="text-xs text-black/45 mt-0.5 tabular">
            {(topProb * 100).toFixed(1)}% confidence
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center px-3.5 py-1.5 text-sm font-medium rounded-full shrink-0",
            meta.bg,
            meta.text
          )}
        >
          {meta.display}
        </span>
      </CardHeader>
      <CardContent>
        <ProbabilityChart probabilities={result.probabilities} />

        <Accordion type="single" collapsible className="mt-2">
          <AccordionItem value="logits" className="border-t-0">
            <AccordionTrigger className="text-xs text-black/50 hover:text-black py-2">
              Raw logits
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 tabular text-xs">
                {result.logits.map((logit, id) => (
                  <div key={id} className="bg-brick-50 border border-black/10 px-2.5 py-2">
                    <div className="text-black/40 truncate">class_{id}</div>
                    <div className="text-black font-medium">{logit.toFixed(4)}</div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
