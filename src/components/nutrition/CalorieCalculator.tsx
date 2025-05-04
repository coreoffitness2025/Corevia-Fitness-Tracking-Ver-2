import { UserProfile } from '../../types';

interface CalorieCalculatorProps {
  userProfile: UserProfile;
  onComplete?: (result: any) => Promise<void>;
}

const CalorieCalculator = ({ userProfile, onComplete }: CalorieCalculatorProps) => {
  // 칼로리 계산 로직
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">칼로리 계산기</h2>
      {/* 계산 결과 표시 */}
    </div>
  );
};

export default CalorieCalculator;
