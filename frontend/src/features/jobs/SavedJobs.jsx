import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  async function fetchSavedJobs() {
    try {
      setLoading(true);

      const response = await axios.get(
        'http://localhost:8000/api/jobs/get-saved-jobs',
        {
          withCredentials: true,
        }
      );

      setSavedJobs(response.data.data);
    } catch (error) {
      console.log(error);

      setError(error?.response?.data?.message || 'Failed to fetch saved jobs');
    } finally {
      setLoading(false);
    }
  }

  async function removeSavedJob(jobId) {
    try {
      await axios.post(
        `http://localhost:8000/api/jobs/remove-job/${jobId}`,
        {},
        {
          withCredentials: true,
        }
      );

      setSavedJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (error) {
      console.log(error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">Loading saved jobs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Saved Jobs</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {savedJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <h2 className="text-xl font-semibold mb-2">No Saved Jobs</h2>

            <p className="text-gray-500">Jobs you save will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {savedJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-xl shadow-md p-5 border"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {job.title}
                    </h2>

                    <p className="text-gray-600 mt-1">{job.companyName}</p>

                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      <span>📍 {job.location}</span>

                      <span>💼 {job.jobType}</span>

                      <span>💰 ₹{job.salary}</span>
                    </div>

                    <p className="mt-4 text-gray-700 line-clamp-2">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
                    >
                      View Job
                    </Link>

                    <button
                      onClick={() => removeSavedJob(job._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Remove
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
