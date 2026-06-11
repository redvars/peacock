import { i, A, b, _ as __decorate, I as IndividualComponent, a as i$1 } from './IndividualComponent-Bdwyrvd6.js';
import { n as n$1 } from './property-B49QQ8pS.js';
import { e as e$1 } from './query-CHb9Ft_d.js';
import { e } from './class-map-DG7CA1et.js';
import { o } from './if-defined-BXZpRQ4P.js';
import { n } from './when-DEJm_QN9.js';
import { i as isLink } from './is-link-Dk2OV3PM.js';
import { o as observerSlotChangesWithCallback } from './observe-slot-change-DPxaZrZF.js';
import { i as isActivationClick, d as dispatchActivationClick } from './dispatch-event-utils-CuEqjlPT.js';
import { D as DISABLED_REASON_ID } from './ButtonConstants-CahP2_NA.js';
import { m as mixinDelegatesAria, a as mixinElementInternals } from './element-internals-2CMts_0M.js';
import { m as mixinFormSubmitter, a as mixinFormAssociated } from './form-associated-BXADnjOB.js';
import { m as mixinBaseButton, a as mixinHyperlink } from './hyperlink-DLvb6MXE.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './throttle-C7ZAPqtu.js';

var css_248z = i`.button {
  transition-property: inset, width, height, transform, opacity;
  transition-duration: 200ms;
  transition-timing-function: var(--easing-standard);
  will-change: inset, transform, opacity;
}

.background {
  display: block;
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-color: var(--private-button-container-color);
  opacity: var(--private-button-container-opacity, 1);
  border-start-start-radius: var(--private-button-container-shape-start-start, var(--private-button-container-shape));
  border-start-end-radius: var(--private-button-container-shape-start-end, var(--private-button-container-shape));
  border-end-start-radius: var(--private-button-container-shape-end-start, var(--private-button-container-shape));
  border-end-end-radius: var(--private-button-container-shape-end-end, var(--private-button-container-shape));
  corner-shape: var(--private-button-container-shape-variant);
  transition-property: inset, width, height, transform, opacity;
  transition-duration: 200ms;
  transition-timing-function: var(--easing-standard);
  will-change: inset, transform, opacity;
}

.neo-background {
  display: block;
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: var(--color-inverse-surface);
  transform: translateX(0.25rem) translateY(0.25rem);
  border-start-start-radius: var(--private-button-container-shape-start-start, var(--private-button-container-shape));
  border-start-end-radius: var(--private-button-container-shape-start-end, var(--private-button-container-shape));
  border-end-start-radius: var(--private-button-container-shape-end-start, var(--private-button-container-shape));
  border-end-end-radius: var(--private-button-container-shape-end-end, var(--private-button-container-shape));
  corner-shape: var(--private-button-container-shape-variant);
  transition-property: inset, width, height, transform, opacity;
  transition-duration: 200ms;
  transition-timing-function: var(--easing-standard);
  will-change: inset, transform, opacity;
}

.focus-ring {
  z-index: 1;
  pointer-events: none;
  --focus-ring-container-shape-start-start: var(
    --private-button-container-shape-start-start,
    var(--private-button-container-shape)
  );
  --focus-ring-container-shape-start-end: var(
    --private-button-container-shape-start-end,
    var(--private-button-container-shape)
  );
  --focus-ring-container-shape-end-start: var(
    --private-button-container-shape-end-start,
    var(--private-button-container-shape)
  );
  --focus-ring-container-shape-end-end: var(
    --private-button-container-shape-end-end,
    var(--private-button-container-shape)
  );
  --focus-ring-container-shape-variant: var(
    --private-button-container-shape-variant
  );
}

.ripple {
  border-start-start-radius: var(--private-button-container-shape-start-start, var(--private-button-container-shape));
  border-start-end-radius: var(--private-button-container-shape-start-end, var(--private-button-container-shape));
  border-end-start-radius: var(--private-button-container-shape-end-start, var(--private-button-container-shape));
  border-end-end-radius: var(--private-button-container-shape-end-end, var(--private-button-container-shape));
  corner-shape: var(--private-button-container-shape-variant);
  pointer-events: none;
  --ripple-state-opacity: var(--private-button-state-opacity, 0);
  --ripple-pressed-color: var(--private-button-state-color);
}

.skeleton {
  display: block;
  position: absolute;
  inset: 0;
  pointer-events: none;
  --skeleton-container-shape-start-start: var(
    --private-button-container-shape-start-start,
    var(--private-button-container-shape)
  );
  --skeleton-container-shape-start-end: var(
    --private-button-container-shape-start-end,
    var(--private-button-container-shape)
  );
  --skeleton-container-shape-end-start: var(
    --private-button-container-shape-end-start,
    var(--private-button-container-shape)
  );
  --skeleton-container-shape-end-end: var(
    --private-button-container-shape-end-end,
    var(--private-button-container-shape)
  );
  --skeleton-container-shape-variant: var(
    --private-button-container-shape-variant
  );
}

.elevation {
  pointer-events: none;
  transition-duration: 280ms;
  --elevation-container-shape-start-start: var(
    --private-button-container-shape-start-start,
    var(--private-button-container-shape)
  );
  --elevation-container-shape-start-end: var(
    --private-button-container-shape-start-end,
    var(--private-button-container-shape)
  );
  --elevation-container-shape-end-start: var(
    --private-button-container-shape-end-start,
    var(--private-button-container-shape)
  );
  --elevation-container-shape-end-end: var(
    --private-button-container-shape-end-end,
    var(--private-button-container-shape)
  );
  --elevation-container-shape-variant: var(
    --private-button-container-shape-variant
  );
  --elevation-level: var(--private-button-container-elevation-level);
}

.outline {
  display: block;
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: var(--private-button-outline-width) solid var(--private-button-outline-color);
  opacity: var(--private-button-outline-opacity, 1);
  border-start-start-radius: var(--private-button-container-shape-start-start, var(--private-button-container-shape));
  border-start-end-radius: var(--private-button-container-shape-start-end, var(--private-button-container-shape));
  border-end-start-radius: var(--private-button-container-shape-end-start, var(--private-button-container-shape));
  border-end-end-radius: var(--private-button-container-shape-end-end, var(--private-button-container-shape));
  corner-shape: var(--private-button-container-shape-variant);
  transition-property: inset, width, height, transform, opacity;
  transition-duration: 200ms;
  transition-timing-function: var(--easing-standard);
  will-change: inset, transform, opacity;
}

.tooltip {
  z-index: 1;
}

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  --button-icon-size: unset;
  --button-container-padding: unset;
}

:host {
  position: relative;
  display: inline-flex;
  min-height: var(--button-height);
  --private-button-container-shape-start-start: var(
    --button-container-shape-start-start,
    var(--button-container-shape)
  );
  --private-button-container-shape-start-end: var(
    --button-container-shape-start-end,
    var(--button-container-shape)
  );
  --private-button-container-shape-end-start: var(
    --button-container-shape-end-start,
    var(--button-container-shape)
  );
  --private-button-container-shape-end-end: var(
    --button-container-shape-end-end,
    var(--button-container-shape)
  );
  --private-button-container-shape-variant: var(
    --button-container-shape-variant
  );
}

/*
  * Reset native button/link styles
  */
.native-button {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  padding: 0;
}

.native-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  outline: none;
}
.native-link:link, .native-link:visited, .native-link:hover, .native-link:active {
  text-decoration: none;
  color: inherit;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--button-height);
  padding: 0 var(--button-container-padding, var(--private-button-container-padding));
  width: 100%;
}
.button .label {
  font-family: var(--font-family-sans) !important;
  font-size: var(--private-button-font-size);
  font-weight: var(--private-button-font-weight);
  line-height: var(--private-button-line-height);
  letter-spacing: var(--private-button-letter-spacing);
  color: var(--private-button-label-text-color);
  --icon-size: var(--button-icon-size, var(--private-button-icon-size));
  --icon-color: var(--private-button-label-text-color);
  opacity: var(--private-button-label-text-opacity, 1);
  display: inline-flex;
  pointer-events: none;
}
.button .touch {
  position: absolute;
  min-height: 2.5rem;
  min-width: 2.5rem;
  height: 100%;
  width: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: var(--private-button-cursor, pointer);
}
.button {
  /* make the icon slot itself collapsible so removal animates smoothly */
}
.button .icon-slot {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  pointer-events: none;
}
.button .icon-slot::slotted(*) {
  --icon-size: var(--button-icon-size, var(--private-button-icon-size));
  --icon-color: var(--private-button-label-text-color);
  opacity: var(--private-button-label-text-opacity, 1);
}

:host(:not([skeleton])) .skeleton {
  display: none;
}

:host([skeleton]) .background {
  display: none;
}
:host([skeleton]) .ripple {
  display: none;
}

/**
 * Button variant definitions
 */
:host([variant=elevated]) {
  --private-button-container-color: var(--elevated-button-container-color);
  --private-button-label-text-color: var(--elevated-button-label-text-color);
  --private-button-container-elevation-level: 1;
  --private-button-state-color: var(--private-button-label-text-color);
}
:host([variant=elevated]):host(:hover:not([disabled], [soft-disabled], [skeleton])) {
  --private-button-container-elevation-level: 2;
  --private-button-state-opacity: 0.08;
}
:host([variant=elevated]):host(:active:not([disabled], [soft-disabled], [skeleton])) {
  --private-button-container-elevation-level: 1;
  --private-button-state-opacity: 0.12;
}
:host([variant=elevated]):host([disabled]), :host([variant=elevated]):host([soft-disabled]) {
  --private-button-cursor: not-allowed;
  --private-button-container-color: var(--color-on-surface);
  --private-button-container-opacity: 0.1;
  --private-button-label-text-color: var(--color-on-surface);
  --private-button-label-text-opacity: 0.38;
}
:host([variant=elevated]):host([disabled]) .ripple, :host([variant=elevated]):host([soft-disabled]) .ripple {
  display: none;
}

:host([variant=filled]) {
  --private-button-container-color: var(--filled-button-container-color);
  --private-button-label-text-color: var(--filled-button-label-text-color);
  --private-button-state-color: var(--private-button-label-text-color);
}
:host([variant=filled]):host(:hover:not([disabled], [soft-disabled], [skeleton])) {
  --private-button-container-elevation-level: 1;
  --private-button-state-opacity: 0.08;
}
:host([variant=filled]):host(:active:not([disabled], [soft-disabled], [skeleton])) {
  --private-button-container-elevation-level: 0;
  --private-button-state-opacity: 0.1;
}
:host([variant=filled]):host([disabled]), :host([variant=filled]):host([soft-disabled]) {
  --private-button-cursor: not-allowed;
  --private-button-container-color: var(--color-on-surface);
  --private-button-container-opacity: 0.1;
  --private-button-label-text-color: var(--color-on-surface);
  --private-button-label-text-opacity: 0.38;
}
:host([variant=filled]):host([disabled]) .ripple, :host([variant=filled]):host([soft-disabled]) .ripple {
  display: none;
}

:host([variant=tonal]) {
  --private-button-container-color: var(--tonal-button-container-color);
  --private-button-label-text-color: var(--tonal-button-label-text-color);
  --private-button-state-color: var(--private-button-label-text-color);
}
:host([variant=tonal]):host(:hover:not([disabled], [soft-disabled], [skeleton])) {
  --private-button-container-elevation-level: 1;
  --private-button-state-opacity: 0.08;
}
:host([variant=tonal]):host(:active:not([disabled], [soft-disabled], [skeleton])) {
  --private-button-container-elevation-level: 0;
  --private-button-state-opacity: 0.12;
}
:host([variant=tonal]):host([disabled]), :host([variant=tonal]):host([soft-disabled]) {
  --private-button-cursor: not-allowed;
  --private-button-container-color: var(--color-on-surface);
  --private-button-container-opacity: 0.1;
  --private-button-label-text-color: var(--color-on-surface);
  --private-button-label-text-opacity: 0.38;
}
:host([variant=tonal]):host([disabled]) .ripple, :host([variant=tonal]):host([soft-disabled]) .ripple {
  display: none;
}

:host([variant=outlined]) {
  --private-button-outline-width: var(
    --outlined-button-outline-width,
    0.0675rem
  );
  --private-button-container-color: var(--outlined-button-container-color);
  --private-button-outline-color: var(--outlined-button-outline-color);
  --private-button-label-text-color: var(--outlined-button-label-text-color);
  --private-button-state-color: var(--private-button-label-text-color);
}
:host([variant=outlined]):host(:hover:not([disabled], [soft-disabled], [skeleton])) {
  --private-button-state-opacity: 0.08;
}
:host([variant=outlined]):host(:active:not([disabled], [soft-disabled], [skeleton])) {
  --private-button-state-opacity: 0.12;
}
:host([variant=outlined]):host([disabled]), :host([variant=outlined]):host([soft-disabled]) {
  --private-button-cursor: not-allowed;
  --private-button-outline-color: var(--color-on-surface);
  --private-button-label-text-color: var(--color-on-surface);
  --private-button-label-text-opacity: 0.38;
  --private-button-outline-opacity: 0.12;
}
:host([variant=outlined]):host([disabled]) .ripple, :host([variant=outlined]):host([soft-disabled]) .ripple {
  display: none;
}

:host([variant=text]) {
  --private-button-label-text-color: var(--text-button-label-text-color);
  --private-button-state-color: var(--private-button-label-text-color);
}
:host([variant=text]):host(:hover:not([disabled], [soft-disabled], [skeleton])) {
  --private-button-state-opacity: 0.08;
}
:host([variant=text]):host(:active:not([disabled], [soft-disabled], [skeleton])) {
  --private-button-state-opacity: 0.12;
}
:host([variant=text]):host([disabled]), :host([variant=text]):host([soft-disabled]) {
  --private-button-cursor: not-allowed;
  --private-button-label-text-color: var(--color-on-surface);
  --private-button-label-text-opacity: 0.38;
}
:host([variant=text]):host([disabled]) .ripple, :host([variant=text]):host([soft-disabled]) .ripple {
  display: none;
}

:host([variant=neo]) {
  --private-button-container-color: var(--neo-button-container-color);
  --private-button-label-text-color: var(--neo-button-label-text-color);
  --private-button-outline-width: var(
    --outlined-button-outline-width,
    0.125rem
  );
  --private-button-outline-color: var(--color-inverse-surface);
}
:host([variant=neo]) .focus-ring {
  --focus-ring-color: var(--color-primary-container);
  --focus-ring-inset: -2px;
}
:host([variant=neo]) .ripple {
  display: none;
}
:host([variant=neo]):host(:active:not([disabled], [soft-disabled], [skeleton])) .background,
:host([variant=neo]):host(:active:not([disabled], [soft-disabled], [skeleton])) .button,
:host([variant=neo]):host(:active:not([disabled], [soft-disabled], [skeleton])) .outline,
:host([variant=neo]):host(:active:not([disabled], [soft-disabled], [skeleton])) .focus-ring {
  transform: translateX(0.25rem) translateY(0.25rem);
}
:host([variant=neo]):host([disabled]) {
  --private-button-container-color: var(--color-on-surface);
  --private-button-container-opacity: 0.1;
  --private-button-label-text-color: var(--color-on-surface);
  --private-button-label-text-opacity: 0.38;
  --private-button-outline-opacity: 0.12;
}
:host([variant=neo]):host([disabled]) .ripple {
  display: none;
}

:host([block]) {
  width: 100%;
}

/* -- Square Shape -- */
:host([shape=square]:not([selected])):host {
  --button-container-shape-variant: squircle;
}
:host([shape=square]:not([selected])):host([size=xs]), :host([shape=square]:not([selected])):host([size=extra-small]), :host([shape=square]:not([selected])):host([size=sm]), :host([shape=square]:not([selected])):host([size=small]) {
  --button-container-shape: var(--shape-corner-medium);
}
:host([shape=square]:not([selected])):host([size=xs]:active), :host([shape=square]:not([selected])):host([size=extra-small]:active), :host([shape=square]:not([selected])):host([size=sm]:active), :host([shape=square]:not([selected])):host([size=small]:active) {
  --button-container-shape: var(--shape-corner-small);
}
:host([shape=square]:not([selected])):host([size=md]), :host([shape=square]:not([selected])):host([size=medium]), :host([shape=square]:not([selected])):host([size=lg]), :host([shape=square]:not([selected])):host([size=large]) {
  --button-container-shape: var(--shape-corner-large);
}
:host([shape=square]:not([selected])):host([size=md]:active), :host([shape=square]:not([selected])):host([size=medium]:active), :host([shape=square]:not([selected])):host([size=lg]:active), :host([shape=square]:not([selected])):host([size=large]:active) {
  --button-container-shape: var(--shape-corner-medium);
}
:host([shape=square]:not([selected])):host([size=xl]), :host([shape=square]:not([selected])):host([size=extra]) {
  --button-container-shape: var(--shape-corner-extra-large);
}
:host([shape=square]:not([selected])):host([size=xl]:active), :host([shape=square]:not([selected])):host([size=extra]:active) {
  --button-container-shape: var(--shape-corner-large);
}

:host([shape=square][selected]),
:host([shape=square][selected]:active) {
  --button-container-shape: var(--shape-corner-full);
  --button-container-shape-variant: round;
}

/* -- Round Shape -- */
:host([shape=round]:not([selected])),
:host([shape=round]:not([selected]):active),
:host([shape=narrow]:not([selected])),
:host([shape=narrow]:not([selected]):active),
:host([shape=wide]:not([selected])),
:host([shape=wide]:not([selected]):active) {
  --button-container-shape: var(--shape-corner-full);
  --button-container-shape-variant: round;
}

:host([shape=round][selected]):host,
:host([shape=narrow][selected]):host,
:host([shape=wide][selected]):host {
  --button-container-shape-variant: squircle;
}
:host([shape=round][selected]):host([size=xs]), :host([shape=round][selected]):host([size=extra-small]), :host([shape=round][selected]):host([size=sm]), :host([shape=round][selected]):host([size=small]),
:host([shape=narrow][selected]):host([size=xs]),
:host([shape=narrow][selected]):host([size=extra-small]),
:host([shape=narrow][selected]):host([size=sm]),
:host([shape=narrow][selected]):host([size=small]),
:host([shape=wide][selected]):host([size=xs]),
:host([shape=wide][selected]):host([size=extra-small]),
:host([shape=wide][selected]):host([size=sm]),
:host([shape=wide][selected]):host([size=small]) {
  --button-container-shape: var(--shape-corner-medium);
}
:host([shape=round][selected]):host([size=xs]:active), :host([shape=round][selected]):host([size=extra-small]:active), :host([shape=round][selected]):host([size=sm]:active), :host([shape=round][selected]):host([size=small]:active),
:host([shape=narrow][selected]):host([size=xs]:active),
:host([shape=narrow][selected]):host([size=extra-small]:active),
:host([shape=narrow][selected]):host([size=sm]:active),
:host([shape=narrow][selected]):host([size=small]:active),
:host([shape=wide][selected]):host([size=xs]:active),
:host([shape=wide][selected]):host([size=extra-small]:active),
:host([shape=wide][selected]):host([size=sm]:active),
:host([shape=wide][selected]):host([size=small]:active) {
  --button-container-shape: var(--shape-corner-small);
}
:host([shape=round][selected]):host([size=md]), :host([shape=round][selected]):host([size=medium]), :host([shape=round][selected]):host([size=lg]), :host([shape=round][selected]):host([size=large]),
:host([shape=narrow][selected]):host([size=md]),
:host([shape=narrow][selected]):host([size=medium]),
:host([shape=narrow][selected]):host([size=lg]),
:host([shape=narrow][selected]):host([size=large]),
:host([shape=wide][selected]):host([size=md]),
:host([shape=wide][selected]):host([size=medium]),
:host([shape=wide][selected]):host([size=lg]),
:host([shape=wide][selected]):host([size=large]) {
  --button-container-shape: var(--shape-corner-large);
}
:host([shape=round][selected]):host([size=md]:active), :host([shape=round][selected]):host([size=medium]:active), :host([shape=round][selected]):host([size=lg]:active), :host([shape=round][selected]):host([size=large]:active),
:host([shape=narrow][selected]):host([size=md]:active),
:host([shape=narrow][selected]):host([size=medium]:active),
:host([shape=narrow][selected]):host([size=lg]:active),
:host([shape=narrow][selected]):host([size=large]:active),
:host([shape=wide][selected]):host([size=md]:active),
:host([shape=wide][selected]):host([size=medium]:active),
:host([shape=wide][selected]):host([size=lg]:active),
:host([shape=wide][selected]):host([size=large]:active) {
  --button-container-shape: var(--shape-corner-medium);
}
:host([shape=round][selected]):host([size=xl]), :host([shape=round][selected]):host([size=extra]),
:host([shape=narrow][selected]):host([size=xl]),
:host([shape=narrow][selected]):host([size=extra]),
:host([shape=wide][selected]):host([size=xl]),
:host([shape=wide][selected]):host([size=extra]) {
  --button-container-shape: var(--shape-corner-extra-large);
}
:host([shape=round][selected]):host([size=xl]:active), :host([shape=round][selected]):host([size=extra]:active),
:host([shape=narrow][selected]):host([size=xl]:active),
:host([shape=narrow][selected]):host([size=extra]:active),
:host([shape=wide][selected]):host([size=xl]:active),
:host([shape=wide][selected]):host([size=extra]:active) {
  --button-container-shape: var(--shape-corner-large);
}

:host([color=primary]:not([toggle])) {
  --elevated-button-container-color: var(--color-surface-container-low);
  --elevated-button-label-text-color: var(--color-primary);
  --filled-button-container-color: var(--color-primary);
  --filled-button-label-text-color: var(--color-on-primary);
  --tonal-button-container-color: var(--color-primary-container);
  --tonal-button-label-text-color: var(--color-on-primary-container);
  --outlined-button-outline-color: var(--color-outline-variant);
  --outlined-button-label-text-color: var(--color-on-surface-variant);
  --text-button-label-text-color: var(--color-primary);
  --neo-button-container-color: var(--color-primary);
  --neo-button-label-text-color: var(--color-on-primary);
}

:host([color=primary][toggle][selected]) {
  --filled-button-container-color: var(--color-primary);
  --filled-button-label-text-color: var(--color-on-primary);
  --tonal-button-container-color: var(--color-secondary);
  --tonal-button-label-text-color: var(--color-on-secondary);
  --elevated-button-container-color: var(--color-primary);
  --elevated-button-label-text-color: var(--color-on-primary);
  --outlined-button-outline-color: var(--color-inverse-surface);
  --outlined-button-container-color: var(--color-inverse-surface);
  --outlined-button-label-text-color: var(--color-inverse-on-surface);
}

:host([color=primary][toggle]:not([selected])) {
  --filled-button-container-color: var(--color-surface-container-high);
  --filled-button-label-text-color: var(--color-on-surface);
  --tonal-button-container-color: var(--color-primary-container);
  --tonal-button-label-text-color: var(--color-on-primary-container);
  --elevated-button-container-color: var(--color-surface-container-low);
  --elevated-button-label-text-color: var(--color-primary);
  --outlined-button-outline-color: var(--color-outline-variant);
  --outlined-button-label-text-color: var(--color-on-surface-variant);
}

:host([color=secondary]:not([toggle])) {
  --elevated-button-container-color: var(--color-surface-container-low);
  --elevated-button-label-text-color: var(--color-secondary);
  --filled-button-container-color: var(--color-secondary);
  --filled-button-label-text-color: var(--color-on-secondary);
  --tonal-button-container-color: var(--color-secondary-container);
  --tonal-button-label-text-color: var(--color-on-secondary-container);
  --outlined-button-outline-color: var(--color-outline-variant);
  --outlined-button-label-text-color: var(--color-on-surface-variant);
  --text-button-label-text-color: var(--color-secondary);
  --neo-button-container-color: var(--color-secondary);
  --neo-button-label-text-color: var(--color-on-secondary);
}

:host([color=secondary][toggle][selected]) {
  --filled-button-container-color: var(--color-secondary);
  --filled-button-label-text-color: var(--color-on-secondary);
  --tonal-button-container-color: var(--color-secondary);
  --tonal-button-label-text-color: var(--color-on-secondary);
  --elevated-button-container-color: var(--color-secondary);
  --elevated-button-label-text-color: var(--color-on-secondary);
  --outlined-button-outline-color: var(--color-inverse-surface);
  --outlined-button-container-color: var(--color-inverse-surface);
  --outlined-button-label-text-color: var(--color-inverse-on-surface);
}

:host([color=secondary][toggle]:not([selected])) {
  --filled-button-container-color: var(--color-surface-container-high);
  --filled-button-label-text-color: var(--color-on-surface);
  --tonal-button-container-color: var(--color-secondary-container);
  --tonal-button-label-text-color: var(--color-on-secondary-container);
  --elevated-button-container-color: var(--color-surface-container-low);
  --elevated-button-label-text-color: var(--color-secondary);
  --outlined-button-outline-color: var(--color-outline-variant);
  --outlined-button-label-text-color: var(--color-on-surface-variant);
}

:host([color=tertiary]:not([toggle])) {
  --elevated-button-container-color: var(--color-surface-container-low);
  --elevated-button-label-text-color: var(--color-tertiary);
  --filled-button-container-color: var(--color-tertiary);
  --filled-button-label-text-color: var(--color-on-tertiary);
  --tonal-button-container-color: var(--color-tertiary-container);
  --tonal-button-label-text-color: var(--color-on-tertiary-container);
  --outlined-button-outline-color: var(--color-outline-variant);
  --outlined-button-label-text-color: var(--color-on-surface-variant);
  --text-button-label-text-color: var(--color-tertiary);
  --neo-button-container-color: var(--color-tertiary);
  --neo-button-label-text-color: var(--color-on-tertiary);
}

:host([color=tertiary][toggle][selected]) {
  --filled-button-container-color: var(--color-tertiary);
  --filled-button-label-text-color: var(--color-on-tertiary);
  --tonal-button-container-color: var(--color-secondary);
  --tonal-button-label-text-color: var(--color-on-secondary);
  --elevated-button-container-color: var(--color-tertiary);
  --elevated-button-label-text-color: var(--color-on-tertiary);
  --outlined-button-outline-color: var(--color-inverse-surface);
  --outlined-button-container-color: var(--color-inverse-surface);
  --outlined-button-label-text-color: var(--color-inverse-on-surface);
}

:host([color=tertiary][toggle]:not([selected])) {
  --filled-button-container-color: var(--color-surface-container-high);
  --filled-button-label-text-color: var(--color-on-surface);
  --tonal-button-container-color: var(--color-tertiary-container);
  --tonal-button-label-text-color: var(--color-on-tertiary-container);
  --elevated-button-container-color: var(--color-surface-container-low);
  --elevated-button-label-text-color: var(--color-tertiary);
  --outlined-button-outline-color: var(--color-outline-variant);
  --outlined-button-label-text-color: var(--color-on-surface-variant);
}

:host([color=success]:not([toggle])) {
  --elevated-button-container-color: var(--color-surface-container-low);
  --elevated-button-label-text-color: var(--color-success);
  --filled-button-container-color: var(--color-success);
  --filled-button-label-text-color: var(--color-on-success);
  --tonal-button-container-color: var(--color-success-container);
  --tonal-button-label-text-color: var(--color-on-success-container);
  --outlined-button-outline-color: var(--color-outline-variant);
  --outlined-button-label-text-color: var(--color-on-surface-variant);
  --text-button-label-text-color: var(--color-success);
  --neo-button-container-color: var(--color-success);
  --neo-button-label-text-color: var(--color-on-success);
}

:host([color=success][toggle][selected]) {
  --filled-button-container-color: var(--color-success);
  --filled-button-label-text-color: var(--color-on-success);
  --tonal-button-container-color: var(--color-secondary);
  --tonal-button-label-text-color: var(--color-on-secondary);
  --elevated-button-container-color: var(--color-success);
  --elevated-button-label-text-color: var(--color-on-success);
  --outlined-button-outline-color: var(--color-inverse-surface);
  --outlined-button-container-color: var(--color-inverse-surface);
  --outlined-button-label-text-color: var(--color-inverse-on-surface);
}

:host([color=success][toggle]:not([selected])) {
  --filled-button-container-color: var(--color-surface-container-high);
  --filled-button-label-text-color: var(--color-on-surface);
  --tonal-button-container-color: var(--color-success-container);
  --tonal-button-label-text-color: var(--color-on-success-container);
  --elevated-button-container-color: var(--color-surface-container-low);
  --elevated-button-label-text-color: var(--color-success);
  --outlined-button-outline-color: var(--color-outline-variant);
  --outlined-button-label-text-color: var(--color-on-surface-variant);
}

:host([color=danger]:not([toggle])) {
  --elevated-button-container-color: var(--color-surface-container-low);
  --elevated-button-label-text-color: var(--color-error);
  --filled-button-container-color: var(--color-error);
  --filled-button-label-text-color: var(--color-on-error);
  --tonal-button-container-color: var(--color-error-container);
  --tonal-button-label-text-color: var(--color-on-error-container);
  --outlined-button-outline-color: var(--color-outline-variant);
  --outlined-button-label-text-color: var(--color-on-surface-variant);
  --text-button-label-text-color: var(--color-error);
  --neo-button-container-color: var(--color-error);
  --neo-button-label-text-color: var(--color-on-error);
}

:host([color=danger][toggle][selected]) {
  --filled-button-container-color: var(--color-error);
  --filled-button-label-text-color: var(--color-on-error);
  --tonal-button-container-color: var(--color-secondary);
  --tonal-button-label-text-color: var(--color-on-secondary);
  --elevated-button-container-color: var(--color-error);
  --elevated-button-label-text-color: var(--color-on-error);
  --outlined-button-outline-color: var(--color-inverse-surface);
  --outlined-button-container-color: var(--color-inverse-surface);
  --outlined-button-label-text-color: var(--color-inverse-on-surface);
}

:host([color=danger][toggle]:not([selected])) {
  --filled-button-container-color: var(--color-surface-container-high);
  --filled-button-label-text-color: var(--color-on-surface);
  --tonal-button-container-color: var(--color-error-container);
  --tonal-button-label-text-color: var(--color-on-error-container);
  --elevated-button-container-color: var(--color-surface-container-low);
  --elevated-button-label-text-color: var(--color-error);
  --outlined-button-outline-color: var(--color-outline-variant);
  --outlined-button-label-text-color: var(--color-on-surface-variant);
}

:host([color=on-surface]) {
  --filled-button-container-color: var(--color-on-surface);
  --filled-button-label-text-color: var(--color-surface);
  --tonal-button-container-color: var(--color-on-surface-container);
  --tonal-button-label-text-color: var(--color-surface-container-high);
  --elevated-button-container-color: var(--color-on-surface);
  --elevated-button-label-text-color: var(--color-surface);
  --outlined-button-outline-color: var(--color-on-surface);
  --outlined-button-label-text-color: var(--color-on-surface);
  --text-button-label-text-color: var(--color-on-surface);
  --neo-button-container-color: var(--color-on-surface);
  --neo-button-label-text-color: var(--color-surface);
}

:host([color=surface]) {
  --filled-button-container-color: var(--color-surface-container-high);
  --filled-button-label-text-color: var(--color-on-surface);
  --tonal-button-container-color: var(--color-surface-container-high);
  --tonal-button-label-text-color: var(--color-on-surface-container);
  --elevated-button-container-color: var(--color-surface);
  --elevated-button-label-text-color: var(--color-on-surface);
  --outlined-button-outline-color: var(--color-on-surface);
  --outlined-button-label-text-color: var(--color-on-surface);
  --text-button-label-text-color: var(--color-on-surface);
  --neo-button-container-color: var(--color-surface);
  --neo-button-label-text-color: var(--color-on-surface);
}

:host([size=xs]),
:host([size=extra-small]) {
  --button-height: 2rem;
  --private-button-icon-size: 1rem;
  --private-button-container-padding: 0.75rem;
  --private-button-icon-label-spacing: 0.5rem;
  --private-button-font-size: 0.875rem !important;
  --private-button-font-weight: var(--font-weight-medium) !important;
  --private-button-line-height: 1.25rem !important;
  --private-button-letter-spacing: 0.1px !important;
}

:host([size=sm]),
:host([size=small]) {
  --button-height: 2.5rem;
  --private-button-icon-size: 1.25rem;
  --private-button-container-padding: 1rem;
  --private-button-icon-label-spacing: 0.5rem;
  --private-button-font-size: 0.875rem !important;
  --private-button-font-weight: var(--font-weight-medium) !important;
  --private-button-line-height: 1.25rem !important;
  --private-button-letter-spacing: 0.1px !important;
}

:host([size=md]),
:host([size=medium]) {
  --button-height: 3.5rem;
  --private-button-icon-size: 1.5rem;
  --private-button-container-padding: 1.5rem;
  --private-button-icon-label-spacing: 0.5rem;
  --private-button-font-size: 1rem !important;
  --private-button-font-weight: var(--font-weight-medium) !important;
  --private-button-line-height: 1.5rem !important;
  --private-button-letter-spacing: 0.15px !important;
}

:host([size=lg]),
:host([size=large]) {
  --button-height: 6rem;
  --private-button-icon-size: 2rem;
  --private-button-container-padding: 3rem;
  --private-button-icon-label-spacing: 0.75rem;
  --private-button-font-size: 1.5rem !important;
  --private-button-font-weight: var(--font-weight-regular) !important;
  --private-button-line-height: 2rem !important;
  --private-button-letter-spacing: 0 !important;
}

:host([size=xl]),
:host([size=extra-large]) {
  --button-height: 8.5rem;
  --private-button-icon-size: 2.5rem;
  --private-button-container-padding: 4rem;
  --private-button-icon-label-spacing: 1rem;
  --private-button-font-size: 2rem !important;
  --private-button-font-weight: var(--font-weight-regular) !important;
  --private-button-line-height: 2.5rem !important;
  --private-button-letter-spacing: 0 !important;
}

/* When both icon and label are present, apply the configured spacing */
:host([has-icon][has-label]) .button {
  gap: var(--private-button-icon-label-spacing);
}

:host(:not([trailing-icon])) .button {
  flex-direction: row;
}

:host([trailing-icon]) .button {
  flex-direction: row-reverse;
}`;

