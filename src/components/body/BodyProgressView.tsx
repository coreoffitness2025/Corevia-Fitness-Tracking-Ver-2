import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getBodyPhotoRecords, getFoodImage, BodyPhotoRecord } from '../../utils/indexedDB';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Camera, Scale, TrendingUp, Calendar, Info, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface WeightRecord {
  date: Date;
  weight: number;
}

interface BodyProgressViewProps {
  onClose?: () => void;
}

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
      const q = query(
        collection(db, 'weightRecords'),
        where('userId', '==', userProfile.uid),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({
        date: doc.data().date.toDate(),
        weight: doc.data().weight
      }));
      
      setWeightHistory(history);
    } catch (error) {
      console.error('체중 기록 로드 실패:', error);
      // Firebase 접근 실패시 빈 배열로 설정
      setWeightHistory([]);
    }
  };

  const loadBodyPhotos = async () => {
    if (!userProfile?.uid) return;

    try {
      const photos = await getBodyPhotoRecords(userProfile.uid);
      // 날짜순으로 정렬 (최신순)
      const sortedPhotos = photos.sort((a, b) => b.date.getTime() - a.date.getTime());
      setBodyPhotos(sortedPhotos);
      
      // 이미지 로드
      await loadImages(sortedPhotos);
    } catch (error) {
      console.error('신체 사진 기록 로드 실패:', error);
      setBodyPhotos([]);
    }
  };

  const loadImages = async (photos: BodyPhotoRecord[]) => {
    const newImageCache: Record<string, string> = { ...imageCache };
    
    for (const photo of photos) {
      if (photo.imageId && !newImageCache[photo.imageId]) {
        try {
          const imageBlob = await getFoodImage(photo.imageId);
          if (imageBlob) {
            const imageUrl = URL.createObjectURL(imageBlob);
            newImageCache[photo.imageId] = imageUrl;
          }
        } catch (error) {
          console.error(`이미지 로드 오류 (ID: ${photo.imageId}):`, error);
        }
      }
    }
    
    setImageCache(newImageCache);
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

  // 체중 그래프 데이터 준비
  const chartData = weightHistory.map(record => ({
    date: record.date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    weight: record.weight,
    fullDate: record.date.toLocaleDateString('ko-KR')
  }));

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
                체중 데이터는 Firebase에, 신체 사진은 <strong>로컬 저장소에만</strong> 보관됩니다. 
                신체 사진은 다른 기기에서 확인할 수 없습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 체중 변화 그래프 */}
        {weightHistory.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Scale size={24} className="text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">체중 변화 추이</h3>
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
                    총 변화량: {(weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight).toFixed(1)} kg
                    {weightHistory[weightHistory.length - 1].weight > weightHistory[0].weight ? 
                      ' 증가' : ' 감소'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 신체 사진 갤러리 */}
        <div>
          <div className="flex items-center mb-4">
            <Camera size={24} className="text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">신체 사진 기록</h3>
          </div>
          
          {bodyPhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bodyPhotos.map((photo) => (
                <div 
                  key={photo.id} 
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handlePhotoClick(photo)}
                >
                  {photo.imageId && imageCache[photo.imageId] ? (
                    <img 
                      src={imageCache[photo.imageId]} 
                      alt="신체 변화 사진" 
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
                아직 신체 사진 기록이 없습니다.
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
                  신체 사진 - {selectedPhoto.record.date.toLocaleDateString('ko-KR')}
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
                    alt="신체 변화 사진" 
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