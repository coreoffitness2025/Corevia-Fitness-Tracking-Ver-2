import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Supplement } from '../../types';
import Button from '../common/Button';
import { Pill, Clock, Plus, Search, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SupplementFormProps {
  onSuccess?: () => void;
}

const SupplementForm: React.FC<SupplementFormProps> = ({ onSuccess }) => {
  const { userProfile } = useAuth();
  const [name, setName] = useState<string>('');
  const [dosage, setDosage] = useState<string>('');
  const [time, setTime] = useState<string>(new Date().toTimeString().slice(0, 5));
  const [isUnknownTime, setIsUnknownTime] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 더미 데이터: 사용자가 자주 복용하는 영양제 (기록 기반)
  const frequentSupplements = [
    '멀티비타민', '오메가3', '비타민D', '마그네슘'
  ];

  // 다양한 영양제 목록 (카테고리별)
  const allSupplements = [
    // 비타민류
    '멀티비타민', '비타민A', '비타민B1', '비타민B2', '비타민B6', '비타민B12', 
    '비타민C', '비타민D', '비타민D3', '비타민E', '비타민K', '엽산', '비오틴',
    '나이아신', '판토텐산', '콜린', '이노시톨',
    
    // 미네랄류
    '마그네슘', '칼슘', '아연', '철분', '셀레늄', '크롬', '구리', '망간',
    '요오드', '칼륨', '인', '황',
    
    // 오메가 및 지방산
    '오메가3', '오메가6', '오메가9', 'EPA', 'DHA', '피시오일', '크릴오일',
    '리놀레산', 'CLA', 'MCT오일',
    
    // 운동 관련
    '단백질 파우더', '웨이 프로틴', '카제인 프로틴', '아미노산', 'BCAA', 
    '글루타민', '크레아틴', '아르기닌', '시트룰린', '베타알라닌', 'HMB',
    '프리워크아웃', '포스트워크아웃',
    
    // 소화 및 장 건강
    '프로바이오틱스', '프리바이오틱스', '락토바실러스', '비피더스균',
    '소화효소', '파파야효소', '브로멜라인',
    
    // 항산화제
    '코엔자임Q10', '리코펜', '루테인', '제아잔틴', '레스베라트롤',
    '아스타잔틴', '글루타치온', '알파리포산', '커큐민',
    
    // 스트레스 및 수면
    '마그네슘', '테아닌', '멜라토닌', '발레리안', '패션플라워',
    '레몬밤', '카모마일', 'GABA', '아시와간다',
    
    // 뼈 건강
    '글루코사민', '콘드로이틴', 'MSM', '콜라겐', '히알루론산',
    '칼슘', '비타민D', '비타민K2', '마그네슘',
    
    // 면역 지원
    '비타민C', '아연', '에키나세아', '엘더베리', '베타글루칸',
    '스피룰리나', '클로렐라', '버섯 추출물',
    
    // 에너지 및 활력
    '철분', '비타민B12', '코엔자임Q10', '인삼', '홍삼', '로디올라',
    '인삼 추출물', '구아라나', '마카',
    
    // 여성 건강
    '엽산', '철분', '칼슘', '이소플라본', '달맞이꽃 오일',
    '크랜베리', '프로바이오틱스 여성용',
    
    // 남성 건강
    '아연', '셀레늄', '쏘팔메토', '리코펜', '마카', '트리뷸러스',
    
    // 기타
    '효모', '스피룰리나', '클로렐라', '밀크시슬', '간 보호제',
    '오메가369', '멀티미네랄', '종합영양제'
  ];

  // 검색 필터링된 영양제 목록
  const filteredSupplements = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    return allSupplements.filter(supplement =>
      supplement.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 20); // 최대 20개만 표시
  }, [searchQuery]);

  const handleQuickName = (supplementName: string) => {
    setName(supplementName);
    setSearchQuery(''); // 검색어 초기화
  };

  const handleTimeUnknown = () => {
    setIsUnknownTime(!isUnknownTime);
    if (!isUnknownTime) {
      setTime('');
    } else {
      setTime(new Date().toTimeString().slice(0, 5));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.uid) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!name.trim()) {
      toast.error('영양제 이름을 입력해주세요.');
      return;
    }

    if (!dosage.trim()) {
      toast.error('복용량을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supplementRecord: Omit<Supplement, 'id'> = {
        userId: userProfile.uid,
        date: new Date(),
        name: name.trim(),
        dosage: dosage.trim(),
        time: isUnknownTime ? undefined : time,
        type: 'other', // 기본값으로 설정
        notes: notes.trim() || undefined,
      };

      // IndexedDB에 저장하는 로직 추가 예정
      // await addSupplementRecord(supplementRecord);
      
      console.log('영양제 섭취 기록:', supplementRecord);
      
      toast.success(`${name} 복용 기록이 저장되었습니다.`);
      
      // 폼 초기화
      setName('');
      setDosage('');
      setTime(new Date().toTimeString().slice(0, 5));
      setIsUnknownTime(false);
      setNotes('');
      setSearchQuery('');
      
      onSuccess?.();
    } catch (error) {
      console.error('영양제 기록 저장 오류:', error);
      toast.error('영양제 기록 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Pill size={28} className="text-green-500 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">영양제 복용 기록</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 영양제 이름 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            영양제 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="영양제 이름을 입력하세요..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            required
            maxLength={50}
          />
        </div>

        {/* 자주 복용하는 영양제 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            자주 복용하는 영양제
          </label>
          <div className="grid grid-cols-2 gap-2">
            {frequentSupplements.map((supplement) => (
              <button
                key={supplement}
                type="button"
                onClick={() => handleQuickName(supplement)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  name === supplement
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {supplement}
              </button>
            ))}
          </div>
        </div>

        {/* 영양제 찾기 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Search size={16} className="inline mr-1" />
            영양제 찾기
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="찾으시는 영양제를 검색하세요..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          />
          
          {/* 검색 결과 */}
          {filteredSupplements.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
              {filteredSupplements.map((supplement, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleQuickName(supplement)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                >
                  {supplement}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 복용량 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            복용량
          </label>
          <input
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="예: 1정, 2스푼, 10ml"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            required
            maxLength={20}
          />
        </div>

        {/* 복용 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock size={16} className="inline mr-1" />
            복용 시간
          </label>
          <div className="flex gap-2">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUnknownTime}
              required={!isUnknownTime}
            />
            <button
              type="button"
              onClick={handleTimeUnknown}
              className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isUnknownTime
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <HelpCircle size={16} />
              알 수 없음
            </button>
          </div>
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            메모 (선택사항)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="복용 목적, 부작용 등을 기록하세요..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {notes.length}/200자
          </p>
        </div>

        {/* 제출 버튼 */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          icon={<Plus size={20} />}
          className="w-full bg-green-500 hover:bg-green-600 border-green-500"
        >
          {isSubmitting ? '저장 중...' : '영양제 복용 기록하기'}
        </Button>
      </form>

      {/* 복용 시간 가이드 */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center mb-2">
          <Pill size={20} className="text-green-600 dark:text-green-400 mr-2" />
          <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">복용 시간 가이드</h3>
        </div>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
          <li>• <strong>비타민:</strong> 식후 30분 (지용성 비타민은 기름과 함께)</li>
          <li>• <strong>미네랄:</strong> 공복 또는 식간</li>
          <li>• <strong>운동 전:</strong> 운동 30분 전</li>
          <li>• <strong>운동 후:</strong> 운동 후 30분 이내</li>
        </ul>
      </div>
    </div>
  );
};

export default SupplementForm; 