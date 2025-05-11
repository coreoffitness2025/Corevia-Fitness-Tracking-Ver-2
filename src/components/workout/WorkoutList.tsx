import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { UserProfile } from '../../types/UserProfile';

const WorkoutList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  
  // 년도와 월 상태 추가
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  
  // 선택된 년도와 월에 따라 달력 데이터 생성
  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  
  // 이전/다음 달 이동 함수
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // 특정 년도/월로 이동하는 함수
  const goToSelectedMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };
  
  // 년도 옵션 생성 (현재 년도 기준 ±5년)
  const yearOptions = Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i);
  
  // 월 옵션 생성
  const monthOptions = [
    { value: 0, label: '1월' },
    { value: 1, label: '2월' },
    { value: 2, label: '3월' },
    { value: 3, label: '4월' },
    { value: 4, label: '5월' },
    { value: 5, label: '6월' },
    { value: 6, label: '7월' },
    { value: 7, label: '8월' },
    { value: 8, label: '9월' },
    { value: 9, label: '10월' },
    { value: 10, label: '11월' },
    { value: 11, label: '12월' }
  ];
  
  // 임시 데이터 (나중에 실제 데이터로 교체)
  // ... existing code ...

  // 달력 연도/월 표시 수정
  const monthYearText = new Date(currentYear, currentMonth).toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long' 
  });
  
  // ... existing code ...
  
  // 운동 부위에 따른 색상 지정 - 성공/실패 색상 더 명확하게 구분
  const getPartColor = (part: ExercisePart, isSuccess: boolean = true) => {
    const baseColors = {
      chest: isSuccess ? 'bg-blue-200 text-blue-800 border-blue-400' : 'bg-red-200 text-red-800 border-red-400',
      back: isSuccess ? 'bg-green-200 text-green-800 border-green-400' : 'bg-red-200 text-red-800 border-red-400',
      shoulder: isSuccess ? 'bg-purple-200 text-purple-800 border-purple-400' : 'bg-red-200 text-red-800 border-red-400',
      leg: isSuccess ? 'bg-orange-200 text-orange-800 border-orange-400' : 'bg-red-200 text-red-800 border-red-400'
    };
    return baseColors[part];
  };

  // 프로필 업데이트 함수 수정
  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      console.log('프로필 업데이트 시작', profile);
      
      // 이전 프로필 데이터 가져오기
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const previousData = userDoc.exists() ? userDoc.data() as UserProfile : null;
      
      // 새 데이터 병합 (중첩된 객체도 올바르게 병합)
      const updatedProfile = deepMerge(
        previousData || defaultProfile,
        profile
      );
      
      // 필수 사용자 정보 유지
      updatedProfile.uid = currentUser.uid;
      if (currentUser.displayName) updatedProfile.displayName = currentUser.displayName;
      if (currentUser.email) updatedProfile.email = currentUser.email;
      if (currentUser.photoURL) updatedProfile.photoURL = currentUser.photoURL;
      
      // 키, 몸무게, 활동 수준 등에 따라 목표 칼로리 계산
      if (profile.height || profile.weight || profile.activityLevel || profile.gender || profile.age) {
        const targetCalories = calculateTargetCalories(
          updatedProfile.height,
          updatedProfile.weight,
          updatedProfile.age,
          updatedProfile.gender,
          updatedProfile.activityLevel,
          updatedProfile.fitnessGoal
        );
        updatedProfile.targetCalories = targetCalories;
      }
      
      // Firestore에 전체 업데이트된 프로필 저장
      await setDoc(userDocRef, updatedProfile, { merge: true });
      
      // 로컬 상태 업데이트
      setUserProfile(updatedProfile);
      console.log('프로필 업데이트 완료', updatedProfile);
      
      // 이벤트 발생 - 다른 컴포넌트에게 프로필 업데이트 알림
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
        detail: { profile: updatedProfile } 
      }));
      
    } catch (err) {
      console.error('프로필 업데이트 오류:', err);
      setError(err instanceof Error ? err.message : '프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 목표 칼로리 계산 함수
  const calculateTargetCalories = (
    height: number,
    weight: number,
    age: number,
    gender: 'male' | 'female',
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive',
    fitnessGoal: 'lose' | 'maintain' | 'gain'
  ): number => {
    // 기초 대사량(BMR) 계산 - 해리스-베네딕트 공식
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    // 활동 계수
    const activityFactors = {
      sedentary: 1.2,    // 거의 운동 안함
      light: 1.375,      // 가벼운 운동 (주 1-3회)
      moderate: 1.55,    // 중간 정도 운동 (주 3-5회)
      active: 1.725,     // 활발한 운동 (주 6-7회)
      veryActive: 1.9    // 매우 활발한 운동 (하루 2회 이상)
    };
    
    // 일일 필요 칼로리 (TDEE)
    const tdee = bmr * activityFactors[activityLevel];
    
    // 목표에 따른 조정
    const goalFactors = {
      lose: 0.8,        // 체중 감량 (20% 적게)
      maintain: 1.0,     // 체중 유지
      gain: 1.15         // 체중 증가 (15% 많게)
    };
    
    return Math.round(tdee * goalFactors[fitnessGoal]);
  };

  // 객체 깊은 병합 함수
  const deepMerge = (target: any, source: any) => {
    const output = Object.assign({}, target);
    
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  };

  const isObject = (item: any) => {
    return (item && typeof item === 'object' && !Array.isArray(item));
  };

  return (
    <div className="space-y-6">
      {/* 달력 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">운동 달력</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 년도 선택기 */}
            <select 
              value={currentYear}
              onChange={(e) => goToSelectedMonth(parseInt(e.target.value), currentMonth)}
              className="py-1 px-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
            
            {/* 월 선택기 */}
            <select 
              value={currentMonth}
              onChange={(e) => goToSelectedMonth(currentYear, parseInt(e.target.value))}
              className="py-1 px-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
            >
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            
            {/* 이전/다음 월 버튼 */}
            <div className="flex items-center space-x-1">
              <button 
                onClick={goToPreviousMonth}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <button 
                onClick={goToNextMonth}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-4 grid grid-cols-7 gap-1">
          {/* 요일 헤더 */}
          {weekdays.map((weekday, i) => (
            <div 
              key={`weekday-${i}`} 
              className={`text-center py-2 text-sm font-medium ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {weekday}
            </div>
          ))}
          
          {/* 날짜 */}
          {calendarDays.map((day, i) => {
            const dateStr = formatDate(day);
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isToday = dateStr === formatDate(new Date());
            const isSelected = dateStr === selectedDate;
            const dayWorkouts = workoutsByDate[dateStr] || [];
            const hasWorkout = dayWorkouts.length > 0;
            
            return (
              <div 
                key={`day-${i}`} 
                onClick={() => setSelectedDate(dateStr)}
                className={`relative p-2 min-h-[60px] text-center cursor-pointer border rounded-lg
                  ${isCurrentMonth ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-40'}
                  ${isToday ? 'border-blue-500' : 'border-transparent'}
                  ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
              >
                <span className={`text-sm ${
                  day.getDay() === 0 ? 'text-red-500' : 
                  day.getDay() === 6 ? 'text-blue-500' : 
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  {day.getDate()}
                </span>
                
                {/* 운동 마커 - 성공/실패 색상 구분 강화 */}
                {hasWorkout && (
                  <div className="mt-1 flex flex-col gap-1">
                    {dayWorkouts.map((workout, j) => {
                      // 주요 정보 추출
                      const mainExerciseWeight = workout.mainExercise.weight;
                      const partLabel = getPartLabel(workout.part);
                      const statusLabel = workout.isAllSuccess ? '성공' : '실패';
                      
                      return (
                        <div 
                          key={`workout-${j}`} 
                          className={`text-xs px-1 py-0.5 rounded-sm border truncate ${getPartColor(workout.part, workout.isAllSuccess)}`}
                          title={`${partLabel} - ${workout.mainExercise.name} ${mainExerciseWeight}kg - ${statusLabel}`}
                        >
                          <span className="font-medium">{partLabel}</span>
                          <span className="mx-1">-</span>
                          <span>{mainExerciseWeight}kg</span>
                          <span className={`ml-1 font-bold ${workout.isAllSuccess ? 'text-green-700' : 'text-red-700'}`}>
                            {workout.isAllSuccess ? '✓' : '✗'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 선택된 날짜 표시 */}
      {/* ... existing code ... */}
    </div>
  );
};

// 현재 달의 날짜 배열 생성
const generateCalendarDays = (year: number, month: number) => {
  // 선택된 달의 첫째 날
  const firstDay = new Date(year, month, 1);
  // 선택된 달의 마지막 날
  const lastDay = new Date(year, month + 1, 0);
  
  // 달력 시작일 (이전 달의 일부 포함)
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());
  
  // 달력 종료일 (다음 달의 일부 포함)
  const endDate = new Date(lastDay);
  const daysToAdd = 6 - lastDay.getDay();
  endDate.setDate(lastDay.getDate() + daysToAdd);
  
  const days = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

export default WorkoutList; 