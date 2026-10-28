import { useTranslation } from 'react-i18next';
import type { QuizQuestion as QType, QuizOption } from '../../types';

interface QuizQuestionProps {
  question: QType;
  onAnswer: (optionId: string) => void;
  isAnswered: boolean;
  selectedOptionId?: string;
  result?: { correct: boolean; correctOptionId: string };
}

export default function QuizQuestion({
  question,
  onAnswer,
  isAnswered,
  selectedOptionId,
  result,
}: QuizQuestionProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('de') ? 'de' : 'en';
  const qText = lang === 'de' ? question.question_de : question.question_en;

  function optionClass(opt: QuizOption): string {
    const base = 'w-full text-left font-pixel text-[9px] py-3 px-4 mb-2 block border-2 transition-all duration-75 cursor-pointer';
    if (!isAnswered) return `${base} border-white bg-accent-teal text-white hover:bg-aurora hover:border-aurora`;
    if (opt.id === result?.correctOptionId) return `${base} border-xp-green bg-xp-green bg-opacity-20 text-xp-green`;
    if (opt.id === selectedOptionId && !result?.correct) return `${base} border-hp-red bg-hp-red bg-opacity-20 text-hp-red`;
    return `${base} border-gray-700 bg-bg-darker text-gray-500 cursor-not-allowed`;
  }

  return (
    <div className="card-pixel-dark">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="badge-pixel text-[7px] bg-aurora text-white">
          {t(`quiz.difficulty.\${question.difficulty}`)}
        </span>
        <span className="font-pixel text-[8px] text-xp-gold">+{question.xp_reward} XP</span>
      </div>

      {/* Question text */}
      <div className="font-pixel text-[10px] text-white leading-relaxed mb-6 border-l-4 border-xp-gold pl-3">
        {qText}
      </div>

      {/* Options */}
      <div>
        {question.options.map(opt => {
          const optText    = lang === 'de' ? opt.text_de : opt.text_en;
          const showExpl   = isAnswered && opt.id === result?.correctOptionId;
          const explanation = showExpl ? (lang === 'de' ? opt.explanation_de : opt.explanation_en) : null;
          return (
            <div key={opt.id}>
              <button
                className={optionClass(opt)}
                onClick={() => !isAnswered && onAnswer(opt.id)}
                disabled={isAnswered}
              >
                {optText}
              </button>
              {explanation && (
                <div className="border-l-4 border-xp-green bg-xp-green bg-opacity-5 px-3 py-2 mb-2 -mt-1">
                  <span className="font-pixel text-[8px] text-xp-green">
                    {t('quiz.explanation')}: {explanation}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Result banner */}
      {isAnswered && result && (
        <div className={[
          'mt-4 py-3 text-center font-pixel text-[11px] border-2',
          result.correct
            ? 'border-xp-green text-xp-green bg-xp-green bg-opacity-10'
            : 'border-hp-red text-hp-red bg-hp-red bg-opacity-10',
        ].join(' ')}>
          {result.correct ? t('quiz.correct') : t('quiz.wrong')}
        </div>
      )}
    </div>
  );
}
