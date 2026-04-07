const calculateMatchPercentage = (userSkills, jobSkills) => {
  const userSet = new Set(userSkills.map((s) => s.toLowerCase()));
  const jobSet = new Set(jobSkills.map((s) => s.toLowerCase()));

  let matchCount = 0;

  for (let skill of jobSet) {
    if (userSet.has(skill)) {
      matchCount++;
    }
  }

  const percentage = (matchCount / jobSet.size) * 100;
  return percentage;
};

export default calculateMatchPercentage;
