import { svg } from 'lit';

/** One person between two empty, dashed seats, with an add badge: invite your team. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="120" cy="150" rx="66" ry="6"/>
<circle class="stroke" stroke-width="2.5" stroke-dasharray="5 5" cx="72" cy="78" r="13"/>
<path class="stroke" stroke-width="2.5" stroke-dasharray="5 5" d="M48 136v-4a24 24 0 0 1 48 0v4z"/>
<circle class="stroke" stroke-width="2.5" stroke-dasharray="5 5" cx="168" cy="78" r="13"/>
<path class="stroke" stroke-width="2.5" stroke-dasharray="5 5" d="M144 136v-4a24 24 0 0 1 48 0v4z"/>
<circle class="primary-soft" cx="120" cy="68" r="18"/>
<path class="primary-soft" d="M86 142v-8a34 34 0 0 1 68 0v8z"/>
<path class="primary" d="M106 102a34 34 0 0 1 28 0l-14 18z"/>
<circle class="primary" cx="186" cy="118" r="16"/>
<path class="stroke-on-primary" stroke-width="4" d="M186 110v16m-8-8h16"/>
<path class="accent" d="M60 34l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>`;
