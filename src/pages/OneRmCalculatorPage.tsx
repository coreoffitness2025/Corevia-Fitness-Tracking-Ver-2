import React from 'react';
import Layout from '../components/common/Layout';
import OneRepMaxCalculator from '../components/1rmcalculator/OneRepMaxCalculator';
import WorkoutWeightGuide from '../components/workout/WorkoutWeightGuide';

const OneRmCalculatorPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            1RM 계산기 및 운동 무게 추천
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            최대 반복 횟수(1RM)를 계산하고 운동 목적에 맞는 무게를 추천받으세요
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <OneRepMaxCalculator />
          </div>
          <div>
            <WorkoutWeightGuide />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OneRmCalculatorPage; 