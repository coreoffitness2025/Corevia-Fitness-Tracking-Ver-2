import { Exercise } from '../types';

export const exercises: Exercise[] = [
  // 가슴 운동
  {
    id: 'benchPress',
    name: '벤치 프레스',
    part: 'chest',
    description: '가슴 상부와 삼두를 강화하는 기본 운동입니다.',
    instructions: [
      '벤치에 누워 발을 바닥에 평평하게 둡니다.',
      '바벨을 어깨 너비보다 약간 넓게 잡습니다.',
      '바벨을 가슴 중앙으로 내린 후 시작 위치로 밀어 올립니다.',
      '팔꿈치가 고정되고 어깨가 뒤로 꺾이지 않도록 합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    equipment: ['바벨', '벤치'],
    muscles: ['가슴', '삼두', '어깨 전면'],
    level: 'beginner'
  },
  {
    id: 'inclineBenchPress',
    name: '인클라인 벤치 프레스',
    part: 'chest',
    description: '가슴 상부를 집중적으로 강화하는 운동입니다.',
    instructions: [
      '벤치를 30-45도 각도로 조정합니다.',
      '벤치에 누워 발을 바닥에 평평하게 둡니다.',
      '바벨을 어깨 너비보다 약간 넓게 잡습니다.',
      '바벨을 가슴 상부로 내린 후 시작 위치로 밀어 올립니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=SrqOu55lrYU',
    equipment: ['바벨', '인클라인 벤치'],
    muscles: ['가슴 상부', '삼두', '어깨 전면'],
    level: 'intermediate'
  },
  {
    id: 'declineBenchPress',
    name: '디클라인 벤치 프레스',
    part: 'chest',
    description: '가슴 하부를 집중적으로 강화하는 운동입니다.',
    instructions: [
      '벤치를 15-30도 각도로 아래로 조정합니다.',
      '벤치에 누워 다리를 고정하고 발을 안전하게 둡니다.',
      '바벨을 어깨 너비보다 약간 넓게 잡습니다.',
      '바벨을 가슴 하부로 내린 후 시작 위치로 밀어 올립니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=LfyQBUKR8SE',
    equipment: ['바벨', '디클라인 벤치'],
    muscles: ['가슴 하부', '삼두'],
    level: 'intermediate'
  },
  {
    id: 'dumbbellPress',
    name: '덤벨 프레스',
    part: 'chest',
    description: '양쪽 가슴을 균형있게 강화하는 운동입니다.',
    instructions: [
      '벤치에 누워 양손에 덤벨을 들고 가슴 위에 위치시킵니다.',
      '팔꿈치를 약간 구부린 상태에서 덤벨을 가슴까지 내립니다.',
      '가슴 근육을 사용해 덤벨을 위로 밀어 올립니다.',
      '정상 위치에서 덤벨을 완전히 모으지 않고 약간의 긴장을 유지합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=QsYre__-aro',
    equipment: ['덤벨', '벤치'],
    muscles: ['가슴', '삼두', '어깨 전면'],
    level: 'beginner'
  },
  {
    id: 'inclineDumbbellPress',
    name: '인클라인 덤벨 프레스',
    part: 'chest',
    description: '가슴 상부를 집중적으로 강화하고 고립시키는 운동입니다.',
    instructions: [
      '벤치를 30-45도 각도로 조정합니다.',
      '양손에 덤벨을 들고 벤치에 앉습니다.',
      '덤벨을 어깨 높이에서 시작해 위로 밀어올립니다.',
      '천천히 덤벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
    equipment: ['덤벨', '인클라인 벤치'],
    muscles: ['가슴 상부', '삼두', '어깨 전면'],
    level: 'intermediate'
  },
  {
    id: 'dumbbellFly',
    name: '덤벨 플라이',
    part: 'chest',
    description: '가슴 근육을 확장시키고 스트레칭하는 운동입니다.',
    instructions: [
      '벤치에 누워 양손에 덤벨을 들고 팔을 위로 뻗습니다.',
      '팔꿈치를 약간 구부린 채로 유지합니다.',
      '팔을 옆으로 활짝 펴 가슴을 스트레칭합니다.',
      '가슴 근육을 사용해 덤벨을 다시 위로 모읍니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0',
    equipment: ['덤벨', '벤치'],
    muscles: ['가슴', '어깨 전면'],
    level: 'beginner'
  },
  {
    id: 'cableFly',
    name: '케이블 플라이',
    part: 'chest',
    description: '가슴 근육 전체를 고립시켜 강화하는 운동입니다.',
    instructions: [
      '케이블 머신 중앙에 서서 양쪽 케이블을 잡습니다.',
      '약간 앞으로 기울여 팔을 양옆으로 벌립니다.',
      '팔꿈치를 약간 구부린 상태로 유지합니다.',
      '가슴 근육을 사용해 핸들을 가슴 앞으로 모읍니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=Iwe6AmxVf7o',
    equipment: ['케이블 머신'],
    muscles: ['가슴', '어깨 전면'],
    level: 'intermediate'
  },
  {
    id: 'chestPress',
    name: '체스트 프레스 머신',
    part: 'chest',
    description: '안정적인 환경에서 가슴 근육을 강화하는 운동입니다.',
    instructions: [
      '머신에 앉아 손잡이를 잡고 등과 머리를 패드에 기대어 놓습니다.',
      '핸들을 잡고 가슴 근육을 사용해 앞으로 밀어냅니다.',
      '팔이 완전히 펴지기 직전까지 밀어줍니다.',
      '천천히 핸들을 가슴 쪽으로 돌아오게 합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=xUm0BiZCWlQ',
    equipment: ['체스트 프레스 머신'],
    muscles: ['가슴', '삼두', '어깨 전면'],
    level: 'beginner'
  },
  {
    id: 'pushUp',
    name: '푸시업',
    part: 'chest',
    description: '가슴, 어깨, 삼두를 동시에 강화하는 기본적인 맨몸 운동입니다.',
    instructions: [
      '손을 어깨보다 약간 넓게 바닥에 놓고 팔을 펴서 플랭크 자세를 취합니다.',
      '몸을 일직선으로 유지하면서 팔꿈치를 구부려 몸을 바닥 쪽으로 내립니다.',
      '가슴이 거의 바닥에 닿을 때까지 내려갑니다.',
      '팔을 펴서 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    equipment: ['없음'],
    muscles: ['가슴', '삼두', '어깨 전면', '코어'],
    level: 'beginner'
  },
  {
    id: 'dips',
    name: '딥스',
    part: 'chest',
    description: '가슴 하부와 삼두를 강화하는 복합 운동입니다.',
    instructions: [
      '평행봉에 올라 팔을 펴고 몸을 지지합니다.',
      '약간 앞으로 기울인 상태에서 팔꿈치를 구부려 몸을 내립니다.',
      '어깨가 평행봉보다 낮아질 때까지 내려갑니다.',
      '팔을 펴서 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=wjUmnZH528Y',
    equipment: ['평행봉'],
    muscles: ['가슴 하부', '삼두', '어깨 전면'],
    level: 'intermediate'
  },
  {
    id: 'peckDeckFly',
    name: '펙덱 플라이',
    part: 'chest',
    description: '가슴 근육을 집중적으로 고립시켜 강화하는 운동입니다.',
    instructions: [
      '펙덱 머신에 앉아 등을 패드에 기대고 팔을 패드 위에 올립니다.',
      '가슴 근육을 사용해 패드를 가운데로 모읍니다.',
      '최대 수축 상태에서 잠시 유지합니다.',
      '천천히 팔을 벌려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=Z57CtFmRMxA',
    equipment: ['펙덱 머신'],
    muscles: ['가슴', '어깨 전면'],
    level: 'beginner'
  },

  // 등 운동
  {
    id: 'deadlift',
    name: '데드리프트',
    part: 'back',
    description: '등 하부, 둔근 및 햄스트링을 강화하는 복합 운동입니다.',
    instructions: [
      '바벨 앞에 발을 어깨 너비로 벌리고 섭니다.',
      '무릎을 굽혀 바벨을 잡되, 등은 곧게 펴야 합니다.',
      '다리와 엉덩이 힘으로 바벨을 들어 올리며, 어깨를 뒤로 젖힙니다.',
      '허리를 편 상태로 엉덩이를 뒤로 밀며 바벨을 내립니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    equipment: ['바벨'],
    muscles: ['등 하부', '둔근', '햄스트링', '승모근'],
    level: 'intermediate'
  },
  {
    id: 'pullUp',
    name: '풀업',
    part: 'back',
    description: '등 상부와 이두를 강화하는 기본 운동입니다.',
    instructions: [
      '풀업 바를 어깨보다 약간 넓게 잡습니다.',
      '팔을 완전히 펴고 매달립니다.',
      '등 근육을 사용해 몸을 위로 당겨 턱이 바 위로 올라가게 합니다.',
      '천천히 몸을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    equipment: ['풀업 바'],
    muscles: ['광배근', '이두', '전완근'],
    level: 'intermediate'
  },
  {
    id: 'barbellRow',
    name: '바벨 로우',
    part: 'back',
    description: '등 중부와 상부를 강화하는 기본 운동입니다.',
    instructions: [
      '바벨을 어깨 너비로 잡고 발을 어깨 너비로 벌립니다.',
      '엉덩이를 뒤로 밀고 상체를 45도 각도로 구부립니다.',
      '등 근육을 사용해 바벨을 배꼽 쪽으로 당겨 올립니다.',
      '천천히 바벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=T3N-TO4reLQ',
    equipment: ['바벨'],
    muscles: ['광배근', '승모근', '이두', '전완근'],
    level: 'intermediate'
  },
  {
    id: 'tBarRow',
    name: '티바 로우',
    part: 'back',
    description: '등 중부와 상부를 집중적으로 강화하는 운동입니다.',
    instructions: [
      '티바 기구에 서서 손잡이를 양손으로 잡습니다.',
      '엉덩이를 뒤로 밀고 상체를 45도 각도로 구부립니다.',
      '등 근육을 사용해 바를 가슴 쪽으로 당겨 올립니다.',
      '천천히 바를 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=j3Igk5nyZE4',
    equipment: ['티바 로우 기구'],
    muscles: ['광배근', '승모근 중부', '후면 삼각근'],
    level: 'intermediate'
  },
  {
    id: 'seatedRow',
    name: '시티드 로우',
    part: 'back',
    description: '등 중부를 집중적으로 강화하는 운동입니다.',
    instructions: [
      '시티드 로우 머신에 앉아 발판에 발을 올립니다.',
      '손잡이를 잡고 무릎을 약간 구부린 상태에서 상체를 곧게 폅니다.',
      '등 근육을 사용해 손잡이를 복부 쪽으로 당깁니다.',
      '천천히 팔을 펴며 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74',
    equipment: ['시티드 로우 머신'],
    muscles: ['광배근', '승모근', '후면 삼각근'],
    level: 'beginner'
  },
  {
    id: 'latPulldown',
    name: '랫 풀다운',
    part: 'back',
    description: '등 상부와 광배근을 강화하는 운동입니다.',
    instructions: [
      '랫 풀다운 머신에 앉아 허벅지를 패드 아래에 고정합니다.',
      '바를 어깨보다 약간 넓게 잡습니다.',
      '등 근육을 사용해 바를 쇄골 쪽으로 당깁니다.',
      '천천히 바를 올려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    equipment: ['랫 풀다운 머신'],
    muscles: ['광배근', '이두', '전완근'],
    level: 'beginner'
  },
  {
    id: 'oneDumbbellRow',
    name: '원암 덤벨 로우',
    part: 'back',
    description: '등 근육을 한쪽씩 집중적으로 강화하는 운동입니다.',
    instructions: [
      '한 손과 같은 쪽 무릎을 벤치에 올려놓습니다.',
      '다른 손으로 덤벨을 잡고 팔을 완전히 펴줍니다.',
      '등 근육을 사용해 덤벨을 가슴 쪽으로 당깁니다.',
      '천천히 덤벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8',
    equipment: ['덤벨', '벤치'],
    muscles: ['광배근', '승모근', '후면 삼각근'],
    level: 'beginner'
  },
  {
    id: 'facePull',
    name: '페이스 풀',
    part: 'back',
    description: '후면 삼각근과 승모근을 강화하는 운동입니다.',
    instructions: [
      '케이블 머신의 로프 어태치먼트를 얼굴 높이로 설정합니다.',
      '로프의 양쪽 끝을 손바닥이 마주보게 잡습니다.',
      '팔꿈치를 바깥쪽으로 들어올려 로프를 얼굴 쪽으로 당깁니다.',
      '천천히 팔을 펴며 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
    equipment: ['케이블 머신', '로프 어태치먼트'],
    muscles: ['후면 삼각근', '승모근', '회전근개'],
    level: 'beginner'
  },

  // 어깨 운동
  {
    id: 'overheadPress',
    name: '오버헤드 프레스',
    part: 'shoulder',
    description: '어깨 전체와 삼두를 강화하는 기본 운동입니다.',
    instructions: [
      '바벨을 어깨 너비로 잡고 가슴 앞에 위치시킵니다.',
      '팔꿈치를 구부려 바벨을 어깨 높이로 들어올립니다.',
      '바벨을 머리 위로 곧게 밀어 올립니다.',
      '천천히 바벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
    equipment: ['바벨'],
    muscles: ['전면 삼각근', '측면 삼각근', '삼두'],
    level: 'intermediate'
  },
  {
    id: 'lateralRaise',
    name: '레터럴 레이즈',
    part: 'shoulder',
    description: '어깨 측면을 집중적으로 강화하는 운동입니다.',
    instructions: [
      '양손에 덤벨을 들고 옆구리에 붙인 채로 서 있습니다.',
      '팔꿈치를 약간 구부린 상태에서 덤벨을 양옆으로 들어올립니다.',
      '어깨 높이까지 들어올린 후 잠시 유지합니다.',
      '천천히 덤벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    equipment: ['덤벨'],
    muscles: ['측면 삼각근'],
    level: 'beginner'
  },
  {
    id: 'frontRaise',
    name: '프론트 레이즈',
    part: 'shoulder',
    description: '어깨 전면을 강화하는 운동입니다.',
    instructions: [
      '양손에 덤벨을 들고 허벅지 앞에 위치시킵니다.',
      '팔꿈치를 약간 구부린 상태에서 덤벨을 앞으로 들어올립니다.',
      '어깨 높이까지 들어올린 후 잠시 유지합니다.',
      '천천히 덤벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=TU8QYVW0gDU',
    equipment: ['덤벨'],
    muscles: ['전면 삼각근'],
    level: 'beginner'
  },
  {
    id: 'reverseFly',
    name: '리버스 플라이',
    part: 'shoulder',
    description: '어깨 후면과 승모근을 강화하는 운동입니다.',
    instructions: [
      '양손에 덤벨을 들고 상체를 앞으로 45도 구부립니다.',
      '팔꿈치를 약간 구부린 상태에서 덤벨을 양옆으로 들어올립니다.',
      '견갑골을 조이면서 뒤쪽으로 최대한 올립니다.',
      '천천히 덤벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=ttvfGg9d76c',
    equipment: ['덤벨'],
    muscles: ['후면 삼각근', '승모근'],
    level: 'beginner'
  },
  {
    id: 'arnoldPress',
    name: '아놀드 프레스',
    part: 'shoulder',
    description: '어깨 전체를 골고루 강화하는 복합 운동입니다.',
    instructions: [
      '양손에 덤벨을 들고 팔꿈치를 구부려 손바닥이 얼굴을 향하게 합니다.',
      '덤벨을 위로 올리면서 손바닥이 앞을 향하도록 회전시킵니다.',
      '팔을 완전히 편 상태에서 잠시 유지합니다.',
      '역순으로 내려와 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=6Z15_WdXmVw',
    equipment: ['덤벨'],
    muscles: ['전면 삼각근', '측면 삼각근', '후면 삼각근'],
    level: 'intermediate'
  },
  {
    id: 'militaryPress',
    name: '밀리터리 프레스',
    part: 'shoulder',
    description: '어깨 전체와 코어 안정성을 강화하는 복합 운동입니다.',
    instructions: [
      '선 자세로 바벨을 어깨 너비로 잡고 가슴 앞에 위치시킵니다.',
      '복부와 코어에 힘을 주고 바벨을 머리 위로 밀어 올립니다.',
      '최대 수축 지점에서 잠시 유지합니다.',
      '천천히 바벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
    equipment: ['바벨'],
    muscles: ['어깨', '삼두', '승모근'],
    level: 'intermediate'
  },
  {
    id: 'dumbbellShoulderPress',
    name: '덤벨 숄더 프레스',
    part: 'shoulder',
    description: '양쪽 어깨를 독립적으로 강화하는 운동입니다.',
    instructions: [
      '덤벨을 어깨 높이에서 손바닥이 앞을 향하도록 잡습니다.',
      '덤벨을 머리 위로 곧게 밀어 올립니다.',
      '정상 위치에서 덤벨이 서로 가깝지만 닿지 않게 합니다.',
      '천천히 덤벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
    equipment: ['덤벨'],
    muscles: ['어깨', '삼두'],
    level: 'beginner'
  },
  {
    id: 'uprightRow',
    name: '업라이트 로우',
    part: 'shoulder',
    description: '어깨 측면과 승모근을 강화하는 복합 운동입니다.',
    instructions: [
      '바벨이나 덤벨을 어깨 너비로 잡고 허벅지 앞에 위치시킵니다.',
      '팔꿈치를 바깥쪽으로 들어올려 바벨을 턱 쪽으로 당깁니다.',
      '어깨 높이까지 당겨 올리고 잠시 유지합니다.',
      '천천히 바벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=jaAV-rD45I0',
    equipment: ['바벨 또는 덤벨'],
    muscles: ['측면 삼각근', '승모근'],
    level: 'intermediate'
  },
  {
    id: 'shoulderShrug',
    name: '숄더 슈러그',
    part: 'shoulder',
    description: '승모근을 집중적으로 강화하는 운동입니다.',
    instructions: [
      '양손에 덤벨을 들고 팔을 편 상태로 서 있습니다.',
      '어깨를 귀 쪽으로 들어올립니다.',
      '최대 수축 상태에서 잠시 유지합니다.',
      '천천히 어깨를 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=g6qbq4Lf1FI',
    equipment: ['덤벨 또는 바벨'],
    muscles: ['승모근'],
    level: 'beginner'
  },
  {
    id: 'cableLateralRaise',
    name: '케이블 레터럴 레이즈',
    part: 'shoulder',
    description: '어깨 측면을 일정한 텐션으로 강화하는 운동입니다.',
    instructions: [
      '케이블 머신 옆에 서서 손잡이를 반대쪽 손으로 잡습니다.',
      '약간 기울인 상태에서 팔을 옆으로 들어올립니다.',
      '어깨 높이까지 들어올린 후 잠시 유지합니다.',
      '천천히 팔을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=ppx3FlO8YIo',
    equipment: ['케이블 머신'],
    muscles: ['측면 삼각근'],
    level: 'intermediate'
  },

  // 하체 운동
  {
    id: 'squat',
    name: '스쿼트',
    part: 'leg',
    description: '하체 전체를 강화하는 기본 운동입니다.',
    instructions: [
      '바벨을 어깨에 올리고 발을 어깨 너비로 벌립니다.',
      '엉덩이를 뒤로 빼면서 무릎을 구부려 내려갑니다.',
      '허벅지가 바닥과 평행해질 때까지 내려갑니다.',
      '발 뒤꿈치를 밀어 원래 자세로 돌아옵니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
    equipment: ['바벨'],
    muscles: ['대퇴사두근', '둔근', '햄스트링'],
    level: 'intermediate'
  },
  {
    id: 'legPress',
    name: '레그 프레스',
    part: 'leg',
    description: '하체 전체를 강화하는 기본 운동입니다.',
    instructions: [
      '레그 프레스 머신에 앉아 발을 어깨 너비로 벌려 플랫폼에 올립니다.',
      '안전 장치를 해제하고 무릎을 구부려 가슴 쪽으로 플랫폼을 내립니다.',
      '다리를 펴서 플랫폼을 밀어냅니다.',
      '무릎을 완전히 펴지 않도록 주의하며 반복합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    equipment: ['레그 프레스 머신'],
    muscles: ['대퇴사두근', '둔근', '햄스트링'],
    level: 'beginner'
  },
  {
    id: 'lunges',
    name: '런지',
    part: 'leg',
    description: '하체 균형과 안정성을 강화하는 운동입니다.',
    instructions: [
      '양손에 덤벨을 들고 발을 모아 서 있습니다.',
      '한 발을 앞으로 크게 내딛어 런지 자세를 취합니다.',
      '앞쪽 무릎이 90도가 될 때까지 몸을 낮춥니다.',
      '앞발의 힘으로 몸을 밀어 올려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
    equipment: ['덤벨(선택)'],
    muscles: ['대퇴사두근', '둔근', '햄스트링'],
    level: 'beginner'
  },
  {
    id: 'legExtension',
    name: '레그 익스텐션',
    part: 'leg',
    description: '대퇴사두근을 집중적으로 강화하는 운동입니다.',
    instructions: [
      '레그 익스텐션 머신에 앉아 발목을 패드 아래에 위치시킵니다.',
      '대퇴사두근의 힘으로 다리를 곧게 펴줍니다.',
      '최대한 펴진 상태에서 잠시 유지합니다.',
      '천천히 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
    equipment: ['레그 익스텐션 머신'],
    muscles: ['대퇴사두근'],
    level: 'beginner'
  },
  {
    id: 'legCurl',
    name: '레그 컬',
    part: 'leg',
    description: '햄스트링을 집중적으로 강화하는 운동입니다.',
    instructions: [
      '레그 컬 머신에 엎드려 발목을 패드 아래에 위치시킵니다.',
      '햄스트링의 힘으로 다리를 구부려 패드를 끌어올립니다.',
      '최대한 구부린 상태에서 잠시 유지합니다.',
      '천천히 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
    equipment: ['레그 컬 머신'],
    muscles: ['햄스트링'],
    level: 'beginner'
  },
  {
    id: 'calfRaise',
    name: '카프 레이즈',
    part: 'leg',
    description: '종아리를 강화하는 운동입니다.',
    instructions: [
      '스미스 머신이나 계단 가장자리에 발볼을 올려놓습니다.',
      '발뒤꿈치를 최대한 내려 종아리를 스트레칭합니다.',
      '발목을 최대한 들어올려 종아리를 수축시킵니다.',
      '천천히 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=-M4-G8p8fmc',
    equipment: ['스미스 머신 또는 계단'],
    muscles: ['비복근', '가자미근'],
    level: 'beginner'
  },

  // 이두 운동
  {
    id: 'bicepCurl',
    name: '바이셉 컬',
    part: 'biceps',
    description: '이두를 강화하는 기본 운동입니다.',
    instructions: [
      '양손에 덤벨을 들고 팔을 편 상태로 서 있습니다.',
      '팔꿈치를 고정한 채로 덤벨을 어깨 쪽으로 들어올립니다.',
      '이두가 완전히 수축된 상태에서 잠시 유지합니다.',
      '천천히 덤벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    equipment: ['덤벨'],
    muscles: ['이두'],
    level: 'beginner'
  },
  {
    id: 'concentrationCurl',
    name: '컨센트레이션 컬',
    part: 'biceps',
    description: '이두를 집중적으로 고립시켜 강화하는 운동입니다.',
    instructions: [
      '벤치에 앉아 다리를 넓게 벌립니다.',
      '한 팔의 팔꿈치를 같은 쪽 허벅지 안쪽에 기대고 덤벨을 잡습니다.',
      '이두를 수축시켜 덤벨을 들어올립니다.',
      '천천히 덤벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=0AZlSK-gM08',
    equipment: ['덤벨', '벤치'],
    muscles: ['이두'],
    level: 'beginner'
  },
  {
    id: 'cableCurl',
    name: '케이블 컬',
    part: 'biceps',
    description: '일정한 텐션으로 이두를 강화하는 운동입니다.',
    instructions: [
      '케이블 머신 앞에 서서 바를 어깨 너비로 잡습니다.',
      '팔꿈치를 고정한 채로 바를 들어올립니다.',
      '이두가 완전히 수축된 상태에서 잠시 유지합니다.',
      '천천히 바를 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=NFzTWp2qpiE',
    equipment: ['케이블 머신'],
    muscles: ['이두'],
    level: 'beginner'
  },
  {
    id: 'eZBarCurl',
    name: 'EZ바 컬',
    part: 'biceps',
    description: '손목에 부담을 줄이면서 이두를 효과적으로 강화하는 운동입니다.',
    instructions: [
      'EZ바를 잡고 팔을 편 상태로 서 있습니다.',
      '팔꿈치를 고정한 채로 바를 들어올립니다.',
      '이두가 완전히 수축된 상태에서 잠시 유지합니다.',
      '천천히 바를 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=6LrsjAJzRm4',
    equipment: ['EZ바'],
    muscles: ['이두'],
    level: 'beginner'
  },
  {
    id: 'hammerCurl',
    name: '해머 컬',
    part: 'biceps',
    description: '이두와 전완근을 함께 강화하는 운동입니다.',
    instructions: [
      '양손에 덤벨을 들고 손바닥이 서로 마주보게 잡습니다.',
      '팔꿈치를 고정한 채로 덤벨을 어깨 쪽으로 들어올립니다.',
      '이두가 완전히 수축된 상태에서 잠시 유지합니다.',
      '천천히 덤벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
    equipment: ['덤벨'],
    muscles: ['이두', '전완근'],
    level: 'beginner'
  },
  {
    id: 'inclineDumbbellCurl',
    name: '인클라인 덤벨 컬',
    part: 'biceps',
    description: '이두 하부를 집중적으로 강화하는 운동입니다.',
    instructions: [
      '인클라인 벤치에 등을 기대고 앉습니다.',
      '양손에 덤벨을 들고 팔을 자연스럽게 내립니다.',
      '팔꿈치를 고정한 채로 덤벨을 들어올립니다.',
      '천천히 덤벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=soxrZlIl35U',
    equipment: ['덤벨', '인클라인 벤치'],
    muscles: ['이두 하부'],
    level: 'intermediate'
  },
  {
    id: 'barbellCurl',
    name: '바벨 컬',
    part: 'biceps',
    description: '이두를 효과적으로 강화하는 운동입니다.',
    instructions: [
      '바벨을 어깨 너비로 잡고 팔을 편 상태로 서 있습니다.',
      '팔꿈치를 고정한 채로 바벨을 어깨 쪽으로 들어올립니다.',
      '이두가 완전히 수축된 상태에서 잠시 유지합니다.',
      '천천히 바벨을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    equipment: ['바벨'],
    muscles: ['이두'],
    level: 'beginner'
  },
  {
    id: 'preacherCurl',
    name: '프리처 컬',
    part: 'biceps',
    description: '이두 하부를 집중적으로 강화하는 운동입니다.',
    instructions: [
      '프리처 벤치에 앉아 상완을 패드에 기대고 바벨이나 덤벨을 잡습니다.',
      '팔꿈치를 패드에 고정한 채로 중량을 들어올립니다.',
      '이두가 완전히 수축된 상태에서 잠시 유지합니다.',
      '천천히 중량을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0',
    equipment: ['프리처 벤치', '바벨 또는 덤벨'],
    muscles: ['이두 하부'],
    level: 'intermediate'
  },

  // 삼두 운동
  {
    id: 'tricepPushdown',
    name: '트라이셉 푸시다운',
    part: 'triceps',
    description: '삼두를 강화하는 기본 운동입니다.',
    instructions: [
      '케이블 머신 앞에 서서 바를 어깨 너비로 잡습니다.',
      '팔꿈치를 옆구리에 붙이고 전완만 움직이도록 합니다.',
      '바를 아래로 밀어 팔을 완전히 펴줍니다.',
      '천천히 바를 올려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
    equipment: ['케이블 머신'],
    muscles: ['삼두'],
    level: 'beginner'
  },
  {
    id: 'ropePushdown',
    name: '로프 푸시다운',
    part: 'triceps',
    description: '삼두의 외측두와 내측두를 강화하는 운동입니다.',
    instructions: [
      '케이블 머신에 로프 어태치먼트를 연결합니다.',
      '로프를 양손으로 잡고 팔꿈치를 옆구리에 고정합니다.',
      '로프를 아래로 밀면서 끝부분을 바깥쪽으로 벌립니다.',
      '천천히 로프를 올려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=vB5OHsJ3EME',
    equipment: ['케이블 머신', '로프 어태치먼트'],
    muscles: ['삼두 외측두', '삼두 내측두'],
    level: 'beginner'
  },
  {
    id: 'closegripBenchPress',
    name: '클로즈 그립 벤치 프레스',
    part: 'triceps',
    description: '삼두와 가슴을 함께 강화하는 복합 운동입니다.',
    instructions: [
      '벤치에 누워 바벨을 어깨보다 좁게 잡습니다.',
      '팔꿈치를 몸에 붙인 상태로 바벨을 가슴 쪽으로 내립니다.',
      '삼두의 힘으로 바벨을 위로 밀어 올립니다.',
      '팔꿈치는 계속 몸에 가깝게 유지합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=nEF0bv2FW94',
    equipment: ['바벨', '벤치'],
    muscles: ['삼두', '가슴', '어깨 전면'],
    level: 'intermediate'
  },
  {
    id: 'diamondPushUp',
    name: '다이아몬드 푸시업',
    part: 'triceps',
    description: '삼두를 집중적으로 강화하는 맨몸 운동입니다.',
    instructions: [
      '양손을 다이아몬드 형태로 모아 바닥에 놓습니다.',
      '몸을 일직선으로 유지하면서 팔꿈치를 구부려 몸을 내립니다.',
      '가슴이 손에 거의 닿을 때까지 내려갑니다.',
      '삼두의 힘으로 몸을 밀어 올려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=J0DnG1_S92I',
    equipment: ['없음'],
    muscles: ['삼두', '가슴'],
    level: 'intermediate'
  },
  {
    id: 'skullCrusher',
    name: '스컬 크러셔',
    part: 'triceps',
    description: '삼두 장두를 집중적으로 강화하는 운동입니다.',
    instructions: [
      '벤치에 누워 바벨이나 EZ바를 이마 위로 들어올립니다.',
      '팔꿈치만 구부려 바를 이마 쪽으로 내립니다.',
      '삼두의 힘으로 바를 다시 위로 밀어 올립니다.',
      '팔꿈치는 항상 안쪽을 향하도록 유지합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM',
    equipment: ['벤치', '바벨 또는 EZ바'],
    muscles: ['삼두 장두'],
    level: 'intermediate'
  },
  {
    id: 'tricepKickback',
    name: '트라이셉 킥백',
    part: 'triceps',
    description: '삼두 외측두를 강화하는 운동입니다.',
    instructions: [
      '한 손과 같은 쪽 무릎을 벤치에 올려놓습니다.',
      '다른 손에 덤벨을 들고 팔꿈치를 90도로 구부립니다.',
      '팔꿈치를 고정한 채로 덤벨을 뒤로 밀어 팔을 펴줍니다.',
      '천천히 팔을 구부려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=m9me07kHPnI',
    equipment: ['덤벨', '벤치'],
    muscles: ['삼두 외측두'],
    level: 'beginner'
  },
  {
    id: 'overheadExtension',
    name: '오버헤드 익스텐션',
    part: 'triceps',
    description: '삼두 장두를 효과적으로 강화하는 운동입니다.',
    instructions: [
      '양손으로 덤벨을 잡고 머리 위로 들어올립니다.',
      '팔꿈치를 구부려 덤벨을 머리 뒤로 내립니다.',
      '삼두의 힘으로 덤벨을 다시 위로 밀어 올립니다.',
      '팔꿈치는 항상 앞을 향하도록 유지합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=YbX7Wd8jQ-Q',
    equipment: ['덤벨'],
    muscles: ['삼두 장두'],
    level: 'beginner'
  },
  {
    id: 'benchDip',
    name: '벤치 딥',
    part: 'triceps',
    description: '삼두를 강화하는 기본적인 맨몸 운동입니다.',
    instructions: [
      '두 개의 벤치 사이에 위치하여 한 벤치에 손을 대고 다른 벤치에 발을 올립니다.',
      '엉덩이를 벤치에서 떨어뜨리고 팔꿈치를 구부려 몸을 내립니다.',
      '팔꿈치가 약 90도가 될 때까지 내려갑니다.',
      '삼두의 힘으로 몸을 밀어 올려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=c3ZGl4pAwZ4',
    equipment: ['벤치'],
    muscles: ['삼두', '가슴 하부'],
    level: 'beginner'
  },

  // 복근 운동
  {
    id: 'crunch',
    name: '크런치',
    part: 'abs',
    description: '복직근 상부를 강화하는 기본 운동입니다.',
    instructions: [
      '등을 바닥에 대고 누워 무릎을 구부립니다.',
      '손을 머리 뒤나 가슴 앞에 위치시킵니다.',
      '복부 근육을 사용해 상체를 들어올립니다.',
      '천천히 상체를 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=4hmQD6urLXA',
    equipment: ['없음'],
    muscles: ['복직근 상부'],
    level: 'beginner'
  },
  {
    id: 'sitUp',
    name: '싯업',
    part: 'abs',
    description: '복직근과 고관절 굴곡근을 강화하는 기본 운동입니다.',
    instructions: [
      '등을 바닥에 대고 누워 무릎을 구부립니다.',
      '발을 고정하고 팔을 가슴 앞에 교차하거나 머리 뒤에 둡니다.',
      '복부 근육을 사용해 상체를 완전히 일으킵니다.',
      '천천히 상체를 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=jDwoBqPH0jk',
    equipment: ['없음'],
    muscles: ['복직근', '고관절 굴곡근'],
    level: 'beginner'
  },
  {
    id: 'hangingLegRaise',
    name: '행잉 레그 레이즈',
    part: 'abs',
    description: '하복부와 코어 강도를 강화하는 고급 운동입니다.',
    instructions: [
      '풀업 바에 매달립니다.',
      '복부에 힘을 주고 다리를 곧게 펴서 앞으로 들어올립니다.',
      '다리를 수평 이상으로 올려 하복부를 완전히 수축시킵니다.',
      '천천히 다리를 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=hdng3Nm1x_E',
    equipment: ['풀업 바'],
    muscles: ['복직근 하부', '고관절 굴곡근', '전완근'],
    level: 'advanced'
  },
  {
    id: 'abRollout',
    name: '애브 롤아웃',
    part: 'abs',
    description: '전체 코어와 복근을 강화하는 효과적인 운동입니다.',
    instructions: [
      '무릎을 꿇고 롤러를 손으로 잡습니다.',
      '복부에 힘을 주고 롤러를 천천히 앞으로 밀어냅니다.',
      '가능한 만큼 멀리 뻗은 다음 잠시 유지합니다.',
      '복부 근육을 사용해 롤러를 몸쪽으로 당겨 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=A2xRx7dGWaE',
    equipment: ['AB 롤러'],
    muscles: ['복직근', '복사근', '척추 기립근'],
    level: 'intermediate'
  },
  {
    id: 'bicycleCrunch',
    name: '바이시클 크런치',
    part: 'abs',
    description: '복직근과 복사근을 동시에 강화하는 효과적인 운동입니다.',
    instructions: [
      '등을 바닥에 대고 누워 손을 머리 뒤에 둡니다.',
      '무릎을 구부려 발을 들어올립니다.',
      '오른쪽 팔꿈치를 왼쪽 무릎에 닿도록 하고, 동시에 오른쪽 다리를 펴줍니다.',
      '반대쪽도 같은 방식으로 반복하며 자전거 타는 동작을 흉내냅니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=9FGilxCbdz8',
    equipment: ['없음'],
    muscles: ['복직근', '복사근'],
    level: 'intermediate'
  },
  {
    id: 'plank',
    name: '플랭크',
    part: 'abs',
    description: '코어 전체를 강화하는 정적 운동입니다.',
    instructions: [
      '전완과 발끝으로 바닥을 지지한 자세를 취합니다.',
      '몸은 일직선을 유지하고 복부에 힘을 줍니다.',
      '호흡을 균일하게 유지하며 자세를 유지합니다.',
      '30초에서 2분 정도 유지하는 것을 목표로 합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
    equipment: ['없음'],
    muscles: ['복직근', '복사근', '허리 근육'],
    level: 'beginner'
  },
  {
    id: 'legRaise',
    name: '레그 레이즈',
    part: 'abs',
    description: '하복부를 집중적으로 강화하는 운동입니다.',
    instructions: [
      '등을 바닥에 대고 누워 다리를 곧게 펴줍니다.',
      '복부 근육을 사용해 다리를 수직으로 들어올립니다.',
      '엉덩이가 약간 들릴 정도로 다리를 최대한 높이 올립니다.',
      '천천히 다리를 내려 바닥 직전에서 멈춥니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=l4kQd9eWclE',
    equipment: ['없음'],
    muscles: ['복직근 하부', '장요근'],
    level: 'intermediate'
  },
  {
    id: 'russianTwist',
    name: '러시안 트위스트',
    part: 'abs',
    description: '복사근을 강화하는 트위스팅 운동입니다.',
    instructions: [
      '바닥에 앉아 무릎을 구부리고 발을 약간 들어올립니다.',
      '상체를 약간 뒤로 기울이고 손은 몸 앞에 모읍니다.',
      '복부에 힘을 주고 상체를 한쪽에서 다른 쪽으로 회전시킵니다.',
      '양쪽으로 번갈아가며 반복합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI',
    equipment: ['덤벨 또는 메디신볼(선택)'],
    muscles: ['복사근', '복직근'],
    level: 'intermediate'
  },
  {
    id: 'mountainClimber',
    name: '마운틴 클라이머',
    part: 'abs',
    description: '코어와 심폐 지구력을 함께 강화하는 운동입니다.',
    instructions: [
      '푸시업 자세로 시작해 손은 어깨 너비로 벌립니다.',
      '한쪽 무릎을 가슴 쪽으로 끌어당깁니다.',
      '빠르게 다리를 교체하며 달리는 동작을 합니다.',
      '허리가 과도하게 들리거나 내려가지 않도록 주의합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=nmwgirgXLYM',
    equipment: ['없음'],
    muscles: ['복직근', '복사근', '고관절 굴곡근'],
    level: 'intermediate'
  },
  {
    id: 'dragonFlag',
    name: '드래곤 플래그',
    part: 'abs',
    description: '전체 코어와 복근을 강화하는 고난도 운동입니다.',
    instructions: [
      '벤치나 평평한 표면에 누워 머리 위쪽을 손으로 잡습니다.',
      '다리와 몸을 일직선으로 들어올립니다.',
      '어깨만 바닥에 닿은 상태에서 몸을 천천히 내립니다.',
      '바닥에 닿기 직전에 다시 몸을 들어올립니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=moyFIvRrS0s',
    equipment: ['벤치 또는 평평한 표면'],
    muscles: ['복직근', '복사근', '허리 근육', '고관절 굴곡근'],
    level: 'advanced'
  },

  // 유산소 운동
  {
    id: 'running',
    name: '러닝',
    part: 'cardio',
    description: '심폐 지구력과 하체 근지구력을 강화하는 기본 유산소 운동입니다.',
    instructions: [
      '편안한 페이스로 시작해 점차 속도를 높입니다.',
      '상체는 곧게 펴고 팔은 90도로 구부려 자연스럽게 흔듭니다.',
      '발의 중간이나 앞부분으로 착지하도록 합니다.',
      '일정한 호흡 패턴을 유지합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=_kGESn8ArrU',
    equipment: ['러닝화'],
    muscles: ['대퇴사두근', '햄스트링', '종아리', '심장'],
    level: 'beginner'
  },
  {
    id: 'cycling',
    name: '사이클링',
    part: 'cardio',
    description: '관절에 부담이 적으면서 심폐 지구력과 하체를 강화하는 운동입니다.',
    instructions: [
      '안장 높이를 적절히 조절해 무릎이 살짝 구부러지도록 합니다.',
      '상체는 약간 앞으로 기울이고 손은 핸들을 편안하게 잡습니다.',
      '페달을 원을 그리듯 일정한 리듬으로 밟습니다.',
      '호흡은 자연스럽게 유지합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=weOd8r9JHdU',
    equipment: ['자전거 또는 실내 사이클'],
    muscles: ['대퇴사두근', '햄스트링', '종아리', '심장'],
    level: 'beginner'
  },
  {
    id: 'jumpRope',
    name: '줄넘기',
    part: 'cardio',
    description: '전신 근육과 심폐 지구력을 효과적으로 강화하는 운동입니다.',
    instructions: [
      '줄은 적절한 길이로 조절하고 손잡이를 가볍게 잡습니다.',
      '발끝으로 가볍게 뛰며 손목 회전으로 줄을 돌립니다.',
      '착지할 때 무릎을 약간 구부려 충격을 흡수합니다.',
      '일정한 리듬과 호흡을 유지합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=FJmRQ5iTXKE',
    equipment: ['줄넘기'],
    muscles: ['종아리', '대퇴사두근', '심장'],
    level: 'beginner'
  },
  {
    id: 'swimming',
    name: '수영',
    part: 'cardio',
    description: '관절 부담이 적고 전신 근육을 균형 있게 발달시키는 운동입니다.',
    instructions: [
      '자신에게 맞는 영법(자유형, 배영, 평영, 접영)을 선택합니다.',
      '호흡 패턴을 일정하게 유지합니다.',
      '동작을 부드럽게 연결하여 효율적으로 수영합니다.',
      '점차 거리나 시간을 늘려가며 강도를 조절합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=pFpbwYY_QH8',
    equipment: ['수영복', '수경'],
    muscles: ['광배근', '가슴', '삼두', '대퇴사두근', '심장'],
    level: 'intermediate'
  },
  {
    id: 'burpee',
    name: '버피',
    part: 'cardio',
    description: '전신 근육과 심폐 지구력을 강화하는 고강도 운동입니다.',
    instructions: [
      '서 있는 자세에서 시작해 몸을 낮추고 손을 바닥에 댑니다.',
      '다리를 뒤로 뻗어 플랭크 자세를 취합니다.',
      '푸시업을 한 후 다시 다리를 앞으로 당겨옵니다.',
      '점프하며 팔을 위로 뻗어 동작을 마무리합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=TU8QYVW0gDU',
    equipment: ['없음'],
    muscles: ['대퇴사두근', '햄스트링', '가슴', '삼두', '심장'],
    level: 'advanced'
  },
  {
    id: 'rowing',
    name: '로잉',
    part: 'cardio',
    description: '전신 근육과 심폐 지구력을 함께 강화하는 저충격 운동입니다.',
    instructions: [
      '로잉 머신에 앉아 발을 패드에 고정하고 핸들을 잡습니다.',
      '무릎을 펴면서 상체를 뒤로 기울입니다.',
      '핸들을 복부 쪽으로 당겨 팔꿈치를 뒤로 젖힙니다.',
      '팔을 펴고 상체를 앞으로 기울여 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=H0r_ZPXJLtg',
    equipment: ['로잉 머신'],
    muscles: ['등', '이두', '대퇴사두근', '햄스트링', '심장'],
    level: 'beginner'
  },
  {
    id: 'hiit',
    name: '고강도 인터벌 트레이닝(HIIT)',
    part: 'cardio',
    description: '짧은 시간에 효과적인 지방 연소와 심폐 지구력 향상을 위한 운동입니다.',
    instructions: [
      '짧은 시간 동안 최대 강도로 운동합니다(예: 30초 스프린트).',
      '휴식 시간을 가집니다(예: 30-60초 걷기).',
      '이 사이클을 반복합니다(예: 10-15분).',
      '항상 적절한 워밍업과 쿨다운을 포함해야 합니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
    equipment: ['다양함(없음부터 여러 장비까지)'],
    muscles: ['전신', '심장'],
    level: 'intermediate'
  },

  // 하체 운동
  {
    id: 'bulgarianSplitSquat',
    name: '불가리안 스플릿 스쿼트',
    part: 'leg',
    description: '한쪽 다리씩 균형감각과 함께 하체를 강화하는 운동입니다.',
    instructions: [
      '벤치 앞에 서서 한쪽 발을 벤치 위에 올립니다.',
      '상체를 곧게 유지하면서 앞쪽 다리로 스쿼트를 수행합니다.',
      '앞쪽 무릎이 90도가 될 때까지 내려갑니다.',
      '앞쪽 다리로 밀어올려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    equipment: ['벤치', '덤벨(선택)'],
    muscles: ['대퇴사두근', '둔근', '햄스트링'],
    level: 'intermediate'
  },
  {
    id: 'romanianDeadlift',
    name: '루마니안 데드리프트',
    part: 'leg',
    description: '햄스트링과 둔근을 집중적으로 강화하는 운동입니다.',
    instructions: [
      '바벨을 어깨 너비로 잡고 무릎을 약간 구부린 상태로 선다.',
      '엉덩이를 뒤로 밀며 상체를 앞으로 기울입니다.',
      '바벨을 허벅지를 따라 내려 정강이 중간까지 내립니다.',
      '둔근과 햄스트링을 수축시켜 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
    equipment: ['바벨'],
    muscles: ['햄스트링', '둔근', '등 하부'],
    level: 'intermediate'
  },
  {
    id: 'hackSquat',
    name: '핵 스쿼트',
    part: 'leg',
    description: '대퇴사두근을 집중적으로 강화하는 운동입니다.',
    instructions: [
      '핵 스쿼트 머신에 등을 대고 어깨 패드 아래에 어깨를 위치시킵니다.',
      '발을 어깨 너비로 벌려 약간 앞으로 위치시킵니다.',
      '안전 장치를 해제하고 무릎을 구부려 내려갑니다.',
      '대퇴사두근을 사용해 시작 자세로 밀어 올립니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=EdtaJRBqwes',
    equipment: ['핵 스쿼트 머신'],
    muscles: ['대퇴사두근', '둔근'],
    level: 'intermediate'
  },
  {
    id: 'stepUp',
    name: '스텝업',
    part: 'leg',
    description: '하체 균형과 안정성을 향상시키는 운동입니다.',
    instructions: [
      '벤치나 플랫폼 앞에 서서 덤벨을 양손에 들고 있습니다.',
      '한쪽 발을 벤치 위에 올리고 그 다리의 힘으로 몸을 들어올립니다.',
      '반대쪽 무릎을 들어올려 균형을 잡습니다.',
      '천천히 반대쪽 발을 내려 시작 자세로 돌아갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=WCFCdxzFBa4',
    equipment: ['벤치 또는 플랫폼', '덤벨(선택)'],
    muscles: ['대퇴사두근', '둔근', '햄스트링'],
    level: 'beginner'
  },
  {
    id: 'gluteBridge',
    name: '글루트 브릿지',
    part: 'leg',
    description: '둔근을 집중적으로 강화하는 운동입니다.',
    instructions: [
      '등을 바닥에 대고 누워 무릎을 구부립니다.',
      '발을 엉덩이 가까이에 두고 팔은 옆에 둡니다.',
      '둔근에 힘을 주어 엉덩이를 들어올립니다.',
      '최고 지점에서 둔근을 꽉 수축시키고 천천히 내려갑니다.'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=wPM8icPu6H8',
    equipment: ['바벨 또는 덤벨(선택)'],
    muscles: ['둔근', '햄스트링'],
    level: 'beginner'
  }
]; 