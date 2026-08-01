import { IResumeContent } from '../types';

export class ResumeNormalizationService {
  static normalize(resume: IResumeContent): IResumeContent {
    return {
      personalInfo: {
        fullName: this.capitalizeTitle(this.cleanWhitespace(resume.personalInfo.fullName)),
        headline: this.capitalizeTitle(this.cleanWhitespace(resume.personalInfo.headline)),
        email: this.normalizeEmail(resume.personalInfo.email),
        phone: this.normalizePhone(resume.personalInfo.phone),
        location: this.capitalizeTitle(this.cleanWhitespace(resume.personalInfo.location)),
        websiteUrl: this.normalizeUrl(resume.personalInfo.websiteUrl),
      },
      summary: this.cleanWhitespace(resume.summary),
      experiences: resume.experiences.map((exp, i) => ({
        ...exp,
        id: exp.id || `exp-${i + 1}`,
        company: this.capitalizeTitle(this.cleanWhitespace(exp.company)),
        position: this.capitalizeTitle(this.cleanWhitespace(exp.position)),
        location: this.capitalizeTitle(this.cleanWhitespace(exp.location)),
        startDate: this.normalizeDate(exp.startDate),
        endDate: this.normalizeDate(exp.endDate),
        highlights: exp.highlights.map((h) => this.cleanWhitespace(h)).filter(Boolean),
      })),
      educations: resume.educations.map((edu, i) => ({
        ...edu,
        id: edu.id || `edu-${i + 1}`,
        institution: this.capitalizeTitle(this.cleanWhitespace(edu.institution)),
        degree: this.capitalizeTitle(this.cleanWhitespace(edu.degree)),
        fieldOfStudy: this.capitalizeTitle(this.cleanWhitespace(edu.fieldOfStudy)),
        startDate: this.normalizeDate(edu.startDate),
        endDate: this.normalizeDate(edu.endDate),
      })),
      projects: resume.projects.map((proj, i) => ({
        ...proj,
        id: proj.id || `proj-${i + 1}`,
        title: this.capitalizeTitle(this.cleanWhitespace(proj.title)),
        subtitle: this.cleanWhitespace(proj.subtitle),
        link: this.normalizeUrl(proj.link),
        startDate: this.normalizeDate(proj.startDate),
        endDate: this.normalizeDate(proj.endDate),
        description: this.cleanWhitespace(proj.description),
        highlights: (proj.highlights || []).map((h) => this.cleanWhitespace(h)).filter(Boolean),
        technologies: (proj.technologies || []).map((t) => this.cleanWhitespace(t)).filter(Boolean),
      })),
      skills: this.normalizeSkills(resume.skills),
      certificates: resume.certificates.map((cert, i) => ({
        ...cert,
        id: cert.id || `cert-${i + 1}`,
        name: this.capitalizeTitle(this.cleanWhitespace(cert.name)),
        issuer: this.capitalizeTitle(this.cleanWhitespace(cert.issuer)),
        issueDate: this.normalizeDate(cert.issueDate),
      })),
      languages: resume.languages.map((lang, i) => ({
        ...lang,
        id: lang.id || `lang-${i + 1}`,
        language: this.capitalizeTitle(this.cleanWhitespace(lang.language)),
        proficiency: (this.capitalizeTitle(this.cleanWhitespace(lang.proficiency)) as any) || 'Native',
      })),
      references: [],
      socialLinks: [],
    };
  }

  static cleanWhitespace(str: any): string {
    if (!str) return '';
    if (typeof str !== 'string') {
      if (typeof str === 'object' && str !== null) {
        if ('currentSummary' in str && typeof str.currentSummary === 'string') return this.cleanWhitespace(str.currentSummary);
        if ('summary' in str && typeof str.summary === 'string') return this.cleanWhitespace(str.summary);
        if ('text' in str && typeof str.text === 'string') return this.cleanWhitespace(str.text);
      }
      return String(str || '').trim();
    }
    return str.replace(/\s+/g, ' ').trim();
  }

  static normalizeEmail(email: string | undefined | null): string {
    if (!email) return '';
    const cleaned = email.trim().toLowerCase();
    const match = cleaned.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/);
    return match ? match[0] : cleaned;
  }

  static normalizePhone(phone: string | undefined | null): string {
    if (!phone) return '';
    return phone.replace(/[^\d+()\s-]/g, '').trim();
  }

  static normalizeUrl(url: string | undefined | null): string {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  static normalizeDate(dateStr: string | undefined | null): string {
    if (!dateStr) return '';
    const cleaned = dateStr.trim();
    if (/present|current|now|today/i.test(cleaned)) return 'Present';
    const match = cleaned.match(/\b(19|20)\d{2}(?:[-/](0[1-9]|1[0-2]))?\b/);
    return match ? match[0] : cleaned;
  }

  static capitalizeTitle(str: string): string {
    if (!str) return '';
    const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v\.?|via)$/i;
    return str
      .split(' ')
      .map((word, index) => {
        if (index > 0 && smallWords.test(word)) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  static normalizeSkills(skills: Array<{ id?: string; name: string; category?: string; level: number }>) {
    const knownTechMap: Record<string, string> = {
      typescript: 'TypeScript',
      javascript: 'JavaScript',
      react: 'React.js',
      reactjs: 'React.js',
      nextjs: 'Next.js',
      nodejs: 'Node.js',
      expressjs: 'Express.js',
      python: 'Python',
      mongodb: 'MongoDB',
      postgresql: 'PostgreSQL',
      docker: 'Docker',
      kubernetes: 'Kubernetes',
      aws: 'AWS',
      graphql: 'GraphQL',
      tailwindcss: 'Tailwind CSS',
    };

    const uniqueMap = new Map<string, { id: string; name: string; category: string; level: number }>();

    skills.forEach((sk, i) => {
      const rawName = this.cleanWhitespace(sk.name);
      if (!rawName) return;

      const lowerKey = rawName.toLowerCase();
      const normalizedName = knownTechMap[lowerKey] || this.capitalizeTitle(rawName);

      if (!uniqueMap.has(normalizedName)) {
        uniqueMap.set(normalizedName, {
          id: sk.id || `skill-${i + 1}`,
          name: normalizedName,
          category: this.capitalizeTitle(this.cleanWhitespace(sk.category || 'Technical')),
          level: Math.min(5, Math.max(1, sk.level || 4)),
        });
      }
    });

    return Array.from(uniqueMap.values());
  }
}
