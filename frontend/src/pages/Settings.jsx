import React from 'react'
import ProfileForm from '../components/ProfileForm.jsx'

export default function Settings() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="fade-up-1 mb-5 sm:mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-[28px] text-g-text tracking-tight">Settings</h1>
        <p className="font-body text-g-text-secondary text-sm mt-1">
          Update your profile — changes sync to Supermemory for persistent AI context.
        </p>
      </div>
      <div className="fade-up-2"><ProfileForm /></div>
    </div>
  )
}
