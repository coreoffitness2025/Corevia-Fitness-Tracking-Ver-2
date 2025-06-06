import { Session, UserProfile } from '../types';
import { getDoc, doc, query, collection, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// 미래 AI API URL 및 키 설정 (환경 변수에서 가져옴)
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'https://api.coreviaai.com';
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;

/**
 * 사용자의 최근 운동 세션을 가져오는 함수
 * @param userId 사용자 ID
 * @param count 가져올 세션 수
 * @returns 최근 운동 세션 배열
 */
export const getRecentWorkoutSessions = async (userId: string, count: number = 10): Promise<Session[]> => {
  try {
    const sessionsQuery = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(count)
    );

    const querySnapshot = await getDocs(sessionsQuery);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: data.date.toDate(),
      } as Session;
    });
  } catch (error) {
    console.error('운동 세션 가져오기 실패:', error);
    return [];
  }
};

/**
 * 사용자 프로필을 가져오는 함수
 * @param userId 사용자 ID
 * @returns 사용자 프로필 정보
 */
export const getUserProfileData = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('사용자 프로필 가져오기 실패:', error);
    return null;
  }
};

/**
 * AI 분석을 통해 운동 조언을 받는 함수
 * @param userId 사용자 ID
 * @returns AI 조언 정보
 */
export const getWorkoutAdvice = async (userId: string) => {
  try {
    // 1. 필요한 데이터 수집
    const [profile, recentWorkouts] = await Promise.all([
      getUserProfileData(userId),
      getRecentWorkoutSessions(userId, 20)
    ]);

    // 2. 컨디션 데이터 수집
    const conditionData = recentWorkouts
      .filter(session => session.condition !== undefined)
      .map(session => ({
        date: session.date,
        condition: session.condition,
        sleepHours: session.sleepHours
      }));

    // 3. 부위별 운동 데이터 그룹화
    const workoutsByPart = recentWorkouts.reduce((acc, session) => {
      const part = session.part;
      if (!acc[part]) {
        acc[part] = [];
      }
      acc[part].push(session);
      return acc;
    }, {} as Record<string, Session[]>);

    // 실제 API 연동 시 사용할 코드
    // const response = await fetch(`${AI_API_URL}/workout-advice`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${AI_API_KEY}`
    //   },
    //   body: JSON.stringify({
    //     profile,
    //     workoutData: recentWorkouts,
    //     conditionData,
    //     workoutsByPart
    //   })
    // });
    // if (!response.ok) {
    //   throw new Error('AI API 응답 오류');
    // }
    // return await response.json();

    // 현재는 모의 데이터 반환
    return {
      success: true,
      advice: {
        general: "최근 운동 패턴을 분석한 결과, 운동 빈도는 양호하나 가슴 운동에 집중되어 있습니다. 등 운동의 빈도를 높여 균형을 맞추는 것이 좋겠습니다.",
        sleepAndCondition: conditionData.length > 0 
          ? "수면 시간이 평균 6시간으로 운동 회복에 다소 부족합니다. 7-8시간 수면을 목표로 하세요." 
          : "수면 데이터가 부족합니다. 수면 시간을 기록하면 더 정확한 조언이 가능합니다.",
        nextWorkout: "다음 운동은 등 운동을 추천합니다. 최근 벤치프레스 무게가 증가했으므로, 데드리프트도 5kg 증량을 시도해보세요."
      }
    };
  } catch (error) {
    console.error('AI 운동 조언 가져오기 실패:', error);
    return {
      success: false,
      error: '데이터 분석 중 오류가 발생했습니다.'
    };
  }
};

/**
 * 사용자의 운동 패턴을 분석하는 함수
 * @param userId 사용자 ID
 * @returns 운동 패턴 분석 결과
 */
export const analyzeWorkoutPatterns = async (userId: string) => {
  try {
    const recentWorkouts = await getRecentWorkoutSessions(userId, 50);
    
    // 실제 API 연동 시 사용할 코드
    // const response = await fetch(`${AI_API_URL}/analyze-patterns`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${AI_API_KEY}`
    //   },
    //   body: JSON.stringify({ workoutData: recentWorkouts })
    // });
    // if (!response.ok) {
    //   throw new Error('AI API 응답 오류');
    // }
    // return await response.json();

    // 현재는 모의 데이터 반환
    return {
      success: true,
      patterns: {
        frequency: "주 3회 운동 패턴을 보이고 있습니다.",
        preferredDays: ["월요일", "수요일", "금요일"],
        preferredTime: "저녁 (18:00-21:00)",
        consistencyScore: 75, // 0-100 점수
        improvement: "월요일 운동 일관성이 가장 높고, 금요일이 가장 낮습니다. 금요일 운동 루틴을 강화하세요."
      }
    };
  } catch (error) {
    console.error('운동 패턴 분석 실패:', error);
    return {
      success: false,
      error: '패턴 분석 중 오류가 발생했습니다.'
    };
  }
};

/**
 * 수면과 컨디션에 따른 성과 상관관계 분석
 * @param userId 사용자 ID
 * @returns 수면-컨디션-성과 상관관계 분석 결과
 */
export const analyzeSleepConditionCorrelation = async (userId: string) => {
  try {
    // 수면 시간과 컨디션 데이터가 있는 세션만 가져오기
    const sessionsQuery = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      where('sleepHours', '!=', null),
      orderBy('sleepHours'),
      orderBy('date', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(sessionsQuery);
    const sessions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: data.date.toDate(),
      } as Session;
    });

    // 실제 API 연동 시 사용할 코드
    // const response = await fetch(`${AI_API_URL}/sleep-condition-analysis`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${AI_API_KEY}`
    //   },
    //   body: JSON.stringify({ sessions })
    // });
    // if (!response.ok) {
    //   throw new Error('AI API 응답 오류');
    // }
    // return await response.json();

    // 현재는 모의 데이터 반환
    if (sessions.length < 5) {
      return {
        success: false,
        error: '분석을 위한 충분한 데이터가 없습니다. 최소 5개 이상의 수면/컨디션 기록이 필요합니다.'
      };
    }

    return {
      success: true,
      correlation: {
        sleepToPerformance: 0.72, // -1 ~ 1 사이 값 (높을수록 강한 양의 상관관계)
        conditionToPerformance: 0.65,
        optimalSleepHours: 7.5,
        insight: "7시간 이상 수면 시 운동 성공률이 85% 이상으로 높아집니다. 특히 가슴 운동은 수면 시간과의 상관관계가 가장 높습니다."
      }
    };
  } catch (error) {
    console.error('수면-컨디션 상관관계 분석 실패:', error);
    return {
      success: false,
      error: '상관관계 분석 중 오류가 발생했습니다.'
    };
  }
}; 