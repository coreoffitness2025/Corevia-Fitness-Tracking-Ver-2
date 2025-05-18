import React, { useState } from 'react';
import Card, { CardTitle, CardSection } from '../common/Card';
import Button from '../common/Button';
import WorkoutProgramDetail from './WorkoutProgramDetail';
import { useNavigate } from 'react-router-dom';

// 운동 프로그램 타입 정의
interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'weight-loss';
  duration: string;
  daysPerWeek: number;
  schedule: Array<{
    day: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      notes?: string;
    }>;
  }>;
  tips: string[];
}

// 샘플 운동 프로그램 데이터
const workoutPrograms: WorkoutProgram[] = [
  {
    id: 'beginner-strength',
    name: '초보자 3분할 근력 향상 프로그램',
    description: '근력 향상에 집중한 초보자 친화적인 3분할 프로그램입니다. 주 3회 운동으로 전신 근력을 효과적으로 개발할 수 있습니다.',
    level: 'beginner',
    goal: 'strength',
    duration: '8주',
    daysPerWeek: 3,
    schedule: [
      {
        day: '월요일 (푸시 데이)',
        exercises: [
          { name: '벤치 프레스', sets: 3, reps: '5-8' },
          { name: '덤벨 숄더 프레스', sets: 3, reps: '8-10' },
          { name: '인클라인 푸시업', sets: 3, reps: '8-12' },
          { name: '트라이셉스 푸시다운', sets: 3, reps: '10-12' }
        ]
      },
      {
        day: '수요일 (풀 데이)',
        exercises: [
          { name: '데드리프트', sets: 3, reps: '5-8' },
          { name: '랫 풀다운', sets: 3, reps: '8-10' },
          { name: '시티드 로우', sets: 3, reps: '8-10' },
          { name: '덤벨 컬', sets: 3, reps: '10-12' }
        ]
      },
      {
        day: '금요일 (레그 데이)',
        exercises: [
          { name: '스쿼트', sets: 3, reps: '5-8' },
          { name: '레그 프레스', sets: 3, reps: '8-10' },
          { name: '레그 컬', sets: 3, reps: '10-12' },
          { name: '카프 레이즈', sets: 3, reps: '12-15' }
        ]
      }
    ],
    tips: [
      '각 운동 세트 사이에 90초-2분 휴식',
      '운동 무게는 마지막 1-2회가 힘들 정도로 설정',
      '첫 2주는 가벼운 무게로 폼에 집중',
      '4주차부터 점진적으로 무게 증가'
    ]
  },
  {
    id: 'intermediate-hypertrophy',
    name: '중급자 5분할 근비대 프로그램',
    description: '근비대(근육 크기 증가)에 초점을 맞춘 중급자용 5분할 프로그램입니다. 근육군별로 더 집중적인 자극을 제공합니다.',
    level: 'intermediate',
    goal: 'hypertrophy',
    duration: '12주',
    daysPerWeek: 5,
    schedule: [
      {
        day: '월요일 (가슴)',
        exercises: [
          { name: '벤치 프레스', sets: 4, reps: '8-10' },
          { name: '인클라인 덤벨 프레스', sets: 4, reps: '10-12' },
          { name: '케이블 플라이', sets: 3, reps: '12-15' },
          { name: '푸시업', sets: 3, reps: '실패시까지' }
        ]
      },
      {
        day: '화요일 (등)',
        exercises: [
          { name: '바벨 로우', sets: 4, reps: '8-10' },
          { name: '풀업', sets: 4, reps: '최대 반복' },
          { name: '시티드 케이블 로우', sets: 3, reps: '10-12' },
          { name: '랫 풀다운', sets: 3, reps: '12-15' }
        ]
      },
      {
        day: '수요일 (하체)',
        exercises: [
          { name: '스쿼트', sets: 4, reps: '8-10' },
          { name: '레그 프레스', sets: 4, reps: '10-12' },
          { name: '루마니안 데드리프트', sets: 3, reps: '10-12' },
          { name: '레그 익스텐션', sets: 3, reps: '12-15' },
          { name: '카프 레이즈', sets: 4, reps: '15-20' }
        ]
      },
      {
        day: '목요일 (어깨)',
        exercises: [
          { name: '오버헤드 프레스', sets: 4, reps: '8-10' },
          { name: '사이드 래터럴 레이즈', sets: 4, reps: '10-12' },
          { name: '리어 델트 플라이', sets: 3, reps: '12-15' },
          { name: '페이스 풀', sets: 3, reps: '12-15' }
        ]
      },
      {
        day: '금요일 (팔)',
        exercises: [
          { name: '바벨 컬', sets: 4, reps: '8-10' },
          { name: '스컬 크러셔', sets: 4, reps: '8-10' },
          { name: '프리처 컬', sets: 3, reps: '10-12' },
          { name: '트라이셉스 푸시다운', sets: 3, reps: '10-12' },
          { name: '해머 컬', sets: 3, reps: '12-15' },
          { name: '트라이셉스 익스텐션', sets: 3, reps: '12-15' }
        ]
      }
    ],
    tips: [
      '세트 간 60-90초 휴식',
      '긴장성 스트레스를 높이기 위해 천천히 내리는 네거티브 동작에 집중',
      '주 2회 30분 유산소 운동 추가 권장',
      '충분한 단백질 섭취(체중 1kg당 1.6-2g)'
    ]
  },
  {
    id: 'advanced-strength',
    name: '고급자 상하체 분할 프로그램',
    description: '주 4일 강도 높은 상하체 분할 프로그램입니다. 전문적인 근력 향상과 근비대를 동시에 목표로 합니다.',
    level: 'advanced',
    goal: 'strength',
    duration: '8주',
    daysPerWeek: 4,
    schedule: [
      {
        day: '월요일 (상체 A)',
        exercises: [
          { name: '벤치 프레스', sets: 5, reps: '5, 3, 2, 5, 5', notes: '피라미드 세트' },
          { name: '가중 풀업', sets: 4, reps: '6-8' },
          { name: '밀리터리 프레스', sets: 4, reps: '6-8' },
          { name: '바벨 로우', sets: 4, reps: '6-8' },
          { name: '스컬 크러셔', sets: 3, reps: '8-10' }
        ]
      },
      {
        day: '화요일 (하체 A)',
        exercises: [
          { name: '스쿼트', sets: 5, reps: '5, 3, 2, 5, 5', notes: '피라미드 세트' },
          { name: '루마니안 데드리프트', sets: 4, reps: '6-8' },
          { name: '불가리안 스플릿 스쿼트', sets: 3, reps: '8-10' },
          { name: '레그 컬', sets: 3, reps: '10-12' },
          { name: '시티드 카프 레이즈', sets: 4, reps: '10-15' }
        ]
      },
      {
        day: '목요일 (상체 B)',
        exercises: [
          { name: '인클라인 벤치 프레스', sets: 4, reps: '6-8' },
          { name: '가중 딥스', sets: 4, reps: '6-8' },
          { name: '덤벨 로우', sets: 4, reps: '8-10' },
          { name: '사이드 레터럴 레이즈', sets: 4, reps: '10-12' },
          { name: '바벨 컬', sets: 3, reps: '8-10' }
        ]
      },
      {
        day: '금요일 (하체 B)',
        exercises: [
          { name: '데드리프트', sets: 5, reps: '5, 3, 2, 5, 5', notes: '피라미드 세트' },
          { name: '프론트 스쿼트', sets: 4, reps: '6-8' },
          { name: '레그 프레스', sets: 4, reps: '8-10' },
          { name: '글루트 햄 레이즈', sets: 3, reps: '8-10' },
          { name: '스탠딩 카프 레이즈', sets: 4, reps: '10-15' }
        ]
      }
    ],
    tips: [
      '주 운동은 세트 간 2-3분 휴식',
      '보조 운동은 세트 간 60-90초 휴식',
      '8주 사이클 후 1주 디로드 필수',
      '체중 1kg당 2g 이상 단백질 섭취',
      '수면과 회복에 특히 주의'
    ]
  }
];

