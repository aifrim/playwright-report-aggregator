import { ChartData, Point } from "chart.js";
import { ReportStats, ReportTimeSeries } from "../use-reports";

export function timeSeriesToLineChartData(
  timeSeries: ReportTimeSeries<ReportStats>,
  colors: Record<
    keyof ReportStats,
    {
      borderColor: string;
      backgroundColor: string;
    }
  >
): ChartData<"line", Point[], string> {
  const dates = timeSeries.map((point) => point.date);
  const labels = dates.map((date) => date.toDateString());

  return {
    labels,
    datasets: [
      {
        label: "All",
        ...colors["expected"],
        data: [
          { x: 1, y: 100 },
          { x: 2, y: 106 },
        ],
      },
    ],
  };
}
