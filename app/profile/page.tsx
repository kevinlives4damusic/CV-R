'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { User, Mail, Key, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setIsLoading(false);
    } else if (user === null) {
      // Only redirect if we've confirmed user is not authenticated
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      if (!user) throw new Error('You must be logged in');
      
      // For email change, we need to reauthenticate first if the user signed in with email/password
      if (user.providerData[0]?.providerId === 'password' && !showCurrentPassword) {
        setShowCurrentPassword(true);
        setIsSaving(false);
        return;
      }
      
      if (user.providerData[0]?.providerId === 'password' && showCurrentPassword) {
        // Reauthenticate with current password
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
      }
      
      await updateEmail(user, email);
      setSuccess('Email updated successfully. Please verify your new email address.');
      setShowCurrentPassword(false);
      setCurrentPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update email');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsSaving(true);

    try {
      if (!user) throw new Error('You must be logged in');
      
      // For password change, we need to reauthenticate first
      if (!showCurrentPassword) {
        setShowCurrentPassword(true);
        setIsSaving(false);
        return;
      }
      
      // Reauthenticate with current password
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      await updatePassword(user, newPassword);
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-3 text-lg">Loading profile...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-10">Your Profile</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <User className="h-6 w-6 text-gray-400 mr-3" />
                <h2 className="text-xl font-semibold">Account Information</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">User ID</p>
                <p className="font-medium">{user?.uid}</p>
              </div>
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Account Created</p>
                <p className="font-medium">
                  {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Email Verification</p>
                <div className="flex items-center">
                  {user?.emailVerified ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Not verified</span>
                      <Button 
                        variant="link" 
                        className="ml-2 text-primary-600 p-0 h-auto"
                        onClick={async () => {
                          try {
                            if (user) {
                              await sendEmailVerification(user);
                              setSuccess('Verification email sent. Please check your inbox.');
                            }
                          } catch (err: any) {
                            setError(err.message || 'Failed to send verification email');
                          }
                        }}
                      >
                        Send verification email
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Authentication Provider</p>
                <p className="font-medium capitalize">
                  {user?.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Mail className="h-6 w-6 text-gray-400 mr-3" />
                <h2 className="text-xl font-semibold">Email Address</h2>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateEmail}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                {showCurrentPassword && user?.providerData[0]?.providerId === 'password' && (
                  <div className="mb-4">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password (required to change email)
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                )}
                
                <Button
                  type="submit"
                  variant="accent"
                  disabled={isSaving || (email === user?.email && !showCurrentPassword)}
                >
                  {isSaving ? 'Updating...' : showCurrentPassword ? 'Confirm Email Change' : 'Update Email'}
                </Button>
              </form>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Key className="h-6 w-6 text-gray-400 mr-3" />
                <h2 className="text-xl font-semibold">Password</h2>
              </div>
            </div>
            <div className="p-6">
              {user?.providerData[0]?.providerId === 'google.com' ? (
                <p className="text-gray-600">
                  You're signed in with Google. Password management is handled through your Google account.
                </p>
              ) : (
                <form onSubmit={handleUpdatePassword}>
                  {showCurrentPassword && (
                    <div className="mb-4">
                      <label htmlFor="currentPasswordForPw" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPasswordForPw"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      minLength={8}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="accent"
                    disabled={isSaving || (!showCurrentPassword && (!newPassword || !confirmPassword))}
                  >
                    {isSaving ? 'Updating...' : showCurrentPassword ? 'Confirm Password Change' : 'Update Password'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 