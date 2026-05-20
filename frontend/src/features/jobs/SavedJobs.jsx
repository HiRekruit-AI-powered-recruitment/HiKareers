import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Building2,
  BookmarkCheck,
  Calendar,
} from 'lucide-react';

import { jobAPI } from '../../features/applications/api';

function SavedJobs() {
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  async function fetchSavedJobs() {
    try {
      setLoading(true);

      const response = await jobAPI.getSavedJobs();

      if (!response.success) {
        setError(response.message || 'Failed to fetch saved jobs');
        return;
      }

      setSavedJobs(response.data || []);
    } catch (error) {
      console.log(error);

      setError('Failed to fetch saved jobs');
    } finally {
      setLoading(false);
    }
  }

  async function removeSavedJob(jobId) {
    try {
      const response = await jobAPI.removeJob(jobId);

      if (!response.success) return;

      setSavedJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (error) {
      console.log(error);
    }
  }

  function handleApply(jobId) {
    navigate(`/apply/${jobId}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">Loading saved jobs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>

          <p className="text-gray-500 mt-2">
            Manage your bookmarked opportunities
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        {savedJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No Saved Jobs
            </h2>

            <p className="text-gray-500">Jobs you bookmark will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {savedJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <h3
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        className="text-xl font-semibold text-gray-900 mb-1 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {job.title}
                      </h3>

                      <p className="text-gray-600 font-medium mb-2">
                        {job.company || job.companyName}
                      </p>

                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>

                        {(job.jobType || job.type) && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.jobType || job.type}
                          </span>
                        )}

                        {(job.experienceLevel || job.experience) && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.experienceLevel || job.experience}
                          </span>
                        )}

                        {job.salary && (
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            {job.salary}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeSavedJob(job._id)}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    aria-label="Remove saved job"
                  >
                    <BookmarkCheck className="w-5 h-5 text-blue-600 fill-blue-600" />
                  </button>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">
                  {job.description}
                </p>

                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}

                    {job.skills.length > 5 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium">
                        +{job.skills.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">
                      {job.createdAt
                        ? `Posted ${new Date(job.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                            }
                          )}`
                        : ''}
                    </span>

                    {job.endDate && (
                      <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                        <Calendar className="w-4 h-4" />
                        Apply by{' '}
                        {new Date(job.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {job.numberOfPositions && (
                      <span className="text-sm text-blue-600 font-medium">
                        {job.numberOfPositions} Positions
                      </span>
                    )}

                    <button
                      onClick={() => handleApply(job._id)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedJobs;
