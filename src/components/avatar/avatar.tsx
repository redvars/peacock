import { Component, Element, h, Host, Prop } from '@stencil/core';

/**\
 * @Label Avatar
 * @name avatar
 * @description The Avatar component is used to represent user, and displays the profile picture, initials or fallback icon.
 * @category Data Display
 * @tags display
 * @example <pc-avatar size="5rem" name="Shivaji Varma" src="/assets/img/avatar.webp"></pc-avatar>
 */
@Component({
  tag: 'pc-avatar',
  styleUrl: 'avatar.scss',
  shadow: true,
})
export class Avatar {
  @Element() elm!: HTMLElement;

  @Prop() name: string = '';

  @Prop() src: string = '';

  private getInitials() {
    const name = this.name.split(' ');
    let firstName = name[0] ? name[0].charAt(0).toUpperCase() : '';
    let lastName = name[1] ? name[1].charAt(0).toUpperCase() : '';
    return `${firstName}${lastName}`;
  }

  render() {
    const cssCls = ['avatar'];
    if (this.src) {
      cssCls.push('avatar-image');
    } else {
      cssCls.push('avatar-initials');
    }
    return (
      <Host title={this.name}>
        <div class="avatar-container">
          <div class={cssCls.join(' ')}>
            {(() => {
              if (this.src) {
                return <img class="image" src={this.src} alt={this.name} />;
              } else {
                return <div class="initials">{this.getInitials()}</div>;
              }
            })()}
          </div>
        </div>
      </Host>
    );
  }
}
