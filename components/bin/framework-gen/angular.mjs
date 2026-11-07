// Angular proxies: one standalone component per element with typed inputs and outputs, and
// ControlValueAccessor directives so fields and toggles work with ngModel and reactive forms.

import { kebabToCamel } from './model.mjs';
import { HEADER, ImportSet, eventTypeWithImports, isIdentifier, jsdoc } from './shared.mjs';

/** Angular class members a generated input or output must not shadow. */
const RESERVED = new Set(['el', 'z', 'constructor', 'ngOnInit', 'ngOnDestroy']);

export function emitAngular(model) {
  const files = {};
  const names = [];

  for (const element of model.elements) {
    const name = `Wc${element.name}`;
    const imports = new ImportSet();
    imports.add(
      `import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, Output } from '@angular/core';`,
    );
    imports.add(`import '../define/${element.tagName}.js';`);
    imports.add(`import type ElementClass from '../define/${element.tagName}.js';`);

    const members = new Set(RESERVED);
    const inputLines = [];
    for (const prop of element.props) {
      if (!isIdentifier(prop.name) || members.has(prop.name)) continue;
      members.add(prop.name);
      inputLines.push(`${jsdoc(prop.description, '  ')}  @Input()
  set ${prop.name}(value: El['${prop.name}']) {
    this.z.runOutsideAngular(() => {
      this.el.${prop.name} = value;
    });
  }
  get ${prop.name}(): El['${prop.name}'] {
    return this.el.${prop.name};
  }
`);
    }

    const outputLines = [];
    for (const event of element.events) {
      let member = kebabToCamel(event.name);
      if (members.has(member)) member = `${member}Event`;
      if (!isIdentifier(member) || members.has(member)) continue;
      members.add(member);
      const { type, imports: typeImports } = eventTypeWithImports(event);
      typeImports.forEach(i => imports.add(i.line, i.key));
      const alias = member === event.name ? '' : `'${event.name}'`;
      outputLines.push(
        `${jsdoc(event.description, '  ')}  @Output(${alias}) readonly ${member} = new EventEmitter<${type}>();\n`,
      );
    }

    files[`components/${element.tagName}.ts`] = `${HEADER}
${imports}

type El = InstanceType<typeof ElementClass>;

${jsdoc(element.description || `Angular proxy for \`<${element.tagName}>\`.`)}@Component({
  selector: '${element.tagName}',
  standalone: true,
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ${name} {
  protected readonly el: El;

  constructor(
    changeDetector: ChangeDetectorRef,
    elementRef: ElementRef<El>,
    protected readonly z: NgZone,
  ) {
    // The element renders itself; Angular only projects content into it.
    changeDetector.detach();
    this.el = elementRef.nativeElement;
  }

${inputLines.join('\n')}
  // Outputs type the element's own DOM events for template checking. Angular listens to the DOM
  // event of the same name, so they are never emitted here: emitting would deliver each event twice.
${outputLines.join('')}}
`;
    names.push({ name, tagName: element.tagName });
  }

  files['value-accessors.ts'] = emitValueAccessors(model);

  files['index.ts'] = `${HEADER}
${names.map(n => `import { ${n.name} } from './components/${n.tagName}.js';`).join('\n')}
import { BooleanValueAccessor, ChangeValueAccessor, InputValueAccessor } from './value-accessors.js';

export { BooleanValueAccessor, ChangeValueAccessor, InputValueAccessor } from './value-accessors.js';
${names.map(n => `export { ${n.name} } from './components/${n.tagName}.js';`).join('\n')}

/** The value accessors that connect Peacock fields to ngModel and reactive forms. */
export const PEACOCK_VALUE_ACCESSORS = [InputValueAccessor, ChangeValueAccessor, BooleanValueAccessor] as const;

/** Every Peacock component and value accessor, for a standalone component's \`imports\`. */
export const PEACOCK_COMPONENTS = [
${names.map(n => `  ${n.name},`).join('\n')}
  ...PEACOCK_VALUE_ACCESSORS,
] as const;
`;
  return files;
}

function selectorFor(elements) {
  return elements
    .flatMap(e =>
      ['ngModel', 'formControlName', 'formControl'].map(attr => `${e.tagName}[${attr}]`),
    )
    .join(',');
}

function emitValueAccessors(model) {
  const bound = model.elements.filter(e => e.binding);
  const onInput = bound.filter(e => e.binding.kind === 'value' && e.binding.event === 'input');
  const onChange = bound.filter(e => e.binding.kind === 'value' && e.binding.event === 'change');
  const toggles = bound.filter(e => e.binding.kind === 'checked');

  const accessor = (className, doc, list, event, prop) => `${jsdoc(doc)}@Directive({
  selector: '${selectorFor(list)}',
  standalone: true,
  host: { '(${event})': 'handleChange()', '(focusout)': 'handleTouched()' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ${className}), multi: true }],
})
export class ${className} extends PeacockValueAccessor {
  writeValue(value: unknown): void {
    this.el.${prop} = ${prop === 'checked' ? 'value === true' : 'value ?? undefined'};
  }

  handleChange(): void {
    this.onChange(this.el.${prop});
  }
}
`;

  return `${HEADER}
import { Directive, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';

/** The properties every bound Peacock field has. */
interface PeacockField extends HTMLElement {
  value?: unknown;
  checked?: boolean;
  disabled?: boolean;
}

@Directive()
abstract class PeacockValueAccessor implements ControlValueAccessor {
  protected onChange: (value: unknown) => void = () => {};

  protected onTouched: () => void = () => {};

  protected readonly el: PeacockField;

  constructor(elementRef: ElementRef<PeacockField>) {
    this.el = elementRef.nativeElement;
  }

  abstract writeValue(value: unknown): void;

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.disabled = isDisabled;
  }

  handleTouched(): void {
    this.onTouched();
  }
}

${accessor('InputValueAccessor', 'Connects fields that report their value as it is typed (the `input` event).', onInput, 'input', 'value')}
${accessor('ChangeValueAccessor', 'Connects fields that report their value when it is committed (the `change` event).', onChange, 'change', 'value')}
${accessor('BooleanValueAccessor', 'Connects toggles (`checked`) such as switches and checkboxes.', toggles, 'change', 'checked')}`;
}
