import { svg } from 'lit';

/** A folded map whose dashed route ends at a cross, away from the pin: page not found. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="120" cy="154" rx="64" ry="6"/>
<path class="surface" d="m54 58 42-12v90l-42 12z"/>
<path class="inset" d="m96 46 48 12v90l-48-12z"/>
<path class="surface" d="m144 58 42-12v90l-42 12z"/>
<path class="stroke-dashed" stroke-width="3" d="M66 126c10-16 24-16 34-28s22-18 34-8 24 8 32-4"/>
<path class="stroke-error" stroke-width="4" d="m160 76 12 12m0-12-12 12"/>
<path class="primary" d="M82 92S64 72 64 60a18 18 0 0 1 36 0c0 12-18 32-18 32z"/>
<circle class="on-primary" cx="82" cy="60" r="7"/>
<path class="accent" d="M196 30l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>`;
