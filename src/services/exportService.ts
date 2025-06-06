import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Food } from '../types';

/**
 * 사용자의 모든 데이터를 내보내는 함수
 * @param userId 사용자 ID
 * @returns 데이터 객체와 파일명
 */
export const exportUserData = async (userId: string) => {
  if (!userId) {
    throw new Error('유효한 사용자 ID가 필요합니다.');
  }

  try {
    // 사용자 프로필 가져오기
    const userProfileRef = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
    const userProfile = userProfileRef.docs.length > 0 ? userProfileRef.docs[0].data() : null;

    // 운동 기록 가져오기
    const workoutsRef = await getDocs(query(collection(db, 'sessions'), where('userId', '==', userId)));
    const workouts = workoutsRef.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 식단 기록 가져오기
    const foodsRef = await getDocs(query(collection(db, 'foods'), where('userId', '==', userId)));
    const foods = foodsRef.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 체중 기록 가져오기
    const weightRecordsRef = await getDocs(query(collection(db, 'weightRecords'), where('userId', '==', userId)));
    const weightRecords = weightRecordsRef.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 모든 데이터를 하나의 객체로 합치기
    const exportData = {
      userProfile,
      workouts,
      foods,
      weightRecords,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    // 파일명 생성
    const fileName = `corevia_data_export_${new Date().toISOString().split('T')[0]}.json`;
    
    return {
      data: exportData,
      fileName
    };
  } catch (error) {
    console.error('데이터 내보내기 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 데이터를 JSON 파일로 다운로드
 * @param data 내보낼 데이터 객체
 * @param fileName 파일명
 */
export const downloadJsonFile = (data: any, fileName: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 특정 기간의 식단 데이터만 CSV로 내보내기
 * @param userId 사용자 ID
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 */
export const exportFoodDataToCsv = async (
  userId: string, 
  startDate: Date = new Date(new Date().setMonth(new Date().getMonth() - 1)), 
  endDate: Date = new Date()
) => {
  try {
    const foodsRef = await getDocs(query(collection(db, 'foods'), 
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    ));
    
    const foods = foodsRef.docs.map(doc => doc.data() as Food);
    
    // CSV 헤더 생성
    let csvContent = "날짜,시간,음식명,칼로리,단백질(g),탄수화물(g),지방(g),메모\n";
    
    // 각 식단 기록을 CSV 행으로 변환
    foods.forEach(food => {
      const date = food.date instanceof Date ? 
        food.date.toLocaleDateString() : 
        new Date((food.date as any).seconds * 1000).toLocaleDateString();
        
      const time = food.date instanceof Date ? 
        food.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
        new Date((food.date as any).seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      // CSV 행 문자열 생성 (큰따옴표로 묶고 콤마 이스케이프 처리)
      const row = [
        `"${date}"`,
        `"${time}"`,
        `"${food.name || ''}"`,
        food.calories || 0,
        food.protein || 0,
        food.carbs || 0,
        food.fat || 0,
        `"${food.notes?.replace(/"/g, '""') || ''}"`
      ].join(',');
      
      csvContent += row + "\n";
    });
    
    // CSV 파일 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `corevia_food_export_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '').replace(/ /g, '')}.csv`;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return fileName;
  } catch (error) {
    console.error('식단 데이터 CSV 내보내기 중 오류:', error);
    throw error;
  }
}; 