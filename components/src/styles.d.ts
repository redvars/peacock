declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.scss' {
  import { CSSResultGroup } from 'lit';

  const styles: CSSResultGroup;
  export default styles;
}
