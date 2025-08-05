import React from 'react';

/**
 * Generic card wrapper with a bold header – helps keep forms consistent.
 * Props:
 *  - title: heading text
 *  - children: body content
 *  - className: extra classes for card
 */
const SectionCard = ({ title, children, className = '' }) => (
  <div className={`card shadow-sm border-0 mb-4 ${className}`}>
    <div className="card-header bg-white border-0 pb-0">
      <h5 className="fw-bold text-primary mb-0">{title}</h5>
    </div>
    <div className="card-body pt-3">
      {children}
    </div>
  </div>
);

export default SectionCard;
