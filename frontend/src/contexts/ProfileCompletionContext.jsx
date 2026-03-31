import React, { createContext, useContext, useMemo } from 'react';

const ProfileCompletionContext = createContext(null);

function calcBasicInfoScore(user) {
  if (!user) return 0;
  let score = 0;
  if (user.fullName) score++;
  if (user.userName) score++;
  if (user.email) score++;
  if (user.mobile) score++;
  if (user.emailVerified) score++;
  return score;
}

function calcResumeScore(user) {
  const resumes = user?.resumes;
  if (!resumes) return 0;
  const hasResume = Object.values(resumes).some((r) => r !== null);
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

    const scoreType =
      data.scoreType ||
      (data.cgpa !== null && data.cgpa !== '' ? 'cgpa' : 'percentage');

    return Object.entries(data).every(([key, value]) => {
      if (key === 'completed') return true;
      if (key === 'scoreType') return true;
      if (key === 'cgpa' && scoreType !== 'cgpa') return true;
      if (key === 'percentage' && scoreType !== 'percentage') return true;
      return value !== null && value !== undefined && value !== '';
    });
  };

  return levels.reduce((sum, level) => {
    return sum + (isLevelComplete(level) ? 1 : 0);
  }, 0);
}

export function ProfileCompletionProvider({ user, children }) {
  const value = useMemo(() => {
    const basicInfoScore = calcBasicInfoScore(user);
    const resumeScore = calcResumeScore(user);
    const educationScore = calcEducationScore(user);

    const totalScore = basicInfoScore + resumeScore + educationScore;
    const maxScore = 11; // 5 basicInfo + 2 resume + 4 education
    const percentage = Math.round((totalScore / maxScore) * 100);

    const incompleteSections = [];
    if (basicInfoScore < 5)
      incompleteSections.push({
        label: 'Basic Info',
        score: basicInfoScore,
        max: 5,
      });
    if (resumeScore < 2)
      incompleteSections.push({
        label: 'Resume',
        score: resumeScore,
        max: 2,
      });
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
  }, [user]);

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
