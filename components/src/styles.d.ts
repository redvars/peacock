declare module '*.css' {
  import { CSSResultGroup } from 'lit';

  const content: Record<string, string> | CSSResultGroup;
  export default content;
}

declare module '*.scss' {
  import { CSSResultGroup } from 'lit';

  const styles: CSSResultGroup;
  export default styles;
}
