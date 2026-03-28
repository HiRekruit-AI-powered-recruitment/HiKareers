import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Sparkles,
  Bell,
  Target,
  Zap,
  Users,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

import ProfileCompletionBanner from '../profile/components/ProfileCompletionBanner.jsx';
import { ProfileCompletionProvider } from '../../contexts/ProfileCompletionContext.jsx';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

// Mock authentication functions for demo
const isAuthenticated = () => false;
const getCurrentUser = () => null;

// Handle Explore Jobs Button Click
const handleExploreJobs = () => {
  window.location.href = '/jobs';
};

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${colorClasses[color]} mb-4`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

// Stat Card Component
function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated: isLoggedIn, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  if (isLoading) return null;

  if (isLoggedIn && user?.userType === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  const resumes = user?.resumes?.['1'] ? [user.resumes['1']] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {isLoggedIn && user && <ProfileCompletionBanner />}
      <div className="relative bg-gradient-to-br from-gray-900 to-blue-900 text-white h-screen flex justify-center items-center">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-800/30 rounded-full px-4 py-2 mb-6 border border-blue-700/30">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">
                AI-Powered Job Matching
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Dream Job with{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ">
                AI Intelligence
              </span>
            </h1>

            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Get personalized job matches, automated notifications, and ace
              your interviews with AI-powered mock sessions
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {!isLoggedIn ? (
                <>
                  <button
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                    onClick={() => navigate('/login')}
                  >
                    Get Started
                  </button>
                  <button
                    onClick={handleExploreJobs}
                    className="px-8 py-4 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
                  >
                    Explore Jobs
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                  >
                    View My Profile
                  </button>
                  <button
                    onClick={() => navigate('/jobs')}
                    className="px-8 py-4 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
                  >
                    Browse Jobs
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Land Your Dream Job
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features designed to accelerate your career journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon={Target}
            title="Smart Job Matching"
            description="Our AI analyzes your profile and matches you with jobs that perfectly fit your skills and career goals."
            color="blue"
          />
          <FeatureCard
            icon={Bell}
            title="Instant Notifications"
            description="Get real-time alerts when new opportunities matching your background become available."
            color="purple"
          />
          <FeatureCard
            icon={Sparkles}
            title="AI Mock Interviews"
            description="Practice with AI-powered mock interviews tailored to your target role and get instant feedback."
            color="green"
          />
          <FeatureCard
            icon={Briefcase}
            title="Easy Application"
            description="Apply to multiple jobs with one click using your HiKareers profile."
            color="orange"
          />
          <FeatureCard
            icon={Users}
            title="Company Insights"
            description="Access detailed information about company culture, salaries, and interview processes."
            color="blue"
          />
          <FeatureCard
            icon={TrendingUp}
            title="Career Growth"
            description="Track your progress and get personalized recommendations to advance your career."
            color="purple"
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How HiKareers Works
            </h2>
            <p className="text-xl text-gray-600">
              Your journey to the perfect job in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Create Your Profile
              </h3>
              <p className="text-gray-600">
                Build your professional profile with your skills, experience,
                and career preferences
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Get Matched
              </h3>
              <p className="text-gray-600">
                Our AI finds the best job opportunities that match your profile
                and sends you notifications
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Ace the Interview
              </h3>
              <p className="text-gray-600">
                Practice with AI mock interviews and apply with confidence to
                land your dream job
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Preparation Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-2 mb-4">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700">
                  AI-Powered
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Master Your Interview Skills
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Practice with our AI mock interview system that adapts to your
                target role, provides real-time feedback, and helps you improve
                with every session.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Personalized questions based on job role
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Instant feedback on your answers
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Track your progress over time
                  </span>
                </li>
              </ul>
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Try Mock Interview
              </button>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg">💼</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      Software Engineer
                    </div>
                    <div className="text-xs text-gray-600">
                      12 practice sessions
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    85%
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-lg">🎨</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      Product Designer
                    </div>
                    <div className="text-xs text-gray-600">
                      8 practice sessions
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    78%
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-lg">📊</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      Data Analyst
                    </div>
                    <div className="text-xs text-gray-600">
                      15 practice sessions
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    92%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 py-16"></div>
    </div>
  );
}
