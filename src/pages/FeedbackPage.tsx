import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import Layout from '../components/common/Layout';

const partNames = {
  chest: '가슴',
  back: '등',
  shoulder: '어깨',
  leg: '하체'
};

const FeedbackPage = () => {
  const { part, mainExercise, getSuccessSets, resetSession } = useSessionStore();
  const navigate = useNavigate();

  if (!part || !mainExercise) {
    navigate('/');
    return null;
  }

  const successSets = getSuccessSets();
  const isAllSuccess = successSets === mainExercise.sets.length;
  const nextWeight = isAllSuccess ? mainExercise.weight + 2.5 : mainExercise.weight;

  const getFeedback = () => {
    if (isAllSuccess) {
      return '축하합니다! 모든 세트를 성공적으로 완료했습니다. 다음 세션에는 무게를 증가시켜보세요.';
    } else if (successSets >= 3) {
      return '좋은 퍼포먼스입니다! 대부분의 세트를 성공했습니다. 다음 세션에서도 같은 무게로 도전해보세요.';
    } else if (successSets >= 1) {
      return '몇 세트를 성공했습니다. 다음 세션에서도 같은 무게로 도전하고 더 많은 세트를 성공해보세요.';
    } else {
      return '이번 세션에서는 모든 세트를 완료하지 못했습니다. 다음 세션에서는 무게를 줄이는 것을 고려해보세요.';
    }
  };

  const handleFinish = () => {
    resetSession();
    navigate('/');
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          피드백
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('ko-KR')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className={`p-4 mb-6 rounded-lg ${
          isAllSuccess ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'
        }`}>
          <h2 className={`text-xl font-semibold mb-2 ${
            isAllSuccess ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'
          }`}>
            {isAllSuccess ? '🎉 완벽한 세션!' : '🔥 노력하는 중!'}
          </h2>
          <p className={
            isAllSuccess ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'
          }>
            {getFeedback()}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
            세션 요약
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">운동 부위</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {partNames[part]}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">무게</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {mainExercise.weight} kg
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">성공 세트</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {successSets} / {mainExercise.sets.length}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
            다음 목표
          </h3>

          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <p className="text-blue-700 dark:text-blue-300">
              다음 {partNames[part]} 운동 세션에서는 <strong>{nextWeight} kg</strong>으로 도전해보세요!
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleFinish}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          완료
        </button>
      </div>
    </Layout>
  );
};

export default FeedbackPage;