/**
 * @label Button
 * @tag wc-button
 * @rawTag button
 *
 * @summary Buttons help people initiate actions, from sending an email, to sharing a document, to liking a post.
 * @overview
 * <p>Buttons are clickable elements that are used to trigger actions. They communicate calls to action to the user and allow users to interact with pages in a variety of ways. Button labels express what action will occur when the user interacts with it.</p>
 *
 * @cssprop --button-container-shape - Defines the border radius of the button container shape.
 *
 * @cssprop --button-container-shape-start-start - Defines the start position of the button container shape.
 * @cssprop --button-container-shape-start-end - Defines the end position of the button container shape.
 * @cssprop --button-container-shape-end-start - Defines the start position of the button container shape.
 * @cssprop --button-container-shape-end-end - Defines the end position of the button container shape.
 *
 *
 * @cssprop --filled-button-container-color - Color of the filled button container.
 * @cssprop --filled-button-label-text-color - Text color of the filled button label.
 *
 * @cssprop --outlined-button-container-color - Color of the outlined button container.
 * @cssprop --outlined-button-label-text-color - Text color of the outlined button label.
 *
 * @cssprop --text-button-label-text-color - Text color of the text button label.
 *
 * @cssprop --tonal-button-container-color - Color of the tonal button container.
 * @cssprop --tonal-button-label-text-color - Text color of the tonal button label.
 *
 * @cssprop --elevated-button-container-color - Color of the elevated button container.
 * @cssprop --elevated-button-label-text-color - Text color of the elevated button label.
 *
 * @cssprop --neo-button-container-color - Color of the neo button container.
 * @cssprop --neo-button-label-text-color - Text color of the neo button label.
 *
 * @fires {MouseEvent} click - Dispatched when the button is clicked.
 *
 * @example
 * ```html
 * <wc-button>Button</wc-button>
 * ```
 * @tags display
 */
