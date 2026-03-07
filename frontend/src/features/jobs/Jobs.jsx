import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  Filter,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../applications/api';
import JobCard from './JobCard';

// Filter Section Component
function FilterSection({ title, options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="space-y-2">
          {options.map((option) => (
            <label key={option.value} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => onChange(option.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                {option.label}
                {option.count !== undefined && (
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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);

  // API state
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  // Filter states
  const [jobTypes, setJobTypes] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [techStacks, setTechStacks] = useState([]);
  const [workModes, setWorkModes] = useState([]);

  // Fetch jobs from the backend
  useEffect(() => {
    const controller = new AbortController();
    fetchJobs();
    return () => controller.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchJobs() {
    try {
      setLoading(true);
      setError('');
      const response = await jobAPI.getAllJobs({ limit: 50 });
      if (response.success) {
        setJobs(response.data.jobs || []);
        setTotal(response.data.total || 0);
      } else {
        setError(response.message || 'Failed to load jobs');
      }
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      console.error('Jobs fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter options — derived dynamically from actual job data
  const filterOptions = {
    jobTypes: [
      { value: 'Full-time', label: 'Full-time' },
      { value: 'Part-time', label: 'Part-time' },
      { value: 'Internship', label: 'Internship' },
      { value: 'Contract', label: 'Contract' },
    ],
    experienceLevels: [
      { value: 'Fresher', label: 'Fresher (0-1 years)' },
      { value: 'Junior', label: 'Junior (1-3 years)' },
      { value: 'Experienced', label: 'Experienced (3+ years)' },
      { value: 'Entry Level', label: 'Entry Level' },
      { value: 'Mid-Senior Level', label: 'Mid-Senior Level' },
      { value: 'Director', label: 'Director' },
      { value: 'Executive', label: 'Executive' },
    ],
    workModes: [
      { value: 'Remote', label: 'Remote' },
      { value: 'On-site', label: 'On-site' },
      { value: 'Hybrid', label: 'Hybrid' },
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
  };

  const activeFiltersCount = jobTypes.length + experienceLevels.length + techStacks.length + workModes.length;

  // Client-side filtering
  const filteredJobs = jobs.filter((job) => {
    // Search query filtering
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const titleMatch = job.title?.toLowerCase().includes(searchLower);
      const companyMatch = job.company?.toLowerCase().includes(searchLower);
      const skillsMatch = job.skills?.some((skill) => skill.toLowerCase().includes(searchLower));

      if (!titleMatch && !companyMatch && !skillsMatch) {
        return false;
      }
    }

    // Location filtering
    if (locationQuery && !job.location?.toLowerCase().includes(locationQuery.toLowerCase())) {
      return false;
    }

    // Job Type filtering
    if (jobTypes.length > 0) {
      const type = job.jobType || job.type;
      if (!type || !jobTypes.includes(type)) {
        return false;
      }
    }

    // Experience Level filtering
    if (experienceLevels.length > 0) {
      const level = job.experienceLevel || job.experience;
      if (!level || !experienceLevels.includes(level)) {
        return false;
      }
    }

    // Work Mode filtering
    if (workModes.length > 0) {
      const mode = job.workMode;
      if (!mode || !workModes.includes(mode)) {
        return false;
      }
    }

    return true;
  });

  const handleApply = (jobId) => {
    navigate(`/apply/${jobId}`);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Your Dream Job</h1>

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
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-80 flex-shrink-0`}>
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button onClick={clearAllFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <FilterSection
                  title="Job Type"
                  options={filterOptions.jobTypes}
                  selected={jobTypes}
                  onChange={(value) => toggleFilter(jobTypes, setJobTypes, value)}
                />
                <FilterSection
                  title="Experience Level"
                  options={filterOptions.experienceLevels}
                  selected={experienceLevels}
                  onChange={(value) => toggleFilter(experienceLevels, setExperienceLevels, value)}
                />
                <FilterSection
                  title="Work Mode"
                  options={filterOptions.workModes}
                  selected={workModes}
                  onChange={(value) => toggleFilter(workModes, setWorkModes, value)}
                />
              </div>
            </div>
          </aside>

          {/* Jobs List */}
          <main className="flex-1">
            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500">Loading jobs...</p>
                </div>
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
                <p>{error}</p>
                <button onClick={fetchJobs} className="mt-2 text-sm underline">Try again</button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{filteredJobs.length}</span> of{' '}
                    <span className="font-semibold text-gray-900">{total}</span> jobs
                  </p>
                </div>

                <div className="space-y-4">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        onApply={handleApply}
                        onSave={handleSave}
                        isSaved={savedJobs.includes(job._id)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                      <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {jobs.length === 0 ? 'No jobs posted yet' : 'No matching jobs found'}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {jobs.length === 0
                          ? 'Check back soon — new opportunities are added regularly.'
                          : 'Try adjusting your filters or search criteria.'}
                      </p>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
