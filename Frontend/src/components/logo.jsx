export function Logo() {
  return (
    <div className="inline-flex items-center px-6 py-3 border-2 border-blue-800 rounded-lg scale-75 z-10 bg-white shadow-[0px_0px_6px_rgba(25,60,184)]">
      <svg
        className="w-8 h-8 mr-3 text-blue-700"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Icon mic simple */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 1v11m0 0a3 3 0 003 3h0a3 3 0 003-3V7a3 3 0 00-3-3h-3zm-6 8a6 6 0 0012 0v-3"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 10v1a7 7 0 0014 0v-1"
        />
      </svg>
      <span className="bg-gradient-to-r from-blue-900 to-blue-500 bg-clip-text text-transparent font-semibold text-lg select-none">
        AI Web Text to Speech
      </span>
    </div>
  );
}
