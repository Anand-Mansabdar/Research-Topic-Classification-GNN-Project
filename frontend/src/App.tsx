import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Predict from "@/pages/Predict";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Predict />} />
          </Routes>
        </div>
        <Footer />
      </div>
      <Toaster />
    </BrowserRouter>
  );
}
