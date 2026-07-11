// @ts-nocheck
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, X, Plus, BookOpen } from "lucide-react";

// Frontend-only UI template — no persistence, no backend.
export function MemoryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [newMemory, setNewMemory] = useState('');
  const [memories, setMemories] = useState<any[]>([]);

  const handleAddMemory = () => {
    if (!newMemory.trim()) return;
    setMemories((prev) => [{
      id: Date.now().toString(),
      type: 'fact',
      content: newMemory,
      date: new Date().toLocaleDateString(),
    }, ...prev]);
    setNewMemory('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] overflow-hidden bg-[#0A0A0A] text-[#E8EAF0] border border-[#222] shadow-2xl rounded-2xl p-0 flex flex-col font-sans" style={{ borderRadius: 16 }}>
        <div className="flex items-center justify-between p-5 pb-4 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2FE0C8]/10 flex items-center justify-center border border-[#2FE0C8]/20 text-[#2FE0C8]">
              <Brain size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">DIGI Core Memories</h2>
              <p className="text-[9px] text-[#666] tracking-wider uppercase mt-0.5 font-bold">UI TEMPLATE · DEMO ONLY</p>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="text-[#666] hover:text-white transition-colors"><X size={16} /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <Input
              placeholder="Type a new memory..."
              value={newMemory}
              onChange={e => setNewMemory(e.target.value)}
              className="w-full h-9 bg-[#0F0F0F] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#2FE0C8]/50 rounded-lg pl-3 pr-4 text-xs"
            />
            <Button onClick={handleAddMemory} className="bg-[#2FE0C8] hover:bg-[#25BFA9] text-black font-semibold rounded-lg px-4 h-9 text-xs transition-colors flex items-center gap-1.5">
              <Plus size={14} /> Add
            </Button>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {memories.length === 0 && (
              <div className="text-center text-[#666] text-xs py-10 italic">No memories yet.</div>
            )}
            {memories.map((mem) => (
              <div key={mem.id} className="p-4 rounded-xl border border-white/5 bg-[#0F0F0F] flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-[#2FE0C8]/10 text-[#2FE0C8] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen size={10} />
                </div>
                <p className="text-xs text-[#999] leading-relaxed">
                  <span className="font-mono text-[10px] text-[#2FE0C8] mr-2">[{mem.date}]</span>
                  {mem.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border-t border-[#1A1A1A] p-4 flex items-center justify-between">
          <span className="text-[10px] text-[#555] font-bold tracking-wider uppercase">{memories.length} ITEMS</span>
          <Button className="bg-white hover:bg-gray-200 text-black font-semibold rounded-lg px-6 h-8 text-xs" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
