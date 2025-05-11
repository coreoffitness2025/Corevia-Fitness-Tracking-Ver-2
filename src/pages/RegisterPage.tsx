<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { toast } from 'react-hot-toast';
import Layout from '../components/common/Layout';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { signInWithGoogle, getGoogleRedirectResult } from '../firebase/firebaseConfig';
import { FcGoogle } from 'react-icons/fc';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth(); // AuthContext에서 인증 상태 가져오기
=======
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { toast } from 'react-hot-toast';
import Layout from '../components/common/Layout';
import { doc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import Button from '../components/common/Button';
import { FcGoogle } from 'react-icons/fc';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
>>>>>>> master
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [debugInfo, setDebugInfo] = useState<string>(''); // 디버깅 정보

  // 인증 상태 변경 감지
  useEffect(() => {
    console.log('Authentication state changed:', isAuthenticated, currentUser?.uid);
    setDebugInfo(prev => `${prev}\n인증 상태: ${isAuthenticated ? '로그인됨' : '로그인되지 않음'}\n사용자 ID: ${currentUser?.uid || 'none'}`);
    
    // 인증 상태가 변경되고 로그인되었으면 리디렉션
    if (isAuthenticated && currentUser) {
      toast.success('로그인 되었습니다. 프로필 페이지로 이동합니다.');
      // 리디렉션 시점을 지연시켜 중첩 리디렉션 방지
      setTimeout(() => navigate('/profile'), 2000);
    }
  }, [isAuthenticated, currentUser, navigate]);

  // 구글 리디렉션 결과 처리
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        setDebugInfo('Google 리디렉션 처리 중...');
        const result = await getGoogleRedirectResult();
        
        if (result && result.user) {
          // 사용자가 리디렉션으로 로그인에 성공했을 때
          console.log('Google 리디렉션 회원가입 성공:', result.user);
          setDebugInfo(prev => `${prev}\nGoogle 로그인 성공: ${result.user.uid}`);
          
          // Firestore에 사용자 정보가 없으면 기본 정보로 저장
          const userDocRef = doc(db, 'users', result.user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // 기본 사용자 프로필 데이터 생성 (타입 단언 사용)
            const userProfileData = {
              uid: result.user.uid,
              displayName: result.user.displayName,
              email: result.user.email,
              photoURL: result.user.photoURL,
            } as UserProfile;
            
            await setDoc(userDocRef, userProfileData);
            toast.success('Google 계정으로 회원가입이 완료되었습니다.');
            setDebugInfo(prev => `${prev}\nFirestore에 사용자 정보 저장 완료`);
          }
          
          // 여기서는 navigate를 호출하지 않고 인증 상태 변경을 감지하는 useEffect에서 처리
        } else {
          setDebugInfo(prev => `${prev}\nGoogle 로그인 결과 없음`);
        }
      } catch (error: any) {
        console.error('리디렉션 결과 처리 오류:', error);
        toast.error('Google 로그인 처리 중 오류가 발생했습니다.');
        setDebugInfo(prev => `${prev}\n오류: ${error.message || '알 수 없는 오류'}`);
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, []);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setDebugInfo('Google 로그인 시작...');
    try {
      await signInWithGoogle();
      // 리디렉션 방식이므로 페이지가 새로고침됨
      // 추가 처리는 useEffect의 handleRedirectResult에서 처리됨
    } catch (error: any) {
      console.error('Google 회원가입 오류:', error);
      toast.error('Google 계정으로 회원가입 중 오류가 발생했습니다.');
      setDebugInfo(prev => `${prev}\n오류: ${error.message || '알 수 없는 오류'}`);
=======
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  // 비밀번호 강도 체크
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return '매우 약함';
      case 1: return '약함';
      case 2: return '보통';
      case 3: return '강함';
      case 4: return '매우 강함';
      default: return '';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // 사용자 프로필 기본 정보 저장
      const userProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      toast.success('구글 계정으로 가입되었습니다.');
      // 추가 정보 입력을 위한 개인화 페이지로 리다이렉트
      navigate('/profile/edit');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error('구글 로그인 중 오류가 발생했습니다.');
    } finally {
>>>>>>> master
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
=======
  const handleEmailPasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName || !email || !password || !confirmPassword) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }
    
