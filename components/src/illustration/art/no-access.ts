import { svg } from 'lit';

/** A closed padlock: you do not have access. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="120" cy="152" rx="44" ry="6"/>
<path class="stroke" stroke-width="12" d="M96 92V70a24 24 0 0 1 48 0v22"/>
<rect class="primary" x="80" y="86" width="80" height="60" rx="12"/>
<circle class="on-primary" cx="120" cy="110" r="8"/>
<rect class="on-primary" x="116" y="112" width="8" height="18" rx="4"/>
<path class="accent" d="M182 46l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>
<circle class="accent-alt" cx="56" cy="68" r="5"/>
<circle class="primary-soft" cx="186" cy="118" r="4"/>`;
