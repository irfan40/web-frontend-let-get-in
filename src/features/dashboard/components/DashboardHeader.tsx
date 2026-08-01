import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { Plus, LogOut, FileText, User } from 'lucide-react';

interface DashboardHeaderProps {
  onCreateNew: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onCreateNew }) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-indigo-400">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-lg">
            RB
          </span>
          <span>ResumeBuild</span>
        </Link>
        <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
          Pro Account
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Resume</span>
        </button>

        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">{user?.fullName || 'User Account'}</div>
            <div className="text-[10px] text-slate-400">{user?.email || 'user@example.com'}</div>
          </div>
          <button
            onClick={() => logout()}
            className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
