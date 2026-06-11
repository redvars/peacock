import { e } from './base-Cl6v8-BZ.js';

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function o(o){return (e$1,n)=>{const{slot:r,selector:s}=o??{},c="slot"+(r?`[name=${r}]`:":not([name])");return e(e$1,n,{get(){const t=this.renderRoot?.querySelector(c),e=t?.assignedElements(o)??[];return void 0===s?e:e.filter(t=>t.matches(s))}})}}

export { o };
//# sourceMappingURL=query-assigned-elements-BJaGSqM0.js.map
