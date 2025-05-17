import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { WorkoutGuideInfo } from '../../types/index';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { toast } from 'react-hot-toast';
import { Settings } from 'lucide-react';

const WorkoutGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [guideInfo, setGuideInfo] = useState<WorkoutGuideInfo>({
    gender: userProfile?.gender || 'male',
    age: userProfile?.age || 30,
    weight: userProfile?.weight || 70,
    experience: userProfile?.experience?.level || 'beginner',
    trainingYears: userProfile?.experience?.years || 0,
    oneRepMaxes: {
      squat: userProfile?.oneRepMax?.squat || 0,
      deadlift: userProfile?.oneRepMax?.deadlift || 0,
      bench: userProfile?.oneRepMax?.bench || 0,
      overheadPress: userProfile?.oneRepMax?.overheadPress || 0,
    },
    preferredSetConfig: userProfile?.setConfiguration?.preferredSetup || '10x5',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setGuideInfo((prev: WorkoutGuideInfo) => {
        const parentObj = prev[parent as keyof WorkoutGuideInfo] || {};
        // 타입 안전을 위해 객체인지 확인
        const parentValue = typeof parentObj === 'object' && parentObj !== null ? parentObj : {};
        
        return {
          ...prev,
          [parent]: {
            ...parentValue,
            [child]: name.includes('oneRepMaxes') ? Number(value) : value
          }
        };
      });
    } else {
      setGuideInfo((prev: WorkoutGuideInfo) => ({
        ...prev,
        [name]: name === 'age' || name === 'weight' || name === 'trainingYears' ? Number(value) : value
      }));
    }
  };

  // 개인화 설정에 적용하는 함수
  const applyToProfile = async () => {
    if (!currentUser) return;
    
    try {
      console.log('세트 설정 적용 시작:', guideInfo.preferredSetConfig);
      
      // 1. 세트 구성 업데이트
      const setConfiguration = {
        preferredSetup: guideInfo.preferredSetConfig,
        customSets: 0,
        customReps: 0
      };
      
      // 세트 구성에 따라 적절한 세트 수와 반복 횟수 설정
      switch (guideInfo.preferredSetConfig) {
        case '5x5':
          // 5회 5세트 (근력-근비대 균형)
          setConfiguration.customSets = 5;
          setConfiguration.customReps = 5;
          break;
        case '6x3':
          // 6회 3세트 (근력 향상 - 스트렝스 초점)
          setConfiguration.customSets = 3;
          setConfiguration.customReps = 6;
          break;
        case '10x5':
          // 10회 5세트 (근비대-보디빌딩 초점)
          setConfiguration.customSets = 5;
          setConfiguration.customReps = 10;
          break;
        case '15x5':
          // 15회 5세트 (근육 성장 자극)
          setConfiguration.customSets = 5;
          setConfiguration.customReps = 15;
          break;
        default:
          // 기본값: 10회 5세트
          setConfiguration.customSets = 5;
          setConfiguration.customReps = 10;
      }
      
      console.log('설정할 세트 구성:', setConfiguration);
      
      // 2. 업데이트할 프로필 정보
      const profileUpdate: Partial<UserProfile> = {
        setConfiguration
      };
      
      // 경험 정보가 있으면 추가
      if (userProfile?.experience) {
        profileUpdate.experience = {
          ...userProfile.experience,
          level: guideInfo.experience
        };
      }
      
      // 1. Firebase 사용자 프로필 업데이트 - 영구 저장
      console.log('프로필 업데이트 직전:', profileUpdate);
      await updateProfile(profileUpdate);
      console.log('프로필 업데이트 완료');
      
      // 2. 로컬 스토리지에 간단히 저장 - 세션 지속
      // 이전 키 데이터 삭제 후 새 설정 저장
      localStorage.removeItem('lastSetConfiguration'); // 이전 키 삭제
      localStorage.removeItem('lastSetConfigurationChecked'); // 이전 관련 키 삭제
      localStorage.setItem('userSetConfiguration', JSON.stringify(setConfiguration));
      console.log('세트 설정을 로컬 스토리지에 저장 완료:', setConfiguration);
      
      // 성공 메시지
      toast.success('세트 설정이 저장되었습니다', {
        duration: 3000,
        position: 'top-center'
      });
      
      // 설정 페이지로 이동
      navigate('/settings');
    } catch (error) {
      console.error('프로필 업데이트 중 오류 발생:', error);
      toast.error('설정 적용 중 오류가 발생했습니다');
    }
  };

  const renderSetConfig = () => (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">메인 운동 세트 설정</h2>
      
      <div className="space-y-6">
        <div>
          <label className="flex items-center p-4 border rounded-md mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <input
              type="radio"
              name="preferredSetConfig"
              value="5x5"
              checked={guideInfo.preferredSetConfig === '5x5'}
              onChange={handleInputChange}
              className="mr-3"
            />
            <div>
              <h3 className="font-medium">5x5세트 (5회 5세트)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">근력과 근비대 균형</p>
            </div>
          </label>
          
          <div className="ml-6 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <ul className="list-disc ml-5 space-y-1">
              <li>근력과 근비대 균형에 최적화된 구성</li>
              <li>초보자부터 중급자까지 적합한 세트 구성</li>
              <li>기초 근력을 키우면서 적절한 부피 확보 가능</li>
              <li>무게 증가에 집중하기 좋은 반복 횟수</li>
              <li>주요 복합 운동(스쿼트, 데드리프트, 벤치프레스 등)에 이상적</li>
            </ul>
          </div>
        </div>
        
        <div>
          <label className="flex items-center p-4 border rounded-md mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <input
              type="radio"
              name="preferredSetConfig"
              value="10x5"
              checked={guideInfo.preferredSetConfig === '10x5'}
              onChange={handleInputChange}
              className="mr-3"
            />
            <div>
              <h3 className="font-medium">10x5세트 (10회 5세트)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">근비대-보디빌딩 초점</p>
            </div>
          </label>
          
          <div className="ml-6 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <ul className="list-disc ml-5 space-y-1">
              <li>근비대(muscle hypertrophy)에 최적화된 구성</li>
              <li>중량과 볼륨 사이의 균형이 좋음</li>
              <li>근육의 모세혈관화를 촉진</li>
              <li>대사 스트레스(metabolic stress)를 적절히 유발하여 근육 성장 자극</li>
            </ul>
          </div>
        </div>
        
        <div>
          <label className="flex items-center p-4 border rounded-md mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <input
              type="radio"
              name="preferredSetConfig"
              value="6x3"
              checked={guideInfo.preferredSetConfig === '6x3'}
              onChange={handleInputChange}
              className="mr-3"
            />
            <div>
              <h3 className="font-medium">6x3세트 (6회 3세트)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">근력 향상 - 스트렝스 초점</p>
            </div>
          </label>
          
          <div className="ml-6 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <ul className="list-disc ml-5 space-y-1">
              <li>근력 향상에 중점을 둔 구성</li>
              <li>중추신경계 활성화 및 신경근 효율성 개선</li>
              <li>빠른 회복으로 더 자주 같은 운동을 반복할 수 있음</li>
              <li>관절 부담이 상대적으로 적음 (세트당 반복 횟수가 적어서)</li>
              <li>근육의 고밀도 섬유(fast-twitch fiber) 자극에 효과적</li>
            </ul>
          </div>
        </div>
        
        <div>
          <label className="flex items-center p-4 border rounded-md mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <input
              type="radio"
              name="preferredSetConfig"
              value="15x5"
              checked={guideInfo.preferredSetConfig === '15x5'}
              onChange={handleInputChange}
              className="mr-3"
            />
            <div>
              <h3 className="font-medium">15x5세트 (15회 5세트)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">근육 성장 자극</p>
            </div>
          </label>
          
          <div className="ml-6 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <ul className="list-disc ml-5 space-y-1">
              <li>근지구력 향상에 탁월</li>
              <li>젖산 내성 증가</li>
              <li>더 많은 혈류 제한 효과로 인한 근육 성장 자극</li>
              <li>느린 근섬유(slow-twitch fiber) 발달에 효과적</li>
              <li>관절과 인대의 강화</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => navigate('/settings')}>
          이전
        </Button>
        <Button variant="primary" onClick={applyToProfile}>
          적용하기
        </Button>
      </div>
    </Card>
  );

  return (
    <Layout
      header={
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">메인 운동 세트 설정</h1>
            <Link 
              to="/settings" 
              className="text-blue-600 dark:text-blue-400 flex items-center gap-1"
            >
              <Settings size={16} />
              <span>설정</span>
            </Link>
          </div>
        </div>
      }
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          메인 운동 세트 설정
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          원하는 운동 세트 구성을 선택하면 앞으로 입력하는 운동에 세트가 자동으로 설정됩니다.
        </p>
      </div>
      
      {renderSetConfig()}
    </Layout>
  );
};

export default WorkoutGuidePage; 