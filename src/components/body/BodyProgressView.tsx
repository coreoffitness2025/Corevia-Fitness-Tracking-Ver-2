import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getBodyPhotoRecords, getBodyPhotoImage, BodyPhotoRecord } from '../../services/bodyService';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Camera, Scale, TrendingUp, Calendar, Info, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { WeightRecord, getWeightHistory } from '../../services/weightService';

interface BodyProgressViewProps {
  onClose?: () => void;
}

// 날짜 필터 타입 추가
type DateFilter = 'daily' | 'weekly' | 'monthly';
type WeightPeriodFilter = '1month' | '3months' | '6months' | '1year' | 'all';

const BodyProgressView: React.FC<BodyProgressViewProps> = ({ onClose }) => {
  const { userProfile } = useAuth();
  const [bodyPhotos, setBodyPhotos] = useState<BodyPhotoRecord[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>([]);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    record: BodyPhotoRecord;
  } | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('daily');
  const [weightPeriodFilter, setWeightPeriodFilter] = useState<WeightPeriodFilter>('all');

  useEffect(() => {
    if (userProfile?.uid) {
      loadBodyProgressData();
    }
  }, [userProfile?.uid]);

  const loadBodyProgressData = async () => {
    if (!userProfile?.uid) return;

    setIsLoading(true);
    try {
      // Firebase에서 체중 기록 불러오기
      await loadWeightHistory();
      
      // IndexedDB에서 신체 사진 기록 불러오기
      await loadBodyPhotos();
    } catch (error) {
      console.error('신체 변화 데이터 로드 오류:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWeightHistory = async () => {
    if (!userProfile?.uid) return;
    
    try {
      const history = await getWeightHistory(userProfile.uid);
      setWeightHistory(history);
      console.log(`${history.length}개의 체중 기록을 로드했습니다.`);
    } catch (error) {
      console.error('체중 기록 로드 오류:', error);
    }
  };

  const loadBodyPhotos = async () => {
    if (!userProfile?.uid) return;
    
    try {
      const photos = await getBodyPhotoRecords(userProfile.uid);
      setBodyPhotos(photos);
      
      // 하이브리드 방식으로 이미지 로드
      const newCache = await loadImages(photos);
      setImageCache(prevCache => ({ ...prevCache, ...newCache }));
      
      console.log(`${photos.length}개의 바디 체크 사진을 로드했습니다.`);
    } catch (error) {
      console.error('바디 체크 사진 로드 오류:', error);
    }
  };

  const loadImages = async (photos: BodyPhotoRecord[]) => {
    const newImageCache: Record<string, string> = {};
    
    for (const photo of photos) {
      if (photo.imageId && !newImageCache[photo.imageId]) {
        try {
          // 하이브리드 방식으로 이미지 로드 (getBodyPhotoImage 사용)
          const imageDataUrl = await getBodyPhotoImage(photo);
          if (imageDataUrl) {
            newImageCache[photo.imageId] = imageDataUrl;
          }
        } catch (error) {
          console.error(`이미지 로드 오류 (ID: ${photo.imageId}):`, error);
        }
      }
    }
    
    return newImageCache;
  };

  const handlePhotoClick = (photo: BodyPhotoRecord) => {
    if (photo.imageId && imageCache[photo.imageId]) {
      setSelectedPhoto({
        url: imageCache[photo.imageId],
        record: photo
      });
    }
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  // 체중 기록을 기간별로 필터링하는 함수
  const getFilteredWeightHistory = () => {
    if (weightPeriodFilter === 'all') {
      return weightHistory;
    }

    const now = new Date();
    let startDate: Date;

    switch (weightPeriodFilter) {
      case '1month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return weightHistory;
    }

    return weightHistory.filter(record => record.date >= startDate);
  };

  // 체중 그래프 데이터 준비 (필터링된 데이터 사용)
  const chartData = getFilteredWeightHistory().map(record => ({
    date: record.date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    weight: record.weight,
    fullDate: record.date.toLocaleDateString('ko-KR')
  }));

  const getFilteredPhotos = () => {
    const now = new Date();
    
    switch (dateFilter) {
      case 'daily':
        // 최근 30일 동안의 사진
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return bodyPhotos.filter(photo => photo.date >= thirtyDaysAgo);
        
      case 'weekly':
        // 날짜별로 그룹화하여 주별로 대표 사진 1장씩만 표시
        const weeklyPhotos: BodyPhotoRecord[] = [];
        const weekGroups = new Map<string, BodyPhotoRecord[]>();
        
        bodyPhotos.forEach(photo => {
          const weekKey = `${photo.date.getFullYear()}-${Math.floor(photo.date.getDate() / 7)}`;
          if (!weekGroups.has(weekKey)) {
            weekGroups.set(weekKey, []);
          }
          weekGroups.get(weekKey)!.push(photo);
        });
        
        // 각 주의 첫 번째 사진만 선택
        weekGroups.forEach(photos => {
          const sortedPhotos = photos.sort((a, b) => a.date.getTime() - b.date.getTime());
          weeklyPhotos.push(sortedPhotos[0]);
        });
        
        return weeklyPhotos.sort((a, b) => b.date.getTime() - a.date.getTime());
        
      case 'monthly':
        // 월별로 그룹화하여 대표 사진 1장씩만 표시
        const monthlyPhotos: BodyPhotoRecord[] = [];
        const monthGroups = new Map<string, BodyPhotoRecord[]>();
        
        bodyPhotos.forEach(photo => {
          const monthKey = `${photo.date.getFullYear()}-${photo.date.getMonth()}`;
          if (!monthGroups.has(monthKey)) {
            monthGroups.set(monthKey, []);
          }
          monthGroups.get(monthKey)!.push(photo);
        });
        
        // 각 월의 첫 번째 사진만 선택
        monthGroups.forEach(photos => {
          const sortedPhotos = photos.sort((a, b) => a.date.getTime() - b.date.getTime());
          monthlyPhotos.push(sortedPhotos[0]);
        });
        
        return monthlyPhotos.sort((a, b) => b.date.getTime() - a.date.getTime());
        
      default:
        return bodyPhotos;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" showText={true} text="신체 변화 데이터를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TrendingUp size={28} className="text-purple-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">신체 변화 추이</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* 개인정보 보호 안내 */}
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-start">
            <Info size={20} className="text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">
                개인정보 보호
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                신체 사진은 <strong>로컬 저장소에만</strong> 보관됩니다. 
                신체 사진은 다른 기기에서 확인할 수 없습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 체중 변화 그래프 */}
        {weightHistory.length > 0 ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Scale size={24} className="text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">체중 변화 추이</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setWeightPeriodFilter('1month')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    weightPeriodFilter === '1month' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  1개월
                </button>
                <button
                  onClick={() => setWeightPeriodFilter('3months')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    weightPeriodFilter === '3months' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  3개월
                </button>
                <button
                  onClick={() => setWeightPeriodFilter('6months')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    weightPeriodFilter === '6months' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  6개월
                </button>
                <button
                  onClick={() => setWeightPeriodFilter('1year')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    weightPeriodFilter === '1year' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  1년
                </button>
                <button
                  onClick={() => setWeightPeriodFilter('all')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    weightPeriodFilter === 'all' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  전체
                </button>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    labelFormatter={(label) => `날짜: ${chartData.find(item => item.date === label)?.fullDate}`}
                    formatter={(value) => [`${value} kg`, '체중']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="체중 (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
              {weightHistory.length > 1 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    총 변화량: {(() => {
                      const filteredData = getFilteredWeightHistory();
                      if (filteredData.length > 1) {
                        const change = (filteredData[filteredData.length - 1].weight - filteredData[0].weight).toFixed(1);
                        return `${change} kg ${filteredData[filteredData.length - 1].weight > filteredData[0].weight ? '증가' : '감소'}`;
                      }
                      return '데이터 부족';
                    })()}
                    {weightPeriodFilter !== 'all' && (
                      <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                        ({weightPeriodFilter === '1month' ? '최근 1개월' :
                          weightPeriodFilter === '3months' ? '최근 3개월' :
                          weightPeriodFilter === '6months' ? '최근 6개월' :
                          weightPeriodFilter === '1year' ? '최근 1년' : '전체'} 기준)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Scale size={24} className="text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">체중 변화 추이</h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
              <Scale size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2 text-lg">
                체중 기록이 없습니다
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base mb-4">
                체중을 입력해주세요
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                홈페이지 → "내 신체 변화" → "체중 기록" 버튼을 클릭하여<br/>
                체중을 기록하면 변화 추이 그래프를 확인할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* 신체 사진 갤러리 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Camera size={24} className="text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">바디 체크 기록</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDateFilter('daily')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  dateFilter === 'daily' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                일별
              </button>
              <button
                onClick={() => setDateFilter('weekly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  dateFilter === 'weekly' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                주별
              </button>
              <button
                onClick={() => setDateFilter('monthly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  dateFilter === 'monthly' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                월별
              </button>
            </div>
          </div>

          {/* 선택사항 안내 */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>📝 참고:</strong> 체중, 체지방률, 근육량 기록은 선택사항입니다. 사진만 기록하셔도 됩니다.
            </p>
          </div>
          
          {bodyPhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getFilteredPhotos().map((photo) => (
                <div 
                  key={photo.id} 
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handlePhotoClick(photo)}
                >
                  {photo.imageId && imageCache[photo.imageId] ? (
                    <img 
                      src={imageCache[photo.imageId]} 
                      alt="바디 체크 사진" 
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                      <Camera size={32} className="text-gray-400" />
                    </div>
                  )}
                  
                  <div className="p-3">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar size={12} className="mr-1" />
                      {photo.date.toLocaleDateString('ko-KR')}
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      {photo.weight && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">체중:</span>
                          <span className="font-medium">{photo.weight} kg</span>
                        </div>
                      )}
                      {photo.bodyFat && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">체지방:</span>
                          <span className="font-medium">{photo.bodyFat}%</span>
                        </div>
                      )}
                      {photo.muscleMass && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">근육량:</span>
                          <span className="font-medium">{photo.muscleMass} kg</span>
                        </div>
                      )}
                    </div>
                    
                    {photo.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                        {photo.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <Camera size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                아직 바디 체크 기록이 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* 사진 상세 모달 */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold">
                  바디 체크 - {selectedPhoto.record.date.toLocaleDateString('ko-KR')}
                </h3>
                <button 
                  onClick={closePhotoModal} 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto">
                <div className="p-4 flex justify-center">
                  <img 
                    src={selectedPhoto.url} 
                    alt="바디 체크 사진" 
                    className="w-full max-h-[60vh] object-contain rounded-lg"
                  />
                </div>
                
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {selectedPhoto.record.weight && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">체중</p>
                        <p className="text-lg font-semibold">{selectedPhoto.record.weight} kg</p>
                      </div>
                    )}
                    {selectedPhoto.record.bodyFat && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">체지방률</p>
                        <p className="text-lg font-semibold">{selectedPhoto.record.bodyFat}%</p>
                      </div>
                    )}
                    {selectedPhoto.record.muscleMass && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">근육량</p>
                        <p className="text-lg font-semibold">{selectedPhoto.record.muscleMass} kg</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedPhoto.record.notes && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">메모</p>
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {selectedPhoto.record.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyProgressView; 