let Button = class Button extends mixinBaseButton(mixinHyperlink(mixinDelegatesAria(mixinFormSubmitter(mixinFormAssociated(mixinElementInternals(i$1)))))) {
    // ── Constructor ───────────────────────────────────────────────────────────
    constructor() {
        super();
        // ── Properties ───────────────────────────────────────────────────────────
        /**
         * When `true` (default), the icon is placed after the label (trailing).
         * When `false`, the icon is placed before the label (leading).
         */
        this.trailingIcon = false;
        /**
         * Button size.
         * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
         */
        this.size = 'sm';
        /** Shape of the button container. */
        this.shape = 'square';
        /**
         * The visual style of the button.
         *
         *  Possible variant values:
         * `"filled"` is a filled button.
         * `"outlined"` is an outlined button.
         * `"text"` is a transparent button.
         * `"tonal"` is a light color button.
         * `"elevated"` is elevated button
         */
        this.variant = 'filled';
        /**
         * Defines the primary color of the button. This can be set to predefined color names to apply specific color themes.
         */
        this.color = 'primary';
        /** When true, renders the button in a loading skeleton state. */
        this.skeleton = false;
        /** When true, the button acts as a toggle. Use with `selected`. */
        this.toggle = false;
        /** When true (and `toggle` is set), the button is in the selected/pressed state. */
        this.selected = false;
        // ── Private fields ────────────────────────────────────────────────────────
        /** Cleanup returned by observerSlotChangesWithCallback for the icon slot. */
        this.__iconSlotCleanup = null;
        /** Cleanup returned by observerSlotChangesWithCallback for the label slot. */
        this.__labelSlotCleanup = null;
        this.__dispatchClick = (event) => {
            // If the button is soft-disabled or a disabled link, we need to explicitly
            // prevent the click from propagating to other event listeners as well as
            // prevent the default action.
            if (this.softDisabled || (this.disabled && this.href) || this.skeleton) {
                event.stopImmediatePropagation();
                event.preventDefault();
                return;
            }
            if (!isActivationClick(event) || !this.buttonElement) {
                return;
            }
            this.focus();
            dispatchActivationClick(this.buttonElement);
        };
        this.addEventListener('click', this.__dispatchClickWithThrottle);
    }
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    disconnectedCallback() {
        // disconnect slot observers first to avoid callbacks during teardown
        try {
            this.__iconSlotCleanup?.();
        }
        catch (e) {
            /* ignore */
        }
        try {
            this.__labelSlotCleanup?.();
        }
        catch (e) {
            /* ignore */
        }
        super.disconnectedCallback();
    }
    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        this.__convertTypeToVariantAndColor();
        // Initialize slot presence tracking for smooth transitions when label/icon are added/removed
        const iconSlot = this.renderRoot.querySelector('slot[name="icon"]');
        const labelSlot = this.renderRoot.querySelector('slot.label');
        // Use MutationObserver-based helper so we react to content/character changes
        if (iconSlot) {
            this.__iconSlotCleanup = observerSlotChangesWithCallback(iconSlot, has => {
                this.toggleAttribute('has-icon', has);
            });
        }
        if (labelSlot) {
            this.__labelSlotCleanup = observerSlotChangesWithCallback(labelSlot, has => {
                this.toggleAttribute('has-label', has);
            });
        }
    }
    // ── Public methods ────────────────────────────────────────────────────────
    focus() {
        this.buttonElement?.focus();
    }
    blur() {
        this.buttonElement?.blur();
    }
    // ── Private methods ───────────────────────────────────────────────────────
    __convertTypeToVariantAndColor() {
        if (this.level === 'primary') {
            this.color = 'primary';
            this.variant = 'filled';
        }
        else if (this.level === 'secondary') {
            this.color = 'surface';
            this.variant = 'tonal';
        }
        else if (this.level === 'tertiary') {
            this.color = 'primary';
            this.variant = 'text';
        }
        else if (this.level === 'danger') {
            this.color = 'danger';
            this.variant = 'filled';
        }
    }
    // ── Render helpers ────────────────────────────────────────────────────────
    renderButtonElement() {
        const isElementLink = isLink(this);
        const cssClasses = {
            button: true,
            'native-button': !isElementLink,
            'native-link': isElementLink,
            'trailing-icon': this.trailingIcon,
        };
        // Needed for closure conformance
        const { ariaLabel, ariaHasPopup, ariaExpanded } = this;
        if (isElementLink) {
            return b `<a
        class=${e(cssClasses)}
        id="link"
        href=${this.href}
        target=${this.target}
        tabindex=${this.disabled ? '-1' : '0'}
        aria-label="${ariaLabel || A}"
        aria-haspopup="${ariaHasPopup || A}"
        aria-expanded="${ariaExpanded || A}"
        aria-describedby=${o(this.softDisabled ? DISABLED_REASON_ID : undefined)}
        ?aria-disabled=${this.softDisabled}
      >
        ${this.renderButtonContent()}
      </a>`;
        }
        return b `<button
        class=${e(cssClasses)}
        id="button"
        aria-label="${ariaLabel || A}"
        aria-haspopup="${ariaHasPopup || A}"
        aria-expanded="${ariaExpanded || A}"
        aria-describedby=${o(this.softDisabled ? DISABLED_REASON_ID : undefined)}
        ?aria-disabled=${this.softDisabled}
        ?disabled=${this.disabled}
      >
        ${this.renderButtonContent()}
      </button>
      ${this.renderTooltip()}`;
    }
    renderButtonContent() {
        return b ` <slot class="icon-slot" name="icon"></slot>
      <slot class="label"></slot>
      <div class="touch"></div>

      ${this.renderDisabledReason(this.softDisabled)}`;
    }
    renderDisabledReason(softDisabled) {
        if (softDisabled)
            return b `<div
        id=${DISABLED_REASON_ID}
        role="tooltip"
        aria-label=${this.disabledReason}
        class="screen-reader-only"
      >
        ${this.disabledReason}
      </div>`;
        return A;
    }
    renderTooltip() {
        if (this.tooltip) {
            const buttonId = isLink(this) ? 'link' : 'button';
            return b `<wc-tooltip class="tooltip" for=${buttonId}
        >${this.tooltip}</wc-tooltip
      >`;
        }
        return A;
    }
    // ── Render ────────────────────────────────────────────────────────────────
    render() {
        const buttonId = isLink(this) ? 'link' : 'button';
        return b `
      <wc-focus-ring class="focus-ring" for=${buttonId}></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      ${n(this.variant === 'neo', () => b `<div class="neo-background"></div>`)}
      <div class="background"></div>
      ${n(this.variant === 'outlined' || this.variant === 'neo', () => b `<div class="outline"></div>`)}
      <wc-ripple class="ripple" for=${buttonId}></wc-ripple>
      <wc-skeleton class="skeleton"></wc-skeleton>

      ${this.renderButtonElement()} ${this.renderTooltip()}
    `;
    }
};
// ── Static ───────────────────────────────────────────────────────────────
/** @nocollapse */ // eslint-disable-next-line
Button.shadowRootOptions = {
    mode: 'open',
    delegatesFocus: true,
};
Button.styles = [css_248z];
__decorate([
    n$1({ type: Boolean, reflect: true, attribute: 'trailing-icon' })
], Button.prototype, "trailingIcon", void 0);
__decorate([
    n$1({ reflect: true })
], Button.prototype, "size", void 0);
__decorate([
    n$1({ type: String })
], Button.prototype, "level", void 0);
__decorate([
    n$1({ type: String, reflect: true })
], Button.prototype, "shape", void 0);
__decorate([
    n$1({ reflect: true })
], Button.prototype, "variant", void 0);
__decorate([
    n$1({ reflect: true })
], Button.prototype, "color", void 0);
__decorate([
    n$1({ type: Boolean, reflect: true })
], Button.prototype, "skeleton", void 0);
__decorate([
    n$1({ type: Boolean, reflect: true })
], Button.prototype, "toggle", void 0);
__decorate([
    n$1({ type: Boolean, reflect: true })
], Button.prototype, "selected", void 0);
__decorate([
    n$1()
], Button.prototype, "tooltip", void 0);
__decorate([
    e$1('.button')
], Button.prototype, "buttonElement", void 0);
Button = __decorate([
    IndividualComponent
], Button);

export { Button };
//# sourceMappingURL=button.js.map
