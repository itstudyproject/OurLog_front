import "../styles/TermsCondition.css";

const PrivacyPolicy = () => {
  return (
    <div className="terms-container">
      <h1 className="terms-container h1">개인정보처리방침</h1>

      <section className="terms-container section ">
        <p className="terms-container p">
          주식회사 포스타입(이하 ‘회사’)은 개인정보보호법에 따라 이용자의 권리를
          보장하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록
          다음과 같이 개인정보 처리방침을 수립·공개합니다.
        </p>
      </section>

      <section className="terms-container section ">
        <h2 className="terms-container h2">
          1. 수집하는 개인정보의 항목 및 수집방법
        </h2>
        <p className="terms-container p">
          <strong>1) 수집하는 개인정보의 항목</strong>
        </p>
        <ol className="terms-container ol">
          <li className="terms-container ol li">
            ○ 필수항목: 이메일, 비밀번호, 이름(또는 별명)
          </li>
          <li className="terms-container ol li">
            ○ 소셜 로그인 시: 이메일 주소, 프로필 사진, 이름 또는 별명
          </li>
          <li className="terms-container ol li">
            ○ 서비스 이용 중 수집: IP 주소, 쿠키, 방문일시, 이용 기록, 기기 정보
            등
          </li>
          <li className="terms-container ol li">
            ○ 본인 인증 시: 성명, 생년월일, 성별, CI, DI 등
          </li>
          <li className="terms-container ol li">
            ○ 결제 및 배송 시: 결제 및 배송 관련 정보, 계좌 정보, 신용카드 정보
            등
          </li>
          <li className="terms-container ol li">
            ○ 고객상담 시: 이메일, 접속 환경 등
          </li>
        </ol>

        <p className="terms-container p">
          <strong>2) 개인정보 수집방법</strong>
        </p>
        <p className="terms-container p">
          회원가입, 서비스 이용, 상담 과정에서 동의를 통해 직접 수집하거나 자동
          생성 정보를 수집합니다.
        </p>
      </section>

      <section className="terms-container section ">
        <h2 className="terms-container h2">2. 개인정보의 수집 및 이용목적</h2>
        <ol className="terms-container ol">
          <li className="terms-container ol li">
            ○ 회원관리, 본인 인증, 부정이용 방지 등
          </li>
          <li className="terms-container ol li">
            ○ 서비스 제공 및 개선, 맞춤형 콘텐츠 제공, 정산 등
          </li>
          <li className="terms-container ol li">
            ○ 가명처리 후 통계·연구·공익 목적의 이용
          </li>
        </ol>
      </section>

      <section className="terms-container section ">
        <h2 className="terms-container h2">3. 개인정보의 보유 및 이용기간</h2>
        <p className="terms-container p">
          개인정보는 수집 및 이용 목적 달성 시 지체 없이 파기합니다. 단, 다음의
          경우 예외적으로 보관합니다.
        </p>
        <ol className="terms-container ol">
          <li className="terms-container ol li">○ 부정 이용기록: 5년</li>
          <li className="terms-container ol li">○ 중복 가입 방지: 3년</li>
          <li className="terms-container ol li">
            ○ 전자상거래법 등 관련법령: 계약/결제/소비자 분쟁 3~5년
          </li>
          <li className="terms-container ol li">
            ○ 통신비밀보호법: 서비스 방문기록 3개월
          </li>
        </ol>
      </section>

      <section className="terms-container section ">
        <h2 className="terms-container h2">4. 개인정보의 제공</h2>
        <p className="terms-container p">
          회사는 원칙적으로 이용자 동의 없이 개인정보를 제3자에게 제공하지
          않습니다. 단, 아래의 경우 예외적으로 제공됩니다.
        </p>
        <ol className="terms-container ol">
          <li className="terms-container ol li">
            ○ 유료서비스 거래 시 상대 회원에게 필요한 정보 제공
          </li>
          <li className="terms-container ol li">
            ○ 포인트 무료 충전소 이용 시 제휴사에 정보 제공 (예: 주식회사
            버즈빌)
          </li>
          <li className="terms-container ol li">
            ○ 법령에 의한 제공 또는 이용자의 생명·안전을 위해 필요한 경우
          </li>
        </ol>
      </section>

      <section>
        <h2 className="terms-container h2">5. 개인정보의 파기</h2>
        <p className="terms-container p">
          수집 목적 달성 또는 보유기간 경과 시 지체 없이 파기합니다.
        </p>
        <ol className="terms-container ol">
          <li className="terms-container ol li">
            ○ 파기절차: 파기 대상 선정 → 개인정보보호책임자 승인 → 파기
          </li>
          <li className="terms-container ol li">
            ○ 파기방법: 전자 파일은 복구 불가능하게 삭제, 종이 문서는 분쇄 또는
            소각
          </li>
        </ol>
      </section>

      <section>최근 개정일자: 2025년 5월 2일</section>
    </div>
  );
};

export default PrivacyPolicy;
