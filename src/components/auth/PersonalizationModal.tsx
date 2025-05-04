import { useState } from 'react';
import { UserProfile } from '../../types';

interface PersonalizationModalProps {
  onClose: () => void;
  onSave: (profile: UserProfile['profile']) => void;
}

const PersonalizationModal = ({ onClose, onSave }: PersonalizationModalProps) => {
  const [profile, setProfile] = useState<UserProfile['profile']>({
    height: 170,
    weight: 70,
    age: 25,
    gender: 'male',
    experience: {
      years: 0,
      level: 'beginner',
      squat: {
        maxWeight: 0,
        maxReps: 0
      }
    }
  });

  const calculateExperienceLevel = (years: number, squat: { maxWeight: number, maxReps: number }) => {
    if (years < 1 || squat.maxWeight < 60) return 'beginner';
    if (years < 3 || squat.maxWeight < 100) return 'intermediate';
    return 'advanced';
  };

  const handleSave = () => {
    const level = calculateExperienceLevel(profile.experience.years, profile.experience.squat);
    onSave({ ...profile, experience: { ...profile.experience, level } });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">개인 정보 입력</h2>
        
        <div className="space-y-4">
          {/* 신체 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">키 (cm)</label>
              <input
                type="number"
                value={profile.height}
                onChange={(e) => setProfile({...profile, height: Number(e.target.value)})}
                className="w-full p-2 border rounded"
                min="100"
                max="250"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">몸무게 (kg)</label>
              <input
                type="number"
                value={profile.weight}
                onChange={(e) => setProfile({...profile, weight: Number(e.target.value)})}
                className="w-full p-2 border rounded"
                min="30"
                max="200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">나이</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({...profile, age: Number(e.target.value)})}
                className="w-full p-2 border rounded"
                min="13"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">성별</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({...profile, gender: e.target.value as 'male' | 'female'})}
                className="w-full p-2 border rounded"
              >
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </div>
          </div>

          {/* 운동 경력 */}
          <div>
            <label className="block text-sm font-medium mb-1">운동 경력 (년)</label>
            <input
              type="number"
              value={profile.experience.years}
              onChange={(e) => setProfile({
                ...profile,
                experience: {
                  ...profile.experience,
                  years: Number(e.target.value)
                }
              })}
              className="w-full p-2 border rounded"
              min="0"
              max="50"
            />
          </div>

          {/* 스쿼트 기록 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">스쿼트 기록</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">최대 중량 (kg)</label>
                <input
                  type="number"
                  value={profile.experience.squat.maxWeight}
                  onChange={(e) => setProfile({
                    ...profile,
                    experience: {
                      ...profile.experience,
                      squat: {
                        ...profile.experience.squat,
                        maxWeight: Number(e.target.value)
                      }
                    }
                  })}
                  className="w-full p-2 border rounded"
                  min="0"
                  max="300"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">최대 횟수</label>
                <input
                  type="number"
                  value={profile.experience.squat.maxReps}
                  onChange={(e) => setProfile({
                    ...profile,
                    experience: {
                      ...profile.experience,
                      squat: {
                        ...profile.experience.squat,
                        maxReps: Number(e.target.value)
                      }
                    }
                  })}
                  className="w-full p-2 border rounded"
                  min="0"
                  max="50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationModal; 