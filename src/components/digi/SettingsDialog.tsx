// @ts-nocheck
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings2, Mic, Briefcase, PlaySquare, User, Smartphone, Key, Eye, EyeOff, Shield, Link2, ExternalLink, Info, CheckCircle2, PhoneOff, Globe, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export function SettingsDialog({ open, onOpenChange, defaultTab = "voice" }: { open: boolean; onOpenChange: (open: boolean) => void; defaultTab?: string }) {
  const [tab, setTab] = useState(defaultTab);
  
  // API Settings State
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash');
  
  // New States for Voice Assistant Tab
  const [showKey, setShowKey] = useState(false);
  const [persona, setPersona] = useState('female');
  const [wakeWord, setWakeWord] = useState(false);
  const [picovoiceKey, setPicovoiceKey] = useState('');
  const [subAgentConfig, setSubAgentConfig] = useState(true);
  
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [openRouterModel, setOpenRouterModel] = useState('');

  // Agent Town State
  const [agentProvider, setAgentProvider] = useState('gemini');
  const [agentApiKey, setAgentApiKey] = useState('');
  const [agentModelId, setAgentModelId] = useState('gemini-1.5-flash-lite');

  // System Settings State
  const [autoUpdates, setAutoUpdates] = useState(true);

  // User Profile State
  const [fullName, setFullName] = useState('');
  const [primaryLocation, setPrimaryLocation] = useState('');
  const [profession, setProfession] = useState('');
  const [bio, setBio] = useState('');

  // WhatsApp Link State
  const [waAutoConnect, setWaAutoConnect] = useState(false);
  const [waLinked, setWaLinked] = useState(false);

  // Load saved settings
  React.useEffect(() => {
    if (open) {
      const load = async () => {
        try {
          if ((window as any).electronAPI && (window as any).electronAPI.loadSettings) {
            const data = await (window as any).electronAPI.loadSettings();
            if (data) {
              if (data.provider) setProvider(data.provider);
              if (data.apiKey) setApiKey(data.apiKey);
              if (data.gemini_api_key && !data.apiKey) setApiKey(data.gemini_api_key);
              if (data.model) setModel(data.model);
              if (data.persona) setPersona(data.persona);
              if (data.wakeWord !== undefined) setWakeWord(data.wakeWord);
              if (data.picovoiceKey) setPicovoiceKey(data.picovoiceKey);
              if (data.subAgentConfig !== undefined) setSubAgentConfig(data.subAgentConfig);
              if (data.openRouterKey) setOpenRouterKey(data.openRouterKey);
              if (data.openRouterModel) setOpenRouterModel(data.openRouterModel);
            }
          } else {
            // Fallback for web mode
            setProvider(localStorage.getItem('digi_provider') || 'gemini');
            setApiKey(localStorage.getItem('digi_api_key') || '');
            setModel(localStorage.getItem('digi_model') || 'gemini-2.0-flash');
            setPersona(localStorage.getItem('digi_persona') || 'female');
            setWakeWord(localStorage.getItem('digi_wakeword') === 'true');
            setPicovoiceKey(localStorage.getItem('digi_picovoice_key') || '');
            setSubAgentConfig(localStorage.getItem('digi_subagent_override') !== 'false');
            setOpenRouterKey(localStorage.getItem('digi_openrouter_key') || '');
            setOpenRouterModel(localStorage.getItem('digi_openrouter_model') || 'google/gemini-1.5-flash-lite');
          }
        } catch (err) {
          console.error("Failed to load settings:", err);
        }
      };
      load();
    }
  }, [open]);

  const handleSave = async () => {
    try {
      // Send to backend
      if ((window as any).electronAPI && (window as any).electronAPI.saveSettings) {
        const result = await (window as any).electronAPI.saveSettings({ 
          provider, apiKey, model, persona, wakeWord, picovoiceKey, subAgentConfig, openRouterKey, openRouterModel 
        });
        
        if (result && result.success) {
          toast.success("Settings saved successfully");
          onOpenChange(false);
        } else {
          toast.error("Failed to save settings: " + (result?.error || "Unknown error"));
        }
      } else {
        // Fallback for web mode
        localStorage.setItem('digi_provider', provider);
        localStorage.setItem('digi_api_key', apiKey);
        localStorage.setItem('digi_model', model);
        localStorage.setItem('digi_persona', persona);
        localStorage.setItem('digi_wakeword', wakeWord.toString());
        localStorage.setItem('digi_picovoice_key', picovoiceKey);
        localStorage.setItem('digi_subagent_override', subAgentConfig.toString());
        localStorage.setItem('digi_openrouter_key', openRouterKey);
        localStorage.setItem('digi_openrouter_model', openRouterModel);
        
        toast.success("Settings saved locally");
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error("An error occurred while saving: " + err.message);
    }
  };

  const tabs = [
    { id: 'voice', label: 'Voice Assistant', desc: 'Gemini Live & Persona', icon: <Mic size={16} /> },
    { id: 'agent', label: 'Agent Town', desc: 'Hermes & Model Config', icon: <Briefcase size={16} /> },
    { id: 'system', label: 'System Settings', desc: 'Updates & Performance', icon: <Settings2 size={16} /> },
    { id: 'user', label: 'User Profile', desc: 'Account & Authentication', icon: <User size={16} /> },
    { id: 'whatsapp', label: 'WhatsApp Link', desc: 'Remote Control', icon: <Smartphone size={16} /> },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] w-[95vw] h-[90vh] sm:h-[600px] max-h-[90vh] bg-[#0A0A0A] text-[#E8EAF0] border border-[#222] shadow-2xl rounded-2xl overflow-hidden p-0 flex flex-col font-sans" style={{ borderRadius: 16 }}>
        
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Sidebar */}
          <div className="w-[260px] flex-shrink-0 bg-[#0F0F0F] border-r border-[#1A1A1A] flex flex-col p-4">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 px-2 pt-2">
              <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center border border-[#222]">
                <Settings2 className="text-[#888]" size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">System Configuration</h2>
                <p className="text-[10px] text-[#666] leading-tight mt-0.5">Manage your core agent credentials,<br/>voice parameters, and active links</p>
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1">
              {tabs.map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex flex-col items-start w-full text-left p-3 rounded-xl transition-all border ${
                    tab === t.id 
                    ? 'bg-[#0F1C1A] border-transparent border-l-4 border-l-[#2FE0C8]' 
                    : 'bg-transparent border-transparent hover:bg-[#151515]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={tab === t.id ? "text-[#2FE0C8]" : "text-[#777]"}>
                      {t.icon}
                    </span>
                    <span className={`text-[13px] font-medium ${tab === t.id ? 'text-white' : 'text-[#888]'}`}>
                      {t.label}
                    </span>
                  </div>
                  <span className={`text-[11px] mt-1 ml-6 ${tab === t.id ? 'text-[#2FE0C8]/60' : 'text-[#555]'}`}>
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-y-auto">
            {/* VOICE ASSISTANT TAB */}
            {tab === 'voice' && (
              <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-lg font-semibold text-white">Voice Assistant Settings</h3>
                  <p className="text-xs text-[#777] mt-1">Customize your live voice assistant engine and response characteristics</p>
                </div>

                <div className="space-y-3 p-5 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-semibold text-[#888] flex items-center gap-2 uppercase tracking-wider mb-1">
                      <Globe size={12} className="text-[#2FE0C8]" />
                      GOOGLE BACKEND CONNECTION
                    </Label>
                    <p className="text-sm font-semibold text-white">Login to use free Gemini Live backend</p>
                    <p className="text-[11px] text-[#555] max-w-[350px] mt-1">Click the button to open a temporary browser window and sign into your Google account. This enables the background Voice AI.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if ((window as any).electronAPI) {
                        (window as any).electronAPI.openGeminiLoginWindow?.();
                      }
                    }} 
                    style={{
                      backgroundColor: '#2FE0C8',
                      color: '#000',
                      height: '40px',
                      padding: '0 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(47, 224, 200, 0.2)'
                    }}
                  >
                    <ExternalLink size={14} />
                    Login to Gemini
                  </button>
                </div>

                <div className="space-y-3 p-5 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold text-[#888] flex items-center gap-2 uppercase tracking-wider">
                      <Key size={12} className="text-[#2FE0C8]" />
                      GEMINI LIVE API KEY
                    </Label>
                    <span className="text-[10px] font-mono text-[#2FE0C8] bg-[#2FE0C8]/10 px-2 py-0.5 rounded flex items-center gap-1 border border-[#2FE0C8]/20">
                      <Shield size={10} /> SECURE
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input 
                        type={showKey ? "text" : "password"} 
                        placeholder="AIzaSyB-..." 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full h-10 bg-[#000] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#2FE0C8]/50 focus-visible:border-[#2FE0C8]/40 shadow-inner rounded-lg pl-3 pr-10 font-mono text-sm" 
                      />
                      <button 
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#999] transition-colors"
                      >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <Button onClick={handleSave} className="bg-[#2FE0C8] hover:bg-[#2FE0C8]/80 text-black h-10 px-4 rounded-lg text-sm font-semibold shadow-lg shadow-[#2FE0C8]/20 transition-all">
                      Save Key
                    </Button>
                  </div>
                  <p className="text-[11px] text-[#555]">This API key is stored locally in your workspace cache and encrypted during transit to secure services.</p>
                </div>

                <div className="space-y-3 p-5 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]">
                  <Label className="text-xs font-semibold text-[#888] flex items-center gap-2 uppercase tracking-wider">
                    <User size={12} className="text-[#2FE0C8]" />
                    SELECT VOICE PERSONA
                  </Label>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button 
                      onClick={() => setPersona('male')}
                      className={`text-left p-4 rounded-xl border transition-all relative ${
                        persona === 'male' ? 'bg-[#142928] border-[#2FE0C8]' : 'bg-[#000] border-[#222] hover:border-[#333]'
                      }`}
                    >
                      <div className="text-xl mb-2">🧔</div>
                      <div className="text-sm font-semibold text-white">Male Persona (Charon)</div>
                      <div className="text-xs text-[#666] mt-1">Deep, crisp, professional tone</div>
                      {persona === 'male' && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#2FE0C8]" />}
                    </button>

                    <button 
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${persona === 'female' ? 'border-[#2FE0C8] bg-[rgba(47,224,200,0.05)]' : 'border-[#1A1D24] bg-[#111318] hover:border-[#333]'}`}
                      onClick={() => setPersona('female')}
                    >
                      <div className="text-xl mb-2">👩</div>
                      <div className="text-sm font-semibold text-white">Female Persona (Aoede)</div>
                      <div className="text-xs text-[#666] mt-1">Clear, natural, helpful tone</div>
                      {persona === 'female' && <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#2FE0C8] flex items-center justify-center">
                         <div className="w-1.5 h-1.5 bg-black rounded-full" />
                      </div>}
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] flex items-start justify-between">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#888] flex items-center gap-2 uppercase tracking-wider mb-2">
                      <Mic size={12} className="text-[#2FE0C8]" />
                      WAKE WORD DETECTION
                    </Label>
                    <p className="text-sm font-semibold text-white">Listen for the wake word in the background</p>
                    <p className="text-[11px] text-[#666] leading-relaxed max-w-[450px]">
                      When ON, a background process keeps listening to your microphone so you can activate the assistant hands-free. Turning it OFF (default) saves CPU and battery — you can still start the assistant manually anytime.
                    </p>
                  </div>
                  <Switch checked={wakeWord} onCheckedChange={setWakeWord} className="data-[state=checked]:bg-[#2FE0C8] mt-1" />
                </div>
                
                <div className="space-y-2 pt-2 border-t border-[#1A1A1A]">
                  <Label className="text-sm font-semibold text-[#888]">Picovoice Access Key (For Wake Word)</Label>
                  <Input 
                    type="password" 
                    placeholder="Enter your Picovoice AccessKey..." 
                    value={picovoiceKey}
                    onChange={(e) => setPicovoiceKey(e.target.value)}
                    className="w-full h-10 bg-[#000] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#2FE0C8]/50 rounded-lg pl-3 font-mono text-sm" 
                  />
                  <p className="text-[11px] text-[#555]">Required for wake word detection to work. Get one for free at console.picovoice.ai</p>
                </div>

                <div className="p-5 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] flex flex-col gap-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-[#888] flex items-center gap-2 uppercase tracking-wider mb-2">
                        <Link2 size={12} className="text-[#2FE0C8]" />
                        SUB-AGENT MODEL CONFIG
                      </Label>
                      <p className="text-sm font-semibold text-white">Override defaults with OpenRouter</p>
                      <p className="text-[11px] text-[#666] leading-relaxed">
                        Enable this option to direct background sub-agents to use any customized OpenRouter model ID instead of Gemini.
                      </p>
                    </div>
                    <Switch checked={subAgentConfig} onCheckedChange={setSubAgentConfig} className="data-[state=checked]:bg-[#2FE0C8] mt-1" />
                  </div>

                  {subAgentConfig && (
                    <div className="space-y-4 pt-4 border-t border-[#222] animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-[11px] font-medium text-[#777]">OpenRouter API Key</Label>
                          <a href="#" className="text-[10px] text-[#2FE0C8] hover:underline flex items-center gap-1">Get Key <ExternalLink size={9}/></a>
                        </div>
                        <div className="relative">
                          <Input 
                            type="password" 
                            placeholder="sk-or-v1-..." 
                            value={openRouterKey}
                            onChange={(e) => setOpenRouterKey(e.target.value)}
                            className="w-full h-9 bg-[#000] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#2FE0C8]/50 rounded-lg pl-3 pr-10 font-mono text-[13px]" 
                          />
                          <Key size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444]" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[11px] font-medium text-[#777]">Model ID</Label>
                        <Input 
                          type="text" 
                          placeholder="google/gemini-1.5-flash-lite" 
                          value={openRouterModel}
                          onChange={(e) => setOpenRouterModel(e.target.value)}
                          className="w-full h-9 bg-[#000] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#2FE0C8]/50 rounded-lg px-3 font-mono text-[13px]" 
                        />
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#555]"></div>
                          <span className="text-[10px] text-[#555]">Default Engine: Gemini 3 Flash Preview</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-lg border border-[#222] bg-[#050505]">
                          <div className="text-[10px] text-[#666] mb-1 uppercase tracking-wider flex items-center gap-1">
                            <Settings2 size={10} /> MAIN ASSISTANT
                          </div>
                          <div className="text-[13px] font-semibold text-white mb-2">Gemini 3.1 Flash Live Preview</div>
                          <div className="inline-flex items-center gap-1 bg-[#2FE0C8]/10 text-[#2FE0C8] px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                            <div className="w-1 h-1 bg-[#2FE0C8] rounded-full animate-pulse" /> LIVE LINK
                          </div>
                        </div>

                        <div className="p-3 rounded-lg border border-[#222] bg-[#050505]">
                          <div className="text-[10px] text-[#666] mb-1 uppercase tracking-wider flex items-center gap-1">
                            <Shield size={10} /> CHILD WORKER
                          </div>
                          <div className="text-[13px] font-semibold text-white mb-2">Gemini 3 Flash Preview</div>
                          <div className="inline-flex items-center gap-1 bg-[#3B82F6]/10 text-[#3B82F6] px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                            BACKGROUND
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AGENT TOWN TAB */}
            {tab === 'agent' && (
              <div className="p-8 pb-20 space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-lg font-semibold text-white">Agent Town Configuration</h3>
                  <p className="text-xs text-[#777] mt-1">Setup API endpoints and model paths specifically for Hermes agent simulations</p>
                </div>

                <div className="bg-[#1C1226] border border-[#3A2252] rounded-xl p-3 flex items-center gap-3">
                  <Info size={14} className="text-[#A78BFA] flex-shrink-0" />
                  <p className="text-[11px] text-[#D8B4FE]">Agent Town (Hermes) is simulator in credentials to use karega. Ye credentials voice channel se bulik independent hain.</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-semibold text-[#888] uppercase tracking-wider">SELECT AI PROVIDER</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Providers */}
                    <button onClick={() => setAgentProvider('openrouter')} className={`p-4 rounded-xl border text-left transition-all ${agentProvider === 'openrouter' ? 'bg-[#121A2F] border-[#3B82F6]' : 'bg-[#000] border-[#222] hover:border-[#333]'}`}>
                      <div className="text-[#3B82F6] mb-2"><Globe size={18} /></div>
                      <div className="text-xs font-semibold text-white">OpenRouter</div>
                      <div className="text-[10px] text-[#666]">200+ models</div>
                    </button>

                    <button onClick={() => setAgentProvider('gemini')} className={`p-4 rounded-xl border text-left transition-all relative ${agentProvider === 'gemini' ? 'bg-[#121A2F] border-[#3B82F6]' : 'bg-[#000] border-[#222] hover:border-[#333]'}`}>
                      <div className="text-[#3B82F6] mb-2"><Briefcase size={18} /></div>
                      <div className="text-xs font-semibold text-white">Google Gemini</div>
                      <div className="text-[10px] text-[#666]">Direct API</div>
                      {agentProvider === 'gemini' && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#3B82F6] flex items-center justify-center">
                         <div className="w-1.5 h-1.5 bg-black rounded-full" />
                      </div>}
                    </button>

                    <button onClick={() => setAgentProvider('chatgpt')} className={`p-4 rounded-xl border text-left transition-all ${agentProvider === 'chatgpt' ? 'bg-[#121A2F] border-[#3B82F6]' : 'bg-[#000] border-[#222] hover:border-[#333]'}`}>
                      <div className="text-[#3B82F6] mb-2"><PlaySquare size={18} /></div>
                      <div className="text-xs font-semibold text-white">ChatGPT Plus/Pro</div>
                      <div className="text-[10px] text-[#666]">Subscription</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-[11px] font-medium text-[#777]">Gemini API Key</Label>
                      <a href="#" className="text-[10px] text-[#2FE0C8] hover:underline flex items-center gap-1">Get Key <ExternalLink size={9}/></a>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input 
                          type="password" 
                          placeholder="••••••••••••••••••••••••••••••••••••••••••••••••" 
                          value={agentApiKey}
                          onChange={(e) => setAgentApiKey(e.target.value)}
                          className="w-full h-9 bg-[#000] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#2FE0C8]/50 rounded-lg pl-3 pr-10 font-mono text-[13px]" 
                        />
                        <Key size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444]" />
                      </div>
                      <Button onClick={handleSave} className="bg-[#2FE0C8] hover:bg-[#2FE0C8]/80 text-black h-9 px-4 rounded-lg text-sm font-semibold shadow-lg shadow-[#2FE0C8]/20 transition-all">
                        Save Key
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-medium text-[#777]">Model ID</Label>
                    <Input 
                      type="text" 
                      value={agentModelId}
                      onChange={(e) => setAgentModelId(e.target.value)}
                      className="w-full h-9 bg-[#000] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#2FE0C8]/50 rounded-lg px-3 font-mono text-[13px]" 
                    />
                    <div className="flex flex-wrap gap-2 pt-2">
                      {['gemini-1.5-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-flash-preview', 'gemini-1.5-pro-preview'].map(m => (
                        <button key={m} onClick={() => setAgentModelId(m)} className={`text-[10px] px-2 py-1 rounded-md border font-mono ${agentModelId === m ? 'bg-[#142928] border-[#2FE0C8]/30 text-[#2FE0C8]' : 'bg-[#0A0A0A] border-[#222] text-[#666] hover:text-[#999]'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#142928] bg-[#0A1A18] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-[#2FE0C8] rounded-full" />
                    <div>
                      <div className="text-xs font-semibold text-white">Gemini - {agentModelId}</div>
                      <div className="text-[10px] text-[#777]">Agent Town will use this provider and model</div>
                    </div>
                  </div>
                  <CloudArrowUpIcon />
                </div>

              </div>
            )}

            {/* SYSTEM SETTINGS TAB */}
            {tab === 'system' && (
              <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-lg font-semibold text-white">System Settings</h3>
                  <p className="text-xs text-[#777] mt-1">Manage application updates and performance characteristics</p>
                </div>

                <div className="p-5 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]">
                  <div className="flex items-start justify-between mb-4">
                    <Label className="text-xs font-semibold text-[#888] flex items-center gap-2 uppercase tracking-wider">
                      <Settings2 size={12} className="text-[#F59E0B]" />
                      AUTOMATIC UPDATES
                    </Label>
                    <Switch checked={autoUpdates} onCheckedChange={setAutoUpdates} className="data-[state=checked]:bg-[#F59E0B]" />
                  </div>
                  
                  <h4 className="text-sm font-semibold text-white mb-1">Automatically download and install updates</h4>
                  <p className="text-[11px] text-[#666] leading-relaxed">
                    When enabled, DIGI Business OS will automatically download new updates in the background and prompt you to install them. When disabled, you will get a notification when updates are available, letting you download them manually.
                  </p>
                </div>
              </div>
            )}

            {/* USER PROFILE TAB */}
            {tab === 'user' && (
              <div className="p-8 pb-20 space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]">
                  <div className="w-14 h-14 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-[#F59E0B] text-xl font-bold mb-3">
                    T
                  </div>
                  <div className="text-sm font-medium text-white mb-1">testing@digibusinessos.com</div>
                  <div className="text-[9px] font-mono tracking-wider text-[#666] uppercase">LOGGED-IN USER</div>
                </div>

                <div className="p-4 rounded-xl border border-[#112417] bg-[#0A170E] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-[#22C55E]" />
                    <div>
                      <div className="text-xs font-semibold text-white">Access Whitelist Status</div>
                      <div className="text-[10px] text-[#22C55E]/70">Your email is verified and approved on the DIGI cloud</div>
                    </div>
                  </div>
                  <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-1 rounded text-[9px] font-bold text-[#22C55E] tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> APPROVED
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] space-y-5">
                  <Label className="text-xs font-semibold text-[#888] flex items-center gap-2 uppercase tracking-wider">
                    <User size={12} className="text-[#F59E0B]" />
                    IDENTITY DETAILS
                  </Label>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-[#777]">Full Name</Label>
                      <Input value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full h-9 bg-[#000] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#2FE0C8]/50 rounded-lg text-xs" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-[#777]">Primary Location</Label>
                        <Input value={primaryLocation} onChange={e=>setPrimaryLocation(e.target.value)} placeholder="e.g. Islamabad, Pakistan" className="w-full h-9 bg-[#000] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#2FE0C8]/50 rounded-lg text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-[#777]">Profession</Label>
                        <Input value={profession} onChange={e=>setProfession(e.target.value)} placeholder="e.g. Senior Software Engineer" className="w-full h-9 bg-[#000] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#2FE0C8]/50 rounded-lg text-xs" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-[#777]">Bio / Personal Context</Label>
                      <Textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell DIGI more about yourself..." className="w-full h-24 bg-[#000] border-[#222] text-white focus-visible:ring-1 focus-visible:ring-[#2FE0C8]/50 rounded-lg text-xs resize-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WHATSAPP LINK TAB */}
            {tab === 'whatsapp' && (
              <div className="p-8 pb-20 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E] flex-shrink-0">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">WhatsApp Remote Link</h3>
                    <p className="text-xs text-[#777] mt-1 leading-relaxed max-w-sm">Apne WhatsApp ko link karein aur "Message Yourself" chat se DIGI Business OS ko remotely command bhejein. Reply wapas WhatsApp par aayega.</p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#22C55E]/30 bg-[#0A140F] overflow-hidden mt-6">
                  {/* Accordion Header */}
                  <div className="p-3 bg-[#0D1C14] border-b border-[#22C55E]/20 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                        <Smartphone size={12} className="text-[#22C55E]" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">WhatsApp</div>
                        <div className="text-[10px] text-[#22C55E]">Linked</div>
                      </div>
                    </div>
                    <div className="text-[#22C55E] mr-2">^</div>
                  </div>
                  
                  {/* Accordion Body */}
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                      <span className="text-sm font-semibold text-[#22C55E]">WhatsApp Linked</span>
                    </div>
                    <p className="text-[11px] text-[#666] mb-6">Send messages to yourself to control DIGI remotely</p>
                    
                    <Button variant="outline" className="w-full max-w-xs border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/5 hover:bg-[#EF4444]/10 hover:text-[#EF4444] rounded-lg h-9 text-xs">
                      Disconnect
                    </Button>
                    
                    <div className="w-full max-w-xs flex justify-between items-center mt-6 pt-4 border-t border-[#1A2E20]">
                      <span className="text-xs text-[#777]">Auto-connect on startup</span>
                      <Switch checked={waAutoConnect} onCheckedChange={setWaAutoConnect} className="data-[state=checked]:bg-[#22C55E] scale-90" />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                    <RefreshCcw size={14} className="text-[#888]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#888] tracking-wider mb-1">ROUTING</div>
                    <p className="text-[11px] text-[#666] leading-relaxed">
                      WhatsApp message uss runtime ko jata hai jo chat panel ke VOICE/CHAT toggle par select ho -- VOICE = Gemini Live, CHAT = Hermes agent.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Fallback for unused tabs */}
            {!['voice', 'agent', 'system', 'user', 'whatsapp'].includes(tab) && (
              <div className="p-8 flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                <Settings2 size={32} className="text-[#555]" />
                <h3 className="text-white font-medium">This section is currently under construction.</h3>
                <p className="text-sm text-[#777]">Switch back to a valid tab to manage settings.</p>
              </div>
            )}
            
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-[#0A0A0A] border-t border-[#1A1A1A] p-4 flex items-center justify-between z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="text-xs text-[#555] font-mono">Version: 1.0.36</span>
          </div>
          
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[#888] hover:text-white hover:bg-[#1A1A1A] rounded-lg px-6 h-9 text-xs">
              Cancel
            </Button>
            <Button className="bg-white hover:bg-gray-200 text-black font-semibold rounded-lg px-6 h-9 text-xs transition-colors" onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const CloudArrowUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2FE0C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m8 16 4-4 4 4" />
  </svg>
);
