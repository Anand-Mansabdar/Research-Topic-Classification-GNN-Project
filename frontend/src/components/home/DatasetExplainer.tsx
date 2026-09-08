import { useScrollReveal } from "@/hooks/useScrollReveal";

export function DatasetExplainer() {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <section id="what-is-cora" className="bg-brick-50 py-24 sm:py-28 scroll-mt-16">
      <div ref={ref} className="mx-auto max-w-6xl px-6 grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-14 items-start">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight">
            What is the CORA dataset?
          </h2>
        </div>
        <div className="max-w-xl space-y-5 text-black/75 leading-relaxed">
          <p>
            CORA is a citation network of roughly 2,700 scientific publications in the machine
            learning literature. Each paper is a node. Each citation between two papers is an
            edge. Together they form a single connected graph rather than a pile of
            unrelated documents.
          </p>
          <p>
            Every node also carries a 1,433-dimensional bag-of-words feature vector — one entry
            per word in a fixed dictionary, marked present or absent in that paper's text.
            There's no word order or grammar in this representation, just which words showed up.
          </p>
          <p>
            The dataset loads through PyTorch Geometric's{" "}
            <code className="font-mono text-sm bg-brick-100 text-brick-900 px-1.5 py-0.5">
              torch_geometric.datasets.Planetoid
            </code>
            , which ships the node features, the citation edges, and a ground-truth topic label
            for every paper.
          </p>
        </div>
      </div>
    </section>
  );
}
