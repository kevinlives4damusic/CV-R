'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from './firebase';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Set or remove the auth cookie based on authentication state
      if (user) {
        // Get the Firebase ID token
        user.getIdToken().then((token) => {
          // Set a cookie with the token (expires in 7 days)
          Cookies.set('firebase-auth-token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
        });
      } else {
        // Remove the auth cookie when user is not authenticated
        Cookies.remove('firebase-auth-token');
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      Cookies.set('firebase-auth-token', idToken, { expires: 7 });
    } catch (error) {
      console.error("Authentication error during sign in:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Send email verification
      await sendEmailVerification(userCredential.user);
      const idToken = await userCredential.user.getIdToken();
      Cookies.set('firebase-auth-token', idToken, { expires: 7 });
    } catch (error) {
      console.error("Authentication error during sign up:", error);
      throw error;
    }
  };

  const logOut = async (): Promise<void> => {
    try {
      await signOut(auth);
      Cookies.remove('firebase-auth-token');
    } catch (error) {
      console.error("Authentication error during logout:", error);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();
      Cookies.set('firebase-auth-token', idToken, { expires: 7 });
    } catch (error) {
      console.error("Authentication error during Google sign in:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 