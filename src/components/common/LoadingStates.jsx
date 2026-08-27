import React from 'react';

/**
 * Professional Loading Skeleton Component
 * Shows loading state while data is being fetched
 */
export const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
  </div>
);

/**
 * Table Loading Skeleton
 */
export const TableLoadingSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-slate-200 rounded"></div>
    ))}
  </div>
);

/**
 * Card Loading Skeleton
 */
export const CardLoadingSkeleton = () => (
  <div className="bg-white rounded-lg p-6 space-y-4 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
  </div>
);

/**
 * Loading Overlay
 */
export const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 text-center">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

/**
 * Error Alert Component
 */
export const ErrorAlert = ({ message, onDismiss }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
    <div className="flex-1">
      <p className="text-sm font-medium text-red-800">{message}</p>
    </div>
    {onDismiss && (
      <button onClick={onDismiss} className="text-red-600 hover:text-red-700">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    )}
  </div>
);

/**
 * Success Alert Component
 */
export const SuccessAlert = ({ message, onDismiss }) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    <div className="flex-1">
      <p className="text-sm font-medium text-green-800">{message}</p>
    </div>
    {onDismiss && (
      <button onClick={onDismiss} className="text-green-600 hover:text-green-700">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    )}
  </div>
);
