/// <reference types="mocha" />
import { expect } from '@open-wc/testing';
import {
  deprecate,
  resetDeprecationWarnings,
} from '../src/__internal/utils/deprecate.js';

describe('deprecate', () => {
  let warnings: string[];
  let original: typeof console.warn;

  beforeEach(() => {
    resetDeprecationWarnings();
    warnings = [];
    original = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
  });

  afterEach(() => {
    console.warn = original;
  });

  it('warns once per distinct message, naming the replacement', () => {
    deprecate('wc-input', 'type="password"', 'wc-password-field');
    deprecate('wc-input', 'type="password"', 'wc-password-field');

    expect(warnings).to.have.length(1);
    expect(warnings[0]).to.contain('wc-input');
    expect(warnings[0]).to.contain('wc-password-field');
    expect(warnings[0]).to.contain('4.0');
  });

  it('warns separately for different APIs', () => {
    deprecate('wc-tab-group', 'a');
    deprecate('wc-tab-group', 'b');
    expect(warnings).to.have.length(2);
  });
});
