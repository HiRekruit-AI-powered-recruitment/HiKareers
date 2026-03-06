import React, { useState } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Building2,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';

// JobCard Component — works with both MongoDB _id and mock id fields
const JobCard = ({ job, onApply, onSave, isSaved }) => {
  const [saved, setSaved] = useState(isSaved);
  const jobId = job._id || job.id;

  const handleSave = () => {
    setSaved(!saved);
    onSave(jobId);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1 hover:text-blue-600 cursor-pointer">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium mb-2">{job.company}</p>
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
          onClick={handleSave}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label={saved ? 'Unsave job' : 'Save job'}
        >
          {saved ? (
            <BookmarkCheck className="w-5 h-5 text-blue-600 fill-blue-600" />
          ) : (
            <Bookmark className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

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
        <span className="text-sm text-gray-500">
          {job.postedDate
            ? `Posted ${job.postedDate}`
            : job.createdAt
              ? `Posted ${new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : ''}
        </span>
        <button
          onClick={() => onApply(jobId)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobCard;
