import React, { ReactNode } from 'react';
import Link from 'next/link'; 


const ErrorIcon: React.FC<{ className?: string }> = ({ className = "h-16 w-16 text-red-500" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} mx-auto mb-4`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true" // Decorative icon
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);


interface ErrorDisplayProps {
  errorMessage: string;
  title?: string;
  action?: ReactNode;
  containerClassName?: string;
}

const Ordernotfound: React.FC<ErrorDisplayProps> = ({
  errorMessage,
  title = "An Error Occurred", 
  action,
  containerClassName = " w-full p-4 sm:p-8 text-center h-[885px] flex flex-col justify-center items-center bg-blue-50 ",
}) => {
  
  const defaultAction = (
    <Link href="/" legacyBehavior>
      <a className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-150 ease-in-out">
        Go to Homepage
      </a>
    </Link>
  );

  return (
    <div className={containerClassName} role="alert">
      <div className="max-w-md"> 
        <ErrorIcon />
        <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-3">
          {title}
        </h1>
        <p className="text-gray-700 mb-6 text-base sm:text-lg">
          {errorMessage}
        </p>
        {action || defaultAction} 
      </div>
    </div>
  );
};

export default Ordernotfound;