import { svg } from 'lit';

/** An open, empty folder: no files here. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="120" cy="152" rx="62" ry="6"/>
<path class="primary" d="M64 48h34l10 10h68a6 6 0 0 1 6 6v76H58V54a6 6 0 0 1 6-6z"/>
<rect class="inset" x="70" y="62" width="100" height="40" rx="4"/>
<path class="primary-soft" d="M54 84a6 6 0 0 1 6-6h120a6 6 0 0 1 6 6l-4 58a8 8 0 0 1-8 8H66a8 8 0 0 1-8-8z"/>
<rect class="primary" x="104" y="96" width="32" height="6" rx="3"/>
<path class="accent" d="M190 40l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>
<circle class="accent-alt" cx="46" cy="64" r="5"/>`;
