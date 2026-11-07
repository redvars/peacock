/**
 * Whether the person is on an Apple platform, where the `mod` key of a shortcut is Command
 * rather than Ctrl. Used by `wc-kbd` (labels) and `wc-command-palette` (key matching).
 */
export function isApplePlatform(): boolean {
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform = nav.userAgentData?.platform || navigator.platform || '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}
