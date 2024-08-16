export const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

export function darkenColor(color: string, amount: number) {
  const colorParts = color.match(/\d+/g) || [];
  return `rgb(${colorParts
    .map((part) => Math.max(parseInt(part, 10) - amount, 0))
    .join(", ")})`;
}

export function lightenColor(color: string, amount: number) {
  const colorParts = color.match(/\d+/g) || [];
  return `rgb(${colorParts
    .map((part) => Math.min(parseInt(part, 10) + amount, 255))
    .join(", ")})`;
}
