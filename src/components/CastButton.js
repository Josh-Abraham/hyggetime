import React, { useState } from 'react';
import IconButton from './IconButton';
import { CastIcon } from './icons';
import './CastButton.scss';

const STEPS = [
  'In Chrome, click the ⋮ menu (top right).',
  'Choose Cast, save, and share → Cast…',
  'Click Sources and pick “Cast tab”.',
  'Select your TV.',
];

const CastButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="cast">
      <IconButton title="Cast to TV" onClick={() => setOpen(!open)}>
        <CastIcon />
      </IconButton>
      {open && (
        <div className="cast-popover">
          <strong>Cast to your TV</strong>
          <ol>
            {STEPS.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <button className="cast-dismiss" onClick={() => setOpen(false)}>Got it</button>
        </div>
      )}
    </div>
  );
};

export default CastButton;
