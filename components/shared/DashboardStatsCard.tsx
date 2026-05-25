interface DashboardStatsCardProps {
  label: string;
  value: number | string;
  variant?: "hero" | "white";
}

export function DashboardStatsCard({
  label,
  value,
  variant = "white",
}: DashboardStatsCardProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={`rounded-2xl p-5 ${
        isHero ? "bg-primary" : "bg-white border border-slate-100"
      }`}
    >
      <div className="flex items-start justify-between">
        <p
          className={`text-sm font-medium ${
            isHero ? "text-slate-200" : "text-slate-500"
          }`}
        >
          {label}
        </p>
      </div>
      <p
        className={`text-5xl font-bold mt-2 ${
          isHero ? "text-white" : "text-text-main"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
