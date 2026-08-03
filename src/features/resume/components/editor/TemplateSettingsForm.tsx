import React from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { Settings, Palette, Type, AlignLeft } from 'lucide-react';

export const TemplateSettingsForm: React.FC = () => {
  const { resume, updateSettings } = useResumeStore();
  const settings = resume.settings;

  const colorPresets = [
    { name: 'Slate Dark', hex: '#0f172a' },
    { name: 'Indigo Night', hex: '#4f46e5' },
    { name: 'Emerald Forest', hex: '#059669' },
    { name: 'Crimson Rose', hex: '#e11d48' },
    { name: 'Royal Sapphire', hex: '#2563eb' },
  ];

  return (
    <div className="space-y-5 bg-surface p-5 rounded-2xl border border-border shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary-glow" />
          Template Styling & Design Tokens
        </h3>
      </div>

      {/* Primary Color Accent */}
      <div>
        <label className="block text-xs font-semibold text-ink-soft mb-2 flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-primary-glow" />
          Primary Theme Color
        </label>
        <div className="flex items-center gap-3">
          {colorPresets.map((c) => (
            <button
              key={c.hex}
              onClick={() => updateSettings({ primaryColor: c.hex })}
              style={{ backgroundColor: c.hex }}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                settings.primaryColor === c.hex ? 'border-primary-glow scale-110 shadow-md' : 'border-transparent opacity-80'
              }`}
              title={c.name}
            />
          ))}
          <input
            type="color"
            value={settings.primaryColor}
            onChange={(e) => updateSettings({ primaryColor: e.target.value })}
            className="w-8 h-8 rounded-xl bg-transparent cursor-pointer border border-border"
          />
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-xs font-semibold text-ink-soft mb-2 flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-primary-glow" />
          Typography Font Family
        </label>
        <select
          value={settings.fontFamily}
          onChange={(e) => updateSettings({ fontFamily: e.target.value })}
          className="input-base text-xs"
        >
          <option value="Inter">Inter (Modern Clean)</option>
          <option value="Roboto">Roboto (Technical Standard)</option>
          <option value="Georgia">Georgia (Classic Serif)</option>
          <option value="Outfit">Outfit (Contemporary)</option>
        </select>
      </div>

      {/* Font Size & Line Spacing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-2">Font Size</label>
          <select
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: e.target.value as 'sm' | 'md' | 'lg' })}
            className="input-base text-xs"
          >
            <option value="sm">Compact (Small)</option>
            <option value="md">Normal (Medium)</option>
            <option value="lg">Large (Spacious)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-2 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-primary-glow" />
            Line Spacing
          </label>
          <select
            value={settings.lineSpacing}
            onChange={(e) => updateSettings({ lineSpacing: e.target.value as 'compact' | 'normal' | 'relaxed' })}
            className="input-base text-xs"
          >
            <option value="compact">Tight</option>
            <option value="normal">Normal</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </div>
      </div>
    </div>
  );
};
