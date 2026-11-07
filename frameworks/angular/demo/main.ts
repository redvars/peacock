import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { PEACOCK_COMPONENTS } from '@redvars/peacock-angular';

@Component({
  selector: 'app-root',
  imports: [FormsModule, ...PEACOCK_COMPONENTS],
  template: `
    <main style="display: grid; gap: 16px; max-width: 360px; padding: 24px">
      <h1>Peacock + Angular</h1>
      <wc-button id="btn" (click)="clicks.set(clicks() + 1)">Clicked {{ clicks() }}</wc-button>
      <wc-input id="name" label="Name" [(ngModel)]="name"></wc-input>
      <wc-button id="reset" level="secondary" (click)="name = 'reset'">Reset name</wc-button>
      <wc-switch id="sw" label="Enabled" [(ngModel)]="enabled"></wc-switch>
      <wc-select
        id="sel"
        label="Choice"
        [options]="options"
        [(ngModel)]="choice"
        (change)="lastChange = $event.detail.value; changeCount = changeCount + 1"
      ></wc-select>
      <output id="state">{{ state() }}</output>
    </main>
  `,
})
class App {
  readonly options = [
    { label: 'Alpha', value: 'alpha' },
    { label: 'Beta', value: 'beta' },
  ];

  readonly clicks = signal(0);

  // Plain fields bound with ngModel; the template reads them through state().
  name = 'Ada';

  enabled = false;

  choice = 'alpha';

  /** From the typed `(change)` output: `$event.detail.value` is checked as a string. */
  lastChange = '';

  changeCount = 0;

  state(): string {
    return JSON.stringify({
      clicks: this.clicks(),
      name: this.name,
      enabled: this.enabled,
      choice: this.choice,
      lastChange: this.lastChange,
      changeCount: this.changeCount,
    });
  }
}

bootstrapApplication(App).catch(error => console.error(error));
