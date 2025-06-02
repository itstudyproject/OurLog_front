import "../styles/TermsCondition.css";

const TermsCondition = () => {
  return (
    <div className="terms-container">
      <h1 className="terms-container h1">OurLog 이용약관</h1>

      <section className="terms-container section ">
        <h2 className="terms-container h2">제1장 총칙</h2>
        <p className="terms-container p">
          본 약관은 OurLog(이하 “회사”라 합니다)가 제공하는 서비스를 이용함에
          있어 회사와 회원 간의 권리, 의무 및 책임 사항, 서비스의 이용 조건 및
          절차, 기타 제반 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="terms-container section ">
        <h2 className="terms-container h2">제2조 약관의 명시, 효력 및 개정</h2>
        <p className="terms-container p">
          1. 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면
          또는 별도의 연결화면에 게시합니다. 2. 회사는 관계 법령을 위배하지 않는
          범위에서 본 약관을 개정할 수 있습니다. 3. 회사가 본 약관을 개정하는
          경우에는 적용 일자 및 개정 내용, 개정 사유를 명시해 현행 약관과 함께
          제1항의 방식에 따라 최소 그 적용 일자 7일 전부터 적용 일자 전일까지
          공지합니다. 다만 회원에게 불리하거나 중대한 사항에 관한 개정인
          경우에는 최소 그 적용 일자 30일 전에 전자우편 주소, 로그인 시 팝업창
          등 가능한 전자적인 수단을 통해 따로 명확히 통지하도록 합니다. 4.
          회사가 제3항에 따라 개정 약관을 공지 또는 통지하면서 회원에게 적용
          일자까지 명시적으로 거부 의사를 표시하지 않으면 승인한 것으로 본다는
          뜻을 명확하게 고지했음에도 불구하고, 거부 의사를 표시하지 않고 회사의
          서비스를 계속 이용하는 회원은 개정 약관에 동의한 것으로 봅니다. 5.
          회원이 개정 약관에 동의하지 않을 경우 서비스 이용계약을 해지할 수
          있습니다.
        </p>
      </section>

      <section className="terms-container section ">
        <h2 className="terms-container h2">제3조 용어의 정의</h2>
        <ol className="terms-container ol">
          <li className="terms-container ol li">
            “서비스”라 함은 이용자가 PC, 휴대형 단말기 등 각종 유무선 기기 또는
            프로그램을 통해 이용할 수 있도록 제공하는 모든 인터넷 서비스를
            말하며, 회사가 공개한 API를 이용해 제3자가 개발 또는 구축한
            프로그램이나 서비스를 통해 이용자에게 제공되는 경우를 포함합니다.
          </li>
          <li className="terms-container ol li">
            “약관”이라 함은 서비스 이용과 관련해 회사와 회원 간에 체결하는
            계약을 말합니다.
          </li>
          <li className="terms-container ol li">
            "회원"이라 함음 본 약관을 승인하고 회원가입을 한 자로서, 회사가
            제공하는 서비스를 지속적으로 이용할 수 있는 자를 말합니다.
          </li>
          <li className="terms-container ol li">
            "이용자" 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원과
            회원이 아닌 자를 말합니다.
          </li>
          <li className="terms-container ol li">
            게시물: 회원이 서비스에 게시한
            부호·문자·음성·음향·영상·그림·사진·링크 등으로 구성된 콘텐츠를
            말합니다.
          </li>
        </ol>
      </section>

      <section className="terms-container section">
        <h2 className="terms-container h2">제4조 약관의 해석</h2>
        <p className="terms-container p">
          회원은 회사가 제공하는 서비스를 이용함에 있어서 관계 법령을 준수해야
          하며, 본 약관의 규정을 들어 관계 법령 위반에 대한 면책을 주장할 수
          없습니다. 회사는 본 약관 외에 별도로 세부이용지침 등의 규정(이하
          “세부이용지침 등”)을 들 수 있으며, 해당 내용이 본 약관과 상충할
          경우에는 세부이용지침 등이 우선해 적용됩니다. 본 약관에 명시되지 않은
          사항과 약관의 해석에 대해서는 세부이용지침 등과 관계 법령을 따릅니다.
        </p>
      </section>

      <section className="terms-container section">
        시행일자: 2025년 05월 02일
      </section>
    </div>
  );
};

export default TermsCondition;
