import { svg } from 'lit';

/** An inbox tray with nothing in it and a paper plane flying off: inbox zero. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="120" cy="152" rx="62" ry="6"/>
<rect class="surface" x="58" y="68" width="124" height="78" rx="10"/>
<rect class="inset" x="68" y="78" width="104" height="42" rx="5"/>
<path class="primary-soft" d="M58 112h34l6 8c4 6 10 8 22 8s18-2 22-8l6-8h34v24a10 10 0 0 1-10 10H68a10 10 0 0 1-10-10z"/>
<path class="primary" d="m150 30 40-10-22 36-8-12z"/>
<path class="accent" d="m150 30 10 14-2 12-8-12z"/>
<path class="stroke" stroke-width="2.5" stroke-dasharray="4 6" d="M146 38c-14 8-24 18-30 28"/>
<circle class="accent-alt" cx="52" cy="50" r="5"/>`;
