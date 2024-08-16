import Chart, { ChartData, Point } from "chart.js/auto";
import { useEffect, useRef } from "react";

type TimelineProps = {
  data: ChartData<"line", Point[], string>;
  title: string;
};

export default function Timeline(props: TimelineProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const ctx = ref.current.getContext("2d");

    if (!ctx) {
      return;
    }

    const chart = new Chart<"line">(ctx, {
      type: "line",
      data: props.data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
          title: {
            display: true,
            text: props.title,
          },
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, [ref, props]);

  return (
    <div>
      <canvas ref={ref} />
    </div>
  );
}
