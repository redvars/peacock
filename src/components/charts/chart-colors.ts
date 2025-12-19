export type ChartColor = {
  color: string;
  hoverColor: string;
};

export function convertToHex(colorName: string): string {
  const computed = getComputedStyle(document.documentElement).getPropertyValue(
    colorName,
  );
  return computed ? computed : colorName;
}

export const chartColors: ChartColor[] = [];

['purple', 'blue', 'green', 'yellow', 'orange', 'red'].forEach(colorName => {
  chartColors.push({
    color: `var(--color-${colorName}-60)`,
    hoverColor: `var(--color-${colorName}-40)`,
  });
});