>>>>>>> master
    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
<<<<<<< HEAD

    try {
      setLoading(true);
      setDebugInfo('이메일/비밀번호 회원가입 시작...');
      
      // 회원가입
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setDebugInfo(prev => `${prev}\n회원가입 성공: ${userCredential.user.uid}`);
=======
    
    try {
      setLoading(true);
      // Firebase 인증으로 사용자 계정 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
>>>>>>> master
      
      // 사용자 프로필 업데이트
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
<<<<<<< HEAD
      setDebugInfo(prev => `${prev}\n프로필 업데이트 완료`);

      // Firestore에 사용자 기본 정보 저장
      const userProfileData = {
        uid: userCredential.user.uid,
        displayName: displayName,
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL,
      } as UserProfile;
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfileData);
      setDebugInfo(prev => `${prev}\nFirestore에 사용자 정보 저장 완료`);

      toast.success('회원가입이 완료되었습니다.');
      
      // 회원가입 후 명시적으로 다시 로그인하여 인증 상태 확인
      await signInWithEmailAndPassword(auth, email, password);
      setDebugInfo(prev => `${prev}\n로그인 시도 완료`);
      
      // 인증 상태 변경을 감지하는 useEffect에서 리디렉션 처리
    } catch (error: any) {
      console.error('Error registering user:', error);
      setDebugInfo(prev => `${prev}\n오류: ${error.message || '알 수 없는 오류'}`);
      
=======

      // 기본 프로필 정보만 Firestore에 저장
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        displayName: displayName,
        email: userCredential.user.email || '',
        photoURL: userCredential.user.photoURL || '',
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

      toast.success('회원가입이 완료되었습니다.');
      // 추가 정보 입력을 위한 개인화 페이지로 리다이렉트
      navigate('/profile/edit');
    } catch (error: any) {
      console.error('Error registering user:', error);
>>>>>>> master
      if (error.code === 'auth/email-already-in-use') {
        toast.error('이미 사용 중인 이메일입니다.');
      } else {
        toast.error('회원가입 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              회원가입
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              이미 계정이 있으신가요?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                로그인하기
              </button>
            </p>
          </div>
          
<<<<<<< HEAD
          {/* 디버깅 정보 */}
          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
              <h3 className="font-bold mb-1">디버깅 정보:</h3>
              {debugInfo}
            </div>
          )}
          
          {/* 구글 회원가입 버튼 */}
=======
>>>>>>> master
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  간편 회원가입
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
<<<<<<< HEAD
                onClick={handleGoogleSignUp}
=======
                onClick={handleGoogleSignIn}
>>>>>>> master
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
<<<<<<< HEAD
                Google로 회원가입
=======
                구글 계정으로 계속하기
>>>>>>> master
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  또는 이메일로 회원가입
                </span>
              </div>
            </div>
<<<<<<< HEAD
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="display-name" className="sr-only">
=======
            
            <form className="mt-6 space-y-6" onSubmit={handleEmailPasswordSignUp}>
              <div>
                <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
>>>>>>> master
                  이름
                </label>
                <input
                  id="display-name"
                  name="displayName"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
<<<<<<< HEAD
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="이름"
                />
              </div>
              <div>
                <label htmlFor="email-address" className="sr-only">
=======
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="이름"
                />
              </div>
              
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
>>>>>>> master
                  이메일 주소
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="이메일 주소"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
=======
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="이메일 주소"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
>>>>>>> master
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
<<<<<<< HEAD
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="비밀번호"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">
=======
                  onChange={handlePasswordChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="비밀번호"
                />
                {password && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className={`h-2.5 rounded-full ${getPasswordStrengthColor()}`} style={{ width: `${passwordStrength * 25}%` }}></div>
                    </div>
                    <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                      비밀번호 강도: {getPasswordStrengthText()}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
>>>>>>> master
                  비밀번호 확인
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
<<<<<<< HEAD
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="비밀번호 확인"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                ) : null}
                {loading ? '처리 중...' : '회원가입'}
              </button>
            </div>
          </form>
=======
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="비밀번호 확인"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs mt-1 text-red-600">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </div>
              
              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {loading ? '처리 중...' : '회원가입'}
                </Button>
              </div>
            </form>
          </div>
>>>>>>> master
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage; 