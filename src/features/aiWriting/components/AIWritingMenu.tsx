import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wand2 } from 'lucide-react';
import { AIWritingAction, AIWritingContext } from '../types';
import { ACTION_LABELS, CONTEXT_ACTIONS } from '../config/writingContexts';
import { AIWritingButton } from './AIWritingButton';

interface AIWritingMenuProps {
  context: AIWritingContext;
  hasSelection: boolean;
  disabled?: boolean;
  triggerLabel?: string;
  iconOnly?: boolean;
  triggerTitle?: string;
  onSelectAction: (action: AIWritingAction) => void;
}

export const AIWritingMenu: React.FC<AIWritingMenuProps> = ({
  context,
  hasSelection,
  disabled,
  triggerLabel,
  iconOnly,
  triggerTitle,
  onSelectAction,
}) => {
  const [open, setOpen] = React.useState(false);
  const actions = CONTEXT_ACTIONS[context] || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <AIWritingButton
            onClick={() => {}}
            disabled={disabled}
            label={triggerLabel}
            iconOnly={iconOnly}
            title={triggerTitle}
          />
        }
      />
      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-56 bg-surface border border-border text-ink rounded-xl shadow-elegant ring-0 p-1.5"
      >
        {hasSelection && (
          <div className="px-2 py-1.5 mb-1 text-[10px] font-semibold text-primary-glow bg-primary/5 rounded-md border border-primary/20">
            Applies to selected text only
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => {
                setOpen(false);
                onSelectAction(action);
              }}
              className="flex items-center gap-2 text-left text-xs font-medium text-ink px-2.5 py-1.5 rounded-lg hover:bg-primary/10 hover:text-primary-glow transition-colors cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-primary-glow shrink-0" />
              <span>{ACTION_LABELS[action]}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
