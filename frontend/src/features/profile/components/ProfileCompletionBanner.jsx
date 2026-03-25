import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileCompletion } from '../../../contexts/ProfileCompletionContext';

export default function ProfileCompletionBanner() {
  const navigate = useNavigate();
  const { percentage } = useProfileCompletion();

  if (percentage >= 100) return null;

  return (
    <div className="w-full bg-orange-400 px-4 py-2 flex items-center justify-center gap-3">
      <span className="text-white text-xs font-medium">
        Your profile is{' '}
        <span className="font-bold">{percentage}% complete</span> — finish it to
        get better job matches
      </span>
      <button
        onClick={() => navigate('/profile')}
        className="flex-shrink-0 text-xs font-bold text-orange-500 bg-white px-3 py-1 rounded-full hover:bg-orange-50 transition-colors"
      >
        Complete →
      </button>
    </div>
  );
}
