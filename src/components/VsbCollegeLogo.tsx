import React from 'react';
import collegeLogo from '../assets/images/vsb-college-logo.jpeg';

export const VsbCollegeLogo: React.FC<{ className?: string }> = ({
  className = 'w-12 h-12',
}) => (
  <img
    src={collegeLogo}
    alt="V.S.B. Engineering College Logo"
    className={`${className} object-contain`}
  />
);