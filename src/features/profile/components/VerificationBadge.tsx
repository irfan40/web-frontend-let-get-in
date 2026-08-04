import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { VerificationStatus } from '../services/verificationService';

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
}) => {
  const getBadgeDetails = () => {
    switch (status) {
      case 'verified':
        return {
          label: 'Verified',
          icon: CheckCircle2,
          color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
        };
      case 'pending':
        return {
          label: 'Pending Review',
          icon: Clock,
          color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
        };
      case 'rejected':
        return {
          label: 'Rejected',
          icon: XCircle,
          color: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400',
        };
      case 'unsubmitted':
      default:
        return {
          label: 'Not Submitted',
          icon: AlertCircle,
          color: 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400',
        };
    }
  };

  const { label, icon: Icon, color } = getBadgeDetails();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-xs font-bold gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${color} ${sizeClasses}`}
    >
      <Icon className={`${iconSizes} shrink-0`} />
      {showLabel && <span>{label}</span>}
    </span>
  );
};
