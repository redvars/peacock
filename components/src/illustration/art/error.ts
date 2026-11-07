import { svg } from 'lit';

/** A rounded warning triangle with an exclamation mark: something went wrong. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="120" cy="152" rx="52" ry="6"/>
<path class="error-soft" d="M120 38c5 0 8 2 11 7l46 82c5 9-1 19-11 19H74c-10 0-16-10-11-19l46-82c3-5 6-7 11-7z"/>
<path class="stroke-error" stroke-width="10" d="M120 78v32"/>
<circle class="error" cx="120" cy="128" r="6"/>
<path class="accent" d="M184 44l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>
<circle class="accent-alt" cx="54" cy="62" r="5"/>
<circle class="primary-soft" cx="190" cy="118" r="4"/>`;
