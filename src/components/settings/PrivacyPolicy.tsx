import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Corevia 피트니스 트래킹 서비스 개인정보처리방침</h1>
      
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        Corevia(이하 "회사")는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.
      </p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제1조 (개인정보의 처리목적)</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">회사는 다음의 목적을 위하여 개인정보를 처리합니다:</p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li><strong>회원 가입 및 관리</strong>: 회원 식별, 본인 확인, 가입 의사 확인</li>
            <li><strong>서비스 제공</strong>: 피트니스 트래킹, 운동 기록 관리, 식단 관리, 신체 변화 추적</li>
            <li><strong>개인 맞춤 서비스</strong>: 목표 칼로리 계산, 운동 통계 제공, 체중 변화 분석</li>
            <li><strong>서비스 개선</strong>: 신규 서비스 개발, 기존 서비스 개선, 이용 현황 통계</li>
            <li><strong>안전 관리</strong>: 부정 이용 방지, 시스템 보안 유지</li>
            <li><strong>광고 서비스</strong>: 맞춤형 광고 제공, 광고 효과 측정, 서비스 수익화</li>
            <li><strong>AI 기반 서비스</strong>: 향후 도입 예정인 AI 기반 운동/식단 추천, 개인 맞춤형 피드백 제공</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제2조 (수집하는 개인정보 항목)</h2>
          <div className="text-gray-700 dark:text-gray-300">
            <div className="mb-4">
              <p className="font-semibold mb-2">2.1 필수 수집 정보</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>회원가입 시 (Google 로그인)</strong>: 이메일 주소, 이름, 프로필 사진 URL</li>
                <li><strong>서비스 이용 시</strong>: 기기 정보(OS, 브라우저), IP 주소, 쿠키, 접속 로그</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <p className="font-semibold mb-2">2.2 선택 수집 정보 (이용자가 직접 입력)</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>신체 정보</strong>: 키, 체중, 나이, 성별, 체지방률, 근육량</li>
                <li><strong>피트니스 정보</strong>: 피트니스 목표, 활동 수준, 목표 칼로리</li>
                <li><strong>운동 기록</strong>: 운동 전 컨디션(수면,식사,운동 시작 시간 등등) 운동 종류, 세트 수, 횟수, 무게, 운동 날짜, 1RM 기록</li>
                <li><strong>식단 정보</strong>: 음식 사진, 물 섭취량, 영양제 섭취 기록, 식사 시간</li>
                <li><strong>신체 사진</strong>: 바디 체크용 사진, 촬영 날짜</li>
                <li><strong>기타</strong>: 개인 메모, 운동 설정 정보</li>
              </ul>
            </div>
            
            <div>
              <p className="font-semibold mb-2">2.3 자동 수집 정보</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>서비스 이용 기록, 접속 로그, 쿠키</li>
                <li>기기 정보(모델명, OS 버전, 화면 크기 등)</li>
                <li>네트워크 정보(IP 주소, 접속 위치)</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제3조 (개인정보의 수집 방법)</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li><strong>회원가입</strong>: Google OAuth 2.0을 통한 소셜 로그인, 이메일을 통한 별도 가입</li>
            <li><strong>서비스 이용</strong>: 웹/앱 내 입력 양식을 통한 직접 입력</li>
            <li><strong>사진 업로드</strong>: 기기 카메라 또는 갤러리를 통한 업로드</li>
            <li><strong>자동 수집</strong>: 서비스 이용 과정에서 자동 생성되는 정보</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제4조 (개인정보의 이용 및 보유기간)</h2>
          <div className="text-gray-700 dark:text-gray-300">
            <div className="mb-4">
              <p className="font-semibold mb-2">4.1 이용기간</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>회원가입일부터 회원 탈퇴일까지</li>
                <li>단, 관련 법령에 의해 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <p className="font-semibold mb-2">4.2 보유기간</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>회원 정보</strong>: 회원 탈퇴 즉시 삭제</li>
                <li><strong>운동/식단 기록</strong>: 회원 탈퇴 즉시 삭제</li>
                <li><strong>사진 파일</strong>: 회원 탈퇴 즉시 삭제</li>
                <li><strong>접속 로그</strong>: 3개월 후 자동 삭제</li>
              </ul>
            </div>
            
            <div>
              <p className="font-semibold mb-2">4.3 법령에 의한 보존</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>소비자의 불만 또는 분쟁처리에 관한 기록</strong>: 3년 (전자상거래법)</li>
                <li><strong>웹사이트 방문기록</strong>: 3개월 (통신비밀보호법)</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제5조 (개인정보의 제3자 제공)</h2>
          <div className="text-gray-700 dark:text-gray-300">
            <p className="mb-2">회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법집행기관이 요구하는 경우</li>
              <li>서비스 제공에 따른 요금정산을 위해 필요한 경우</li>
            </ul>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제6조 (개인정보 처리의 위탁)</h2>
          <div className="text-gray-700 dark:text-gray-300">
            <p className="mb-2">회사는 서비스 향상을 위해 아래와 같이 개인정보 처리업무를 외부에 위탁하고 있습니다:</p>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-600">
                    <th className="text-left py-2 font-semibold">위탁받는 자</th>
                    <th className="text-left py-2 font-semibold">위탁업무</th>
                    <th className="text-left py-2 font-semibold">개인정보 보유/이용기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-gray-600">
                    <td className="py-2">Google LLC (Firebase)</td>
                    <td className="py-2">클라우드 서버 운영, 데이터 저장, 인증 서비스</td>
                    <td className="py-2">회원 탈퇴시 또는 위탁계약 종료시까지</td>
                  </tr>
                  <tr>
                    <td className="py-2">Google LLC (Analytics)</td>
                    <td className="py-2">서비스 이용 통계 분석</td>
                    <td className="py-2">수집 후 26개월</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="text-sm">위탁계약 시 개인정보보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.</p>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제7조 (개인정보의 파기)</h2>
          <div className="text-gray-700 dark:text-gray-300">
            <div className="mb-4">
              <p className="font-semibold mb-2">7.1 파기절차</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>회원 탈퇴 시 개인정보는 즉시 파기됩니다.</li>
                <li>보유기간이 경과한 개인정보는 지체없이 파기됩니다.</li>
                <li>개인정보가 불필요하게 된 때에는 지체없이 해당 개인정보를 파기합니다.</li>
              </ul>
            </div>
            
            <div>
              <p className="font-semibold mb-2">7.2 파기방법</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>전자적 파일</strong>: 기술적 방법을 사용하여 기록을 재생할 수 없도록 완전 삭제</li>
                <li><strong>출력물 등</strong>: 분쇄하거나 소각하여 파기</li>
                <li><strong>Firebase 저장 데이터</strong>: Google Firebase의 삭제 정책에 따라 완전 삭제</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제8조 (정보주체의 권리 및 행사방법)</h2>
          <div className="text-gray-700 dark:text-gray-300">
            <div className="mb-4">
              <p className="font-semibold mb-2">8.1 정보주체의 권리</p>
              <p className="mb-2">이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>개인정보 처리현황 통지 요구</li>
                <li>개인정보 열람 요구</li>
                <li>개인정보 정정·삭제 요구</li>
                <li>개인정보 처리정지 요구</li>
                <li>손해배상 청구</li>
              </ul>
            </div>
            
            <div>
              <p className="font-semibold mb-2">8.2 권리 행사 방법</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>이메일</strong>: coreoffitness2025@gmail.com</li>
                <li><strong>서비스 내</strong>: 설정 메뉴 → 기본 정보 변경</li>
                <li><strong>회원 탈퇴</strong>: 서비스 내 계정 관리 메뉴</li>
                <li>권리 행사 시 본인 확인을 위해 신분증명서를 요구할 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제9조 (개인정보의 안전성 확보조치)</h2>
          <div className="text-gray-700 dark:text-gray-300">
            <p className="mb-2">회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다:</p>
            
            <div className="space-y-3">
              <div>
                <p className="font-semibold">9.1 기술적 조치</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>개인정보 암호화: 중요한 개인정보는 암호화되어 저장 및 전송</li>
                  <li>해킹 등에 대비한 기술적 대책: 방화벽, 백신 프로그램 등 보안프로그램 설치</li>
                  <li>HTTPS 프로토콜을 통한 안전한 데이터 전송</li>
                  <li>Google Firebase 보안 규칙을 통한 데이터 접근 제어</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold">9.2 관리적 조치</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>개인정보에 대한 접근 권한의 제한</li>
                  <li>개인정보를 취급하는 직원의 최소화 및 교육</li>
                  <li>개인정보처리시스템 접속기록의 보관 및 위변조 방지조치</li>
                  <li>개인정보 보호정책의 수립 및 시행</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold">9.3 물리적 조치</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>서버실, 자료보관실 등의 접근통제</li>
                  <li>클라우드 서비스 제공업체의 물리적 보안 체계 활용</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제10조 (개인정보보호책임자)</h2>
          <div className="text-gray-700 dark:text-gray-300">
            <p className="mb-2">회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다:</p>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p><strong>개인정보보호책임자</strong></p>
              <ul className="space-y-1 mt-2">
                <li>개인 정보 보호 주체체: Corevia </li>
                <li>연락처: coreoffitness2025@gmail.com</li>
                <li>책임자는 개인정보 처리업무를 총괄하며, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 노력하고 있습니다.</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제11조 (권익침해 구제방법)</h2>
          <div className="text-gray-700 dark:text-gray-300">
            <p className="mb-2">정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보보호위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다:</p>
            
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>개인정보보호위원회</strong>: privacy.go.kr / 국번없이 182</li>
              <li><strong>개인정보침해신고센터</strong>: privacy.kisa.or.kr / 국번없이 118</li>
              <li><strong>대검찰청 사이버범죄수사단</strong>: www.spo.go.kr / 02-3480-3573</li>
              <li><strong>경찰청 사이버테러대응센터</strong>: www.ctrc.go.kr / 국번없이 112</li>
            </ul>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">제12조 (개인정보 처리방침 변경)</h2>
          <div className="text-gray-700 dark:text-gray-300">
            <ul className="list-disc pl-6 space-y-1">
              <li>본 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</li>
              <li>중요한 변경의 경우 30일 전에 공지하며, 개인정보의 수집 및 활용, 제3자 제공 등에 관한 사항이 변경되는 경우에는 최소 30일 이전에 고지합니다.</li>
            </ul>
          </div>
        </section>
        
        <section className="border-t pt-4">
          <div className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
            <p><strong>현행 개인정보 처리방침</strong></p>
            <p>시행일자: 2025년 1월 1일</p>
            <p>공고일자: 2025년 1월 1일</p>
            <p>변경일자: 2025년 1월 1일</p>
            
            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
              <p><strong>연락처</strong></p>
              <p>회사명: Corevia</p>
              <p>이메일: coreoffitness2025@gmail.com</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 