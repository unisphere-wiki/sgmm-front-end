import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div className="flex space-x-4 sm:space-x-6">
            <a
              href="http://unisphere.wiki/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900 text-xs sm:text-sm"
            >
              About Us
            </a>
            <a
              href="http://unisphere.wiki:5001/api/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900 text-xs sm:text-sm"
            >
              Documentation
            </a>
            <a
              href="http://unisphere.wiki:5001/api/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900 text-xs sm:text-sm"
            >
              API Status
            </a>
          </div>
          <div className="text-gray-500 text-xs sm:text-sm">
            Version 1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 