const WorkoutProgram: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const navigate = useNavigate();

  // 필터링된 프로그램 목록
  const filteredPrograms = workoutPrograms.filter(program => {
    if (selectedGoal !== 'all' && program.goal !== selectedGoal) return false;
    if (selectedLevel !== 'all' && program.level !== selectedLevel) return false;
    return true;
  });

  // 프로그램 상세 정보 표시/닫기
  const showProgramDetail = (program: WorkoutProgram) => {
    setSelectedProgram(program);
  };

  // 상세 정보 닫기
  const handleClose = () => {
    setSelectedProgram(null);
  };

  // 운동 검색 페이지로 이동 (운동 이름을 검색어로 사용)
  const navigateToExerciseSearch = (exerciseName: string) => {
    navigate('/qna', { 
      state: { 
        activeTab: 'exercise',
        searchTerm: exerciseName
      } 
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">운동 프로그램</h2>
      
      {/* 필터 옵션 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">운동 목표</label>
          <select 
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="p-2 border rounded-md bg-white dark:bg-gray-700"
          >
            <option value="all">모든 목표</option>
            <option value="strength">근력 향상</option>
            <option value="hypertrophy">근비대</option>
            <option value="endurance">근지구력</option>
            <option value="weight-loss">체중 감량</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">운동 수준</label>
          <select 
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="p-2 border rounded-md bg-white dark:bg-gray-700"
          >
            <option value="all">모든 수준</option>
            <option value="beginner">초보자</option>
            <option value="intermediate">중급자</option>
            <option value="advanced">고급자</option>
          </select>
        </div>
      </div>

      {/* 프로그램 목록 */}
      {selectedProgram ? (
        <div>
          <Button 
            variant="secondary" 
            onClick={handleClose}
            className="mb-4"
          >
            ← 목록으로 돌아가기
          </Button>
          
          <WorkoutProgramDetail program={selectedProgram} onClose={handleClose} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrograms.map(program => (
            <Card key={program.id} className="hover:shadow-lg transition-shadow">
              <CardSection>
                <CardTitle>{program.name}</CardTitle>
                <div className="flex gap-2 my-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    program.level === 'beginner' ? 'bg-green-100 text-green-800' :
                    program.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {program.level === 'beginner' ? '초보자' :
                     program.level === 'intermediate' ? '중급자' : '고급자'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    주 {program.daysPerWeek}회 운동
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    {program.duration}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{program.description}</p>
                
                {/* 대표 운동 목록 표시 */}
                {program.schedule[0]?.exercises && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">주요 운동:</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.schedule.flatMap(day => day.exercises)
                        .slice(0, 5) // 최대 5개만 표시
                        .map((exercise, idx) => (
                          <button
                            key={idx}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            onClick={() => navigateToExerciseSearch(exercise.name)}
                          >
                            {exercise.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="primary" 
                  onClick={() => showProgramDetail(program)}
                  className="w-full"
                >
                  프로그램 상세 보기
                </Button>
              </CardSection>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutProgram; 