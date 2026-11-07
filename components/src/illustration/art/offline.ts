import { svg } from 'lit';

/** A Wi-Fi signal struck through: no connection. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<path class="stroke" stroke-width="12" d="M66 84a76 76 0 0 1 108 0"/>
<path class="stroke" stroke-width="12" d="M86 104a48 48 0 0 1 68 0"/>
<circle class="primary" cx="120" cy="130" r="10"/>
<path class="stroke-primary" stroke-width="12" d="M104 118a22 22 0 0 1 32 0"/>
<path class="backdrop" d="m78 46 6-6 88 98-6 6z"/>
<path class="stroke-error" stroke-width="8" d="m80 44 82 92"/>
<path class="accent" d="M186 42l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>
<circle class="accent-alt" cx="58" cy="128" r="5"/>`;
