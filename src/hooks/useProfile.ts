import { useCallback } from 'react';
import { saveUserProfile } from '../services/firebaseService';
import { UserProfile } from '../types';
import { toast } from 'react-hot-toast';
import { FirebaseError } from 'firebase/app';

interface UseProfileProps {
  userProfile: UserProfile | null;
  navigate: (path: string) => void;
}

export const useProfile = ({
  userProfile,
  navigate,
}: UseProfileProps) => {
  const handleSaveProfile = useCallback(async (profile: UserProfile['profile']) => {
    if (!userProfile) {
      toast.error('사용자 정보가 없습니다.');
      return;
    }

    try {
      const updatedProfile: UserProfile = {
        ...userProfile,
        profile
      };
      
      await saveUserProfile(updatedProfile);
      toast.success('프로필 저장 완료!');
      navigate('/dashboard');
    } catch (error) {
      let errorMessage = '프로필 저장에 실패했습니다. 다시 시도해주세요.';
      
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'permission-denied':
            errorMessage = '프로필 저장 권한이 없습니다. 다시 로그인해주세요.';
            break;
          case 'unavailable':
            errorMessage = '서비스가 일시적으로 사용 불가능합니다. 잠시 후 다시 시도해주세요.';
            break;
          default:
            console.error('Firebase 에러:', error);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error('프로필 저장 실패:', error);
      toast.error(errorMessage);
    }
  }, [userProfile, navigate]);

  return { handleSaveProfile };
}; 