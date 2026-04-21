import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserLocation, RiderRequirements } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role?: 'user' | 'rider', location?: UserLocation, requirements?: RiderRequirements) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      // Clear previous listener if it exists
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (fbUser) {
        setFirebaseUser(fbUser);
        // Fetch user profile from Firestore with real-time listener
        unsubDoc = onSnapshot(doc(db, 'users', fbUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUser({ uid: fbUser.uid, ...(docSnap.data() as User) });
          } else {
            setUser({ uid: fbUser.uid, name: fbUser.displayName || 'User', email: fbUser.email || '', role: 'user', status: 'approved' });
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile listen error:", error);
          setLoading(false);
        });
      } else {
        setFirebaseUser(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (name: string, email: string, password: string, role: 'user' | 'rider' = 'user', location?: UserLocation, requirements?: RiderRequirements) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });

    // build a distinct referral code (Alpha-Numeric)
    const shortCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const cleanName = name.split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase();
    const referralCode = `${cleanName}${shortCode}`;

    // Build user data - only include fields that have actual values
    const finalData: Record<string, any> = {
      uid: credential.user.uid,
      name: name,
      email: email,
      role: role,
      status: role === 'rider' ? 'pending' : 'approved',
      createdAt: new Date().toISOString(),
      referralCode: referralCode,
    };

    // Only add location if it was provided
    if (location && typeof location === 'object') {
      finalData.location = JSON.parse(JSON.stringify(location));
    }

    // Only add requirements if it was provided  
    if (requirements && typeof requirements === 'object') {
      finalData.requirements = JSON.parse(JSON.stringify(requirements));
    }

    // Nuclear clean: this strips ALL undefined/null from the entire object
    const safeData = JSON.parse(JSON.stringify(finalData));
    
    await setDoc(doc(db, 'users', safeData.uid), safeData);
    setUser(safeData);

  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('Mission interrupted: Re-authentication identity missing.');
    }
    
    // Re-authenticate user first
    const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signIn, signUp, signOut, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}
