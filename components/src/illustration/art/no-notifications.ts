import { svg } from 'lit';

/** A resting bell under a crescent moon: no notifications. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="120" cy="152" rx="44" ry="6"/>
<circle class="primary" cx="120" cy="138" r="11"/>
<circle class="primary" cx="120" cy="46" r="7"/>
<path class="primary-soft" d="M120 50c-22 0-34 18-34 40v22l-10 14h88l-10-14V90c0-22-12-40-34-40z"/>
<rect class="primary" x="72" y="122" width="96" height="10" rx="5"/>
<path class="accent" d="M180 34a16 16 0 1 0 14 24 13 13 0 0 1-14-24z"/>
<circle class="detail" cx="164" cy="80" r="3"/>
<circle class="detail" cx="174" cy="90" r="2"/>
<circle class="accent-alt" cx="58" cy="60" r="5"/>`;
