import React from 'react'

const PARTNERS = [
  { name: 'Modal', href: 'https://modal.com', title: 'Modal — Serverless GPU & CPU' },
  { name: 'Gemini', href: 'https://ai.google.dev', title: 'Google Gemini AI' },
  { name: 'Supermemory', href: 'https://supermemory.ai', title: 'Supermemory — Universal Memory API' },
  { name: 'Capital One', href: 'https://developer.capitalone.com', title: 'Capital One — Nessie API' },
]

function ModalLogo({ className }) {
  return (
    <svg viewBox="0 0 368 192" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" className={className}>
      <path d="M148.873 4L183.513 64L111.922 188C110.492 190.47 107.853 192 104.993 192H40.3325C38.9025 192 37.5325 191.62 36.3325 190.93C35.1325 190.24 34.1226 189.24 33.4026 188L1.0725 132C-0.3575 129.53 -0.3575 126.48 1.0725 124L70.3625 4C71.0725 2.76 72.0925 1.76001 73.2925 1.07001C74.4925 0.380007 75.8625 0 77.2925 0H141.952C144.812 0 147.453 1.53 148.883 4H148.873ZM365.963 124L296.672 4C295.962 2.76 294.943 1.76001 293.743 1.07001C292.543 0.380007 291.173 0 289.743 0H225.083C222.223 0 219.583 1.53 218.153 4L183.513 64L255.103 188C256.533 190.47 259.173 192 262.033 192H326.693C328.122 192 329.492 191.62 330.693 190.93C331.893 190.24 332.902 189.24 333.622 188L365.953 132C367.383 129.53 367.383 126.48 365.953 124H365.963Z" fill="currentColor" />
      <path d="M109.623 64H183.523L148.883 4C147.453 1.53 144.813 0 141.953 0H77.2925C75.8625 0 74.4925 0.380007 73.2925 1.07001L109.623 64Z" fill="currentColor" fillOpacity="0.85" />
      <path d="M109.623 64L73.2925 1.07001C72.0925 1.76001 71.0825 2.76 70.3625 4L1.0725 124C-0.3575 126.48 -0.3575 129.52 1.0725 132L33.4026 188C34.1126 189.24 35.1325 190.24 36.3325 190.93L109.613 64H109.623Z" fill="currentColor" fillOpacity="0.7" />
      <path d="M183.513 64H109.613L36.3325 190.93C37.5325 191.62 38.9025 192 40.3325 192H104.993C107.853 192 110.492 190.47 111.922 188L183.513 64Z" fill="currentColor" fillOpacity="0.85" />
      <path d="M365.963 132C366.673 130.76 367.033 129.38 367.033 128H294.372L258.042 190.93C259.242 191.62 260.612 192 262.042 192H326.703C329.563 192 332.202 190.47 333.632 188L365.963 132Z" fill="currentColor" fillOpacity="0.85" />
      <path d="M225.083 0C223.653 0 222.283 0.380007 221.083 1.07001L294.362 128H367.023C367.023 126.62 366.663 125.24 365.953 124L296.672 4C295.242 1.53 292.603 0 289.743 0H225.073H225.083Z" fill="currentColor" fillOpacity="0.85" />
      <path d="M258.033 190.93L294.362 128L221.083 1.07001C219.883 1.76001 218.873 2.76 218.153 4L183.513 64L255.103 188C255.813 189.24 256.833 190.24 258.033 190.93Z" fill="currentColor" fillOpacity="0.7" />
    </svg>
  )
}

function GeminiLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" className={className}>
      <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="currentColor" />
    </svg>
  )
}

function SupermemoryLogo({ className }) {
  return (
    <svg viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" className={className}>
      <path d="M39.127 12.622H24.606V0H19.914V13.695C19.914 15.149 20.488 16.546 21.509 17.575L33.366 29.533L36.683 26.187L27.926 17.356H39.129V12.624L39.127 12.622ZM2.446 5.812L11.204 14.644H0V19.375H14.521V31.997H19.213V18.302C19.2133 16.849 18.6401 15.4547 17.618 14.422L5.764 2.466L2.446 5.812Z" fill="currentColor" />
    </svg>
  )
}

function CapitalOneLogo({ className }) {
  return (
    <svg viewBox="0 0 1521 1350" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" className={className}>
      <path d="M169.24 18.25C369.48 5.08 570.32 -2.73 771.13 2.49C914.31 7.29 1057.96 16.6 1198.55 45.63C1277.81 63.17 1357.96 85.56 1427.29 129.17C1468.73 156.03 1509.37 193.61 1518.17 244.51C1529.08 303.54 1504.76 361.63 1474.99 411.35C1419.58 500.82 1344.04 575.51 1266.52 645.84C1168.78 732.62 1064.64 812.02 957.82 887.28C853.06 960.1 747.94 1032.44 641.16 1102.25C505.04 1189.69 365.81 1272.25 223.99 1350L31.42 1350C129.87 1281.65 222.39 1205.22 313.03 1126.9C424.74 1030.33 533.02 929.85 639.28 827.26C659.98 807.37 682.27 788.6 697.94 764.18C748.55 693.34 795.16 611.78 792.76 521.98C791.4 460.6 757.91 404.2 712.42 364.74C637.63 300.62 542.15 267.79 448.31 243.05C353.48 218.87 256.35 205.6 159.22 195.16C106.12 192.2 53.25 184.77 0 184.48L0 31.7C56.21 24.88 112.79 22.48 169.24 18.25Z" fill="currentColor" />
    </svg>
  )
}

const LOGO_MAP = {
  Modal: ModalLogo,
  Gemini: GeminiLogo,
  Supermemory: SupermemoryLogo,
  'Capital One': CapitalOneLogo,
}

// const LOGO_WIDTH = { Modal: 32, Gemini: 14, Supermemory: 18, 'Capital One': 14 }

export default function PartnerLogos({ className = '' }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 shrink-0 rounded-full bg-g-green pulse-dot" />
        <span className="font-display text-xs font-bold text-g-text-tertiary">
          Powered by Modal
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-start gap-4">
        {PARTNERS.map(({ name, href, title }) => {
          const LogoComponent = LOGO_MAP[name]
          // const w = LOGO_WIDTH[name]
          return (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              className="group flex h-4 shrink-0 items-center justify-center text-g-text-tertiary/70 transition-colors hover:text-g-text-tertiary"
            >
              <span className="flex h-full items-center justify-center" >
                <LogoComponent className="h-full w-full object-contain" />
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
