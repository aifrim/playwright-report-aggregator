import Timeline from "../charts/Timeline";
import { CHART_COLORS, lightenColor } from "../charts/utils/colors";
import { timeSeriesToLineChartData } from "../core/transformers/timeseries-to-linechart-data";
import useReports from "../core/use-reports";

export default function OverviewWidget() {
  const reports = useReports();
  const data = timeSeriesToLineChartData(reports.timeSeries, {
    expected: {
      borderColor: CHART_COLORS.blue,
      backgroundColor: lightenColor(CHART_COLORS.blue, 50),
    },
    unexpected: {
      borderColor: CHART_COLORS.red,
      backgroundColor: lightenColor(CHART_COLORS.red, 50),
    },
    skipped: {
      borderColor: CHART_COLORS.grey,
      backgroundColor: lightenColor(CHART_COLORS.grey, 50),
    },
    flaky: {
      borderColor: CHART_COLORS.orange,
      backgroundColor: lightenColor(CHART_COLORS.orange, 50),
    },
    duration: {
      borderColor: CHART_COLORS.green,
      backgroundColor: lightenColor(CHART_COLORS.green, 50),
    },
  });

  return (
    <div>
      <Timeline title="Overview" data={data} />
    </div>
  );
}
