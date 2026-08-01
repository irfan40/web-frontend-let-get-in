import { useResumeStore } from '../store/useResumeStore';

export const triggerPdfDownload = () => {
  if (typeof window !== 'undefined') {
    const state = useResumeStore.getState();
    const name = state.resume?.content?.personalInfo?.fullName || 'Resume';
    const cleanName = name.trim().replace(/\s+/g, '_') || 'Resume';
    const originalTitle = document.title;
    document.title = `${cleanName}_Resume`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  }
};
