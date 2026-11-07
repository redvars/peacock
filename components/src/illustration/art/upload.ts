import { svg } from 'lit';

/** A page and an up arrow inside a dashed drop zone: drop files here. */
export default svg`<rect class="backdrop" x="40" y="26" width="160" height="128" rx="18"/>
<rect class="stroke-dashed" stroke-width="2.5" x="40" y="26" width="160" height="128" rx="18"/>
<path class="surface" d="M98 46h30l18 18v54a6 6 0 0 1-6 6H98a6 6 0 0 1-6-6V52a6 6 0 0 1 6-6z"/>
<path class="inset" d="M128 46v14a4 4 0 0 0 4 4h14z"/>
<rect class="inset" x="102" y="78" width="30" height="5" rx="2.5"/>
<rect class="inset" x="102" y="90" width="20" height="5" rx="2.5"/>
<circle class="primary" cx="144" cy="118" r="20"/>
<path class="stroke-on-primary" stroke-width="4" d="M144 128v-20m-8 8 8-8 8 8"/>
<circle class="accent" cx="64" cy="128" r="6"/>
<circle class="accent-alt" cx="176" cy="48" r="5"/>`;
