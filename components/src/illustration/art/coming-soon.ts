import { svg } from 'lit';

/** An hourglass with sand running through: coming soon. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="120" cy="154" rx="46" ry="6"/>
<path class="surface" d="M92 46h56c0 26-16 36-22 44 6 8 22 18 22 44H92c0-26 16-36 22-44-6-8-22-18-22-44z"/>
<path class="primary-soft" d="M102 62h36c-2 10-12 18-18 24-6-6-16-14-18-24z"/>
<path class="primary-soft" d="M100 130h40c-2-14-12-20-20-22-8 2-18 8-20 22z"/>
<path class="stroke-primary" stroke-width="3" stroke-dasharray="3 5" d="M120 92v14"/>
<rect class="primary" x="82" y="36" width="76" height="12" rx="6"/>
<rect class="primary" x="82" y="132" width="76" height="12" rx="6"/>
<path class="accent" d="M182 50l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>
<circle class="accent-alt" cx="58" cy="70" r="5"/>
<circle class="primary-soft" cx="182" cy="122" r="4"/>`;
