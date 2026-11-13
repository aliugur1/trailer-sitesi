'use client';
import { useState } from 'react';

export default function Tabs({ tabs }: { tabs: [string, [string, string][]][] }) {
  const [i, setI] = useState(0);
  return (
    <>
      <div className="chips" role="tablist">
        {tabs.map(([name], k) => (
          <button key={name} type="button" role="tab" aria-selected={k === i} onClick={() => setI(k)}>{name}</button>
        ))}
      </div>
      {tabs.map(([name, rows], k) => (
        <div key={name} role="tabpanel" className="tabp" hidden={k !== i}>
          <dl className="tab-panel">{rows.map(([a, b]) => <div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl>
        </div>
      ))}
    </>
  );
}
