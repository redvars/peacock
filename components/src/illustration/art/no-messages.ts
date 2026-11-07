import { svg } from 'lit';

/** Two speech bubbles, the front one waiting with placeholder dots: no messages yet. */
export default svg`<circle class="backdrop" cx="120" cy="88" r="70"/>
<ellipse class="shadow" cx="140" cy="158" rx="46" ry="5"/>
<path class="primary-soft" d="M70 40h64a14 14 0 0 1 14 14v30a14 14 0 0 1-14 14H90l-20 16 2-16a14 14 0 0 1-16-14V54a14 14 0 0 1 14-14z"/>
<path class="surface" d="M110 76h64a14 14 0 0 1 14 14v30a14 14 0 0 1-14 14h-2l6 16-24-16h-44a14 14 0 0 1-14-14V90a14 14 0 0 1 14-14z"/>
<circle class="detail" cx="124" cy="105" r="5"/>
<circle class="detail" cx="142" cy="105" r="5"/>
<circle class="detail" cx="160" cy="105" r="5"/>
<rect class="primary" x="72" y="58" width="40" height="6" rx="3"/>
<rect class="primary" x="72" y="72" width="24" height="6" rx="3"/>
<path class="accent" d="M192 48l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>
<circle class="accent-alt" cx="58" cy="132" r="5"/>`;
