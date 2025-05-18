import React, { useState } from 'react';
import Card, { CardTitle, CardSection } from '../common/Card';
import Button from '../common/Button';
import WorkoutProgramDetail from './WorkoutProgramDetail';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';

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
  },
  {
    id: 'beginner-endurance',
    name: '초보자 전신 근지구력 프로그램',
    description: '근지구력 향상과 체력 개발에 중점을 둔 초보자용 전신 운동 프로그램입니다. 고반복 저중량으로 진행합니다.',
    level: 'beginner',
    goal: 'endurance',
    duration: '6주',
    daysPerWeek: 3,
    schedule: [
      {
        day: '월요일 (전신 A)',
        exercises: [
          { name: '고블릿 스쿼트', sets: 3, reps: '15-20' },
          { name: '덤벨 벤치 프레스', sets: 3, reps: '15-20' },
          { name: '케이블 로우', sets: 3, reps: '15-20' },
          { name: '덤벨 숄더 프레스', sets: 3, reps: '15-20' },
          { name: '플랭크', sets: 3, reps: '30-60초' }
        ]
      },
      {
        day: '수요일 (전신 B)',
        exercises: [
          { name: '런지', sets: 3, reps: '15-20' },
          { name: '푸시업', sets: 3, reps: '최대 반복' },
          { name: '래터럴 레이즈', sets: 3, reps: '15-20' },
          { name: '덤벨 로우', sets: 3, reps: '15-20' },
          { name: '바이셉스 컬', sets: 3, reps: '15-20' }
        ]
      },
      {
        day: '금요일 (전신 C)',
        exercises: [
          { name: '루마니안 데드리프트', sets: 3, reps: '15-20' },
          { name: '인클라인 푸시업', sets: 3, reps: '최대 반복' },
          { name: '페이스 풀', sets: 3, reps: '15-20' },
          { name: '트라이셉스 익스텐션', sets: 3, reps: '15-20' },
          { name: '러시안 트위스트', sets: 3, reps: '20-30' }
        ]
      }
    ],
    tips: [
      '세트 간 30-45초 휴식 (슈퍼세트 권장)',
      '속도 조절보다 완전한 동작 범위에 집중',
      '주 2-3회 20-30분 유산소 운동 추가 권장',
      '매일 5-10분 스트레칭으로 유연성 확보'
    ]
  },
  {
    id: 'weight-loss',
    name: '체중 감량 집중 프로그램',
    description: '체중 감량을 위한 복합 운동과 유산소 운동을 결합한 프로그램입니다. 칼로리 소모를 극대화합니다.',
    level: 'beginner',
    goal: 'weight-loss',
    duration: '10주',
    daysPerWeek: 4,
    schedule: [
      {
        day: '월요일 (전신 + HIIT)',
        exercises: [
          { name: '덤벨 스쿼트', sets: 3, reps: '12-15' },
          { name: '덤벨 벤치 프레스', sets: 3, reps: '12-15' },
          { name: '케틀벨 스윙', sets: 3, reps: '15-20' },
          { name: '마운틴 클라이머', sets: 3, reps: '30초 동안' },
          { name: 'HIIT (30초 운동/30초 휴식)', sets: 10, reps: '총 10분', notes: '버피, 점프스쿼트, 점핑잭 등 번갈아가며' }
        ]
      },
      {
        day: '수요일 (상체 + 유산소)',
        exercises: [
          { name: '푸시업', sets: 3, reps: '최대 반복' },
          { name: '덤벨 로우', sets: 3, reps: '12-15' },
          { name: '래터럴 레이즈', sets: 3, reps: '12-15' },
          { name: '트라이셉스 딥스', sets: 3, reps: '12-15' },
          { name: '중강도 유산소', sets: 1, reps: '30분', notes: '조깅, 사이클링 등' }
        ]
      },
      {
        day: '금요일 (하체 + 코어)',
        exercises: [
          { name: '불가리안 스플릿 스쿼트', sets: 3, reps: '10-12' },
          { name: '힙 쓰러스트', sets: 3, reps: '12-15' },
          { name: '트레드밀 경사 걷기', sets: 1, reps: '15분' },
          { name: '플랭크 변형', sets: 3, reps: '30초씩 세 가지 변형' },
          { name: '러시안 트위스트', sets: 3, reps: '20-30' }
        ]
      },
      {
        day: '일요일 (순환 운동)',
        exercises: [
          { name: '서킷 트레이닝(30초씩, 휴식 없이)', sets: 4, reps: '총 6가지 운동', notes: '스쿼트, 푸시업, 로우, 런지, 마운틴 클라이머, 플랭크' },
          { name: '느린 속도 유산소 운동', sets: 1, reps: '20-25분', notes: '낮은 강도로 회복 촉진' }
        ]
      }
    ],
    tips: [
      '세트 간 휴식 30-45초로 심박수 유지',
      '식이 조절과 병행시 더 높은 효과',
      '매일 8000보 이상 걷기 권장',
      '충분한 수분 섭취로 신진대사 촉진'
    ]
  },
  {
    id: 'home-workout',
    name: '장비 최소화 홈트레이닝 프로그램',
    description: '덤벨 한 쌍만으로 집에서 효과적으로 할 수 있는 전신 운동 프로그램입니다.',
    level: 'beginner',
    goal: 'hypertrophy',
    duration: '8주',
    daysPerWeek: 3,
    schedule: [
      {
        day: '월요일 (상체 중심)',
        exercises: [
          { name: '덤벨 벤치 프레스', sets: 4, reps: '8-12' },
          { name: '덤벨 로우', sets: 4, reps: '8-12' },
          { name: '덤벨 숄더 프레스', sets: 3, reps: '10-12' },
          { name: '덤벨 플라이', sets: 3, reps: '12-15' },
          { name: '덤벨 컬', sets: 3, reps: '10-12' },
          { name: '덤벨 킥백', sets: 3, reps: '12-15' }
        ]
      },
      {
        day: '수요일 (하체 중심)',
        exercises: [
          { name: '덤벨 고블릿 스쿼트', sets: 4, reps: '10-12' },
          { name: '덤벨 런지', sets: 4, reps: '10-12' },
          { name: '덤벨 RDL', sets: 3, reps: '10-12' },
          { name: '덤벨 카프 레이즈', sets: 3, reps: '15-20' },
          { name: '덤벨 러시안 트위스트', sets: 3, reps: '15-20' },
          { name: '플랭크', sets: 3, reps: '30-60초' }
        ]
      },
      {
        day: '금요일 (전신)',
        exercises: [
          { name: '덤벨 스쿼트 투 프레스', sets: 4, reps: '10-12' },
          { name: '덤벨 렌치로우', sets: 4, reps: '10-12' },
          { name: '덤벨 푸시업 투 로우', sets: 3, reps: '8-10' },
          { name: '덤벨 리버스 런지 위드 트위스트', sets: 3, reps: '8-10' },
          { name: '덤벨 파머 캐리', sets: 3, reps: '30-40초' }
        ]
      }
    ],
    tips: [
      '덤벨 무게는 마지막 1-2회가 힘들도록 설정',
      '가능하면 세트 간 45-60초로 유지',
      '동작이 어려우면 무게를 줄이고 정확한 폼에 집중',
      '매일 간단한 스트레칭 권장'
    ]
  },
  {
    id: 'functional-training',
    name: '기능성 체력 향상 프로그램',
    description: '일상생활과 운동 퍼포먼스를 향상시키는 기능성 운동 중심 프로그램입니다.',
    level: 'intermediate',
    goal: 'endurance',
    duration: '8주',
    daysPerWeek: 4,
    schedule: [
      {
        day: '월요일 (상체 기능성)',
        exercises: [
          { name: '푸시업 변형', sets: 4, reps: '각 변형 8-10회' },
          { name: '턱걸이 또는 네거티브 턱걸이', sets: 4, reps: '최대 반복' },
          { name: '케틀벨 클린 앤 프레스', sets: 3, reps: '8-10' },
          { name: '배틀 로프', sets: 3, reps: '30초' },
          { name: '터키시 겟업', sets: 3, reps: '6-8' }
        ]
      },
      {
        day: '화요일 (하체 기능성)',
        exercises: [
          { name: '고블릿 스쿼트', sets: 4, reps: '10-12' },
          { name: '케틀벨 스윙', sets: 4, reps: '15-20' },
          { name: '점프 런지', sets: 3, reps: '8-10' },
          { name: '싱글 레그 데드리프트', sets: 3, reps: '8-10' },
          { name: '래터럴 밴드 워크', sets: 3, reps: '15-20' }
        ]
      },
      {
        day: '목요일 (코어 & 회전)',
        exercises: [
          { name: '우드 초퍼', sets: 3, reps: '12-15' },
          { name: '플랭크 로테이션', sets: 3, reps: '8-10' },
          { name: '파이크 롤아웃', sets: 3, reps: '8-10' },
          { name: '사이드 플랭크 위드 리치', sets: 3, reps: '8-10' },
          { name: '버드독', sets: 3, reps: '10-12' }
        ]
      },
      {
        day: '토요일 (복합 & 민첩성)',
        exercises: [
          { name: '버피', sets: 3, reps: '8-12' },
          { name: '덤벨 쓰러스터', sets: 3, reps: '12-15' },
          { name: '래더 드릴', sets: 3, reps: '30초' },
          { name: '메디신볼 슬램', sets: 3, reps: '10-12' },
          { name: '점프 스쿼트', sets: 3, reps: '10-12' }
        ]
      }
    ],
    tips: [
      '동작의 품질과 제어에 집중',
      '세트 간 60-90초 휴식',
      '폼이 무너지면 즉시 중단',
      '주 2회 자신이 좋아하는 스포츠나 레크리에이션 활동 추가'
    ]
  }
];

const WorkoutProgram: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const navigate = useNavigate();

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
      
      {/* 운동 검색 안내 메모 추가 */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start">
        <Info className="text-blue-500 mr-2 flex-shrink-0 mt-1" size={20} />
        <div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            자세한 운동 정보는 상단 메뉴의 Q&A 페이지에서 운동 검색 기능을 통해 확인할 수 있습니다.
            각 운동의 올바른 자세와 주의사항을 확인하고 안전하게 운동하세요.
          </p>
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
          {workoutPrograms.map(program => (
            <Card key={program.id} className="hover:shadow-lg transition-shadow">
              <CardSection>
                <CardTitle>{program.name}</CardTitle>
                <div className="flex flex-wrap gap-2 my-2">
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
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                    {program.goal === 'strength' ? '근력 향상' : 
                     program.goal === 'hypertrophy' ? '근비대' :
                     program.goal === 'endurance' ? '근지구력' : '체중 감량'}
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
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs"
                          >
                            {exercise.name}
                          </span>
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