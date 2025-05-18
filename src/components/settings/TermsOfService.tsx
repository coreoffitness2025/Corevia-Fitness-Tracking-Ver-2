import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Corevia Fitness 이용약관</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제1조 (목적)</h2>
          <p className="text-gray-700 dark:text-gray-300">
            본 약관은 Corevia Fitness(이하 "서비스")의 이용 조건, 절차, 권리와 의무 등을 정함을 목적으로 합니다.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제2조 (회원가입 및 서비스 이용)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>본 서비스는 Google 로그인을 통해 가입할 수 있으며, 탈퇴 시 모든 정보는 삭제됩니다.</li>
            <li>사용자는 신체 정보(키, 체중, 나이 등)와 운동/식단 기록을 입력하여 서비스를 이용할 수 있습니다.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제3조 (서비스 내용)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>운동 기록: 운동 부위 선택, 세트/횟수 입력, 그래프화 제공</li>
            <li>식단 기록: 목표 칼로리 안내, 음식별 사진 기록 및 피드백</li>
            <li>Q&A 및 가이드: 운동 검색, 칼로리 계산, 1RM 계산기 등</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제4조 (유료 서비스)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>일부 고급 기능은 유료 구독을 통해 제공됩니다.</li>
            <li>구독 요금: 월 4,000원 (Google Play 또는 Apple App Store를 통해 결제)</li>
            <li>환불 및 해지는 각 앱스토어 정책에 따릅니다.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제5조 (지적 재산권)</h2>
          <p className="text-gray-700 dark:text-gray-300">
            본 서비스의 UI, 콘텐츠, 데이터베이스는 Corevia에 귀속되며 무단 도용, 복제, 재배포를 금합니다.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제6조 (책임의 제한)</h2>
          <p className="text-gray-700 dark:text-gray-300">
            본 서비스는 운동 및 식단 정보를 안내하지만, 사용자의 선택에 따라 발생하는 건강상의 문제에 대해 책임을 지지 않습니다.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제7조 (분쟁 해결)</h2>
          <p className="text-gray-700 dark:text-gray-300">
            본 약관은 대한민국 법률에 따르며, 분쟁 발생 시 서울중앙지방법원을 관할 법원으로 합니다.
          </p>
        </section>
        
        <section>
          <p className="text-gray-700 dark:text-gray-300 font-medium">본 약관은 2025년 5월 18일부터 적용됩니다.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService; 