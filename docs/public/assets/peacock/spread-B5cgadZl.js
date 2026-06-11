import { e, i, t } from './directive-ZPhl09Yt.js';

class SpreadDirective extends i {
    constructor(partInfo) {
        super(partInfo);
        if (partInfo.type !== t.ELEMENT) {
            throw new Error('spread() can only be used on elements');
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    render(_props) {
        return '';
    }
    update(part, [props]) {
        if (!props)
            return;
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const key in props) {
            const value = props[key];
            if (value === undefined || value === null) {
                part.element.removeAttribute(key);
            }
            else {
                part.element.setAttribute(key, value);
            }
        }
    }
}
const spread = e(SpreadDirective);

export { spread as s };
//# sourceMappingURL=spread-B5cgadZl.js.map
