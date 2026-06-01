import React from 'react';

export const ProductSkeleton = () => {
  return (
    <div className="h-full w-full">
      <div className="h-full flex flex-col bg-white border border-gray-150 shadow-sm rounded-[1rem] p-2.5 overflow-hidden animate-pulse">
        {/* Image Container Skeleton */}
        <div className="relative aspect-square bg-gray-200 rounded-lg">
          {/* Heart icon placeholder */}
          <div className="absolute top-2 right-2 rounded-full w-6 h-6 bg-gray-300"></div>
        </div>

        {/* Content Skeleton */}
        <div className="pt-2 pb-0.5 flex-1 flex flex-col">
          {/* Title Placeholder */}
          <div className="h-3.5 bg-gray-200 rounded w-11/12 mb-1.5"></div>

          {/* Price Placeholder */}
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <div className="h-4 bg-gray-300 rounded w-12"></div>
            <div className="h-3 bg-gray-200 rounded w-6"></div>
          </div>

          {/* Condition and Category Badges Placeholder */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="h-3.5 bg-gray-200 rounded-full w-12"></div>
            <div className="h-3 bg-gray-200 rounded w-14"></div>
          </div>

          {/* Divider */}
          <hr className="border-gray-100 my-1.5" />

          {/* Seller Profile Placeholder */}
          <div className="flex items-center justify-between mt-auto pt-1">
            <div className="flex items-center gap-1.5 w-1/2">
              <div className="w-5 h-5 rounded-full bg-gray-200 shrink-0"></div>
              <div className="h-2.5 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="h-2.5 bg-gray-200 rounded w-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductSkeletonList = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeleton key={idx} />
      ))}
    </div>
  );
};
