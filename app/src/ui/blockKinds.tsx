import * as React from 'react';

import { Block } from '../core/content/types';
import { Strings } from './i18n/strings';

/** Short and long name of each kind of step, so players know what is coming. */
export function blockKindNames(strings: Strings, type: Block['type']): { short: string; long: string } {
  switch (type) {
    case 'briefing':
      return { short: strings.kindBriefing, long: strings.kindBriefingLong };
    case 'quiz':
      return { short: strings.kindQuiz, long: strings.kindQuizLong };
    case 'prompt':
      return { short: strings.kindPrompt, long: strings.kindPromptLong };
    case 'mission':
      return { short: strings.kindMission, long: strings.kindMissionLong };
    case 'usecase':
      return { short: strings.kindUseCase, long: strings.kindUseCaseLong };
  }
}

/** Line icon for a kind of step (24 × 24, drawn with the current colour). */
export function BlockKindIcon(props: { type: Block['type']; className?: string }): React.ReactElement {
  let shape: React.ReactElement;
  switch (props.type) {
    case 'briefing':
      shape = <path d="M3 5h6a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H3zM21 5h-6a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5H21z" />;
      break;
    case 'quiz':
      shape = (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5v.4" />
          <path d="M12 16.8v.2" strokeWidth="2.6" />
        </>
      );
      break;
    case 'prompt':
      shape = <path d="M4 20l4.2-1L19 8.2 15.8 5 5 15.8zM13.8 7l3.2 3.2" />;
      break;
    case 'mission':
      shape = <path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" />;
      break;
    case 'usecase':
      shape = (
        <>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M7 11h10M7 15h6M8 6V4M16 6V4" />
        </>
      );
      break;
  }
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {shape}
    </svg>
  );
}
