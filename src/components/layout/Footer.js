import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex space-x-6">
            <Link
              to="/about"
              className="text-gray-500 hover:text-gray-900 text-sm"
            >
              About
            </Link>
            <Link
              to="/documentation"
              className="text-gray-500 hover:text-gray-900 text-sm"
            >
              Documentation
            </Link>
            <Link
              to="/api-status"
              className="text-gray-500 hover:text-gray-900 text-sm"
            >
              API Status
            </Link>
          </div>
          <div className="text-gray-500 text-sm">
            Version 1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 