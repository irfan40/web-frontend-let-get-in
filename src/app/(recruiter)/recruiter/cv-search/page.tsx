"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search, Zap, User } from "lucide-react";
import { recruiterService } from "@/features/recruiter/services/recruiterService";
import { CreditPack, SourcedCandidate } from "@/features/recruiter/types";
import { BuyCreditsModal } from "@/features/recruiter/components/BuyCreditsModal";
import { ContactModal } from "@/features/recruiter/components/ContactModal";
import { CandidateProfileModal } from "@/features/recruiter/components/CandidateProfileModal";

export default function CvSearchPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId") || undefined;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SourcedCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [balance, setBalance] = useState(0);
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState<SourcedCandidate | null>(null);
  const [profileCandidate, setProfileCandidate] = useState<SourcedCandidate | null>(null);

  useEffect(() => {
    recruiterService.getCredits().then(({ balance, packs }) => {
      setBalance(balance);
      setPacks(packs);
    });
  }, []);

  const runSearch = async () => {
    if (!jobId && !query.trim()) {
      setError("Enter a search query or open this page from a job to source candidates.");
      return;
    }
    setError(null);
    setLoading(true);
    setSearched(true);
    try {
      const data = await recruiterService.searchCandidates({ jobId, query: query.trim() || undefined });
      setResults(data);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      runSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleRevealed = (candidateUserId: string, email?: string, phone?: string, newBalance?: number) => {
    setResults((prev) =>
      prev.map((c) => (c.candidateUserId === candidateUserId ? { ...c, email, phone, contactRevealed: true } : c))
    );
    if (newBalance !== undefined) setBalance(newBalance);
    setActiveCandidate(null);
    if (profileCandidate?.candidateUserId === candidateUserId) {
      setProfileCandidate((prev) => (prev ? { ...prev, email, phone, contactRevealed: true } : null));
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">CV Search</h1>
          <p className="text-ink-soft mt-1 text-sm">Source candidates by skill or match them to a job.</p>
        </div>
        <button
          type="button"
          onClick={() => setBuyModalOpen(true)}
          className="inline-flex items-center gap-2 text-xs font-semibold bg-surface-alt border border-border text-ink px-4 py-2.5 rounded-xl hover:bg-surface transition"
        >
          <Zap className="w-4 h-4 text-primary-glow" />
          {balance} credits
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="e.g. React developer with 3+ years experience"
            className="input-base pl-10"
          />
        </div>
        <button
          type="button"
          onClick={runSearch}
          disabled={loading}
          className="bg-gradient-brand text-primary-foreground font-semibold px-6 py-3 rounded-xl shadow-elegant hover:shadow-glow transition disabled:opacity-70"
        >
          Search
        </button>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center text-ink-soft">
          <Loader2 className="w-6 h-6 animate-spin text-primary-glow" />
        </div>
      ) : searched && results.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center text-ink-soft text-sm">
          No matching candidates found.
        </div>
      ) : (
        <div className="space-y-2.5">
          {results.map((c, index) => (
            <div
              key={c.candidateUserId || `candidate-${index}`}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-surface hover:shadow-elegant transition flex-wrap"
            >
              <div
                onClick={() => setProfileCandidate(c)}
                className="min-w-0 cursor-pointer group flex-1"
              >
                <div className="text-sm font-bold text-ink group-hover:text-primary transition flex items-center gap-2">
                  <span>{c.name}</span>
                </div>
                {c.headline && <div className="text-xs text-ink-soft mt-0.5">{c.headline}</div>}
                {c.skills && c.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {c.skills.slice(0, 6).map((s, sIdx) => (
                      <span
                        key={`${s}-${sIdx}`}
                        className="text-[10px] font-semibold text-primary-glow bg-primary/10 px-1.5 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-1 rounded-full">
                  {c.matchScore}% match
                </span>
                <button
                  type="button"
                  onClick={() => setActiveCandidate(c)}
                  className="text-xs font-semibold text-ink bg-surface-alt border border-border px-3 py-2 rounded-xl hover:bg-surface transition"
                >
                  {c.contactRevealed ? "View Contact" : "Reveal Contact"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BuyCreditsModal
        open={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        packs={packs}
        onPurchased={setBalance}
      />

      {activeCandidate && (
        <ContactModal
          candidate={activeCandidate}
          onClose={() => setActiveCandidate(null)}
          onRevealed={handleRevealed}
          onInsufficientCredits={() => {
            setActiveCandidate(null);
            setBuyModalOpen(true);
          }}
        />
      )}

      {profileCandidate && (
        <CandidateProfileModal
          isOpen={!!profileCandidate}
          candidate={{
            _id: profileCandidate.candidateUserId,
            fullName: profileCandidate.name,
            headline: profileCandidate.headline,
            location: profileCandidate.location,
            skills: profileCandidate.skills,
            matchScore: profileCandidate.matchScore,
            email: profileCandidate.contactRevealed ? profileCandidate.email : undefined,
            phone: profileCandidate.contactRevealed ? profileCandidate.phone : undefined,
          }}
          onClose={() => setProfileCandidate(null)}
        />
      )}
    </div>
  );
}
