import React from 'react';

export function Stats() {
  const stats = [
    { label: 'Active Professionals', value: '120,000+' },
    { label: 'Reduced Time-to-Hire', value: '60%' },
    { label: 'Average Time to Hire', value: '11 Days' },
    { label: 'ATS Match Accuracy', value: '99.4%' },
  ];

  return (
    <section className="py-12 border-y border-white/5 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-5xl font-black text-white tracking-tight">
                <span className="bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  {s.value}
                </span>
              </div>
              <div className="text-xs md:text-sm font-medium text-slate-400 mt-2">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
