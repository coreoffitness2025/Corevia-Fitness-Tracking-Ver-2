import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
// 네이티브 플러그인 import 및 웹 SDK import 제거
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import Button from '../common/Button';
import Card from '../common/Card';

const WorkoutGraph: React.FC = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { docs } = await FirebaseFirestore.getCollection({
          collection: 'workouts',
          queries: [
            { type: 'where', fieldPath: 'userId', operator: '==', value: user.uid },
            { type: 'orderBy', fieldPath: 'date', direction: 'asc' },
          ],
        });
        
        const formattedData = docs.map(doc => {
          const data = doc.data();
          // 데이터 포맷팅 로직 (예시)
          return {
            date: new Date(data.date.seconds * 1000).toLocaleDateString(),
            volume: data.exercises.reduce((acc, ex) => acc + (ex.sets * ex.reps * ex.weight), 0),
          };
        });
        setChartData(formattedData);
      } catch (error) {
        console.error("운동 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkoutData();
  }, [user]);

  // ... (JSX 렌더링 로직)
};

export default WorkoutGraph;