import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Corevia 피트니스 트래킹 서비스 이용약관</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제1조 (목적 및 적용범위)</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            본 약관은 Corevia에서 제공하는 피트니스 트래킹 서비스(이하 "서비스")의 이용조건 및 절차, 이용자와 회사의 권리, 의무, 책임사항을 규정함을 목적으로 합니다.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            본 서비스는 웹 애플리케이션 형태로 제공되며, 향후 모바일 앱으로 확장될 수 있습니다.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제2조 (용어의 정의)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li><strong>"서비스"</strong>: Corevia에서 제공하는 피트니스 트래킹, 운동 기록, 식단 관리, 신체 변화 추적 등의 통합 건강 관리 서비스</li>
            <li><strong>"이용자"</strong>: 본 약관에 따라 서비스를 이용하는 회원 및 비회원</li>
            <li><strong>"회원"</strong>: Google 계정을 통해 로그인하여 서비스를 이용하는 자</li>
            <li><strong>"콘텐츠"</strong>: 서비스 내에서 이용자가 생성, 업로드하는 모든 정보 (운동 기록, 식단 사진, 신체 사진, 메모 등)</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제3조 (회원가입 및 계정 관리)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>회원가입은 Google 계정을 통한 소셜 로그인으로만 가능합니다.</li>
            <li>이용자는 정확하고 최신의 정보를 제공해야 하며, 허위 정보 제공 시 서비스 이용에 제한을 받을 수 있습니다.</li>
            <li>계정의 보안은 이용자 본인의 책임이며, 계정 정보의 무단 사용으로 인한 손해는 이용자가 부담합니다.</li>
            <li>회원 탈퇴 시 모든 개인 데이터는 즉시 삭제되며, 복구가 불가능합니다.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제4조 (서비스의 내용)</h2>
          <div className="text-gray-700 dark:text-gray-300">
            <p className="mb-2">본 서비스는 다음과 같은 기능을 제공합니다:</p>
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-semibold">4.1 개인 프로필 관리</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>신체 정보 (키, 체중, 나이, 체지방률, 근육량) 입력 및 관리</li>
                  <li>피트니스 목표 설정 (체중 감소/유지/증가)</li>
                  <li>활동 수준 및 목표 칼로리 설정</li>
                  <li>체중 변화 추이 분석 및 그래프 제공</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold">4.2 운동 기록 관리</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>운동 부위별 세트/횟수/무게 기록</li>
                  <li>1RM(1회 최대 무게) 계산 및 저장</li>
                  <li>운동 세트 설정 (5x5, 10x5, 15x5, 6x3) 커스터마이징</li>
                  <li>운동 통계 및 진행 상황 그래프 제공</li>
                  <li>기간별 운동 기록 필터링 (1개월, 3개월, 6개월, 1년)</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold">4.3 식단 및 영양 관리</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>음식 사진 촬영 및 저장</li>
                  <li>물 섭취량 기록 (시간대별)</li>
                  <li>영양제 섭취 기록 (시간대별)</li>
                  <li>식단 로그 (일별/주별/월별 보기)</li>
                  <li>목표 칼로리 달성률 추적</li>
                  <li>영양 성분 데이터베이스 (2800+ 한국 음식 정보)</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold">4.4 바디 체크 (신체 변화 추적)</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>신체 사진 촬영 및 날짜별 저장</li>
                  <li>신체 변화 추이 확인 (일/주/월별 필터링)</li>
                  <li>체중, 체지방률, 근육량 수치 기록 (선택사항)</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold">4.5 정보 제공 서비스</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>운동 관련 FAQ 및 가이드</li>
                  <li>영양 정보 및 식단 가이드</li>
                  <li>1RM 계산기 등 피트니스 도구</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제5조 (데이터 저장 및 보안)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>모든 사용자 데이터는 Google Firebase 클라우드 서비스를 통해 안전하게 저장됩니다.</li>
            <li>사진 및 이미지 파일은 Firebase Storage에 암호화되어 저장됩니다.</li>
            <li>데이터는 실시간으로 동기화되며, 사용자별로 완전히 분리되어 관리됩니다.</li>
            <li>서비스는 업계 표준 보안 프로토콜을 준수하며, 개인정보보호법을 엄격히 준수합니다.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제6조 (이용자의 의무)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>이용자는 서비스를 이용함에 있어 관련 법령을 준수해야 합니다.</li>
            <li>타인의 개인정보를 수집, 저장, 공개하는 행위를 금지합니다.</li>
            <li>서비스의 안정적 운영을 방해하는 행위를 금지합니다.</li>
            <li>부적절하거나 불법적인 콘텐츠 업로드를 금지합니다.</li>
            <li>서비스를 상업적 목적으로 무단 이용하는 행위를 금지합니다.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제7조 (지적재산권)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>서비스의 UI/UX 디자인, 소프트웨어, 영양 데이터베이스 등은 Corevia의 지적재산권입니다.</li>
            <li>이용자가 생성한 콘텐츠의 저작권은 이용자에게 있으나, 서비스 제공을 위한 최소한의 이용 권한을 회사에 부여합니다.</li>
            <li>서비스의 무단 복제, 배포, 역공학을 금지합니다.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제8조 (서비스 이용 제한)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>회사는 다음의 경우 서비스 이용을 제한할 수 있습니다:</li>
            <li className="ml-4">- 본 약관 위반 시</li>
            <li className="ml-4">- 타인의 권리를 침해하는 행위</li>
            <li className="ml-4">- 서비스의 정상적 운영을 방해하는 행위</li>
            <li className="ml-4">- 관련 법령 위반 시</li>
            <li>이용 제한 시 사전 통지를 원칙으로 하되, 긴급한 경우 사후 통지할 수 있습니다.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제9조 (면책사항)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li><strong>건강 관련 면책</strong>: 본 서비스는 건강 관리 도구일 뿐, 의학적 조언이나 치료를 대체하지 않습니다. 건강 관련 결정은 반드시 의료 전문가와 상담하시기 바랍니다.</li>
            <li><strong>영양 정보 면책</strong>: 제공되는 영양 정보는 참고용이며, 조리 방법 등에 따라 실제와 다를 수 있습니다.</li>
            <li><strong>운동 안전 면책</strong>: 운동 시 안전은 이용자 본인의 책임이며, 운동으로 인한 부상에 대해 회사는 책임지지 않습니다.</li>
            <li><strong>데이터 손실 면책</strong>: 천재지변, 시스템 장애 등 불가항력으로 인한 데이터 손실에 대해서는 책임을 지지 않습니다.</li>
            <li><strong>제3자 서비스</strong>: Google Firebase 등 제3자 서비스의 장애로 인한 손해에 대해서는 해당 제3자의 정책을 따릅니다.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제10조 (서비스 변경 및 중단)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>회사는 서비스의 개선을 위해 기능을 변경하거나 추가할 수 있습니다.</li>
            <li>중대한 변경 시에는 30일 전 공지하며, 경미한 변경은 서비스 내 공지로 대체할 수 있습니다.</li>
            <li>서비스 중단 시에는 최소 30일 전 공지하고, 이용자 데이터 백업 기간을 제공합니다.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제11조 (분쟁해결)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>본 약관은 대한민국 법률에 따라 해석되고 적용됩니다.</li>
            <li>서비스 이용과 관련한 분쟁은 서울중앙지방법원을 전속관할법원으로 합니다.</li>
            <li>분쟁 발생 시 먼저 당사자 간 협의를 통해 해결하도록 노력합니다.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제12조 (약관의 효력 및 변경)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>본 약관은 2025년 1월 1일부터 적용됩니다.</li>
            <li>약관 변경 시 변경 사유와 적용 일자를 명시하여 최소 7일 전에 공지합니다.</li>
            <li>중요한 변경 사항은 30일 전에 공지하며, 이용자가 거부 의사를 표시하지 않으면 동의한 것으로 봅니다.</li>
          </ul>
        </section>
        
        <section className="border-t pt-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            <strong>연락처</strong><br />
            회사명: Corevia<br />
            이메일: coreoffitness2025@gmail.com<br />
            시행일: 2025년 1월 1일
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService; 