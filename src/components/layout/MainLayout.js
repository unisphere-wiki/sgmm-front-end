import React from 'react';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col overflow-hidden">
        <div className="flex-grow h-full px-4 sm:px-6 md:px-8 lg:px-12 py-4 md:py-8 lg:py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 