import { User, UserCredential } from 'firebase/auth';
import { useCallback } from 'react';
import { signInWithGoogle, signInWithEmail, getUserProfile, getGoogleRedirectResult } from '../firebase/firebaseConfig';
import { UserProfile } from '../types';
import { toast } from 'react-hot-toast';
import { DEFAULT_PROFILE } from '../constants/profile';
import { FirebaseError } from 'firebase/app';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseLoginProps {
  onSuccess?: (user: User | null, profile: UserProfile | null) => void;
  onError?: (error: Error) => void;
}

const createUserProfile = (user: User | null): UserProfile | null => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    displayName: user.displayName || '',
    email: user.email || null,
    photoURL: user.photoURL || null,
    height: DEFAULT_PROFILE.height,
    weight: DEFAULT_PROFILE.weight,
    age: DEFAULT_PROFILE.age,
    gender: DEFAULT_PROFILE.gender,
    activityLevel: DEFAULT_PROFILE.activityLevel,
    fitnessGoal: DEFAULT_PROFILE.fitnessGoal,
    experience: DEFAULT_PROFILE.experience,
    settings: {
      darkMode: false,
      notifications: {
        workoutReminder: true,
        mealReminder: true,
        progressUpdate: true
      },
      units: {
        weight: 'kg',
        height: 'cm'
      },
      language: 'ko'
    }
  };
};

export const useLogin = ({ onSuccess, onError }: UseLoginProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      const result = await getGoogleRedirectResult();
      
      if (!result || !result.user) {
        throw new Error('로그인에 실패했습니다.');
      }
      
      const user = result.user;
      const existingProfile = await getUserProfile(user.uid);
      const profile = existingProfile || createUserProfile(user);
      
      if (onSuccess) {
        onSuccess(user, profile);
      }
      navigate('/');
    } catch (error) {
      const firebaseError = error as FirebaseError;
      toast.error(firebaseError.message);
      if (onError) {
        onError(firebaseError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, navigate]);

  const handleEmailLogin = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await signInWithEmail(email, password);
      const user = result.user as User | null;
      
      if (!user) {
        throw new Error('로그인에 실패했습니다.');
      }
      
      const existingProfile = await getUserProfile(user.uid);
      const profile = existingProfile || createUserProfile(user);
      
      if (onSuccess) {
        onSuccess(user, profile);
      }
      navigate('/');
    } catch (error) {
      const firebaseError = error as FirebaseError;
      toast.error(firebaseError.message);
      if (onError) {
        onError(firebaseError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, navigate]);

  return {
    isLoading,
    handleGoogleLogin,
    handleEmailLogin
  };
};
