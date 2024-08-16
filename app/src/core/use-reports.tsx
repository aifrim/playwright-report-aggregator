import { useContext } from "react";
import { Data } from "./data.context";

export type Report = any;

export type ReportStats = {
  duration: number;
  expected: number;
  skipped: number;
  unexpected: number;
  flaky: number;
};

export type ReportTimeSeries<T> = Array<{
  date: Date;
  values: T;
}>;

/**
 *
 * @param reports
 * @returns {ReportTimeSeries<ReportStats>}
 */
function getTimeSeries(reports: Report[]) {
  return reports.map(({ json }) => {
    return {
      date: new Date(json.stats.startTime),
      values: {
        duration: json.stats.duration,
        expected: json.stats.expected,
        skipped: json.stats.skipped,
        unexpected: json.stats.unexpected,
        flaky: json.stats.flaky,
      },
    };
  });
}

export default function useReports() {
  const reports = useContext(Data);

  if (!reports) {
    throw new Error("Data context not found");
  }

  const timeSeries = getTimeSeries(reports);

  return {
    timeSeries,
  };
}
