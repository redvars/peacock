import { _ as __decorate } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { i as internals } from './element-internals-2CMts_0M.js';

/**
 * A symbol used to access dispatch hooks on an event.
 */
const dispatchHooks = Symbol('dispatchHooks');
/**
 * Add a hook for an event that is called after the event is dispatched and
 * propagates to other event listeners.
 *
 * This is useful for behaviors that need to check if an event is canceled.
 *
 * The callback is invoked synchronously, which allows for better integration
 * with synchronous platform APIs (like `<form>` or `<label>` clicking).
 *
 * Note: `setupDispatchHooks()` must be called on the element before adding any
 * other event listeners. Call it in the constructor of an element or
 * controller.
 *
 * @example
 * ```ts
 * class MyControl extends LitElement {
 *   constructor() {
 *     super();
 *     setupDispatchHooks(this, 'click');
 *     this.addEventListener('click', event => {
 *       afterDispatch(event, () => {
 *         if (event.defaultPrevented) {
 *           return
 *         }
 *
 *         // ... perform logic
 *       });
 *     });
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * class MyController implements ReactiveController {
 *   constructor(host: ReactiveElement) {
 *     // setupDispatchHooks() may be called multiple times for the same
 *     // element and events, making it safe for multiple controllers to use it.
 *     setupDispatchHooks(host, 'click');
 *     host.addEventListener('click', event => {
 *       afterDispatch(event, () => {
 *         if (event.defaultPrevented) {
 *           return;
 *         }
 *
 *         // ... perform logic
 *       });
 *     });
 *   }
 * }
 * ```
 *
 * @param event The event to add a hook to.
 * @param callback A hook that is called after the event finishes dispatching.
 */
function afterDispatch(event, callback) {
    const hooks = event[dispatchHooks];
    if (!hooks) {
        throw new Error(`'${event.type}' event needs setupDispatchHooks().`);
    }
    hooks.addEventListener('after', callback, { once: true });
}
/**
 * A lookup map of elements and event types that have a dispatch hook listener
 * set up. Used to ensure we don't set up multiple hook listeners on the same
 * element for the same event.
 */
const ELEMENT_DISPATCH_HOOK_TYPES = new WeakMap();
/**
 * Sets up an element to add dispatch hooks to given event types. This must be
 * called before adding any event listeners that need to use dispatch hooks
 * like `afterDispatch()`.
 *
 * This function is safe to call multiple times with the same element or event
 * types. Call it in the constructor of elements, mixins, and controllers to
 * ensure it is set up before external listeners.
 *
 * @example
 * ```ts
 * class MyControl extends LitElement {
 *   constructor() {
 *     super();
 *     setupDispatchHooks(this, 'click');
 *     this.addEventListener('click', this.listenerUsingAfterDispatch);
 *   }
 * }
 * ```
 *
 * @param element The element to set up event dispatch hooks for.
 * @param eventTypes The event types to add dispatch hooks to.
 */
function setupDispatchHooks(element, ...eventTypes) {
    let typesAlreadySetUp = ELEMENT_DISPATCH_HOOK_TYPES.get(element);
    if (!typesAlreadySetUp) {
        typesAlreadySetUp = new Set();
        ELEMENT_DISPATCH_HOOK_TYPES.set(element, typesAlreadySetUp);
    }
    for (const eventType of eventTypes) {
        // Don't register multiple dispatch hook listeners. A second registration
        // would lead to the second listener calling `afterDispatch()` hooks twice.
        if (typesAlreadySetUp.has(eventType)) {
            continue;
        }
        element.addEventListener(eventType, (event) => {
            // Add hooks onto the event.
            const hooks = new EventTarget();
            event[dispatchHooks] = hooks;
            const cleanupLastNodeListener = new AbortController();
            const callAfterDispatch = () => {
                cleanupLastNodeListener.abort();
                hooks.dispatchEvent(new Event('after'));
            };
            const patchStopPropagation = (superMethod) => {
                return function () {
                    superMethod.call(this);
                    // Synchronously call afterDispatch() hooks when interrupted.
                    callAfterDispatch();
                };
            };
            event.stopPropagation = patchStopPropagation(event.stopPropagation);
            event.stopImmediatePropagation = patchStopPropagation(event.stopImmediatePropagation);
            // Add an event listener to detect the end of the event's propagation.
            const composedPath = event.composedPath();
            let lastNodeForEvent;
            if (event.composed && event.bubbles) {
                lastNodeForEvent = composedPath[composedPath.length - 1];
            }
            else if (!event.bubbles) {
                lastNodeForEvent = composedPath[0];
            }
            else {
                lastNodeForEvent = composedPath[0].getRootNode();
            }
            lastNodeForEvent.addEventListener(eventType, () => {
                // Synchronously call afterDispatch() hooks.
                callAfterDispatch();
            }, { once: true, signal: cleanupLastNodeListener.signal });
        }, {
            // Ensure this listener runs before other listeners.
            // `setupDispatchHooks()` should be called in constructors to also
            // ensure they run before any other externally-added capture listeners.
            capture: true,
        });
        typesAlreadySetUp.add(eventType);
    }
}

