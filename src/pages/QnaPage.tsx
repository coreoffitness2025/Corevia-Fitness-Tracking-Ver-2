// 운동 부위별 운동 목록 데이터
const exercisesByPart: Record<ExercisePart, Exercise[]> = {
  chest: [
    {
      id: 'bench_press',
      name: '벤치 프레스',
      description: '가슴과 삼두근을 타겟으로 하는 대표적인 상체 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
      steps: [
        '벤치에 누워 양 발을 바닥에 단단히 고정시킵니다.',
        '바를 어깨너비보다 약간 넓게 잡습니다.',
        '바를 가슴 중앙까지 내린 후 팔을 완전히 펴는 동작을 반복합니다.',
        '내릴 때는 천천히, 올릴 때는 강하게 밀어올립니다.'
      ]
    },
    {
      id: 'incline_bench_press',
      name: '인클라인 벤치 프레스',
      description: '상부 가슴을 타겟으로 하는 가슴 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=SrqOu55lrYU',
      steps: [
        '30-45도 각도로 세팅된 벤치에 등을 기대어 앉습니다.',
        '바를 어깨너비보다 약간 넓게 잡습니다.',
        '바를 쇄골 상단까지 내린 후 팔을 완전히 펴는 동작을 반복합니다.',
        '일반 벤치프레스보다 중량은 약간 낮게 시작하는 것이 좋습니다.'
      ]
    },
    {
      id: 'decline_bench_press',
      name: '디클라인 벤치 프레스',
      description: '하부 가슴을 타겟으로 하는 가슴 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=LfyQBUKR8SE',
      steps: [
        '10-30도 각도로 아래로 기울어진 벤치에 누워 다리를 고정시킵니다.',
        '바를 어깨너비보다 약간 넓게 잡습니다.',
        '바를 가슴 하단부까지 내린 후 팔을 완전히 펴는 동작을 반복합니다.',
        '어깨 관절에 무리가 가지 않도록 주의합니다.'
      ]
    },
    {
      id: 'dumbbell_fly',
      name: '덤벨 플라이',
      description: '가슴 근육 바깥쪽을 타겟으로 하는 가슴 확장 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0',
      steps: [
        '벤치에 누워 덤벨을 각 손에 들고 팔을 위로 뻗습니다.',
        '팔꿈치를 약간 구부린 상태로 고정합니다.',
        '가슴 근육을 사용하여 양팔을 옆으로 벌립니다.',
        '가슴이 스트레칭되는 느낌이 들 때까지 벌린 후 시작 위치로 돌아옵니다.'
      ]
    },
    {
      id: 'cable_crossover',
      name: '케이블 크로스오버',
      description: '가슴 중앙부를 타겟으로 하는 케이블 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=taI4XduLpTk',
      steps: [
        '케이블 머신 양쪽에 서서 핸들을 각 손으로 잡습니다.',
        '한 발을 앞으로 내딛고 약간 앞으로 기울입니다.',
        '팔꿈치를 약간 구부린 채로 케이블을 몸 앞으로 당겨 교차시킵니다.',
        '천천히 시작 위치로 돌아가며 가슴 근육의 스트레칭을 느낍니다.'
      ]
    }
  ],
  back: [
    {
      id: 'deadlift',
      name: '데드리프트',
      description: '등, 허리, 하체 전체를 사용하는 대표적인 복합 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
      steps: [
        '바벨 앞에 발을 어깨너비로 벌리고 선 후 무릎을 굽혀 바를 잡습니다.',
        '등을 곧게 편 상태에서 바벨을 다리와 히프로 들어올립니다.',
        '허리를 곧게 유지한 채 어깨를 뒤로 젖히며 상체를 똑바로 세웁니다.',
        '역순으로 바벨을 내려놓는 동작을 반복합니다.'
      ]
    },
    {
      id: 'pull_up',
      name: '풀업',
      description: '등 넓이와 상부 등을 발달시키는 기초 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
      steps: [
        '풀업 바를 어깨너비보다 약간 넓게 잡습니다.',
        '팔을 완전히 펴고 매달린 상태에서 시작합니다.',
        '턱이 바 위로 올라오도록 몸을 끌어올립니다.',
        '천천히 원래 위치로 내려옵니다.'
      ]
    },
    {
      id: 'barbell_row',
      name: '바벨 로우',
      description: '등 중앙부와 광배근을 타겟으로 하는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=kBWAon7ItDw',
      steps: [
        '바벨을 잡고 상체를 거의 지면과 평행하게 숙입니다.',
        '무릎을 약간 굽히고 등을 곧게 유지합니다.',
        '팔꿈치를 뒤로 당기며 바벨을 복부 아래쪽으로 당깁니다.',
        '천천히 바벨을 내려 시작 위치로 돌아갑니다.'
      ]
    },
    {
      id: 'lat_pulldown',
      name: '랫 풀다운',
      description: '광배근과 상부 등을 강화하는 케이블 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
      steps: [
        '랫 풀다운 머신에 앉아 바를 어깨보다 넓게 잡습니다.',
        '가슴을 약간 내밀고 등을 곧게 유지합니다.',
        '팔꿈치를 아래로 당기며 바를 가슴 상단까지 내립니다.',
        '천천히 시작 위치로 돌아갑니다.'
      ]
    },
    {
      id: 'seated_cable_row',
      name: '시티드 케이블 로우',
      description: '등 중앙부와 하부를 타겟으로 하는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74',
      steps: [
        '케이블 로우 머신에 앉아 발을 플랫폼에 고정합니다.',
        '핸들을 잡고 무릎을 약간 구부린 채 상체를 곧게 폅니다.',
        '팔꿈치를 뒤로 당기며 핸들을 복부 쪽으로 당깁니다.',
        '천천히 팔을 펴며 시작 위치로 돌아갑니다.'
      ]
    }
  ],
  shoulder: [
    {
      id: 'overhead_press',
      name: '오버헤드 프레스',
      description: '어깨 전체, 특히 전면 삼각근을 발달시키는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
      steps: [
        '바벨을 어깨너비로 잡고 가슴 높이에서 시작합니다.',
        '팔꿈치를 바깥쪽으로 향하게 한 채로 바벨을 머리 위로 밀어올립니다.',
        '팔이 완전히 펴질 때까지 밀어올립니다.',
        '천천히 시작 위치로 내려옵니다.'
      ]
    },
    {
      id: 'lateral_raise',
      name: '래터럴 레이즈',
      description: '측면 삼각근을 타겟으로 하는 어깨 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
      steps: [
        '덤벨을 양손에 들고 팔을 옆구리에 붙인 채로 서 있습니다.',
        '팔꿈치를 약간 구부린 상태로 고정합니다.',
        '덤벨을 어깨 높이까지 들어올립니다.',
        '천천히 시작 위치로 내려옵니다.'
      ]
    },
    {
      id: 'front_raise',
      name: '프론트 레이즈',
      description: '전면 삼각근을 강화하는 어깨 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=sOcYlBI85oc',
      steps: [
        '덤벨을 양손에 들고 팔을 몸 앞에 위치시킵니다.',
        '팔을 거의 곧게 펴고 덤벨을 앞으로 들어올립니다.',
        '어깨 높이까지 올린 후 잠시 멈춥니다.',
        '천천히 시작 위치로 내려옵니다.'
      ]
    },
    {
      id: 'reverse_fly',
      name: '리버스 플라이',
      description: '후면 삼각근을 타겟으로 하는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=ttvfGg9d76c',
      steps: [
        '벤치에 가슴을 대고 엎드리거나 상체를 앞으로 굽힌 상태로 서서 진행합니다.',
        '덤벨을 양손에 들고 팔꿈치를 약간 구부립니다.',
        '어깨 근육을 사용하여 덤벨을 양옆으로 들어올립니다.',
        '견갑골이 조여지는 느낌이 들 때까지 올린 후 천천히 내립니다.'
      ]
    },
    {
      id: 'face_pull',
      name: '페이스 풀',
      description: '후면 삼각근과 회전근개를 강화하는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
      steps: [
        '케이블 머신 로프 어태치먼트를 얼굴 높이로 설정합니다.',
        '로프의 양쪽 끝을 각 손으로 잡습니다.',
        '팔꿈치를 바깥쪽으로 향하게 하며 로프를 얼굴 쪽으로 당깁니다.',
        '견갑골을 조이며 로프의 끝이 귀 옆에 오도록 당긴 후 천천히 돌아갑니다.'
      ]
    }
  ],
  leg: [
    {
      id: 'squat',
      name: '스쿼트',
      description: '하체 전체를 발달시키는 가장 기본적인 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=1oed-UmAxFs',
      steps: [
        '바벨을 어깨에 올리고 발을 어깨너비로 벌립니다.',
        '허리를 곧게 펴고 엉덩이를 뒤로 빼면서 무릎을 굽힙니다.',
        '대퇴부가 바닥과 평행해질 때까지 내려갑니다.',
        '발바닥으로 바닥을 강하게 밀며 시작 위치로 돌아옵니다.'
      ]
    },
    {
      id: 'leg_press',
      name: '레그 프레스',
      description: '하체 근육을 타겟으로 하는 기계 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
      steps: [
        '레그 프레스 기계에 앉아 발을 어깨너비로 플랫폼에 놓습니다.',
        '안전 장치를 해제하고 무릎을 가슴쪽으로 굽힙니다.',
        '발로 플랫폼을 밀어 다리를 펴지만, 무릎을 완전히 펴지는 않습니다.',
        '천천히 시작 위치로 돌아옵니다.'
      ]
    },
    {
      id: 'romanian_deadlift',
      name: '루마니안 데드리프트',
      description: '대둔근과 햄스트링을 강화하는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
      steps: [
        '바벨을 어깨너비로 잡고 허리를 펴고 섭니다.',
        '무릎을 약간 구부린 상태로 고정합니다.',
        '엉덩이를 뒤로 빼며 상체를 앞으로 굽힙니다.',
        '바벨을 정강이 중간까지 내린 후 엉덩이를 앞으로 밀며 시작 위치로 돌아옵니다.'
      ]
    },
    {
      id: 'lunges',
      name: '런지',
      description: '대퇴사두, 대둔근, 햄스트링을 고르게 발달시키는 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
      steps: [
        '양손에 덤벨을 들고 똑바로 섭니다.',
        '한 발을 앞으로 크게 내딛고 무릎을 굽힙니다.',
        '뒷발의 무릎이 바닥 가까이 내려가도록 합니다.',
        '앞발로 밀며 시작 위치로 돌아온 후 반대쪽 다리로 반복합니다.'
      ]
    },
    {
      id: 'leg_extensions',
      name: '레그 익스텐션',
      description: '대퇴사두를 집중적으로 발달시키는 기계 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
      steps: [
        '레그 익스텐션 머신에 앉고 발목 패드를 정강이 위에 고정합니다.',
        '무릎을 구부린 상태에서 시작합니다.',
        '대퇴사두를 수축하며 다리를 완전히 펴줍니다.',
        '천천히 시작 위치로 돌아갑니다.'
      ]
    },
    {
      id: 'leg_curls',
      name: '레그 컬',
      description: '햄스트링을 타겟으로 하는 기계 운동입니다.',
      videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
      steps: [
        '레그 컬 머신에 엎드리고 발목 패드를 발 뒤쪽에 고정합니다.',
        '다리를 편 상태에서 시작합니다.',
        '햄스트링을 수축하며 발을 엉덩이 쪽으로 구부립니다.',
        '천천히 시작 위치로 돌아갑니다.'
      ]
    }
  ]
}; 