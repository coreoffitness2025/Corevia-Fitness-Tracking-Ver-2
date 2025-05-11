import { User } from 'firebase/auth';
import { useCallback } from 'react';
import { signInWithGoogle, signInWithEmail, getUserProfile } from '../services/firebaseService';
import { UserProfile } from '../types';
import { toast } from 'react-hot-toast';
import { DEFAULT_PROFILE } from '../constants/profile';
import { FirebaseError } from 'firebase/app';

interface UseLoginProps {
  setIsLoading: (loading: boolean) => void;
  setUser: (user: UserProfile) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setShowPersonalization: (show: boolean) => void;
  navigate: (path: string) => void;
}

const createUserProfile = (user: User): UserProfile => ({
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
  experience: DEFAULT_PROFILE.experience
});

export const useLogin = ({
  setIsLoading,
  setUser,
  setUserProfile,
  setShowPersonalization,
  navigate,
}: UseLoginProps) => {
  const handleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithGoogle();
      
      if (!userCredential) {
        throw new Error('로그인에 실패했습니다.');
      }

      const userProfile = createUserProfile(userCredential);
      setUser(userProfile);

      // 기존 프로필 확인
      const existingProfile = await getUserProfile(userCredential.uid);
      
      if (existingProfile) {
        setUserProfile(existingProfile);
        toast.success('로그인 성공!');
        navigate('/dashboard');
      } else {
        setUserProfile(userProfile);
        setShowPersonalization(true);
      }
    } catch (error) {
      let errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';
      
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = '로그인 창이 닫혔습니다. 다시 시도해주세요.';
            break;
          case 'auth/network-request-failed':
            errorMessage = '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
            break;
          case 'auth/popup-blocked':
            errorMessage = '팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.';
            break;
          default:
            console.error('Firebase 에러:', error);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error('로그인 실패:', error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setUser, setUserProfile, setShowPersonalization, navigate]);

  const handleEmailLogin = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmail(email, password);
      
      if (!userCredential) {
        throw new Error('로그인에 실패했습니다.');
      }

      const userProfile = createUserProfile(userCredential);
      setUser(userProfile);

      // 기존 프로필 확인
      const existingProfile = await getUserProfile(userCredential.uid);
      
      if (existingProfile) {
        setUserProfile(existingProfile);
        toast.success('로그인 성공!');
        navigate('/dashboard');
      } else {
        setUserProfile(userProfile);
        setShowPersonalization(true);
      }
    } catch (error) {
      let errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';
      
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = '존재하지 않는 이메일입니다.';
            break;
          case 'auth/wrong-password':
            errorMessage = '잘못된 비밀번호입니다.';
            break;
          case 'auth/too-many-requests':
            errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
            break;
          case 'auth/network-request-failed':
            errorMessage = '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
            break;
          default:
            console.error('Firebase 에러:', error);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error('로그인 실패:', error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setUser, setUserProfile, setShowPersonalization, navigate]);

  return {
    handleLogin,
    handleEmailLogin
  };
};
