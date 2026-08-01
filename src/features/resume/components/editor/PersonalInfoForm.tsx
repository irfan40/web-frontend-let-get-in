import React from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { User, Mail, Phone, MapPin, Globe, Briefcase } from 'lucide-react';

export const PersonalInfoForm: React.FC = () => {
  const { resume, updatePersonalInfo } = useResumeStore();
  const info = resume.content.personalInfo;

  return (
    <div className="space-y-4 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          Personal Details
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
          <div className="relative">
            <input
              type="text"
              value={info.fullName || ''}
              onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Headline</label>
          <div className="relative">
            <input
              type="text"
              value={info.headline || ''}
              onChange={(e) => updatePersonalInfo({ headline: e.target.value })}
              placeholder="e.g. Senior Full Stack Engineer"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
          <div className="relative">
            <input
              type="email"
              value={info.email || ''}
              onChange={(e) => updatePersonalInfo({ email: e.target.value })}
              placeholder="alex@example.com"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
          <div className="relative">
            <input
              type="text"
              value={info.phone || ''}
              onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
          <div className="relative">
            <input
              type="text"
              value={info.location || ''}
              onChange={(e) => updatePersonalInfo({ location: e.target.value })}
              placeholder="San Francisco, CA"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Portfolio / Website URL</label>
          <div className="relative">
            <input
              type="url"
              value={info.websiteUrl || ''}
              onChange={(e) => updatePersonalInfo({ websiteUrl: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
