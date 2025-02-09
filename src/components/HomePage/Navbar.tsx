import React from 'react';
import { PenLine } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <PenLine className="h-6 w-6 text-gray-800" />
            <span className="ml-2 text-xl font-semibold">WriteWhisper</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-gray-900">Write a story</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Library</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Pricing</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">About us</a>
          </div>

          <div>
            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg">
              Log in
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;