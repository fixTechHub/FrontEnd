import React from 'react';

/**
 * Simple horizontal progress bar for 5-step forms.
 * Props: current (1-5)
 */
const StepProgress = ({ current = 1, total = 5 }) => {
  const percent = Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div className="progress mb-4" style={{ height: 6 }}>
      <div
        className="progress-bar bg-success"
        style={{ width: `${percent}%` }}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      />
    </div>
  );
};

export default StepProgress;
