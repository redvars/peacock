import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@redvars/peacock/styles.css';
import { Button, Input, Select, Switch } from '@redvars/peacock-react';
import type { SwitchElement } from '@redvars/peacock-react';

const OPTIONS = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
];

function App() {
  const [clicks, setClicks] = useState(0);
  const [name, setName] = useState('Ada');
  const [enabled, setEnabled] = useState(false);
  const [choice, setChoice] = useState('alpha');

  return (
    <main style={{ display: 'grid', gap: 16, maxWidth: 360, padding: 24 }}>
      <h1>Peacock + React</h1>
      <Button id="btn" onClick={() => setClicks(c => c + 1)}>
        Clicked {clicks}
      </Button>
      <Input
        id="name"
        label="Name"
        value={name}
        onInput={event => setName(event.detail.value)}
      />
      <Button id="reset" level="secondary" onClick={() => setName('reset')}>
        Reset name
      </Button>
      <Switch
        id="sw"
        label="Enabled"
        checked={enabled}
        onChange={event => setEnabled((event.currentTarget as SwitchElement).checked)}
      />
      <Select
        id="sel"
        label="Choice"
        options={OPTIONS}
        value={choice}
        onChange={event => setChoice(event.detail.value)}
      />
      <output id="state">
        {JSON.stringify({ clicks, name, enabled, choice })}
      </output>
    </main>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
