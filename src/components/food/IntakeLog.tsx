import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Food, WaterIntake, Supplement, IntakeRecord } from '../../types';
import { Calendar, ChevronLeft, ChevronRight, Utensils, Droplets, Pill, Clock, StickyNote } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';

interface IntakeLogProps {
  selectedDate?: Date;
}

const IntakeLog: React.FC<IntakeLogProps> = ({ selectedDate: propSelectedDate }) => {
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(propSelectedDate || new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [intakeRecords, setIntakeRecords] = useState<IntakeRecord[]>([]);

  // 날짜 포맷팅 함수
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 시간 포맷팅 함수
  const formatTime = (time: string) => {
    return time.slice(0, 5); // HH:mm 형태로 변환
  };

  // 날짜 변경 함수
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // 모든 섭취 기록을 로드하는 함수 (향후 IndexedDB와 연동)
  const loadIntakeRecords = async () => {
    if (!userProfile?.uid) return;

    setIsLoading(true);
    try {
      // 임시 더미 데이터 (실제로는 IndexedDB에서 가져올 예정)
      const mockRecords: IntakeRecord[] = [
        {
          type: 'food',
          data: {
            id: '1',
            userId: userProfile.uid,
            date: selectedDate,
            name: '닭가슴살 샐러드',
            calories: 350,
            protein: 30,
            carbs: 15,
            fat: 12,
            notes: '맛있었음'
          } as Food
        },
        {
          type: 'water',
          data: {
            id: '2',
            userId: userProfile.uid,
            date: selectedDate,
            amount: 500,
            time: '09:30',
            notes: '운동 후'
          } as WaterIntake
        },
        {
          type: 'supplement',
          data: {
            id: '3',
            userId: userProfile.uid,
            date: selectedDate,
            name: '멀티비타민',
            dosage: '1정',
            time: '08:00',
            type: 'vitamin',
            notes: '공복에 복용'
          } as Supplement
        }
      ];

      // 시간순으로 정렬
      const sortedRecords = mockRecords.sort((a, b) => {
        const getTime = (record: IntakeRecord) => {
          if (record.type === 'food') {
            return record.data.date.getHours() * 60 + record.data.date.getMinutes();
          } else if (record.type === 'water') {
            const [hours, minutes] = record.data.time.split(':').map(Number);
            return hours * 60 + minutes;
          } else if (record.type === 'supplement') {
            const [hours, minutes] = record.data.time.split(':').map(Number);
            return hours * 60 + minutes;
          }
          return 0;
        };

        return getTime(a) - getTime(b);
      });

      setIntakeRecords(sortedRecords);
    } catch (error) {
      console.error('섭취 기록 로드 오류:', error);
      toast.error('섭취 기록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIntakeRecords();
  }, [selectedDate, userProfile?.uid]);

  // 기록 타입별 아이콘과 색상
  const getRecordIcon = (type: IntakeRecord['type']) => {
    switch (type) {
      case 'food':
        return <Utensils size={20} className="text-orange-500" />;
      case 'water':
        return <Droplets size={20} className="text-blue-500" />;
      case 'supplement':
        return <Pill size={20} className="text-green-500" />;
    }
  };

  // 기록 타입별 배경색
  const getRecordBgColor = (type: IntakeRecord['type']) => {
    switch (type) {
      case 'food':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'water':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'supplement':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    }
  };

  // 기록 내용 렌더링
  const renderRecordContent = (record: IntakeRecord) => {
    switch (record.type) {
      case 'food':
        return (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{record.data.name}</h4>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">칼로리: {record.data.calories}kcal</span>
              <span className="text-gray-600 dark:text-gray-400">단백질: {record.data.protein}g</span>
              <span className="text-gray-600 dark:text-gray-400">탄수화물: {record.data.carbs}g</span>
              <span className="text-gray-600 dark:text-gray-400">지방: {record.data.fat}g</span>
            </div>
          </div>
        );
      case 'water':
        return (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">물 섭취</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {record.data.amount}ml
            </p>
          </div>
        );
      case 'supplement':
        return (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{record.data.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {record.data.dosage} ({record.data.type === 'vitamin' ? '비타민' : 
                                   record.data.type === 'mineral' ? '미네랄' :
                                   record.data.type === 'protein' ? '단백질' :
                                   record.data.type === 'preworkout' ? '운동 전' :
                                   record.data.type === 'postworkout' ? '운동 후' : '기타'})
            </p>
          </div>
        );
    }
  };

  // 시간 추출 함수
  const getRecordTime = (record: IntakeRecord) => {
    if (record.type === 'food') {
      return record.data.date.toTimeString().slice(0, 5);
    } else {
      return record.data.time;
    }
  };

  // 일일 요약 계산
  const getDailySummary = () => {
    const foodRecords = intakeRecords.filter(r => r.type === 'food') as Array<{ type: 'food'; data: Food }>;
    const waterRecords = intakeRecords.filter(r => r.type === 'water') as Array<{ type: 'water'; data: WaterIntake }>;
    const supplementRecords = intakeRecords.filter(r => r.type === 'supplement') as Array<{ type: 'supplement'; data: Supplement }>;

    const totalCalories = foodRecords.reduce((sum, record) => sum + record.data.calories, 0);
    const totalProtein = foodRecords.reduce((sum, record) => sum + record.data.protein, 0);
    const totalCarbs = foodRecords.reduce((sum, record) => sum + record.data.carbs, 0);
    const totalFat = foodRecords.reduce((sum, record) => sum + record.data.fat, 0);
    const totalWater = waterRecords.reduce((sum, record) => sum + record.data.amount, 0);

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      water: totalWater,
      supplements: supplementRecords.length
    };
  };

  const summary = getDailySummary();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* 날짜 선택 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => changeDate(-1)}
          icon={<ChevronLeft size={20} />}
        />
        
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {formatDate(selectedDate)}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            총 {intakeRecords.length}개 기록
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => changeDate(1)}
          icon={<ChevronRight size={20} />}
        />
      </div>

      {/* 일일 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">칼로리</p>
          <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">{summary.calories}kcal</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">물</p>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{summary.water}ml</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">단백질</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">{summary.protein}g</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">영양제</p>
          <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{summary.supplements}개</p>
        </div>
      </div>

      {/* 섭취 기록 목록 */}
      <div className="space-y-4">
        {intakeRecords.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">이 날짜에는 기록이 없습니다.</p>
          </div>
        ) : (
          intakeRecords.map((record, index) => (
            <div
              key={`${record.type}-${record.data.id}`}
              className={`p-4 rounded-lg border-2 ${getRecordBgColor(record.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getRecordIcon(record.type)}
                  <div className="flex-1">
                    {renderRecordContent(record)}
                    {record.data.notes && (
                      <div className="flex items-center gap-1 mt-2">
                        <StickyNote size={14} className="text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {record.data.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Clock size={14} />
                  {formatTime(getRecordTime(record))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 오늘로 이동 버튼 */}
      {selectedDate.toDateString() !== new Date().toDateString() && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => setSelectedDate(new Date())}
          >
            오늘로 이동
          </Button>
        </div>
      )}
    </div>
  );
};

export default IntakeLog; 