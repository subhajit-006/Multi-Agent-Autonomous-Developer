import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 py-8 mt-auto">
      <div className="container text-center">
        <p className="text-light-text mb-4">
          &copy; {new Date().getFullYear()} Minimal Single-File Landing Page. All rights reserved.
        </p>
        <div className="flex justify-center space-x-6">
          <a href="#" className="text-light-text hover:text-primary-color transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-light-text hover:text-primary-color transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-light-text hover:text-primary-color transition-colors">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;