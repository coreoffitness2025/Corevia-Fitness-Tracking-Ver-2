import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Corevia Fitness 개인정보처리방침</h1>
      
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        Corevia Fitness(이하 "본 서비스")는 사용자 개인정보를 소중히 여기며, 아래와 같은 방침을 통해 개인정보를 보호합니다.
      </p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">1. 수집하는 개인정보 항목</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Google 로그인 시: 이메일, 이름, 프로필 사진</li>
            <li>사용자가 직접 입력하는 정보: 키, 몸무게, 나이, 1RM, 운동 세트 설정, 식단 사진, 운동 이력, 식사 기록, 메모</li>
            <li>기기 정보: 운영체제, 사용 브라우저 등 기본 디바이스 정보</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">2. 개인정보 수집 목적</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>운동 및 식단 기록 저장 및 제공</li>
            <li>사용자 맞춤 칼로리 분석 및 운동 피드백 제공</li>
            <li>최근 운동·식단 기록 표시, 그래프 시각화</li>
            <li>유료 구독 이용자 인증 및 프리미엄 기능 제공</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">3. 개인정보 보관 및 파기</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>사용자의 데이터는 Firebase를 통해 안전하게 저장되며, 회원 탈퇴 시 즉시 삭제됩니다.</li>
            <li>식단 사진은 기기 내부에 저장되며, 사용자가 직접 삭제하거나 앱 삭제 시 사라질 수 있습니다.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">4. 개인정보 제3자 제공 및 위탁</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Firebase (Google LLC): 데이터 저장 및 인증 기능</li>
            <li>OpenAI API (선택적 사용 시): AI 피드백 제공 목적</li>
          </ul>
          <p className="mt-2 text-gray-700 dark:text-gray-300">※ 제3자는 국내·외 서버를 통해 정보 처리를 위탁받을 수 있으며, 법령에 따라 보호 조치를 취하고 있습니다.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">5. 이용자의 권리 및 행사방법</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>사용자는 언제든지 본인의 개인정보 열람, 정정, 삭제를 요청할 수 있습니다.</li>
            <li>요청: coreoffitness2025@gmail.com</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">6. 개인정보 보호 책임자</h2>
          <p className="text-gray-700 dark:text-gray-300">Corevia(coreoffitness2025@gmail.com)</p>
        </section>
        
        <section>
          <p className="text-gray-700 dark:text-gray-300 font-medium">본 방침은 2025년 5월 18일부터 적용됩니다.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 