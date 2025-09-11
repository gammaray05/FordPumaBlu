import React, { useState, useEffect } from 'react';
import { setDateOffset, getDateOffset, todayStr } from '../utils/dates';

export default function Debug({ onOffsetChange }) {
  const [offset, setOffset] = useState(getDateOffset());

  const handleOffsetChange = (newOffset) => {
    setOffset(newOffset);
    setDateOffset(newOffset);
    onOffsetChange(newOffset);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '10px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <button onClick={() => handleOffsetChange(offset - 1)} style={{ background: '#444', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '5px' }}>-1 Giorno</button>
      <span>{todayStr()} ({offset}d)</span>
      <button onClick={() => handleOffsetChange(offset + 1)} style={{ background: '#444', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '5px' }}>+1 Giorno</button>
      {offset !== 0 && (
        <button onClick={() => handleOffsetChange(0)} style={{ background: '#666', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '5px' }}>Reset</button>
      )}
    </div>
  );
}
