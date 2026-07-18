// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Zap, X, Search, Plus, ArrowLeft } from "lucide-react";

export function SkillsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [skillName, setSkillName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [skills, setSkills] = useState<any[]>([]);

  const loadSkills = async () => {
    if ((window as any).electronAPI?.loadSkills) {
      const data = await (window as any).electronAPI.loadSkills();
      setSkills(data || []);
    }
  };

  useEffect(() => {
    if (open) {
      loadSkills();
      setView('list');
    }
  }, [open]);

  const handleSaveSkill = async () => {
    if (!skillName.trim() || !description.trim()) return;
    const newSkill = {
      id: Date.now().toString(),
      name: skillName,
      description,
      instructions
    };
    const updated = [newSkill, ...skills];
    setSkills(updated);
    if ((window as any).electronAPI?.saveSkills) {
      await (window as any).electronAPI.saveSkills(updated);
    }
    setSkillName('');
    setDescription('');
    setInstructions('');
    setView('list');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] w-[calc(100vw-2rem)] h-[min(550px,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] overflow-hidden bg-[#0A0A0A] text-[#E8EAF0] border border-[#222] shadow-2xl rounded-2xl p-0 flex flex-col font-sans" style={{ borderRadius: 16 }}>
        
        {view === 'list' ? (
          <>
            {/* List View Header */}
            <div className="flex items-center justify-between p-5 pb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Skills</h2>
                <p className="text-[11px] text-[#777] mt-0.5">Teach your AI agent custom workflows</p>
              </div>
            </div>

            {/* List View Body */}
            <div className="px-5 flex flex-col h-full">
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Input 
                    placeholder="Search skills..." 
                    className="w-full h-9 bg-[#0F0F0F] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#3B82F6]/50 rounded-lg pl-9 pr-4 text-xs" 
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                </div>
                <Button onClick={() => setView('create')} className="bg-white hover:bg-gray-200 text-black font-semibold rounded-lg px-4 h-9 text-xs transition-colors flex items-center gap-1.5">
                  <Plus size={14} /> New Skill
                </Button>
              </div>

              {/* Skills List or Empty State */}
              {skills.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-70">
                  <div className="w-12 h-12 rounded-2xl border border-[#333] bg-[#111] flex items-center justify-center text-[#555] mb-4">
                    <Zap size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#CCC]">No skills yet</h3>
                  <p className="text-xs text-[#666] mt-1 mb-4">Create your first skill to get started</p>
                  <button onClick={() => setView('create')} className="text-[#3B82F6] text-xs font-semibold hover:underline flex items-center gap-1">
                    <Plus size={12} /> Create Skill
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                  {skills.map((s) => (
                    <div key={s.id} className="p-4 border border-[#222] rounded-xl bg-[#111]">
                      <h4 className="text-sm font-semibold text-white">{s.name}</h4>
                      <p className="text-[11px] text-[#888] mt-1">{s.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Create View Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1A1A1A]">
              <button onClick={() => setView('list')} className="text-[#888] hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold">
                <ArrowLeft size={14} /> Skills
              </button>
            </div>

            {/* Create View Body */}
            <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto">
              
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">SKILL NAME <span className="text-[#EF4444]">*</span></Label>
                <Input 
                  value={skillName}
                  onChange={e => setSkillName(e.target.value)}
                  placeholder="e.g. Write Weekly Report"
                  className="w-full h-11 bg-[#000] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#3B82F6]/50 rounded-xl px-4 text-xs" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">DESCRIPTION <span className="text-[#EF4444]">*</span></Label>
                <Input 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What does this skill do? The AI uses this to decide when to activate it."
                  className="w-full h-11 bg-[#000] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#3B82F6]/50 rounded-xl px-4 text-xs" 
                />
              </div>

              <div className="space-y-2 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">INSTRUCTIONS</Label>
                  <span className="text-[10px] text-[#555]">Markdown supported</span>
                </div>
                <Textarea 
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder={`Write the step-by-step instructions the AI should follow.\n\nExample:\n1. Ask the user for the report period.\n2. Summarize key metrics.\n3. Write a professional summary in English.`}
                  className="w-full flex-1 min-h-[150px] bg-[#000] border-[#222] text-[#CCC] focus-visible:ring-1 focus-visible:ring-[#3B82F6]/50 rounded-xl p-4 text-xs font-mono resize-none leading-relaxed" 
                />
              </div>

            </div>

            {/* Footer */}
            <div className="bg-[#0A0A0A] border-t border-[#1A1A1A] p-4 flex items-center justify-end shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-20">
              <div className="flex gap-3">
                <Button variant="ghost" className="text-[#888] hover:text-white hover:bg-[#1A1A1A] rounded-lg px-6 h-9 text-xs" onClick={() => setView('list')}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSkill} disabled={!skillName.trim() || !description.trim()} className={`${(!skillName.trim() || !description.trim()) ? 'bg-[#333] text-[#888] cursor-not-allowed' : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white cursor-pointer'} font-semibold rounded-lg px-6 h-9 text-xs transition-colors`}>
                  Save Skill
                </Button>
              </div>
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
