import { SolidApexCharts } from "solid-apexcharts";
import { createEffect, createSignal } from "solid-js";

interface HistogramProps {
  data: number[];
}

export default function Histogram(props: HistogramProps) {
  const [data, setData] = createSignal<{ x: number; y: number }[]>([]);

  createEffect(() => {
    setData(
      Object.entries(
        props.data.reduce((acc, curr) => {
          acc[curr] ? ++acc[curr] : (acc[curr] = 1);
          return { ...acc };
        }, {})
      ).map(([key, value]) => ({
        x: parseFloat(key),
        y: value as number,
      }))
    );
  });

  return (
    <SolidApexCharts
      type="histogram"
      width="900"
      options={{
        xaxis: {
          type: "numeric",
          tickAmount: 10,
        },
        yaxis: {
          labels: {
            formatter: (val) => val.toFixed(0),
          },
        },
        dataLabels: {
          formatter: (val, { dataPointIndex }) => {
            return data()[dataPointIndex].x;
          },
        },
      }}
      series={[
        {
          name: "Mean diff",
          data: data(),
        },
      ]}
    />
  );
}