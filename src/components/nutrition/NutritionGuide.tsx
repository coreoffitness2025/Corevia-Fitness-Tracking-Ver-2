import { useAuth } from '../../contexts/AuthContext';
import CalorieCalculator from './CalorieCalculator';
import FoodLog from './FoodLog';
import NutritionTips from './NutritionTips';

const NutritionGuide = () => {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <CalorieCalculator userProfile={userProfile} />
      <FoodLog />
      <NutritionTips />
    </div>
  );
};

export default NutritionGuide;
