/**
 * Formats a duration for step cards and the run timeline: "420 ms", "1.2 s", "4 min 10 s",
 * "2 h 14 min". Units come from `Intl`, so they follow the locale.
 */
export function formatDuration(ms: number | undefined, locale: string): string {
  if (ms === undefined || !Number.isFinite(ms) || ms < 0) return '';
  const unit = (value: number, name: string, digits = 0) =>
    new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: name,
      unitDisplay: 'short',
      maximumFractionDigits: digits,
    }).format(value);
  if (ms < 1000) return unit(Math.round(ms), 'millisecond');
  const seconds = ms / 1000;
  if (seconds < 60) return unit(seconds, 'second', seconds < 10 ? 1 : 0);
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const rest = Math.round(seconds - minutes * 60);
    return rest
      ? `${unit(minutes, 'minute')} ${unit(rest, 'second')}`
      : unit(minutes, 'minute');
  }
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes - hours * 60;
  return restMinutes
    ? `${unit(hours, 'hour')} ${unit(restMinutes, 'minute')}`
    : unit(hours, 'hour');
}
