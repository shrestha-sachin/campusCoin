import React from 'react'
import logoSrcDefault from '../assets/icons/campuscoin-logo.svg'
import logoSrcLight from '../assets/icons/campuscoin-logo-light.svg'

export default function Logo({ size = 'default', light=false, className = '' }) {
  const sizes = {
    small: 28,
    default: 34,
    large: 42,
  }
  const height = sizes[size] ?? sizes.default
  const logo = light ? logoSrcLight : logoSrcDefault

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={logo}
        alt="CampusCoin"
        className="flex-shrink-0 h-auto w-auto object-contain"
        style={{ height }}
      />
    </div>
  )
}
