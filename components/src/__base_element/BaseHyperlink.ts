import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export default abstract class BaseHyperlink extends LitElement {
	/**
	 * Hyperlink to navigate to on click.
	 */
	@property({ reflect: true }) href?: string;

	/**
	 * Sets or retrieves the window or frame at which to target content.
	 */
	@property() target: '_self' | '_parent' | '_blank' | '_top' | string =
		'_self';

	/**
	 * Indicates whether the element should render as a navigable link.
	 */
	protected isLink(): boolean {
		return !!this.href;
	}
}
