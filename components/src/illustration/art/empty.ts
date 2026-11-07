import { svg } from 'lit';

/** An open cardboard box with nothing inside: no data yet. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="120" cy="152" rx="58" ry="6"/>
<path class="primary-soft" d="M76 82h88l10-22H66z"/>
<path class="inset" d="M72 82h96l-6 18H78z"/>
<path class="primary" d="m72 82 6 18-26 8-8-20z"/>
<path class="primary" d="m168 82-6 18 26 8 8-20z"/>
<path class="surface" d="M78 100h84v42a8 8 0 0 1-8 8H86a8 8 0 0 1-8-8z"/>
<rect class="primary-soft" x="128" y="122" width="24" height="16" rx="3"/>
<path class="stroke" stroke-width="2.5" d="M134 130h12"/>
<path class="accent" d="M62 38l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>
<circle class="accent-alt" cx="184" cy="42" r="5"/>
<circle class="primary-soft" cx="170" cy="28" r="3"/>`;
