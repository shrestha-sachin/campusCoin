import React from 'react'
import { FileText, Calendar, Trash2, ShieldCheck, ExternalLink, FileCheck } from 'lucide-react'
import { useApp } from '../store.jsx'

export default function DocumentHistory() {
    const { profile, setProfile } = useApp()
    const documents = profile.doc_history || []

    function removeDoc(id) {
        if (window.confirm('Remove this document from your profile history? (This won\'t delete stored academic events)')) {
            setProfile(prev => ({
                ...prev,
                doc_history: prev.doc_history.filter(d => d.id !== id)
            }))
        }
    }

    return (
        <div className="card p-5 sm:p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-g-blue to-g-purple flex items-center justify-center shadow-sm">
                        <ShieldCheck size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-g-text text-base">Academic Documents</h3>
                        <p className="font-body text-[10px] text-g-text-tertiary uppercase font-bold tracking-wider">Knowledge Repository</p>
                    </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-g-bg border border-g-border text-[10px] font-bold text-g-text-tertiary">
                    {documents.length} SECURE
                </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar max-h-[400px]">
                {documents.length > 0 ? (
                    documents.map((doc, idx) => (
                        <div key={doc.id || idx} className="p-4 rounded-2xl bg-g-bg border border-g-border/40 hover:border-g-blue/30 transition-all group relative">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-g-border flex items-center justify-center text-g-blue shadow-sm">
                                    <FileCheck size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-display font-bold text-g-text text-sm truncate pr-8">{doc.name}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} className="text-g-text-tertiary" />
                                            <span className="font-body text-[11px] text-g-text-tertiary">
                                                {new Date(doc.upload_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <span className="w-1 h-1 rounded-full bg-g-border" />
                                        <span className="font-body text-[11px] text-g-blue font-bold">
                                            {doc.event_count} AI Events
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => removeDoc(doc.id)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg text-g-text-tertiary hover:text-g-red hover:bg-g-red-pastel opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                        <FileText size={48} className="text-g-text-tertiary mb-4" />
                        <p className="font-display font-bold text-sm uppercase tracking-widest">No Documents Yet</p>
                        <p className="font-body text-xs mt-1">Upload a syllabus in Campus Navigator</p>
                    </div>
                )}
            </div>

            {documents.length > 0 && (
                <div className="mt-6 pt-5 border-t border-g-border flex items-center justify-between">
                    <p className="font-body text-[10px] text-g-text-tertiary leading-relaxed max-w-[70%]">
                        Your documents are processed by Gemini 1.5 and stored in your secure encrypted profile.
                    </p>
                    <div className="w-8 h-8 rounded-lg bg-g-bg flex items-center justify-center text-g-text-tertiary">
                        <ExternalLink size={14} />
                    </div>
                </div>
            )}
        </div>
    )
}
