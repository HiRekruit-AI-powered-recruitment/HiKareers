import { rules } from "./constants.models.js";

// Helper function to check atleast one resume is uploaded
export function hasAnyResume(resumes) {
  if (!resumes) return false;

  return Object.values(resumes).some((r) => r !== null);
}

//helper function for qualification check based on highest qualification level
export function areRequiredQualificationsCompleted(qualifications,highestQualification) {
  if (!qualifications || !highestQualification) return false;
  console.log("areRequiredQualificationsCompleted called")

  const order = ["tenth", "twelfth", "graduation", "postgraduation"];

  const requiredLevels = order.slice(
    0,
    order.indexOf(highestQualification) + 1,
  );

  return requiredLevels.every(
    (level) => qualifications[level]?.completed === true,
  );
}

//helper function to check profileCompleted
export function isProfileCompleted(user) {
  if (!user) return false;

  const basicChecks =
    user.emailVerified === true &&
    user.mobileVerified === true &&
    user.highestQualification != null &&
    hasAnyResume(user.resumes);

  if (!basicChecks) return false;

  return areRequiredQualificationsCompleted(
    user.qualifications,
    user.highestQualification,
  );
}

// just a Wrapper function
export function isQualificationCompleted(level, data) {
  if (!data) return false;

  return rules[level].every((field) => data[field] != null);
}