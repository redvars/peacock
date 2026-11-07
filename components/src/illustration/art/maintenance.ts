import { svg } from 'lit';

/** A striped road barrier and a traffic cone: down for maintenance. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="116" cy="150" rx="70" ry="6"/>
<rect class="surface" x="72" y="62" width="8" height="84" rx="3"/>
<rect class="surface" x="152" y="62" width="8" height="84" rx="3"/>
<rect class="surface" x="54" y="58" width="124" height="30" rx="6"/>
<path class="primary" d="M70 59h16l-16 28H58zm32 0h16l-16 28H86zm32 0h16l-16 28h-16zm32 0h11l-10 18v10h-17z"/>
<rect class="stroke" stroke-width="2" x="54" y="58" width="124" height="30" rx="6"/>
<rect class="primary-soft" x="62" y="144" width="28" height="6" rx="3"/>
<rect class="primary-soft" x="142" y="144" width="28" height="6" rx="3"/>
<path class="primary-soft" d="m182 86 18 58h-36z"/>
<path class="primary" d="M178 100h8l4 13h-16zm-8 26h24l3 10h-30z"/>
<rect class="primary" x="158" y="142" width="48" height="8" rx="3"/>
<path class="accent" d="M64 30l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>`;
