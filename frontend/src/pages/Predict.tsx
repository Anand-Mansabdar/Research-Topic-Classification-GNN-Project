import { PredictionTabs } from "@/components/predict/PredictionTabs";

export default function Predict() {
  return (
    <main className="bg-brick-50 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl mb-12">
          <h1 className="font-display text-4xl font-medium leading-tight">Prediction workspace</h1>
          <p className="mt-4 text-black/65 leading-relaxed">
            Classify a paper already in the CORA graph by its node index, or send the model a
            graph of your own — a feature vector per node, and optionally the citation edges
            between them.
          </p>
        </div>
        <PredictionTabs />
      </div>
    </main>
  );
}
