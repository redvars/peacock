import { customElement } from 'lit/decorators.js';
import { Avatar } from './avatar.js';

/**
 * @summary The Avatar component is used to represent user, and displays the profile picture, initials or fallback icon.
 *
 * @cssprop --avatar-background-color - Controls the color of the avatar.
 * @cssprop --avatar-size - Controls the size of the avatar.
 */
@customElement('p-avatar')
export class PAvatar extends Avatar {}
