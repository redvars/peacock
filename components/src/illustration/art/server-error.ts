import { svg } from 'lit';

/** A stack of three servers, one with a red light and an alert badge: something broke on our side. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="120" cy="152" rx="54" ry="6"/>
<rect class="surface" x="74" y="38" width="92" height="32" rx="7"/>
<rect class="surface" x="74" y="76" width="92" height="32" rx="7"/>
<rect class="surface" x="74" y="114" width="92" height="32" rx="7"/>
<circle class="success" cx="90" cy="54" r="5"/>
<circle class="error" cx="90" cy="92" r="5"/>
<circle class="success" cx="90" cy="130" r="5"/>
<rect class="inset" x="104" y="51" width="46" height="6" rx="3"/>
<rect class="inset" x="104" y="89" width="46" height="6" rx="3"/>
<rect class="inset" x="104" y="127" width="46" height="6" rx="3"/>
<circle class="error" cx="170" cy="78" r="20"/>
<path class="stroke-surface" stroke-width="5" d="M170 68v11"/>
<circle class="knockout" cx="170" cy="88" r="3"/>
<path class="stroke-error" stroke-width="3" d="m56 58 8 6-6 4 8 6"/>`;
