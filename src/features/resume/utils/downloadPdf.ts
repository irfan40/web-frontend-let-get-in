import { useResumeStore } from '../store/useResumeStore';

export const triggerPdfDownload = () => {
  if (typeof window === 'undefined') return;

  const state = useResumeStore.getState();
  const name = state.resume?.content?.personalInfo?.fullName || 'Resume';
  const cleanName = name.trim().replace(/\s+/g, '_') || 'Resume';

  const resumeElement = document.querySelector('.resume-paper') as HTMLElement;

  if (!resumeElement) {
    const originalTitle = document.title;
    document.title = `${cleanName}_Resume`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
    return;
  }

  // Create or reuse isolated hidden iframe for 100% clean PDF print export of ONLY the resume
  let printFrame = document.getElementById('resume-pdf-print-iframe') as HTMLIFrameElement;
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'resume-pdf-print-iframe';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.visibility = 'hidden';
    document.body.appendChild(printFrame);
  }

  const doc = printFrame.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Collect all active stylesheets and link tags from main app
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((s) => s.outerHTML)
    .join('\n');

  // Strip inline scale transforms from cloned resume paper
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = resumeElement.outerHTML;
  const clonedPaper = tempDiv.querySelector('.resume-paper') as HTMLElement;
  if (clonedPaper) {
    clonedPaper.style.transform = 'none';
    clonedPaper.style.boxShadow = 'none';
    clonedPaper.style.margin = '0';
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>${cleanName}_Resume</title>
        <meta charset="utf-8">
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .resume-paper {
            transform: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        ${tempDiv.innerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Wait 300ms for web fonts & styles to resolve before opening print dialog
  setTimeout(() => {
    printFrame.contentWindow?.focus();
    printFrame.contentWindow?.print();
  }, 300);
};
