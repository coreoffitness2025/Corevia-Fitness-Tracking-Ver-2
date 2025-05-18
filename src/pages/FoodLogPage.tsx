import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '../components/common/Layout';

interface FoodLog {
  id: string;
  date: string;
  time: string;
  imageData: string;
  timestamp: number;
}

const STORAGE_KEY = 'foodLogs';

export default function FoodLogPage() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeInput, setTimeInput] = useState('');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  // 데이터 로딩
  useEffect(() => {
    const logs = getFoodLogsByViewMode();
    setFoodLogs(logs);
  }, [selectedDate, viewMode]);

  // 뷰 모드별 데이터 가져오기
  const getFoodLogsByViewMode = (): FoodLog[] => {
    try {
      const allLogs = localStorage.getItem(STORAGE_KEY);
      if (!allLogs) return [];
      
      const parsed = JSON.parse(allLogs) as FoodLog[];
      
      if (viewMode === 'day') {
        return parsed.filter(log => log.date === selectedDate);
      } else if (viewMode === 'week') {
        const startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - 6);
        return parsed.filter(log => {
          const logDate = new Date(log.date);
          return logDate >= startDate && logDate <= new Date(selectedDate);
        });
      } else if (viewMode === 'month') {
        const [year, month] = selectedDate.split('-');
        return parsed.filter(log => {
          const [logYear, logMonth] = log.date.split('-');
          return logYear === year && logMonth === month;
        });
      }
      return [];
    } catch (error) {
      console.error('음식 로그 로드 실패:', error);
      return [];
    }
  };

  // 음식 로그 저장
  const saveFoodLog = (imageData: string) => {
    try {
      if (!timeInput) {
        toast.error('시간을 입력해주세요!');
        return;
      }

      const allLogs = localStorage.getItem(STORAGE_KEY);
      const logs = allLogs ? JSON.parse(allLogs) : [];
      
      const newLog: FoodLog = {
        id: Date.now().toString(),
        date: selectedDate,
        time: timeInput,
        imageData,
        timestamp: Date.now()
      };
      
      logs.push(newLog);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      
      // UI 업데이트
      setFoodLogs(prev => [...prev, newLog]);
      toast.success('음식 기록이 저장되었습니다!');
      setTimeInput(''); // 시간 입력 초기화
    } catch (error) {
      console.error('음식 로그 저장 실패:', error);
      toast.error('저장에 실패했습니다.');
    }
  };

  // 음식 로그 삭제
  const deleteFoodLog = (id: string) => {
    try {
      const allLogs = localStorage.getItem(STORAGE_KEY);
      if (!allLogs) return;
      
      const logs = JSON.parse(allLogs);
      const updatedLogs = logs.filter((log: FoodLog) => log.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
      
      setFoodLogs(logs => logs.filter(log => log.id !== id));
      toast.success('삭제되었습니다.');
    } catch (error) {
      console.error('음식 로그 삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  // 이미지 처리
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          saveFoodLog(reader.result);
        }
      };
      reader.onerror = () => {
        toast.error('이미지 처리에 실패했습니다.');
      };
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  // 그룹화된 날짜별 로그 가져오기
  const getGroupedLogs = () => {
    return foodLogs.reduce((acc: Record<string, FoodLog[]>, log) => {
      if (!acc[log.date]) {
        acc[log.date] = [];
      }
      acc[log.date].push(log);
      return acc;
    }, {});
  };

  const groupedLogs = viewMode !== 'day' ? getGroupedLogs() : {};

  return (
    <Layout>
      <Toaster position="top-center" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          식단 기록
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          음식을 사진으로 기록해보세요
        </p>
      </div>

      {/* 뷰 모드 선택 */}
      <div className="flex gap-2 mb-4">
        {(['day', 'week', 'month'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-lg ${
              viewMode === mode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {mode === 'day' && '일별'}
            {mode === 'week' && '1주일'}
            {mode === 'month' && '한달'}
          </button>
        ))}
      </div>

      {/* 날짜 선택 */}
      <div className="flex items-center gap-2 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={today}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 
                   focus:ring-blue-500"
        />
      </div>

      {/* 일별 보기일 때만 업로드 UI 표시 */}
      {viewMode === 'day' && (
        <>
          {/* 시간 입력 */}
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <input
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 
                       focus:ring-blue-500"
              placeholder="식사 시간"
            />
          </div>

          {/* 업로드 버튼 */}
          <div className="flex gap-3 mb-6">
            <label className="flex-1">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isLoading}
              />
              <div className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed 
                      ${isLoading ? 'border-gray-300 cursor-not-allowed opacity-50' : 'border-blue-500 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900'} 
                      dark:border-blue-400`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-blue-600 font-medium dark:text-blue-400">
                  {isLoading ? '처리 중...' : '사진 찍기'}
                </span>
              </div>
            </label>

            <label className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isLoading}
              />
              <div className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed 
                      ${isLoading ? 'border-gray-300 cursor-not-allowed opacity-50' : 'border-green-500 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900'} 
                      dark:border-green-400`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-green-600 font-medium dark:text-green-400">
                  {isLoading ? '처리 중...' : '갤러리에서 선택'}
                </span>
              </div>
            </label>
          </div>
        </>
      )}

      {/* 로그 표시 */}
      {viewMode === 'day' ? (
        <div className="grid grid-cols-1 gap-4">
          {foodLogs.map((log, index) => (
            <div key={log.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">식사 {index + 1}</span>
                <button
                  onClick={() => deleteFoodLog(log.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <img
                src={log.imageData}
                alt="음식 사진"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLogs)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
              .map(([date, logs]) => (
              <div key={date} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    {new Date(date).toLocaleDateString('ko-KR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </h3>
                <div className="grid grid-cols-1 gap-4">
                  {logs.map((log, index) => (
                    <div key={log.id} className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 dark:text-gray-400">식사 {index + 1}</span>
                        <button
                          onClick={() => deleteFoodLog(log.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                        <img
                          src={log.imageData}
                        alt="음식 사진"
                        className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
            ))}
        </div>
      )}
    </Layout>
  );
}