/**
 * Mixes in form submitter behavior for a class.
 *
 * A click listener is added to each element instance. If the click is not
 * default prevented, it will submit the element's form, if any.
 *
 * @example
 * ```ts
 * const base = mixinFormSubmitter(mixinElementInternals(LitElement));
 * class MyButton extends base {
 *   static formAssociated = true;
 * }
 * ```
 *
 * @param base The class to mix functionality into.
 * @return The provided class with `FormSubmitter` mixed in.
 */
function mixinFormSubmitter(base) {
    class FormSubmitterElement extends base {
        // Name attribute must reflect synchronously for form integration.
        get name() {
            return this.getAttribute('name') ?? '';
        }
        set name(name) {
            this.setAttribute('name', name);
        }
        // Mixins must have a constructor with `...args: any[]`
        // tslint:disable-next-line:no-any
        constructor(...args) {
            super(...args);
            this.type = 'submit';
            this.value = '';
            setupDispatchHooks(this, 'click');
            this.addEventListener('click', async (event) => {
                const isReset = this.type === 'reset';
                const isSubmit = this.type === 'submit';
                const elementInternals = this[internals];
                const { form } = elementInternals;
                if (!form || !(isSubmit || isReset)) {
                    return;
                }
                afterDispatch(event, () => {
                    if (event.defaultPrevented) {
                        return;
                    }
                    if (isReset) {
                        form.reset();
                        return;
                    }
                    // form.requestSubmit(submitter) does not work with form associated custom
                    // elements. This patches the dispatched submit event to add the correct
                    // `submitter`.
                    // See https://github.com/WICG/webcomponents/issues/814
                    form.addEventListener('submit', (submitEvent) => {
                        Object.defineProperty(submitEvent, 'submitter', {
                            configurable: true,
                            enumerable: true,
                            get: () => this,
                        });
                    }, { capture: true, once: true });
                    elementInternals.setFormValue(this.value);
                    form.requestSubmit();
                });
            });
        }
    }
    __decorate([
        n()
    ], FormSubmitterElement.prototype, "type", void 0);
    __decorate([
        n({ reflect: true })
    ], FormSubmitterElement.prototype, "value", void 0);
    return FormSubmitterElement;
}

/**
 * A symbol property to retrieve the form value for an element.
 */
const getFormValue = Symbol('getFormValue');
/**
 * A symbol property to retrieve the form state for an element.
 */
