import { Hero } from "@/components/home/Hero";
import { DatasetExplainer } from "@/components/home/DatasetExplainer";
import { TaskExplainer } from "@/components/home/TaskExplainer";
import { ModelExplainer } from "@/components/home/ModelExplainer";
import { StatsStrip } from "@/components/home/StatsStrip";
import { CtaFooter } from "@/components/home/CtaFooter";

export default function Home() {
  return (
    <main>
      <Hero />
      <DatasetExplainer />
      <TaskExplainer />
      <ModelExplainer />
      <StatsStrip />
      <CtaFooter />
    </main>
  );
}
