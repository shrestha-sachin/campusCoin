import React from 'react'

export default function Logo({ size = 'default', className = '' }) {
    const sizes = {
        small: { icon: 24, text: 'text-base' },
        default: { icon: 32, text: 'text-xl' },
        large: { icon: 40, text: 'text-2xl' },
    }
    const s = sizes[size] || sizes.default

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            {/* Coin icon — overlapping colored arcs */}
            <svg
                width={s.icon}
                height={s.icon}
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
            >
                {/* Background circle */}
                <circle cx="20" cy="20" r="18" fill="#4285f4" />
                {/* Inner ring */}
                <circle cx="20" cy="20" r="13" fill="white" fillOpacity="0.2" />
                {/* Dollar sign */}
                <text
                    x="20"
                    y="26"
                    textAnchor="middle"
                    fill="white"
                    fontFamily="GoogleSans, sans-serif"
                    fontWeight="700"
                    fontSize="18"
                >
                    $
                </text>
                {/* Google-colored accent dots */}
                <circle cx="8" cy="10" r="3" fill="#ea4335" opacity="0.9" />
                <circle cx="32" cy="10" r="3" fill="#f9ab00" opacity="0.9" />
                <circle cx="32" cy="30" r="3" fill="#34a853" opacity="0.9" />
            </svg>

            {/* Wordmark */}
            <span className={`font-display font-bold tracking-tight ${s.text}`}>
                <span className="text-g-blue">Campus</span>
                <span className="text-g-text">Coin</span>
            </span>
        </div>
    )
}
