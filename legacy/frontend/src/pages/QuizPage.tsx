import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { quizApi } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import QuizQuestion from '../components/quiz/QuizQuestion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PixelButton from '../components/common/PixelButton';
import LevelUpModal from '../components/common/LevelUpModal';
import type { QuizQuestion as QType } from '../types';

interface AnswerResult {
  correct: boolean;
  correctOptionId: string;
  xpEarned: number;
  newLevel?: number;
  oldLevel?: number;
  leveledUp?: boolean;
}

export default function QuizPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const updateUser = useAuthStore(s => s.updateUser);
  const user = useAuthStore(s => s.user);

  const [question, setQuestion] = useState<QType | null>(null);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | undefined>();
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [done, setDone] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [count, setCount] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const loadNext = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setSelectedOption(undefined);
    setResult(null);
    try {
      const res = await quizApi.getNext(slug);
      const data = res.data.data;
      if (!data) {
        setDone(true);
      } else {
        setQuestion(data);
      }
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { loadNext(); }, [loadNext]);

  const handleAnswer = async (optionId: string) => {
    if (!question || answering) return;
    setSelectedOption(optionId);
    setAnswering(true);
    try {
      const res = await quizApi.submitAnswer(question.id, optionId);
      const data = res.data.data;
      setResult({
        correct: data.correct,
        correctOptionId: data.correctOptionId,
        xpEarned: data.xpEarned ?? 0,
        newLevel: data.newLevel,
        oldLevel: data.oldLevel,
        leveledUp: data.leveledUp,
      });
      setTotalXP(prev => prev + (data.xpEarned ?? 0));
      setCount(c => c + 1);
      if (data.leveledUp) {
        updateUser({ current_level: data.newLevel, total_xp: (user?.total_xp ?? 0) + (data.xpEarned ?? 0) });
        setShowLevelUp(true);
      }
    } catch {
      // ignore
    } finally {
      setAnswering(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (done) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-pixel text-center py-12">
          <div className="font-pixel text-sm text-xp-gold mb-4">{t('quiz.allDone')}</div>
          {count > 0 && (
            <div className="font-pixel text-[9px] text-aurora mb-6">
              +{totalXP} XP {t('quiz.title')}
            </div>
          )}
          <Link to={`/island/${slug}`}>
            <PixelButton variant="secondary">{t('quiz.backToIsland')}</PixelButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link to={`/island/${slug}`} className="font-pixel text-[9px] text-aurora hover:text-white">
          ◄ {t('common.back')}
        </Link>
        <div className="font-pixel text-[9px] text-xp-gold">
          {count > 0 && `+${totalXP} XP`}
        </div>
      </div>

      <h1 className="font-pixel text-xs text-xp-gold">{t('quiz.title')}</h1>

      {question && (
        <QuizQuestion
          question={question}
          onAnswer={handleAnswer}
          isAnswered={!!result}
          selectedOptionId={selectedOption}
          result={result ? { correct: result.correct, correctOptionId: result.correctOptionId } : undefined}
        />
      )}

      {result && (
        <div className="flex flex-col gap-3">
          {result.xpEarned > 0 && (
            <div className="font-pixel text-[9px] text-xp-gold text-center animate-xp-float">
              {t('quiz.xpEarned', { xp: result.xpEarned })}
            </div>
          )}
          <PixelButton variant="secondary" fullWidth onClick={loadNext}>
            {t('quiz.next')} ►
          </PixelButton>
        </div>
      )}

      <LevelUpModal
        visible={showLevelUp}
        newLevel={result?.newLevel ?? 1}
        onClose={() => setShowLevelUp(false)}
      />
    </div>
  );
}
