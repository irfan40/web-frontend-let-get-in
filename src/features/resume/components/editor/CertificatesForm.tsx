import React from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { Award, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { ICertificate } from '../../types';

export const CertificatesForm: React.FC = () => {
  const { resume, addCertificate, updateCertificate, removeCertificate, reorderCertificates } = useResumeStore();
  const certificates = resume.content.certificates || [];

  const handleAdd = () => {
    const newCert: ICertificate = {
      id: `cert-${Date.now()}`,
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: '2023-04',
      credentialUrl: '',
    };
    addCertificate(newCert);
  };

  const moveCert = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= certificates.length) return;
    const items = [...certificates];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    if (reorderCertificates) reorderCertificates(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Certifications & Licenses</h3>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Certificate</span>
        </button>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
          No certifications added yet. Click &quot;Add Certificate&quot; to add your credentials.
        </div>
      ) : (
        certificates.map((cert, idx) => (
          <div key={cert.id} className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/50">
                  #{idx + 1}
                </span>
                <span className="text-xs font-semibold text-white">{cert.name || 'Certificate'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveCert(idx, 'up')}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                  title="Move Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === certificates.length - 1}
                  onClick={() => moveCert(idx, 'down')}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                  title="Move Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeCertificate(cert.id)}
                  className="p-1 text-rose-400 hover:text-rose-300 ml-2"
                  title="Delete Certificate"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Certificate / License Name</label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertificate(cert.id, { name: e.target.value })}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Issuer / Organization</label>
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => updateCertificate(cert.id, { issuer: e.target.value })}
                  placeholder="e.g. Amazon Web Services"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Issue Date</label>
                <input
                  type="text"
                  value={cert.issueDate || ''}
                  onChange={(e) => updateCertificate(cert.id, { issueDate: e.target.value })}
                  placeholder="YYYY-MM"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Credential URL / Verification Link</label>
                <input
                  type="text"
                  value={cert.credentialUrl || ''}
                  onChange={(e) => updateCertificate(cert.id, { credentialUrl: e.target.value })}
                  placeholder="https://example.com/verify/123"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
