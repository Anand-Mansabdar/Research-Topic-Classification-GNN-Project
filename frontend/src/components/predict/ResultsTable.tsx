import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClassMeta } from "@/lib/classColors";
import { cn } from "@/lib/utils";
import type { PredictionResult } from "@/lib/api";

interface ResultsTableProps {
  results: PredictionResult[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-white">Node</TableHead>
          <TableHead className="text-white">Predicted class</TableHead>
          <TableHead className="text-white">Confidence</TableHead>
          <TableHead className="text-white">Class ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((r) => {
          const meta = getClassMeta(r.predicted_class_label);
          const confidence = Math.max(...r.probabilities);
          return (
            <TableRow key={r.node_index}>
              <TableCell className="tabular font-medium">{r.node_index}</TableCell>
              <TableCell>
                <span className={cn("inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full", meta.bg, meta.text)}>
                  {meta.display}
                </span>
              </TableCell>
              <TableCell className="tabular">{(confidence * 100).toFixed(1)}%</TableCell>
              <TableCell className="tabular text-black/50">{r.predicted_class_id}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
