import React from 'react'
import ProfileForm from '../components/ProfileForm.jsx'

export default function Settings() {
  return (
    <div className="p-10 max-w-2xl mx-auto">
      <div className="fade-up-1 mb-10">
        <h1 className="font-google font-bold text-3xl text-google-black">Settings</h1>
        <p className="font-google-text text-google-black/55 text-base mt-2">
          Update your profile — changes sync to Supermemory for persistent AI context.
        </p>
      </div>

      <div className="fade-up-2">
        <ProfileForm />
      </div>
    </div>
  )
}
