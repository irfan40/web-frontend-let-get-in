'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';
import { StorageProviderFactory } from '../../../features/resume/storage/factory';
import { IResume } from '../../../features/resume/types';
import { ResumeCard } from '../../../features/dashboard/components/ResumeCard';
import { CreateResumeModal } from '../../../features/dashboard/components/CreateResumeModal';
import { Plus, Search, FileText, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const [resumes, setResumes] = useState<IResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchResumes = async () => {
      setIsLoading(true);
      try {
        const provider = StorageProviderFactory.getProvider(isAuthenticated);
        const list = await provider.list();
        if (isMounted) {
          setResumes(Array.isArray(list) ? list : []);
        }
      } catch (err: unknown) {
        const errorMsg = (err as { message?: string })?.message || String(err);
        console.warn('Failed to fetch resumes:', errorMsg);
        if (isMounted) {
          setResumes([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchResumes();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    try {
      const provider = StorageProviderFactory.getProvider(isAuthenticated);
      await provider.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string })?.message || String(err);
      console.error('Failed to delete resume:', errorMsg);
    }
  };

  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-dark rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-elegant relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--primary-glow)_0%,_transparent_70%)] pointer-events-none" />
          <div className="relative space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-glow bg-primary/10 px-3 py-1 rounded-full w-fit border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" /> Intelligent Career Assistant
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Welcome back to <span className="text-gradient-brand">LetGetIn AI</span>
            </h1>
            <p className="text-sm text-ink-soft max-w-xl leading-relaxed">
              Build verified, ATS-optimized, high-converting professional profiles and resumes in minutes.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-brand text-primary-foreground text-xs font-semibold px-6 py-3.5 rounded-xl shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 shrink-0"
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
              className="input-base pl-10"
            />
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-3.5" />
          </div>
          <div className="text-xs text-ink-soft font-medium">
            Showing {filteredResumes.length} resume{filteredResumes.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Resumes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-surface/50 border border-border rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="text-center py-20 bg-surface/40 border border-dashed border-border rounded-3xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-primary-foreground mx-auto shadow-glow">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-ink">No Resumes Found</h3>
            <p className="text-xs text-ink-soft max-w-sm mx-auto leading-relaxed">
              You haven&apos;t created any resumes yet or no resumes match your search query.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-brand text-primary-foreground text-xs font-semibold px-6 py-3 rounded-xl shadow-elegant hover:shadow-glow transition-all inline-flex items-center gap-2"
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
