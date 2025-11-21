import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { resultRepository } from "~/lib/repositories/result.repository";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/chart";

Chart.register(...registerables);

export async function loader({}: Route.LoaderArgs) {
  const results = await resultRepository.findAll();

  const wins: Record<string, number> = {};
  results.forEach((result) => {
    if (result.position === 1) {
      wins[result.driver.name] = (wins[result.driver.name] || 0) + 1;
    }
  });

  const topDrivers = Object.entries(wins)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, wins: count }));

  return { topDrivers };
}

export default function ChartPage({ loaderData }: Route.ComponentProps) {
  const { topDrivers } = loaderData;
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: topDrivers.map((d) => d.name),
        datasets: [
          {
            label: "Wins",
            data: topDrivers.map((d) => d.wins),
            backgroundColor: "rgba(220, 38, 38, 0.5)", // F1 red
            borderColor: "rgb(220, 38, 38)",
            borderWidth: 2,
            hoverBackgroundColor: "rgba(220, 38, 38, 0.8)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#e5e5e5",
              font: { size: 14 },
            },
          },
          title: {
            display: true,
            text: "Top 10 Drivers by Race Wins",
            color: "#fff",
            font: { size: 20, weight: "bold" },
          },
        },
        scales: {
          x: {
            ticks: { color: "#e5e5e5" },
            grid: { display: false },
          },
          y: {
            ticks: { color: "#e5e5e5" },
            grid: {
              color: "rgba(255,255,255,0.1)",
            },
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [topDrivers]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Chart Card */}
        <Card className="bg-neutral-900 border border-neutral-800 shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-red-500">Driver Statistics</CardTitle>
            <CardDescription className="text-gray-400">
              Top Formula 1 race winners visualized with Chart.js
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <canvas ref={chartRef}></canvas>
            </div>
          </CardContent>
        </Card>

        {/* Driver Cards */}
        <h2 className="text-2xl font-bold text-red-500 mt-12 mb-4">Top 10 Drivers</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {topDrivers.map((driver, index) => (
            <Card
              key={driver.name}
              className="bg-neutral-900 border border-neutral-800 hover:border-red-500 transition-all rounded-xl shadow-lg"
            >
              <CardHeader className="pb-0">
                <CardTitle className="text-lg font-semibold text-gray-200">
                  #{index + 1} {driver.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-2 pb-4">
                <div className="text-3xl font-extrabold text-red-500">{driver.wins}</div>
                <div className="text-gray-400 text-sm">wins</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
