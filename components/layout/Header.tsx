"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Menu, X, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '@/lib/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logOut, loading } = useAuth();

  // Add scroll event listener to detect when the user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-lg shadow-md' 
        : 'bg-transparent'
    }`}>
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <FileText className={`h-8 w-8 ${isScrolled ? 'text-indigo-600' : 'text-indigo-500'}`} />
            <span className={`text-xl font-logo ${isScrolled ? 'text-indigo-600' : 'text-indigo-500'}`}>Resume.AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/features" className={`${isScrolled ? 'text-gray-800' : 'text-gray-800'} hover:text-indigo-600 transition-colors`}>
              Features
            </Link>
            <Link href="/pricing" className={`${isScrolled ? 'text-gray-800' : 'text-gray-800'} hover:text-indigo-600 transition-colors`}>
              Pricing
            </Link>
            
            {!loading && (user ? (
              <div className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className={`flex items-center space-x-2 ${isScrolled ? 'text-gray-800' : 'text-gray-800'} hover:text-indigo-600 transition-colors`}
                >
                  <User className="h-5 w-5" />
                  <span>{user.email?.split('@')[0] || 'User'}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/comparison" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Compare Resumes
                    </Link>
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className={`${isScrolled ? 'text-gray-800' : 'text-gray-800'} hover:text-indigo-600 transition-colors`}>
                Login
              </Link>
            ))}
            
            <Button variant="accent" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all">
              <Link href={!loading && user ? "/dashboard" : "/auth/login"}>
                {!loading && user ? "Dashboard" : "Login"}
              </Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-indigo-600"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 flex flex-col space-y-4 bg-white rounded-lg mt-2 shadow-lg border border-gray-100">
            <Link 
              href="/features" 
              className="text-gray-800 hover:text-indigo-600 transition-colors px-4 py-2 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-800 hover:text-indigo-600 transition-colors px-4 py-2 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            
            {!loading && (user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-800 hover:text-indigo-600 transition-colors px-4 py-2 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/comparison" 
                  className="text-gray-800 hover:text-indigo-600 transition-colors px-4 py-2 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Compare Resumes
                </Link>
                <Link 
                  href="/profile" 
                  className="text-gray-800 hover:text-indigo-600 transition-colors px-4 py-2 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="text-left text-gray-800 hover:text-indigo-600 transition-colors px-4 py-2 hover:bg-gray-50 w-full"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                href="/auth/login" 
                className="text-gray-800 hover:text-indigo-600 transition-colors px-4 py-2 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            ))}
            
            <div className="px-4 pt-2">
              <Button 
                variant="accent" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link href={!loading && user ? "/dashboard" : "/auth/login"}>
                  {!loading && user ? "Dashboard" : "Login"}
                </Link>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;