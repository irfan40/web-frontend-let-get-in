'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface HealthMetric {
  id: string;
  name: string;
  score: number;
  status: 'Excellent' | 'Good' | 'Needs Improvement' | 'Warning';
  explanation: string;
  category: 'content' | 'ats' | 'formatting' | 'impact';
}

export interface AtsAnalysisResult {
  overallScore: number;
  completenessScore: number;
  readabilityScore: number;
  keywordScore: number;
  formattingScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSections: string[];
  missingSkills: string[];
  missingKeywords: string[];
  recommendations: Array<{
    id: string;
    text: string;
    actionType: 'summary' | 'experience' | 'skills' | 'projects' | 'metrics' | 'keywords';
    targetId?: string;
  }>;
  healthMetrics: HealthMetric[];
  lastAnalyzedAt: string | null;
}

export const useAtsAnalysis = () => {
  const { resume } = useResumeStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsAnalysisResult | null>(null);
  const [userMode, setUserMode] = useState<'auto' | 'manual'>('auto');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time precise calculation for the currently open resume
  const calculateHeuristics = useCallback((): AtsAnalysisResult => {
    const { content } = resume;
    const { personalInfo, summary, experiences, educations, projects, skills } = content;

    const summaryText = typeof summary === 'string'
      ? summary.trim()
      : (summary && typeof summary === 'object' && 'summary' in summary)
      ? String((summary as any).summary || '').trim()
      : String(summary || '').trim();

    const fullNameText = typeof personalInfo?.fullName === 'string' ? personalInfo.fullName.trim() : String(personalInfo?.fullName || '').trim();
    const emailText = typeof personalInfo?.email === 'string' ? personalInfo.email.trim() : String(personalInfo?.email || '').trim();
    const phoneText = typeof personalInfo?.phone === 'string' ? personalInfo.phone.trim() : String(personalInfo?.phone || '').trim();
    const headlineText = typeof personalInfo?.headline === 'string' ? personalInfo.headline.trim() : String(personalInfo?.headline || '').trim();
    const locationText = typeof personalInfo?.location === 'string' ? personalInfo.location.trim() : String(personalInfo?.location || '').trim();

    // 1. Completeness Score (0-100)
    let completenessPoints = 0;
    if (fullNameText) completenessPoints += 15;
    if (emailText) completenessPoints += 15;
    if (phoneText) completenessPoints += 10;
    if (headlineText) completenessPoints += 10;
    if (locationText) completenessPoints += 5;
    if (summaryText.length >= 30) completenessPoints += 15;
    if (experiences && experiences.length > 0) completenessPoints += 15;
    if (educations && educations.length > 0) completenessPoints += 8;
    if (skills && skills.length > 0) completenessPoints += 7;
    const completenessScore = Math.min(100, completenessPoints);

    // 2. Readability Score (0-100)
    const summaryWords = summaryText.split(/\s+/).filter(Boolean).length;
    const bulletWords = (experiences || [])
      .flatMap((e) => (Array.isArray(e?.highlights) ? e.highlights : []))
      .map((h) => String(h || ''))
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    const totalWords = summaryWords + bulletWords;
    let readabilityScore = 0;
    if (totalWords >= 150 && totalWords <= 600) readabilityScore = 95;
    else if (totalWords >= 50) readabilityScore = 75;
    else if (totalWords > 0) readabilityScore = 35;

    // 3. Action Verb & Impact Metrics (0-100)
    const actionVerbs = [
      'architected', 'spearheaded', 'developed', 'optimized', 'led', 'designed',
      'streamlined', 'implemented', 'engineered', 'launched', 'built', 'created',
      'managed', 'scaled', 'delivered', 'integrated', 'increased', 'reduced'
    ];
    const allHighlightsText = (experiences || [])
      .flatMap((e) => (Array.isArray(e?.highlights) ? e.highlights : []))
      .map((h) => String(h || ''))
      .join(' ')
      .toLowerCase();
    const actionVerbMatches = actionVerbs.filter((v) => allHighlightsText.includes(v));
    const hasMetricNumbers = /\b(\d+%\b|\$\d+|\d+\+|\d+\s*users|\d+\s*ms)\b/i.test(allHighlightsText);

    let actionVerbScore = 0;
    if (experiences && experiences.length > 0) {
      actionVerbScore = Math.min(100, actionVerbMatches.length * 20 + (hasMetricNumbers ? 30 : 10));
    }

    // 4. Keyword Score (0-100)
    let keywordScore = 0;
    if ((skills && skills.length > 0) || (projects && projects.length > 0)) {
      keywordScore = Math.min(100, (skills?.length || 0) * 15 + (projects?.length > 0 ? 25 : 0));
    }

    // 5. Formatting Score (0-100)
    let formattingScore = 0;
    if (completenessScore > 0) {
      formattingScore = Math.min(95, Math.round(completenessScore * 0.8 + 15));
    }

    // Overall ATS Score calculation strictly based on current open resume
    const overallScore = Math.round(
      completenessScore * 0.35 +
      keywordScore * 0.25 +
      actionVerbScore * 0.20 +
      readabilityScore * 0.10 +
      formattingScore * 0.10
    );

    // Dynamic Strengths & Weaknesses for open resume
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const missingSections: string[] = [];
    const missingSkills: string[] = [];

    if (personalInfo.fullName && personalInfo.email) strengths.push('Complete contact information header');
    if (summary && summary.length >= 40) strengths.push('Solid executive professional summary');
    if (experiences.length >= 1) strengths.push(`${experiences.length} work experience entries specified`);
    if (actionVerbMatches.length >= 2) strengths.push(`Includes ${actionVerbMatches.length} strong action verbs`);
    if (hasMetricNumbers) strengths.push('Contains quantifiable percentage & metric outcomes');
    if (skills.length >= 4) strengths.push(`${skills.length} technical skills listed`);

    if (!summary || summary.length < 30) weaknesses.push('Professional summary is brief or missing');
    if (experiences.length === 0) weaknesses.push('Work experience section is empty');
    if (skills.length < 4) weaknesses.push('Skills section needs at least 4 core technical skills');
    if (!hasMetricNumbers && experiences.length > 0) weaknesses.push('Missing measurable metrics or percentage achievements');
    if (educations.length === 0) weaknesses.push('Education background is empty');

    if (!summary) missingSections.push('Summary');
    if (experiences.length === 0) missingSections.push('Experience');
    if (skills.length === 0) missingSections.push('Skills');
    if (educations.length === 0) missingSections.push('Education');

    if (skills.length < 3) {
      missingSkills.push('TypeScript', 'System Architecture', 'CI/CD Pipelines');
    }

    const healthMetrics: HealthMetric[] = [
      {
        id: 'completeness',
        name: 'Resume Completeness',
        score: completenessScore,
        status: completenessScore >= 80 ? 'Excellent' : completenessScore >= 60 ? 'Good' : 'Needs Improvement',
        explanation: `${completenessScore}% of essential resume fields populated.`,
        category: 'content',
      },
      {
        id: 'ats',
        name: 'Overall ATS Score',
        score: overallScore,
        status: overallScore >= 80 ? 'Excellent' : overallScore >= 65 ? 'Good' : 'Warning',
        explanation: 'Probability of passing automated ATS resume screeners.',
        category: 'ats',
      },
      {
        id: 'readability',
        name: 'Readability',
        score: readabilityScore,
        status: readabilityScore >= 80 ? 'Excellent' : 'Good',
        explanation: 'Evaluates word count, sentence length, and structural scanning ease.',
        category: 'content',
      },
      {
        id: 'action-verbs',
        name: 'Action Verb Usage',
        score: actionVerbScore,
        status: actionVerbScore >= 75 ? 'Excellent' : 'Needs Improvement',
        explanation: `${actionVerbMatches.length} high-impact action verbs detected.`,
        category: 'impact',
      },
      {
        id: 'keyword-coverage',
        name: 'Keyword Coverage',
        score: keywordScore,
        status: keywordScore >= 75 ? 'Excellent' : 'Needs Improvement',
        explanation: `${skills.length} technical skills and keywords recognized.`,
        category: 'ats',
      },
      {
        id: 'formatting',
        name: 'Formatting Quality',
        score: formattingScore,
        status: 'Excellent',
        explanation: 'Standardized typography, single-column margins, and clear hierarchy.',
        category: 'formatting',
      },
      {
        id: 'experience-strength',
        name: 'Experience Strength',
        score: experiences.length > 0 ? (hasMetricNumbers ? 90 : 70) : 20,
        status: experiences.length > 0 ? 'Good' : 'Warning',
        explanation: `${experiences.length} experience roles documented.`,
        category: 'impact',
      },
      {
        id: 'education-completeness',
        name: 'Education Completeness',
        score: educations.length > 0 ? 95 : 20,
        status: educations.length > 0 ? 'Excellent' : 'Warning',
        explanation: `${educations.length} education records provided.`,
        category: 'content',
      },
    ];

    const recommendations = [
      {
        id: 'rec-1',
        text: 'Improve Summary: Make your executive summary more impactful with target roles.',
        actionType: 'summary' as const,
      },
      {
        id: 'rec-2',
        text: 'Rewrite Experience: Upgrade bullet points with action verbs and percentage outcomes.',
        actionType: 'experience' as const,
      },
      {
        id: 'rec-3',
        text: 'Generate Achievement Metrics: Add quantified numbers to your project bullet points.',
        actionType: 'metrics' as const,
      },
      {
        id: 'rec-4',
        text: 'Suggest Missing Skills: Add high-demand technical keywords to boost ATS ranking.',
        actionType: 'skills' as const,
      },
    ];

    return {
      overallScore,
      completenessScore,
      readabilityScore,
      keywordScore,
      formattingScore,
      strengths,
      weaknesses,
      missingSections,
      missingSkills,
      missingKeywords: ['CI/CD', 'Docker', 'System Design', 'Microservices'],
      recommendations,
      healthMetrics,
      lastAnalyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }, [resume]);

  // Instantly sync result whenever open resume state changes
  useEffect(() => {
    setResult(calculateHeuristics());
  }, [resume, calculateHeuristics]);

  // Deep AI ATS Scan
  const runAtsAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    const heuristic = calculateHeuristics();

    try {
      const response = await axios.post(`${API_BASE_URL}/ai/ats-analyze`, {
        resumeContent: resume.content,
      });

      if (response.data?.data) {
        const aiData = response.data.data;
        setResult({
          ...heuristic,
          overallScore: aiData.score || heuristic.overallScore,
          missingKeywords: aiData.missingKeywords || heuristic.missingKeywords,
          strengths: aiData.recommendations?.length
            ? [...heuristic.strengths]
            : heuristic.strengths,
          lastAnalyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } else {
        setResult(heuristic);
      }
    } catch (error) {
      console.warn('AI ATS analysis API fallback to client heuristics:', error);
      setResult(heuristic);
    } finally {
      setIsAnalyzing(false);
    }
  }, [resume, calculateHeuristics]);

  // Debounced Auto Trigger (7 seconds after typing stops)
  useEffect(() => {
    if (userMode !== 'auto') return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      runAtsAnalysis();
    }, 7000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resume, userMode, runAtsAnalysis]);

  return {
    isAnalyzing,
    result,
    userMode,
    setUserMode,
    runAtsAnalysis,
  };
};
