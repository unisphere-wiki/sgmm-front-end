import React from 'react';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow overflow-hidden">
        <div className="h-full px-12 py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 