const getFormState = Symbol('getFormState');
/**
 * Mixes in form-associated behavior for a class. This allows an element to add
 * values to `<form>` elements.
 *
 * Implementing classes should provide a `[formValue]` to return the current
 * value of the element, as well as reset and restore callbacks.
 *
 * @example
 * ```ts
 * const base = mixinFormAssociated(mixinElementInternals(LitElement));
 *
 * class MyControl extends base {
 *   \@property()
 *   value = '';
 *
 *   override [getFormValue]() {
 *     return this.value;
 *   }
 *
 *   override formResetCallback() {
 *     const defaultValue = this.getAttribute('value');
 *     this.value = defaultValue;
 *   }
 *
 *   override formStateRestoreCallback(state: string) {
 *     this.value = state;
 *   }
 * }
 * ```
 *
 * Elements may optionally provide a `[formState]` if their values do not
 * represent the state of the component.
 *
 * @example
 * ```ts
 * const base = mixinFormAssociated(mixinElementInternals(LitElement));
 *
 * class MyCheckbox extends base {
 *   \@property()
 *   value = 'on';
 *
 *   \@property({type: Boolean})
 *   checked = false;
 *
 *   override [getFormValue]() {
 *     return this.checked ? this.value : null;
 *   }
 *
 *   override [getFormState]() {
 *     return String(this.checked);
 *   }
 *
 *   override formResetCallback() {
 *     const defaultValue = this.hasAttribute('checked');
 *     this.checked = defaultValue;
 *   }
 *
 *   override formStateRestoreCallback(state: string) {
 *     this.checked = Boolean(state);
 *   }
 * }
 * ```
 *
 * @param base The class to mix functionality into. The base class must use
 *     `mixinElementInternals()`.
 * @return The provided class with `FormAssociated` mixed in.
 */
function mixinFormAssociated(base) {
    class FormAssociatedElement extends base {
        get form() {
            return this[internals].form;
        }
        get labels() {
            return this[internals].labels;
        }
        // Use @property for the `name` and `disabled` properties to add them to the
        // `observedAttributes` array and trigger `attributeChangedCallback()`.
        //
        // We don't use Lit's default getter/setter (`noAccessor: true`) because
        // the attributes need to be updated synchronously to work with synchronous
        // form APIs, and Lit updates attributes async by default.
        get name() {
            return this.getAttribute('name') ?? '';
        }
        set name(name) {
            // Note: setting name to null or empty does not remove the attribute.
            this.setAttribute('name', name);
            // We don't need to call `requestUpdate()` since it's called synchronously
            // in `attributeChangedCallback()`.
        }
        get disabled() {
            return this.hasAttribute('disabled');
        }
        set disabled(disabled) {
            // Coerce `disabled` in `Boolean()` to ensure that setting to `null` or
            // `undefined` sets the attribute to `false`.
            this.toggleAttribute('disabled', Boolean(disabled));
            // We don't need to call `requestUpdate()` since it's called synchronously
            // in `attributeChangedCallback()`.
        }
        attributeChangedCallback(name, old, value) {
            // Manually `requestUpdate()` for `name` and `disabled` when their
            // attribute or property changes.
            // The properties update their attributes, so this callback is invoked
            // immediately when the properties are set. We call `requestUpdate()` here
            // instead of letting Lit set the properties from the attribute change.
            // That would cause the properties to re-set the attribute and invoke this
            // callback again in a loop. This leads to stale state when Lit tries to
            // determine if a property changed or not.
            if (name === 'name' || name === 'disabled') {
                // Disabled's value is only false if the attribute is missing and null.
                const oldValue = name === 'disabled' ? old !== null : old;
                // Trigger a lit update when the attribute changes.
                this.requestUpdate(name, oldValue);
                return;
            }
            super.attributeChangedCallback(name, old, value);
        }
        requestUpdate(name, oldValue, options) {
            super.requestUpdate(name, oldValue, options);
            // If any properties change, update the form value, which may have changed
            // as well.
            // Update the form value synchronously in `requestUpdate()` rather than
            // `update()` or `updated()`, which are async. This is necessary to ensure
            // that form data is updated in time for synchronous event listeners.
            this[internals].setFormValue(this[getFormValue](), this[getFormState]());
        }
        [getFormValue]() {
            return this.getAttribute('value');
        }
        [getFormState]() {
            return this[getFormValue]();
        }
        formDisabledCallback(disabled) {
            this.disabled = disabled;
        }
    }
    /** @nocollapse */
    FormAssociatedElement.formAssociated = true;
    __decorate([
        n({ noAccessor: true })
    ], FormAssociatedElement.prototype, "name", null);
    __decorate([
        n({ type: Boolean, noAccessor: true })
    ], FormAssociatedElement.prototype, "disabled", null);
    return FormAssociatedElement;
}

export { mixinFormAssociated as a, mixinFormSubmitter as m };
//# sourceMappingURL=form-associated-BXADnjOB.js.map
