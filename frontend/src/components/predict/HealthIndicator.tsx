import { useHealthCheck } from "@/hooks/useHealthCheck";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function HealthIndicator() {
  const health = useHealthCheck();

  const label =
    health.status === "checking"
      ? "Checking..."
      : health.status === "healthy"
      ? "Service online"
      : "Service unreachable";

  const dotClass =
    health.status === "healthy"
      ? "bg-brick-600"
      : health.status === "unreachable"
      ? "bg-white/30"
      : "bg-white/30 animate-pulse";

  const tooltipText =
    health.status === "healthy"
      ? `Providers: ${health.data.providers.join(", ")}`
      : health.status === "unreachable"
      ? "Could not reach the API. Check VITE_API_BASE_URL or the server."
      : "Contacting the prediction service...";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 text-xs text-white/70 cursor-default">
            <span className={cn("block size-2 rounded-full", dotClass)} aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
