/**
 * 날짜 관련 유틸리티 함수 모음
 */

/**
 * Date 객체를 'YYYY-MM-DD' 형식의 문자열로 변환
 * @param date 변환할 Date 객체
 * @returns 'YYYY-MM-DD' 형식의 문자열
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 날짜를 'YYYY년 MM월 DD일' 형식으로 변환
 * @param date 변환할 Date 객체 또는 날짜 문자열
 * @returns 한국어 날짜 형식
 */
export const formatDateKorean = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  return `${year}년 ${month}월 ${day}일`;
};

/**
 * 날짜를 요일 포함하여 '2023년 5월 17일 수요일' 형식으로 변환
 * @param date 변환할 Date 객체
 * @returns 요일을 포함한 한국어 날짜 형식
 */
export const formatDateWithWeekday = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

/**
 * 요일 이름 배열 (일~토)
 */
export const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 주어진 날짜의 요일 이름 반환
 * @param date 날짜 객체
 * @returns 요일 이름 (일~토)
 */
export const getDayOfWeek = (date: Date): string => {
  return weekdays[date.getDay()];
};

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns 오늘 날짜 문자열
 */
export const getTodayString = (): string => {
  return formatDate(new Date());
};

/**
 * 날짜가 오늘인지 확인
 * @param date 확인할 날짜
 * @returns 오늘이면 true, 아니면 false
 */
export const isToday = (date: Date | string): boolean => {
  const today = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  
  return (
    today.getFullYear() === checkDate.getFullYear() &&
    today.getMonth() === checkDate.getMonth() &&
    today.getDate() === checkDate.getDate()
  );
}; 