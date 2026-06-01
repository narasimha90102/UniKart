import React from 'react';

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Premium Gradient Spinner Container */}
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute w-20 h-20 rounded-full border-4 border-primary/10 animate-pulse"></div>
        {/* Spinning gradient border */}
        <div className="w-16 h-16 rounded-full border-4 border-t-indigo-600 border-r-purple-600 border-b-pink-500 border-l-transparent animate-spin duration-700"></div>
        {/* Inner static brand element */}
        <div className="absolute text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent select-none animate-pulse">
          U
        </div>
      </div>
      {/* Loading Text */}
      <div className="mt-6 flex flex-col items-center gap-1">
        <span className="text-sm font-semibold tracking-wider text-gray-600 dark:text-gray-300 uppercase">
          UniKart
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 animate-pulse">
          Loading amazing deals...
        </span>
      </div>
    </div>
  );
};
