import { Directive, ElementPart, PartInfo } from 'lit/directive.js';
declare class SpreadDirective extends Directive {
    constructor(partInfo: PartInfo);
    render(_props: {
        [key: string]: any;
    } | undefined): string;
    update(part: ElementPart, [props]: [{
        [key: string]: any;
    } | undefined]): void;
}
export declare const spread: (_props: {
    [key: string]: any;
} | undefined) => import("lit-html/directive.js").DirectiveResult<typeof SpreadDirective>;
export {};
