export default function MockInterview() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4 ">
      <h1 className="text-4xl font-bold text-slate-900 mb-3">
        Coming Soon
        <span className="inline-flex gap-1 ml-2 align-middle">
          <span
            className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-blue-200 animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </span>
      </h1>
      <p className="text-slate-500 text-base max-w-xs mb-10">
        Mock interviews are on the way. We're working hard to launch this
        feature for you.
      </p>
      <div className="flex gap-4">
        <a
          href="/"
          className="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
        >
          Home
        </a>
        <a
          href="/jobs"
          className="px-6 py-3 rounded-xl border border-blue-200 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition"
        >
          Browse Jobs
        </a>
      </div>
    </div>
  );
}
