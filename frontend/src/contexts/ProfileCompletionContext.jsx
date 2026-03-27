import React, { createContext, useContext, useMemo } from 'react';

const ProfileCompletionContext = createContext(null);

// Max points: basicInfo(4) + resume(2) + education(4) = 10
function calcBasicInfoScore(user) {
  if (!user) return 0;
  let score = 0;
  if (user.fullName) score++;
  if (user.userName) score++;
  if (user.email) score++;
  if (user.mobile) score++;
  // Email must also be verified for full score
  if (!user.emailVerified) score = Math.max(0, score - 1);
  return score;
}

function calcResumeScore(resumes) {
  // 2pts if resume is uploaded, else 0
  const hasResume = resumes[0];
  return hasResume ? 2 : 0;
}

function calcEducationScore(user) {
  if (!user?.highestQualification || !user?.qualifications) return 0;

  const levelMap = {
    tenth: ['tenth'],
    twelfth: ['tenth', 'twelfth'],
    graduation: ['tenth', 'twelfth', 'graduation'],
    postgraduation: ['tenth', 'twelfth', 'graduation', 'postgraduation'],
  };

  const levels = levelMap[user.highestQualification] || [];
  if (levels.length === 0) return 0;

  const isLevelComplete = (level) => {
    const data = user.qualifications[level];
    if (!data || typeof data !== 'object') return false;
    return Object.entries(data).every(([key, value]) => {
      if (key === 'completed') return true;
      return value !== null && value !== undefined && value !== '';
    });
  };

  // 1pt per completed level, max 4pts
  return levels.reduce((sum, level) => {
    return sum + (isLevelComplete(level) ? 1 : 0);
  }, 0);
}

export function ProfileCompletionProvider({ user, resumes, children }) {
  const value = useMemo(() => {
    const basicInfoScore = calcBasicInfoScore(user);
    const resumeScore = calcResumeScore(resumes);
    const educationScore = calcEducationScore(user);

    const totalScore = basicInfoScore + resumeScore + educationScore;
    const maxScore = 10;
    const percentage = Math.round((totalScore / maxScore) * 100);

    const incompleteSections = [];
    if (basicInfoScore < 4)
      incompleteSections.push({
        label: 'Basic Info',
        score: basicInfoScore,
        max: 4,
      });
    if (resumeScore < 2)
      incompleteSections.push({ label: 'Resume', score: resumeScore, max: 2 });
    if (educationScore < 4)
      incompleteSections.push({
        label: 'Education Details',
        score: educationScore,
        max: 4,
      });

    return {
      basicInfoScore,
      resumeScore,
      educationScore,
      totalScore,
      maxScore,
      percentage,
      incompleteSections,
    };
  }, [user, resumes]);

  return (
    <ProfileCompletionContext.Provider value={value}>
      {children}
    </ProfileCompletionContext.Provider>
  );
}

export function useProfileCompletion() {
  const ctx = useContext(ProfileCompletionContext);
  if (!ctx)
    throw new Error(
      'useProfileCompletion must be used within ProfileCompletionProvider'
    );
  return ctx;
}
