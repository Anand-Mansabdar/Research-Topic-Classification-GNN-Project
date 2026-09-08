import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { GraphPredictRequest } from "@/lib/api";

const FEATURE_LENGTH = 1433;

interface CustomGraphFormProps {
  onSubmit: (body: GraphPredictRequest) => void;
  loading: boolean;
}

interface ParsedGraph {
  ok: true;
  body: GraphPredictRequest;
  numNodes: number;
  numEdges: number;
}
interface ParsedError {
  ok: false;
  message: string;
}

function parseGraph(text: string): ParsedGraph | ParsedError | null {
  if (!text.trim()) return null;

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, message: "That isn't valid JSON. Check for a missing bracket or comma." };
  }

  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return { ok: false, message: 'Expected a JSON object like { "node_features": [...] }.' };
  }
  const obj = json as Record<string, unknown>;

  if (!Array.isArray(obj.node_features) || obj.node_features.length === 0) {
    return { ok: false, message: '"node_features" must be a non-empty array of arrays.' };
  }

  const nodeFeatures = obj.node_features as unknown[];
  for (let i = 0; i < nodeFeatures.length; i++) {
    const row = nodeFeatures[i];
    if (!Array.isArray(row) || row.length !== FEATURE_LENGTH || !row.every((v) => typeof v === "number")) {
      return {
        ok: false,
        message: `Row ${i} must be an array of exactly ${FEATURE_LENGTH} numbers (found ${
          Array.isArray(row) ? row.length : typeof row
        }).`,
      };
    }
  }

  let edgeIndices: number[][] | undefined;
  if (obj.edge_indices !== undefined) {
    if (
      !Array.isArray(obj.edge_indices) ||
      obj.edge_indices.length !== 2 ||
      !obj.edge_indices.every((row) => Array.isArray(row) && row.every((v) => Number.isInteger(v)))
    ) {
      return { ok: false, message: '"edge_indices" must have shape [2, num_edges] of integers.' };
    }
    edgeIndices = obj.edge_indices as number[][];
    const numNodes = nodeFeatures.length;
    const outOfRange = edgeIndices.flat().some((v) => v < 0 || v >= numNodes);
    if (outOfRange) {
      return { ok: false, message: `"edge_indices" must reference node indices between 0 and ${numNodes - 1}.` };
    }
  }

  return {
    ok: true,
    body: { node_features: nodeFeatures as number[][], edge_indices: edgeIndices },
    numNodes: nodeFeatures.length,
    numEdges: edgeIndices ? edgeIndices[0].length : 0,
  };
}

function randomSparseVector(length: number, density = 0.03): number[] {
  return Array.from({ length }, () => (Math.random() < density ? 1 : 0));
}

function generateRandomGraph(numNodes = 5): string {
  const node_features = Array.from({ length: numNodes }, () => randomSparseVector(FEATURE_LENGTH));
  // a light chain + a couple of extra edges, so the graph is connected but not fully dense
  const from: number[] = [];
  const to: number[] = [];
  for (let i = 0; i < numNodes - 1; i++) {
    from.push(i);
    to.push(i + 1);
  }
  if (numNodes > 2) {
    from.push(0);
    to.push(numNodes - 1);
  }
  return JSON.stringify({ node_features, edge_indices: [from, to] }, null, 2);
}

export function CustomGraphForm({ onSubmit, loading }: CustomGraphFormProps) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const parsed = useMemo(() => parseGraph(text), [text]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(setText);
    e.target.value = "";
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <Label htmlFor="graph-json">Graph JSON</Label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setText(generateRandomGraph(5))}>
              Generate random graph
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              Upload JSON
            </Button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
          </div>
        </div>
        <Textarea
          id="graph-json"
          rows={12}
          placeholder={`{\n  "node_features": [[0, 1, 0, ...], [1, 0, 0, ...]],\n  "edge_indices": [[0], [1]]\n}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-invalid={parsed?.ok === false}
        />
        <p className="text-xs text-black/45 mt-2">
          Each row of "node_features" must have exactly {FEATURE_LENGTH} numbers. "edge_indices" is
          optional and, if given, must have shape [2, num_edges].
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 border-t border-black/10 pt-5">
        <p className="text-sm">
          {parsed === null && <span className="text-black/40">Paste or generate a graph to see a summary.</span>}
          {parsed?.ok === false && <span className="text-brick-700">{parsed.message}</span>}
          {parsed?.ok === true && (
            <span className="tabular text-black/70">
              {parsed.numNodes} node{parsed.numNodes === 1 ? "" : "s"}, {FEATURE_LENGTH} features each,{" "}
              {parsed.numEdges} edge{parsed.numEdges === 1 ? "" : "s"}
            </span>
          )}
        </p>
        <Button
          type="button"
          disabled={!parsed?.ok || loading}
          onClick={() => parsed?.ok && onSubmit(parsed.body)}
        >
          {loading ? "Classifying..." : "Classify graph"}
        </Button>
      </div>
    </div>
  );
}
