/// <reference types="mocha" />
import { html, type TemplateResult } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import {
  Form,
  formDataToObject,
  type FormDirtyChangeDetail,
  type FormSubmitDetail,
} from '../src/form/index.js';
import { Alert } from '../src/alert/index.js';
import { Button } from '../src/button/index.js';
import { Checkbox } from '../src/checkbox/index.js';
import { Field } from '../src/field/index.js';
import { Input } from '../src/input/index.js';
import { Item } from '../src/item/index.js';
import { Menu, MenuItem } from '../src/menu/index.js';
import { Select, SelectOptionElement } from '../src/select/index.js';

for (const [tag, element] of [
  ['wc-alert', Alert],
  ['wc-button', Button],
  ['wc-checkbox', Checkbox],
  ['wc-field', Field],
  ['wc-input', Input],
  ['wc-item', Item],
  ['wc-menu', Menu],
  ['wc-menu-item', MenuItem],
  ['wc-option', SelectOptionElement],
  ['wc-select', Select],
  ['wc-form', Form],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

async function setup(template: TemplateResult) {
  const el = fixtureSync<Form>(template);
  await el.updateComplete;
  const form = el.querySelector('form') as HTMLFormElement;
  await Promise.all(
    Array.from(form.elements).map(
      control => (control as Partial<Input>).updateComplete,
    ),
  );
  return { el, form };
}

/** Fires a synthetic submit, which runs wc-form's handling without navigating. */
function submit(form: HTMLFormElement, submitter: HTMLElement | null = null) {
  const event = new SubmitEvent('submit', {
    bubbles: true,
    cancelable: true,
    submitter,
  });
  form.dispatchEvent(event);
  return event;
}

/** Types into a wc-input the way the person would. */
async function type(field: Input, text: string) {
  const input = field.shadowRoot!.querySelector('input') as HTMLInputElement;
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await field.updateComplete;
}

/** Types into a native input. */
function typeNative(control: HTMLInputElement, text: string) {
  const input = control;
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function summary(el: Form) {
  return el.shadowRoot!.querySelector<Alert>('.summary');
}

function summaryItems(el: Form) {
  return Array.from(el.shadowRoot!.querySelectorAll('.error')).map(item =>
    item.textContent?.trim(),
  );
}

const profileForm = () => html`
  <wc-form>
    <form>
      <wc-input label="Email" name="email" required></wc-input>
      <label for="city">City</label>
      <input id="city" name="city" required />
      <button type="submit">Save</button>
    </form>
  </wc-form>
`;

describe('Form', () => {
  describe('setup', () => {
    it('keeps the form in the light DOM so Peacock fields join it', async () => {
      const { el, form } = await setup(profileForm());
      const field = el.querySelector('wc-input') as Input;
      expect(field.form).to.equal(form);
      expect(el.form).to.equal(form);
      expect(form.noValidate).to.be.true;
      expect(el.shadowRoot!.querySelector('slot')).to.exist;
    });
  });

  describe('validation summary', () => {
    it('blocks an invalid submit and lists each invalid field', async () => {
      const { el, form } = await setup(profileForm());
      let fired = 0;
      el.addEventListener('submit', event => {
        if (event instanceof CustomEvent) fired += 1;
      });

      const event = submit(form);

      expect(event.defaultPrevented).to.be.true;
      expect(fired).to.equal(0);
      await el.updateComplete;
      const alert = summary(el);
      expect(alert).to.exist;
      expect(alert!.getAttribute('intent')).to.equal('danger');
      const items = summaryItems(el);
      expect(items).to.have.length(2);
      expect(items[0]).to.match(/^Email: /);
      expect(items[1]).to.match(/^City: /);
      expect(el.shadowRoot!.querySelector('.headline')!.textContent).to.contain(
        '2 problems',
      );
    });

    it('moves focus to the summary', async () => {
      const { el, form } = await setup(profileForm());
      submit(form);
      await waitUntil(() => el.shadowRoot!.activeElement === summary(el));
      expect(summary(el)!.getAttribute('aria-labelledby')).to.equal(
        el.shadowRoot!.querySelector('.headline')!.id,
      );
    });

    it('focuses a field from its link', async () => {
      const { el, form } = await setup(profileForm());
      submit(form);
      await el.updateComplete;
      const links =
        el.shadowRoot!.querySelectorAll<HTMLAnchorElement>('.error-link');
      links[1].click();
      expect(document.activeElement).to.equal(el.querySelector('#city'));
      links[0].click();
      expect(document.activeElement).to.equal(el.querySelector('wc-input'));
    });

    it('updates as fields are fixed and goes away when all are', async () => {
      const { el, form } = await setup(profileForm());
      submit(form);
      await el.updateComplete;

      await type(el.querySelector('wc-input') as Input, 'a@b.c');
      await waitUntil(() => summaryItems(el).length === 1);
      expect(summaryItems(el)[0]).to.match(/^City: /);
      expect(el.shadowRoot!.querySelector('.headline')!.textContent).to.contain(
        '1 problem',
      );

      typeNative(el.querySelector('#city') as HTMLInputElement, 'Pune');
      await waitUntil(() => !summary(el));
    });

    it('shows the message under Peacock fields', async () => {
      const { el, form } = await setup(profileForm());
      submit(form);
      const field = el.querySelector('wc-input') as Input;
      await field.updateComplete;
      const wcField = field.shadowRoot!.querySelector('wc-field')!;
      expect(wcField.getAttribute('error-text')).to.equal(
        field.validationMessage,
      );
    });

    it('labels Peacock select and checkbox fields', async () => {
      const { el, form } = await setup(html`
        <wc-form>
          <form>
            <wc-select label="Fruit" name="fruit" required>
              <wc-option value="apple">Apple</wc-option>
            </wc-select>
            <wc-checkbox
              label="Accept terms"
              name="terms"
              required
            ></wc-checkbox>
            <input name="code" aria-label="Code" required />
          </form>
        </wc-form>
      `);
      submit(form);
      await el.updateComplete;
      const items = summaryItems(el);
      expect(items).to.have.length(3);
      expect(items[0]).to.match(/^Fruit: /);
      expect(items[1]).to.match(/^Accept terms: /);
      expect(items[2]).to.match(/^Code: /);
    });

    it('focuses the first invalid field instead with no-summary', async () => {
      const { el, form } = await setup(html`
        <wc-form no-summary>
          <form>
            <input name="first" aria-label="First" />
            <wc-input label="Email" name="email" required></wc-input>
            <input name="city" required />
          </form>
        </wc-form>
      `);
      const event = submit(form);
      expect(event.defaultPrevented).to.be.true;
      await el.updateComplete;
      expect(summary(el)).to.not.exist;
      expect(document.activeElement).to.equal(el.querySelector('wc-input'));
    });

    it('skips validation for a novalidate form or a formnovalidate button', async () => {
      const { el, form } = await setup(html`
        <wc-form>
          <form novalidate>
            <input name="city" required />
          </form>
        </wc-form>
      `);
      el.addEventListener('submit', event => event.preventDefault());
      expect(submit(form).defaultPrevented).to.be.true; // cancelled by the listener
      await el.updateComplete;
      expect(summary(el)).to.not.exist;

      const second = await setup(html`
        <wc-form>
          <form>
            <input name="city" required />
            <button type="submit" formnovalidate>Draft</button>
          </form>
        </wc-form>
      `);
      let fired = false;
      second.el.addEventListener('submit', event => {
        if (event instanceof CustomEvent) fired = true;
        event.preventDefault();
      });
      submit(second.form, second.form.querySelector('button'));
      expect(fired).to.be.true;
    });

    it('validate() reports validity and shows the summary', async () => {
      const { el } = await setup(profileForm());
      expect(await el.validate()).to.be.false;
      expect(summaryItems(el)).to.have.length(2);
    });
  });

  describe('submit', () => {
    const fullForm = () => html`
      <wc-form>
        <form>
          <wc-input label="Email" name="email" value="a@b.c"></wc-input>
          <wc-select label="Fruit" name="fruit" value="apple">
            <wc-option value="apple">Apple</wc-option>
            <wc-option value="pear">Pear</wc-option>
          </wc-select>
          <wc-checkbox
            label="News"
            name="topics"
            value="news"
            checked
          ></wc-checkbox>
          <input type="checkbox" name="topics" value="sport" checked />
          <input name="city" value="Pune" />
          <button type="submit" name="action" value="save">Save</button>
        </form>
      </wc-form>
    `;

    it('fires submit with the form data as a plain object', async () => {
      const { el, form } = await setup(fullForm());
      let detail: FormSubmitDetail | undefined;
      el.addEventListener('submit', event => {
        if (event instanceof CustomEvent) {
          detail = event.detail;
          event.preventDefault();
        }
      });
      const button = form.querySelector('button') as HTMLButtonElement;
      const native = submit(form, button);

      expect(native.defaultPrevented).to.be.true;
      expect(detail).to.exist;
      expect(detail!.value).to.deep.equal({
        email: 'a@b.c',
        fruit: 'apple',
        topics: ['news', 'sport'],
        city: 'Pune',
        action: 'save',
      });
      expect(detail!.formData.get('city')).to.equal('Pune');
      expect(detail!.submitter).to.equal(button);
    });

    it('lets the native submission go ahead when not cancelled', async () => {
      const { el, form } = await setup(fullForm());
      let custom = 0;
      let native = 0;
      el.addEventListener('submit', event => {
        if (event instanceof CustomEvent) custom += 1;
        else native += 1;
      });
      const outer = (event: Event) => {
        if (!(event instanceof CustomEvent)) native += 100;
      };
      document.addEventListener('submit', outer);
      const event = submit(form);
      document.removeEventListener('submit', outer);

      expect(event.defaultPrevented).to.be.false;
      expect(custom).to.equal(1);
      // The native event stops at wc-form, so listeners hear one `submit`.
      expect(native).to.equal(0);
    });

    it('submits through requestSubmit', async () => {
      const { el, form } = await setup(fullForm());
      let value: FormSubmitDetail['value'] | undefined;
      el.addEventListener('submit', event => {
        if (event instanceof CustomEvent) value = event.detail.value;
        event.preventDefault();
      });
      form.requestSubmit();
      expect(value?.email).to.equal('a@b.c');
    });

    it('makes submit buttons busy while loading and ignores submits', async () => {
      const { el, form } = await setup(html`
        <wc-form>
          <form>
            <input name="city" value="Pune" />
            <wc-button type="submit">Save</wc-button>
            <button type="submit">Also save</button>
            <button type="button">Other</button>
          </form>
        </wc-form>
      `);
      let fired = 0;
      el.addEventListener('submit', event => {
        if (event instanceof CustomEvent) fired += 1;
        event.preventDefault();
      });
      const wcButton = el.querySelector('wc-button') as Button;
      const [native, other] = Array.from(el.querySelectorAll('button'));

      el.loading = true;
      await el.updateComplete;
      expect(el.hasAttribute('loading')).to.be.true;
      expect(wcButton.loading).to.be.true;
      expect(native.disabled).to.be.true;
      expect(other.disabled).to.be.false;
      expect(form.getAttribute('aria-busy')).to.equal('true');
      expect(submit(form).defaultPrevented).to.be.true;
      expect(fired).to.equal(0);

      el.loading = false;
      await el.updateComplete;
      expect(wcButton.loading).to.be.false;
      expect(native.disabled).to.be.false;
      expect(form.hasAttribute('aria-busy')).to.be.false;
      submit(form);
      expect(fired).to.equal(1);
    });
  });

  describe('dirty tracking', () => {
    it('is dirty while a value differs from its initial value', async () => {
      const { el } = await setup(html`
        <wc-form>
          <form>
            <wc-input label="Email" name="email" value="a@b.c"></wc-input>
            <input name="city" value="Pune" />
          </form>
        </wc-form>
      `);
      const changes: boolean[] = [];
      el.addEventListener('dirty-change', event => {
        changes.push(
          (event as CustomEvent<FormDirtyChangeDetail>).detail.dirty,
        );
      });
      expect(el.dirty).to.be.false;

      const field = el.querySelector('wc-input') as Input;
      await type(field, 'x@y.z');
      await waitUntil(() => el.dirty);
      await el.updateComplete;
      expect(el.hasAttribute('dirty')).to.be.true;

      await type(field, 'a@b.c');
      await waitUntil(() => !el.dirty);
      await el.updateComplete;
      expect(el.hasAttribute('dirty')).to.be.false;

      typeNative(
        el.querySelector('input[name=city]') as HTMLInputElement,
        'Goa',
      );
      await waitUntil(() => el.dirty);
      expect(changes).to.deep.equal([true, false, true]);
    });

    it('markClean() makes the current values the baseline', async () => {
      const { el } = await setup(html`
        <wc-form
          ><form><input name="city" value="Pune" /></form
        ></wc-form>
      `);
      const input = el.querySelector('input') as HTMLInputElement;
      typeNative(input, 'Goa');
      await waitUntil(() => el.dirty);
      el.markClean();
      expect(el.dirty).to.be.false;
      typeNative(input, 'Pune');
      await waitUntil(() => el.dirty);
    });

    it('is clean again after a form reset', async () => {
      const { el, form } = await setup(html`
        <wc-form>
          <form>
            <wc-input label="Email" name="email" value="a@b.c"></wc-input>
            <input name="city" value="Pune" />
          </form>
        </wc-form>
      `);
      await type(el.querySelector('wc-input') as Input, 'x@y.z');
      await waitUntil(() => el.dirty);
      form.reset();
      await waitUntil(() => !el.dirty);
      expect((el.querySelector('wc-input') as Input).value).to.equal('a@b.c');
    });

    it('asks before leaving the page with warn-unsaved while dirty', async () => {
      const { el } = await setup(html`
        <wc-form warn-unsaved
          ><form><input name="city" value="Pune" /></form
        ></wc-form>
      `);
      const unload = () => {
        const event = new Event('beforeunload', { cancelable: true });
        window.dispatchEvent(event);
        return event.defaultPrevented;
      };
      expect(unload()).to.be.false;
      typeNative(el.querySelector('input') as HTMLInputElement, 'Goa');
      await waitUntil(() => el.dirty);
      expect(unload()).to.be.true;
      el.warnUnsaved = false;
      expect(unload()).to.be.false;
    });
  });

  describe('server errors', () => {
    it('shows errors on the named fields and in the summary', async () => {
      const { el, form } = await setup(html`
        <wc-form>
          <form>
            <wc-input label="Email" name="email" value="a@b.c"></wc-input>
            <input name="city" aria-label="City" value="Pune" />
          </form>
        </wc-form>
      `);
      const field = el.querySelector('wc-input') as Input;
      const city = el.querySelector('input') as HTMLInputElement;
      await el.setErrors({ email: 'Already taken', city: 'Unknown city' });

      expect(field.validationMessage).to.equal('Already taken');
      expect(city.validationMessage).to.equal('Unknown city');
      expect(summaryItems(el)).to.deep.equal([
        'Email: Already taken',
        'City: Unknown city',
      ]);
      await field.updateComplete;
      expect(
        field.shadowRoot!.querySelector('wc-field')!.getAttribute('error-text'),
      ).to.equal('Already taken');
      expect(el.shadowRoot!.activeElement).to.equal(summary(el));

      // Fields with server errors block the next submit.
      expect(submit(form).defaultPrevented).to.be.true;
    });

    it('clears a field error when the field changes', async () => {
      const { el } = await setup(html`
        <wc-form>
          <form>
            <wc-input label="Email" name="email" value="a@b.c"></wc-input>
            <input name="city" aria-label="City" value="Pune" />
          </form>
        </wc-form>
      `);
      const field = el.querySelector('wc-input') as Input;
      await el.setErrors({ email: 'Already taken', city: 'Unknown city' });

      await type(field, 'new@b.c');
      await waitUntil(() => summaryItems(el).length === 1);
      expect(field.validity.valid).to.be.true;

      typeNative(el.querySelector('input') as HTMLInputElement, 'Goa');
      await waitUntil(() => !summary(el));
    });

    it('lists an error for no field without a link', async () => {
      const { el, form } = await setup(html`
        <wc-form
          ><form><input name="city" value="Pune" /></form
        ></wc-form>
      `);
      await el.setErrors({ '': 'The server is unavailable' });
      expect(summaryItems(el)).to.deep.equal(['The server is unavailable']);
      expect(el.shadowRoot!.querySelector('.error-link')).to.not.exist;

      // The next submit attempt answers a form-level error.
      el.addEventListener('submit', event => event.preventDefault());
      submit(form);
      await el.updateComplete;
      expect(summary(el)).to.not.exist;
    });

    it('setErrors({}) clears earlier errors', async () => {
      const { el } = await setup(html`
        <wc-form
          ><form><input name="city" aria-label="City" value="Pune" /></form
        ></wc-form>
      `);
      const city = el.querySelector('input') as HTMLInputElement;
      await el.setErrors({ city: 'Unknown city' });
      expect(city.validity.valid).to.be.false;
      await el.setErrors({});
      expect(city.validity.valid).to.be.true;
      expect(summary(el)).to.not.exist;
    });
  });

  describe('formDataToObject', () => {
    it('makes repeated names arrays', () => {
      const data = new FormData();
      data.append('a', '1');
      data.append('b', '2');
      data.append('b', '3');
      data.append('b', '4');
      expect(formDataToObject(data)).to.deep.equal({
        a: '1',
        b: ['2', '3', '4'],
      });
    });
  });
});
