import { svg } from 'lit';

/** A check mark in a circle with confetti around it: done, all set. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<circle class="success-soft" cx="120" cy="88" r="52"/>
<circle class="success" cx="120" cy="88" r="38"/>
<path class="stroke-surface" stroke-width="9" d="m102 89 12 12 24-26"/>
<rect class="primary" x="54" y="44" width="10" height="5" rx="2" transform="rotate(-30 59 46)"/>
<rect class="accent" x="176" y="40" width="10" height="5" rx="2" transform="rotate(40 181 42)"/>
<rect class="primary-soft" x="180" y="122" width="10" height="5" rx="2" transform="rotate(-20 185 124)"/>
<rect class="accent-alt" x="46" y="118" width="10" height="5" rx="2" transform="rotate(25 51 120)"/>
<circle class="accent" cx="70" cy="150" r="4"/>
<circle class="primary" cx="166" cy="152" r="3"/>
<path class="accent" d="M120 6l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>`;
