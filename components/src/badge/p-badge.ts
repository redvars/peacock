import { customElement } from 'lit/decorators.js';
import { Badge } from './badge.js';

/**
 * @summary The badge component is used to display a small amount of information to the user.
 *
 * @cssprop --badge-color - Controls the color of the badge.
 */
@customElement('p-badge')
export class PBadge extends Badge {}
