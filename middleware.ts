import { NextResponse, type NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/verify',
  '/auth/callback',
  '/features',
  '/pricing',
  '/blog',
  '/upload',
  '/results',
  '/dashboard',
  '/profile'
];

// Define routes that require authentication - empty now as we're making all routes public
const protectedRoutes: string[] = [];

export async function middleware(request: NextRequest) {
  // Simply allow all requests to proceed
  return NextResponse.next();
} 