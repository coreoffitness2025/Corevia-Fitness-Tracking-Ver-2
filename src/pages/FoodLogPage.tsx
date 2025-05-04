import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { Camera, Upload, Trash2, Calendar } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface FoodLog {
  id: string;
  date: string;
  imageData: string; // base64 형태의 이미지 데이터
  timestamp: number;
}

const STORAGE_KEY = 'foodLogs';

export default function FoodLogPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 로컬 스토리지에서 로그 불러오기
  useEffect(() => {
    const logs = getFoodLogs(selectedDate);
    setFoodLogs(logs);
  }, [selectedDate]);

  // 로컬 스토리지에서 해당 날짜의 음식 로그 가져오기
  const getFoodLogs = (date: string): FoodLog[] => {
    try {
      const allLogs = localStorage.getItem(STORAGE_KEY);
      if (!allLogs) return [];
      
      const parsed = JSON.parse(allLogs);
      return parsed.filter((log: FoodLog) => log.date === date);
    } catch (error) {
      console.error('음식 로그 로드 실패:', error);
      return [];
    }
  };

  // 음식 로그 저장
  const saveFoodLog = (imageData: string) => {
    try {
      const allLogs = localStorage.getItem(STORAGE_KEY);
      const logs = allLogs ? JSON.parse(allLogs) : [];
      
      const newLog: FoodLog = {
        id: Date.now().toString(),
        date: selectedDate,
        imageData,
        timestamp: Date.now()
      };
      
      logs.push(newLog);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      
      // 즉시 UI 업데이트
      setFoodLogs([...foodLogs, newLog]);
      toast.success('음식 기록이 저장되었습니다!');
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
      
      // UI 업데이트
      setFoodLogs(foodLogs.filter(log => log.id !== id));
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
      // 이미지를 base64로 변환
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
      // 파일 입력 초기화
      event.target.value = '';
    }
  };

  return (
    <Layout>
      <Toaster position="top-center" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          식단 기록
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          오늘 먹은 음식을 사진으로 기록해보세요
        </p>
      </div>

      {/* 날짜 선택 */}
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 
                   focus:ring-blue-500"
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
            <Camera className="w-5 h-5 text-blue-500 dark:text-blue-400" />
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
            <Upload className="w-5 h-5 text-green-500 dark:text-green-400" />
            <span className="text-green-600 font-medium dark:text-green-400">
              {isLoading ? '처리 중...' : '앨범에서 선택'}
            </span>
          </div>
        </label>
      </div>

      {/* 음식 이미지 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {foodLogs.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            {selectedDate === new Date().toISOString().split('T')[0] 
              ? '오늘 먹은 음식을 기록해보세요' 
              : '이 날짜에 기록된 음식이 없습니다'}
          </div>
        ) : (
          foodLogs.map(log => (
            <div key={log.id} className="relative group">
              <img
                src={log.imageData}
                alt={`${log.date} 음식`}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <button
                onClick={() => deleteFoodLog(log.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full 
                         opacity-0 group-hover:opacity-100 transition-opacity
                         text-white hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                {new Date(log.timestamp).toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
