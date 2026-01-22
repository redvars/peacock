import { customElement } from 'lit/decorators.js';
import { Icon } from './icon.js';

/**
 * @name Icon
 * @summary Icons are visual symbols used to represent ideas, objects, or actions.
 *
 * @cssprop --icon-color - Controls the color of the icon.
 * @cssprop [--icon-size=1rem] - Controls the size of the icon. Defaults to "1rem"
 */
@customElement('p-icon')
export class PIcon extends Icon {}
