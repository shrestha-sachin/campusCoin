import React from 'react'
import logoSrc from '../assets/icons/campuscoin-logo.svg'

export default function Logo({ size = 'default', className = '' }) {
  const sizes = {
    small: 28,
    default: 34,
    large: 42,
  }
  const height = sizes[size] ?? sizes.default

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={logoSrc}
        alt="CampusCoin"
        className="flex-shrink-0 h-auto w-auto object-contain"
        style={{ height }}
      />
    </div>
  )
}
