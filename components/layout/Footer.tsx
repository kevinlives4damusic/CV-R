"use client";

import React from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-900 border-t border-navy-800">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-indigo-400" />
              <span className="text-xl font-logo text-white">Resume.ai</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              AI-powered resume review to help you land your dream job.
            </p>
          </div>

          {/* Product Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/features" className="text-base text-gray-400 hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-base text-gray-400 hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-base text-gray-400 hover:text-white">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-base text-gray-400 hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-base text-gray-400 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-base text-gray-400 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-base text-gray-400 hover:text-white">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/privacy" className="text-base text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-base text-gray-400 hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-navy-800">
          <div className="text-center md:text-left text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Resume.ai. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 