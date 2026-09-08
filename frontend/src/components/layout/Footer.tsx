export function Footer() {
  return (
    <footer className="bg-black text-white/50 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
        <p>A graph convolutional network trained on the CORA citation dataset.</p>
        <p className="tabular text-white/35">1433 features · 7 classes · CPU inference</p>
      </div>
    </footer>
  );
}
