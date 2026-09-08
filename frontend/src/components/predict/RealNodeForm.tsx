import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// The standard CORA Planetoid graph has 2,708 nodes (indices 0–2707); the
// backend loads the full graph (not just a train/val/test split), so this is
// the true valid range for /predict/cora_node.
const CORA_NODE_COUNT = 2708;

interface RealNodeFormProps {
  onSubmit: (nodeIndices: number[]) => void;
  loading: boolean;
}

export function RealNodeForm({ onSubmit, loading }: RealNodeFormProps) {
  const [draft, setDraft] = useState("");
  const [indices, setIndices] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  function commitDraft() {
    const raw = draft.trim();
    if (!raw) return;
    const parts = raw.split(/[\s,]+/).filter(Boolean);
    const parsed: number[] = [];
    for (const part of parts) {
      const n = Number(part);
      if (!Number.isInteger(n) || n < 0 || n >= CORA_NODE_COUNT) {
        setError(`"${part}" isn't a valid node index. Use whole numbers from 0 to ${CORA_NODE_COUNT - 1}.`);
        return;
      }
      parsed.push(n);
    }
    setError(null);
    setIndices((prev) => Array.from(new Set([...prev, ...parsed])));
    setDraft("");
  }

  function removeIndex(n: number) {
    setIndices((prev) => prev.filter((x) => x !== n));
  }

  function addRandom() {
    const n = Math.floor(Math.random() * CORA_NODE_COUNT);
    setIndices((prev) => (prev.includes(n) ? prev : [...prev, n]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    commitDraft();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="node-index-input">Node index or indices</Label>
        <p className="text-sm text-black/50 mt-1 mb-2.5">
          Valid range: 0 to {CORA_NODE_COUNT - 1}. Separate multiple with a comma or space, then
          press Enter.
        </p>
        <div className="flex gap-2">
          <Input
            id="node-index-input"
            inputMode="numeric"
            placeholder="e.g. 42, 1108"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitDraft();
              }
            }}
            aria-invalid={!!error}
            aria-describedby={error ? "node-index-error" : undefined}
          />
          <Button type="button" variant="outline" onClick={addRandom}>
            Random node
          </Button>
        </div>
        {error && (
          <p id="node-index-error" className="text-sm text-brick-700 mt-2">
            {error}
          </p>
        )}
      </div>

      {indices.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {indices.map((n) => (
            <Badge key={n} variant="muted" className="tabular pr-1.5">
              {n}
              <button
                type="button"
                onClick={() => removeIndex(n)}
                className="ml-0.5 hover:text-brick-950 focus-visible:outline-none"
                aria-label={`Remove node ${n}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Button
        type="button"
        disabled={indices.length === 0 || loading}
        onClick={() => onSubmit(indices)}
        className="w-full sm:w-auto"
      >
        {loading ? "Classifying..." : `Classify ${indices.length || ""} node${indices.length === 1 ? "" : "s"}`.trim()}
      </Button>
    </form>
  );
}
