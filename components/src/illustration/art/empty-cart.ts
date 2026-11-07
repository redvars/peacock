import { svg } from 'lit';

/** An empty shopping cart: nothing in your cart yet. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="124" cy="152" rx="56" ry="6"/>
<path class="surface" d="M78 66h100l-12 46H90z"/>
<path class="stroke" stroke-width="2" d="M110 70v38m28-38v38M84 88h88"/>
<path class="stroke-primary" stroke-width="7" d="M52 50h18l18 70h76"/>
<path class="stroke-primary" stroke-width="7" d="M74 66h104l-12 46H86"/>
<circle class="primary" cx="98" cy="138" r="9"/>
<circle class="primary" cx="154" cy="138" r="9"/>
<circle class="knockout" cx="98" cy="138" r="3"/>
<circle class="knockout" cx="154" cy="138" r="3"/>
<path class="accent" d="M184 34l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>
<circle class="accent-alt" cx="136" cy="40" r="5"/>`;
