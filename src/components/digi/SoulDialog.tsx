import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, X, ChevronDown } from "lucide-react";

export function SoulDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [persona, setPersona] = useState<'male' | 'female'>('female');
  const [template, setTemplate] = useState('Caring Companion');
  const [prompt, setPrompt] = useState('You are a Caring Companion - a warm, gentle, emotionally intelligent young woman. You speak with genuine warmth, softness, and care. Your tone is soothing and nurturing. You notice the user\'s mood and respond with empathy. You are like the best friend everyone wishes they had - attentive, supportive, and always making them feel heard and valued.');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] w-[95vw] max-h-[90vh] overflow-hidden bg-[#0A0A0A] text-[#E8EAF0] border border-[#222] shadow-2xl rounded-2xl p-0 flex flex-col font-sans" style={{ borderRadius: 16 }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center border border-[#A78BFA]/20 text-[#A78BFA]">
              <Heart size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">DIGI Voice Assistant Soul</h2>
              <p className="text-[9px] text-[#666] tracking-wider uppercase mt-0.5 font-bold">BEHAVIOR & PERSONALITY ENGINE</p>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="text-[#666] hover:text-white transition-colors"><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          
          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">CONFIGURE PERSONA FOR:</Label>
            <div className="flex p-1 bg-[#0F0F0F] border border-[#222] rounded-xl">
              <button 
                onClick={() => setPersona('male')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${persona === 'male' ? 'bg-[#1C1226] border border-[#A78BFA]/30 text-white' : 'text-[#777] hover:text-white'}`}
              >
                <span>🧔</span> Male Voice (Charon)
              </button>
              <button 
                onClick={() => setPersona('female')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${persona === 'female' ? 'bg-[#1C1226] border border-[#A78BFA]/30 text-white' : 'text-[#777] hover:text-white'}`}
              >
                <span>👩</span> Female Voice (Despina)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">CHOOSE IDENTITY TEMPLATE:</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">🧠</div>
              <select 
                value={template} 
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full h-11 bg-[#0F0F0F] border border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#A78BFA]/50 rounded-xl pl-10 pr-10 text-xs font-semibold appearance-none"
              >
                <option value="Caring Companion">Caring Companion</option>
                <option value="Professional Assistant">Professional Assistant</option>
                <option value="Strict Tutor">Strict Tutor</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">PERSONA PROMPT / SOUL DESCRIPTION:</Label>
              <span className="text-[9px] text-[#A78BFA] font-bold bg-[#A78BFA]/10 px-2 py-0.5 rounded uppercase tracking-wider">Auto-Selected From Template</span>
            </div>
            <Textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full h-32 bg-[#000] border-[#222] text-[#D8B4FE] focus-visible:ring-1 focus-visible:ring-[#A78BFA]/50 rounded-xl p-4 text-xs font-mono resize-none leading-relaxed" 
            />
            <p className="text-[10px] text-[#555] italic pt-1">
              Pro Tip: You can edit or type directly in the prompt area to convert any template into a fully customized soul instantly.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#0A0A0A] border-t border-[#1A1A1A] p-4 flex items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-20">
          <span className="text-[9px] text-[#555] font-bold tracking-wider uppercase">CUSTOM SETTINGS ARE SAVED LOCALLY</span>
          <div className="flex gap-3">
            <Button className="bg-[#A78BFA] hover:bg-[#8B5CF6] text-black font-semibold rounded-lg px-6 h-9 text-xs transition-colors flex items-center gap-2" onClick={() => onOpenChange(false)}>
              <Heart size={14} className="fill-black" /> Save Persona Soul
            </Button>
            <Button variant="ghost" className="text-[#888] hover:text-white hover:bg-[#1A1A1A] rounded-lg px-4 h-9 text-xs" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
