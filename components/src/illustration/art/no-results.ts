import { svg } from 'lit';

/** A magnifying glass over a page, with an empty lens: the search found nothing. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="120" cy="152" rx="52" ry="6"/>
<rect class="surface" x="62" y="38" width="84" height="104" rx="8"/>
<rect class="detail" x="76" y="56" width="44" height="6" rx="3"/>
<rect class="inset" x="76" y="72" width="56" height="6" rx="3"/>
<rect class="inset" x="76" y="88" width="36" height="6" rx="3"/>
<path class="stroke-primary" stroke-width="14" d="m162 120 18 18"/>
<circle class="surface" cx="140" cy="98" r="30"/>
<circle class="stroke-primary" stroke-width="8" cx="140" cy="98" r="30"/>
<path class="stroke" stroke-width="4" d="m132 90 16 16m0-16-16 16"/>
<path class="accent" d="M186 50l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>
<circle class="accent-alt" cx="48" cy="112" r="5"/>`;
