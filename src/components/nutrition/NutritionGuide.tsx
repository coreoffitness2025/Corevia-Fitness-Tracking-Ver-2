import { useAuth } from '../../contexts/AuthContext';
import CalorieCalculator from './CalorieCalculator';
import FoodLog from './FoodLog';

const NutritionGuide = () => {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">프로필을 완성하면 영양 가이드를 사용할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CalorieCalculator userProfile={userProfile} />
      <FoodLog />
    </div>
  );
};

export default NutritionGuide;
