'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';
import { StorageProviderFactory } from '../../../features/resume/storage/factory';
import { IResume } from '../../../features/resume/types';
import { DashboardHeader } from '../../../features/dashboard/components/DashboardHeader';
import { ResumeCard } from '../../../features/dashboard/components/ResumeCard';
import { CreateResumeModal } from '../../../features/dashboard/components/CreateResumeModal';
import { Plus, Search, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [resumes, setResumes] = useState<IResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const fetchResumes = async () => {
      setIsLoading(true);
      try {
        const provider = StorageProviderFactory.getProvider(isAuthenticated);
        const list = await provider.list();
        setResumes(list);
      } catch (err) {
        console.error('Failed to fetch resumes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    try {
      const provider = StorageProviderFactory.getProvider(isAuthenticated);
      await provider.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <DashboardHeader onCreateNew={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">Welcome back to ResumeBuild AI</h1>
            <p className="text-xs text-slate-300">
              Create ATS-optimized, high-converting professional resumes in minutes.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Resume</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resumes by title..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Showing {filteredResumes.length} resume{filteredResumes.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Resumes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Resumes Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven&apos;t created any resumes yet or no resumes match your search.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Your First Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredResumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      <CreateResumeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
