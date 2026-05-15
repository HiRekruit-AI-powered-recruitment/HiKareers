import React, { createContext, useContext, useMemo } from 'react';

const ProfileCompletionContext = createContext(null);

function calcBasicInfoScore(user) {
  if (!user) return 0;

  let score = 0;

  if (user.fullName) score++;
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
  if (!user?.qualifications) return 0;

  const qualificationRules = {
    tenth: ['institutionName', 'startYear', 'endYear'],

    twelfth: ['institutionName', 'startYear', 'endYear'],

    graduation: ['institutionName', 'courseName', 'startYear', 'endYear'],

    postgraduation: ['institutionName', 'courseName', 'startYear', 'endYear'],
  };

  const isValidValue = (value) => {
    return value !== null && value !== undefined && value !== '';
  };

  let score = 0;

  Object.entries(qualificationRules).forEach(([level, requiredFields]) => {
    const data = user.qualifications[level];

    if (!data) return;

    const hasRequiredFields = requiredFields.every((field) =>
      isValidValue(data[field])
    );

    const hasScore = isValidValue(data.percentage) || isValidValue(data.cgpa);

    if (hasRequiredFields && hasScore) {
      score += 1;
    }
  });

  return score;
}

export function ProfileCompletionProvider({ user, children }) {
  const value = useMemo(() => {
    if (!user) {
      return {
        basicInfoScore: 0,
        resumeScore: 0,
        educationScore: 0,
        totalScore: 0,
        maxScore: 11,
        percentage: 0,
        incompleteSections: [],
      };
    }
    console.log(user);
    const basicInfoScore = calcBasicInfoScore(user);

    const resumeScore = calcResumeScore(user);

    const educationScore = calcEducationScore(user);

    const totalScore = basicInfoScore + resumeScore + educationScore;

    const maxScore = 10;

    const percentage =
      maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    console.log({
      basicInfoScore,
      resumeScore,
      educationScore,
      totalScore,
      percentage,
    });

    const incompleteSections = [];

    if (basicInfoScore < 5) {
      incompleteSections.push({
        label: 'Basic Info',
        score: basicInfoScore,
        max: 5,
      });
    }

    if (resumeScore < 2) {
      incompleteSections.push({
        label: 'Resume',
        score: resumeScore,
        max: 2,
      });
    }

    if (educationScore < 4) {
      incompleteSections.push({
        label: 'Education Details',
        score: educationScore,
        max: 4,
      });
    }

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

  if (!ctx) {
    throw new Error(
      'useProfileCompletion must be used within ProfileCompletionProvider'
    );
  }

  return ctx;
}
