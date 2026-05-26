export interface Section {
  title: string;
  order: number;
  component: unknown;
  componentProps?: any;
}

export function buildSections(modules: Record<string, unknown>): Section[] {
  return Object.entries(modules)
    .filter(([, module]) => {
      const mod = module as Record<string, unknown>;
      return mod.title !== undefined;
    })
    .map(([, module]) => {
      const mod = module as Record<string, unknown>;
      return {
        title: mod.title as string,
        order: (mod.order as number) ?? 999,
        component: mod.default,
      };
    })
    .sort((a, b) => a.order - b.order);
}
