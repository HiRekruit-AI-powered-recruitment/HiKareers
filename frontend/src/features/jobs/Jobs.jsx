import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Search,
  Filter,
  X,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';

import JobCard from './JobCard';

// Filter Section Component
function FilterSection({
  title,
  options,
  selected,
  onChange,
  type = 'checkbox',
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center cursor-pointer group"
            >
              <input
                type={type}
                checked={selected.includes(option.value)}
                onChange={() => onChange(option.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                {option.label}
                {option.count && (
                  <span className="text-gray-400 ml-1">({option.count})</span>
                )}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// Main Jobs Component
export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);

  // Filter states
  const [jobTypes, setJobTypes] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [techStacks, setTechStacks] = useState([]);
  const [workModes, setWorkModes] = useState([]);
  const [salaryRanges, setSalaryRanges] = useState([]);

  // Mock jobs data
  const [jobs] = useState([
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Solutions',
      location: 'Bangalore, India',
      type: 'Full-time',
      experience: '3-5 years',
      salary: '₹15-25 LPA',
      description:
        'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building responsive web applications using React and modern JavaScript.',
      skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Redux'],
      postedDate: '2 days ago',
      workMode: 'Hybrid',
      experienceLevel: 'Experienced',
    },
    {
      id: 2,
      title: 'Backend Developer - Node.js',
      company: 'StartupXYZ',
      location: 'Mumbai, India',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '₹12-20 LPA',
      description:
        'Join our fast-growing startup as a Backend Developer. Work on scalable microservices architecture using Node.js, Express, and MongoDB.',
      skills: ['Node.js', 'Express', 'MongoDB', 'AWS', 'Docker'],
      postedDate: '1 week ago',
      workMode: 'Remote',
      experienceLevel: 'Experienced',
    },
    {
      id: 3,
      title: 'Full Stack Developer Intern',
      company: 'InnovateTech',
      location: 'Pune, India',
      type: 'Internship',
      experience: '0-1 years',
      salary: '₹20-30k/month',
      description:
        'Great opportunity for freshers! Learn and work on real projects using MERN stack. Mentorship provided by senior developers.',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
      postedDate: '3 days ago',
      workMode: 'On-site',
      experienceLevel: 'Fresher',
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      company: 'CloudScale Inc',
      location: 'Hyderabad, India',
      type: 'Full-time',
      experience: '4-6 years',
      salary: '₹18-28 LPA',
      description:
        'Looking for a skilled DevOps Engineer to manage our cloud infrastructure, CI/CD pipelines, and ensure high availability of services.',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Python'],
      postedDate: '5 days ago',
      workMode: 'Hybrid',
      experienceLevel: 'Experienced',
    },
    {
      id: 5,
      title: 'React Native Developer',
      company: 'MobileFirst Apps',
      location: 'Delhi NCR, India',
      type: 'Contract',
      experience: '2-3 years',
      salary: '₹10-18 LPA',
      description:
        'Build beautiful mobile applications for iOS and Android using React Native. Work with a talented team on consumer-facing products.',
      skills: ['React Native', 'JavaScript', 'Redux', 'Firebase', 'REST API'],
      postedDate: '1 day ago',
      workMode: 'Remote',
      experienceLevel: 'Experienced',
    },
    {
      id: 6,
      title: 'Java Developer - Fresher',
      company: 'Enterprise Solutions Ltd',
      location: 'Chennai, India',
      type: 'Full-time',
      experience: '0-1 years',
      salary: '₹3-5 LPA',
      description:
        'Fresh graduates welcome! Work on enterprise Java applications. Training will be provided on Spring Boot, Microservices, and best practices.',
      skills: ['Java', 'Spring Boot', 'MySQL', 'REST API', 'Git'],
      postedDate: '1 week ago',
      workMode: 'On-site',
      experienceLevel: 'Fresher',
    },
    {
      id: 7,
      title: 'Data Scientist',
      company: 'AI Innovations',
      location: 'Bangalore, India',
      type: 'Full-time',
      experience: '3-5 years',
      salary: '₹20-35 LPA',
      description:
        'Join our AI team to build machine learning models and extract insights from large datasets. Experience with Python and ML frameworks required.',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics'],
      postedDate: '4 days ago',
      workMode: 'Hybrid',
      experienceLevel: 'Experienced',
    },
    {
      id: 8,
      title: 'UI/UX Designer',
      company: 'DesignStudio',
      location: 'Mumbai, India',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '₹8-15 LPA',
      description:
        'Create stunning user interfaces and seamless user experiences. Work closely with developers to bring designs to life.',
      skills: [
        'Figma',
        'Adobe XD',
        'Prototyping',
        'User Research',
        'Wireframing',
      ],
      postedDate: '2 days ago',
      workMode: 'Hybrid',
      experienceLevel: 'Experienced',
    },
  ]);

  // Filter options
  const filterOptions = {
    jobTypes: [
      { value: 'Full-time', label: 'Full-time', count: 5 },
      { value: 'Internship', label: 'Internship', count: 1 },
      { value: 'Contract', label: 'Contract', count: 1 },
      { value: 'Part-time', label: 'Part-time', count: 0 },
    ],
    experienceLevels: [
      { value: 'Fresher', label: 'Fresher (0-1 years)', count: 2 },
      { value: 'Junior', label: 'Junior (1-3 years)', count: 0 },
      { value: 'Experienced', label: 'Experienced (3+ years)', count: 6 },
    ],
    techStacks: [
      { value: 'React', label: 'React', count: 3 },
      { value: 'Node.js', label: 'Node.js', count: 3 },
      { value: 'JavaScript', label: 'JavaScript', count: 4 },
      { value: 'Python', label: 'Python', count: 2 },
      { value: 'Java', label: 'Java', count: 1 },
      { value: 'AWS', label: 'AWS', count: 2 },
      { value: 'Docker', label: 'Docker', count: 2 },
      { value: 'MongoDB', label: 'MongoDB', count: 2 },
    ],
    workModes: [
      { value: 'Remote', label: 'Remote', count: 2 },
      { value: 'On-site', label: 'On-site', count: 2 },
      { value: 'Hybrid', label: 'Hybrid', count: 4 },
    ],
    salaryRanges: [
      { value: '0-5', label: '₹0-5 LPA', count: 1 },
      { value: '5-10', label: '₹5-10 LPA', count: 1 },
      { value: '10-20', label: '₹10-20 LPA', count: 3 },
      { value: '20+', label: '₹20+ LPA', count: 3 },
    ],
  };

  const toggleFilter = (filterArray, setFilter, value) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter((item) => item !== value));
    } else {
      setFilter([...filterArray, value]);
    }
  };

  const clearAllFilters = () => {
    setJobTypes([]);
    setExperienceLevels([]);
    setTechStacks([]);
    setWorkModes([]);
    setSalaryRanges([]);
  };

  const activeFiltersCount =
    jobTypes.length +
    experienceLevels.length +
    techStacks.length +
    workModes.length +
    salaryRanges.length;

  // Filter jobs based on selected filters
  const filteredJobs = jobs.filter((job) => {
    // Search query filter
    if (
      searchQuery &&
      !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !job.company.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !job.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ) {
      return false;
    }

    // Location filter
    if (
      locationQuery &&
      !job.location.toLowerCase().includes(locationQuery.toLowerCase())
    ) {
      return false;
    }

    // Job type filter
    if (jobTypes.length > 0 && !jobTypes.includes(job.type)) {
      return false;
    }

    // Experience level filter
    if (
      experienceLevels.length > 0 &&
      !experienceLevels.includes(job.experienceLevel)
    ) {
      return false;
    }

    // Tech stack filter
    if (
      techStacks.length > 0 &&
      !techStacks.some((tech) => job.skills.includes(tech))
    ) {
      return false;
    }

    // Work mode filter
    if (workModes.length > 0 && !workModes.includes(job.workMode)) {
      return false;
    }

    return true;
  });

  const handleApply = (jobId) => {
    console.log('Apply to job:', jobId);
    // Navigate to apply page or open modal
  };

  const handleSave = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter((id) => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Find Your Dream Job
          </h1>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by job title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:w-64 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Location"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } md:block w-full md:w-80 flex-shrink-0`}
          >
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <FilterSection
                  title="Job Type"
                  options={filterOptions.jobTypes}
                  selected={jobTypes}
                  onChange={(value) =>
                    toggleFilter(jobTypes, setJobTypes, value)
                  }
                />

                <FilterSection
                  title="Experience Level"
                  options={filterOptions.experienceLevels}
                  selected={experienceLevels}
                  onChange={(value) =>
                    toggleFilter(experienceLevels, setExperienceLevels, value)
                  }
                />

                <FilterSection
                  title="Tech Stack"
                  options={filterOptions.techStacks}
                  selected={techStacks}
                  onChange={(value) =>
                    toggleFilter(techStacks, setTechStacks, value)
                  }
                />

                <FilterSection
                  title="Work Mode"
                  options={filterOptions.workModes}
                  selected={workModes}
                  onChange={(value) =>
                    toggleFilter(workModes, setWorkModes, value)
                  }
                />

                <FilterSection
                  title="Salary Range"
                  options={filterOptions.salaryRanges}
                  selected={salaryRanges}
                  onChange={(value) =>
                    toggleFilter(salaryRanges, setSalaryRanges, value)
                  }
                />
              </div>
            </div>
          </aside>

          {/* Jobs List */}
          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing{' '}
                <span className="font-semibold text-gray-900">
                  {filteredJobs.length}
                </span>{' '}
                jobs
              </p>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Most Recent</option>
                <option>Most Relevant</option>
                <option>Salary: High to Low</option>
                <option>Salary: Low to High</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={handleApply}
                    onSave={handleSave}
                    isSaved={savedJobs.includes(job.id)}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No jobs found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
