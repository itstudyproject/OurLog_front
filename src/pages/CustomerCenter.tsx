import React, { useState, useEffect } from "react";
import type { QuestionDTO, QuestionFormData, PageResultDTO } from "../types/Question";
import { Search, X } from "lucide-react";
import "../styles/CustomerCenter.css";
import { useToken } from "../hooks/useToken";


//자주묻는 질문 더미데이터
  const originalFaqs: QuestionDTO[] = [
   {
      questionId: 0-1,
      title: "로그인이 안 돼요.",
      content:
        "로그인이 안 되는 경우, 아이디와 비밀번호를 다시 한 번 확인해주세요. 계속해서 로그인이 안 되는 경우 고객센터로 문의해주시기 바랍니다.",
      regDate: "2024-01-20",
      modDate: "2024-01-20",
      userDTO: {
        userId: 0-1,
        email: "admin@example.com",
        nickname: "관리자",
      },
      isOpen: false,
    },
    {
      questionId: 0-2,
      title: "비밀번호를 잊어버렸어요.",
      content:
        "로그인 페이지에서 '비밀번호 찾기'를 클릭하시면 가입하신 이메일로 임시 비밀번호를 발송해드립니다.",
      regDate: "2024-01-20",
      modDate: "2024-01-20",
      userDTO: {
        userId: 0-1,
        email: "admin@example.com",
        nickname: "관리자",
      },
      isOpen: false,
    },
    {
      questionId: 0-3,
      title: "회원가입은 어떻게 하나요?",
      content:
        "메인 페이지에서 '회원가입' 버튼을 클릭하시면 회원가입 페이지로 이동합니다. 필요한 정보를 입력하시고 '가입하기' 버튼을 클릭하시면 회원가입이 완료됩니다.",
      regDate: "2024-01-20",
      modDate: "2024-01-20",
      userDTO: {
        userId: 0-1,
        email: "admin@example.com",
        nickname: "관리자",
      },
      isOpen: false,
    },
    {
      questionId: 0-4,
      title: "회원탈퇴는 어떻게 하나요?",
      content:
        "회원탈퇴는 로그인 후 [마이페이지]-[회원탈퇴]에서 할 수 있습니다. 탈퇴와 동시에 회원님의 개인정보 및 모든 이용정보가 즉시 삭제되며 절대 복구할 수 없으니 탈퇴시 유의해주시기 바랍니다.",
      regDate: "2024-01-20",
      modDate: "2024-01-20",
      userDTO: {
        userId: 0-1,
        email: "admin@example.com",
        nickname: "관리자",
      },
      isOpen: false,
    },
  ];

const CustomerCenter: React.FC = () => {
  const token = useToken(); // useToken 훅을 통해 토큰을 가져옴
  const [list, setList] = useState<QuestionDTO[]>([]); // 문의글 목록 (히스토리)
  const [activeSection, setActiveSection] = useState<"faq" | "register" | "list">("faq"); 
  const [showRegisterModal, setShowRegisterModal] = useState(false); // 작성, 수정 모달표시
  const [showDeleteModal, setShowDeleteModal] = useState(false); // 삭제확인 모달표시
  const [showAlertModal, setShowAlertModal] = useState(false); // 답변완료 수정삭제제한 알림
  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const [alertMessage, setAlertMessage] = useState(""); // 경고모달
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null); // 삭제대상되는 문의글 ID
  const [editingRegister, setEditingRegister] = useState<QuestionDTO | null>(null); // 수정중인 문의 객체
  const [registerForm, setRegisterForm] = useState<QuestionFormData>({
    title: "",
    content: "",
  }); // 문의글 작성/수정폼에 입력되는 값
  const [registers, setRegisters] = useState<QuestionDTO[]>([])

const [questionPage, setQuestionPage] = useState<PageResultDTO<QuestionDTO> | null>(null);


  // 토큰을 확인하고 list 데이터를 가져오는 함수

useEffect(() => {
  if (token) {
    console.log("Token found:", token);

    const fetchList = async () => {
      try {
        const response = await fetch("http://localhost:8080/ourlog/list/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PageResultDTO<QuestionDTO> = await response.json();
        setQuestionPage(data); // questionPage 상태 업데이트
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    };

    fetchList();
  } else {
    console.log("Token is missing");
  }
}, [token]);


  // 검색
  const [faqs, setFaqs] = useState<QuestionDTO[]>(originalFaqs);

  const filteredFaqs = searchTerm
    ? faqs.filter(
        (faq) =>
          faq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqs;

  const scrollToSection = (section: "faq" | "register" | "list") => {
    setActiveSection(section);
    const sectionRefs = {
      faq: document.getElementById("faq"),
      register: document.getElementById("register"),
      list: document.getElementById("list"),
    };
    sectionRefs[section]?.scrollIntoView({ behavior: "smooth" });
  };

  // 자주묻는질문 답변 open
  const toggleQuestion = (questionId: number) => {
    setFaqs(
      faqs.map((faq) =>
        faq.questionId === questionId ? { ...faq, isOpen: !faq.isOpen } : faq
      )
    );
  };

  // 1:1 문의(Question) 수정 기능
  const handleEditRegister = (register: QuestionDTO) => {
    setEditingRegister(register);
    setRegisterForm({
      title: register.title,
      content: register.content,
    });
    setShowRegisterModal(true);
  };

  // 1:1 문의(Question) 삭제 기능
  const handleDeleteRegister = (questionId: number) => {
    const register = list.find((q) => q.questionId === questionId);
    if (register?.answerDTO) {
      handleRestrictedAction("delete");
      return;
    }
    setSelectedQuestionId(questionId);
    setShowDeleteModal(true);
  };

  // 안내메세지
  const handleRestrictedAction = (action: "edit" | "delete") => {
    setAlertMessage(
      `답변이 완료된 문의는 ${action === "edit" ? "수정" : "삭제"}할 수 없습니다.`
    );
    setShowAlertModal(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRegister) {
      // 수정 로직
      setRegisters(
        registers.map((q) =>
          q.questionId === editingRegister.questionId
            ? {
                ...q,
                title: registerForm.title,
                content: registerForm.content,
                modDate: new Date().toISOString().split("T")[0],
              }
            : q
        )
      );
    } else {
      // 새 문의 작성 로직
      const newInquiry: QuestionDTO = {
        questionId: Math.max(...registers.map((q) => q.questionId), 0) + 1,
        title: registerForm.title,
        content: registerForm.content,
        regDate: new Date().toISOString().split("T")[0],
        modDate: new Date().toISOString().split("T")[0],
        userDTO: {
          userId: 2,
          email: "user@example.com",
          nickname: "사용자",
        },
        isOpen: false,
      };
      setRegisters([...registers, newInquiry]);
    }

    setRegisterForm({ title: "", content: "" });
    setEditingRegister(null);
    setShowRegisterModal(false);
  };

  // 삭제했을 때 확인
  const handleDeleteConfirm = async () => {
  if (selectedQuestionId) {
    const url = `http://localhost:8080/ourlog/question/delete/${selectedQuestionId}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("삭제 실패");

      setList(list.filter((q) => q.questionId !== selectedQuestionId));
      setShowDeleteModal(false);
    } catch (err) {
      console.error("❌ 삭제 중 오류:", err);
    }
  }
};


  return (
  <>
    <div className="cc-container">
      {/* Sidebar */}
      <nav className="cc-sidebar">
        <h2 className="cc-sidebar-title">고객센터</h2>
        <div
          className={`cc-nav-item ${activeSection === "faq" ? "active" : ""}`}
          onClick={() => scrollToSection("faq")}
        >
          자주 묻는 질문
        </div>
        {!searchTerm && (
          <>
            <div
              className={`cc-nav-item ${activeSection === "register" ? "active" : ""}`}
              onClick={() => scrollToSection("register")}
            >
              1:1 문의하기
            </div>
            <div
              className={`cc-nav-item ${activeSection === "list" ? "active" : ""}`}
              onClick={() => scrollToSection("list")}
            >
              1:1 문의내역
            </div>
          </>
        )}
      </nav>

      {/* Content */}
      <div className="cc-content">
        {/* FAQ Section */}
        <section id="faq">
          <h1 className="cc-styled-h1">
            무엇이든 물어보세요<br />
            궁금하신 점 바로 풀어드립니다.
          </h1>

          <div className="cc-search-wrapper">
            <input
              type="text"
              className="cc-search-input"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="cc-search-icon" />
          </div>

          <div className="cc-section-title">
            {searchTerm ? `"${searchTerm}"에 대한 검색 결과` : "자주 묻는 질문"}
          </div>

          <div className="cc-faq-list">
            {filteredFaqs.map((faq) => (
              <div className="cc-faq-item" key={faq.questionId}>
                <div
                  className="cc-question-box"
                  onClick={() => toggleQuestion(faq.questionId)}
                  aria-expanded={faq.isOpen}
                >
                  {faq.title}
                </div>
                <div className={`cc-answer ${faq.isOpen ? "open" : ""}`}>
                  {faq.content}
                </div>
              </div>
            ))}
            {filteredFaqs.length === 0 && searchTerm && (
              <p className="cc-no-results">검색 결과가 없습니다.</p>
            )}
          </div>
        </section>

        {/* Register & List Sections (when not searching) */}
        {!searchTerm && (
          <>
            {/* 1:1 문의하기 */}
            <section id="register">
              <h2 className="cc-section-title">1:1 문의하기</h2>
              <p className="cc-info-text">
                서비스 이용 중 불편하신 점이나 문의사항을 남겨주시면 신속하게 답변 드리도록 하겠습니다.
              </p>
              <p className="cc-info-text">
                영업일 기준(주말·공휴일 제외) 3일 이내에 답변드리겠습니다. 단, 문의가 집중되는 경우 답변이 지연될 수 있습니다.
              </p>
              <div className="cc-warning-box">
                산업안전보건법에 따라 폭언, 욕설, 성희롱, 반말, 비하, 반복적인 요구 등에는 회신 없이 상담을 종료하며,
                이후 다른 문의에도 회신하지 않습니다. 업무방해, 모욕죄 등으로 민형사상 조치를 취할 수 있습니다.
              </div>
              <form onSubmit={handleRegisterSubmit}>
                <input
                  type="text"
                  value={registerForm.title}
                  onChange={(e) => setRegisterForm({ ...registerForm, title: e.target.value })}
                  placeholder="제목"
                  required
                />
                <textarea
                  value={registerForm.content}
                  onChange={(e) => setRegisterForm({ ...registerForm, content: e.target.value })}
                  placeholder="내용"
                  required
                />
                <button type="submit">문의하기</button>
              </form>
            </section>

            {/* 문의내역 */}
            <section id="list">
              <h2 className="cc-section-title">1:1 문의내역</h2>
              <table className="cc-table">
                <thead>
                  <tr>
                    <th className="cc-th">번호</th>
                    <th className="cc-th">제목</th>
                    <th className="cc-th">작성일</th>
                    <th className="cc-th">상태</th>
                    <th className="cc-th">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((register) => (
                    <tr key={register.questionId}>
                      <td className="cc-td">{register.questionId}</td>
                      <td className="cc-td">{register.title}</td>
                      <td className="cc-td">{register.regDate}</td>
                      <td className="cc-td">
                        <span className={`cc-status-badge ${register.answerDTO ? "completed" : "waiting"}`}>
                          {register.answerDTO ? "답변 완료" : "답변 대기"}
                        </span>
                      </td>
                      <td className="cc-td">
                        <div className="cc-button-group">
                          <button
                            className="cc-action-button"
                            onClick={() =>
                              register.answerDTO
                                ? handleRestrictedAction("edit")
                                : handleEditRegister(register)
                            }
                          >
                            수정
                          </button>
                          <button
                            className="cc-action-button delete"
                            onClick={() =>
                              register.answerDTO
                                ? handleRestrictedAction("delete")
                                : handleDeleteRegister(register.questionId)
                            }
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </div>

    {/* 문의 모달 */}
    {showRegisterModal && (
      <div className="cc-overlay">
        <div className="cc-modal">
          <div className="cc-modal-header">
            <h2>{editingRegister ? "문의 수정하기" : "1:1 문의하기"}</h2>
            <button
              className="cc-close-button"
              onClick={() => {
                setShowRegisterModal(false);
                setEditingRegister(null);
                setRegisterForm({ title: "", content: "" });
              }}
            >
              <X />
            </button>
          </div>
          <form onSubmit={handleRegisterSubmit}>
            <div className="cc-form-group">
              <label>제목</label>
              <input
                type="text"
                value={registerForm.title}
                onChange={(e) => setRegisterForm({ ...registerForm, title: e.target.value })}
                required
              />
            </div>
            <div className="cc-form-group">
              <label>내용</label>
              <textarea
                value={registerForm.content}
                onChange={(e) => setRegisterForm({ ...registerForm, content: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="cc-button">
              {editingRegister ? "수정하기" : "제출하기"}
            </button>
          </form>
        </div>
      </div>
    )}

    {/* 삭제 확인 모달 */}
    {showDeleteModal && (
      <div className="cc-overlay">
        <div className="cc-modal">
          <div className="cc-modal-header">
            <h3>삭제 확인</h3>
            <button className="cc-close-button" onClick={() => setShowDeleteModal(false)}>
              <X />
            </button>
          </div>
          <p>문의를 삭제하시겠습니까?</p>
          <div className="cc-modal-button-group">
            <button className="cc-modal-button cancel" onClick={() => setShowDeleteModal(false)}>
              취소
            </button>
            <button className="cc-modal-button" onClick={handleDeleteConfirm}>
              확인
            </button>
          </div>
        </div>
      </div>
    )}

    {/* 알림 모달 */}
    {showAlertModal && (
      <div className="cc-overlay">
        <div className="cc-modal">
          <div className="cc-modal-header">
            <h3>알림</h3>
            <button className="cc-close-button" onClick={() => setShowAlertModal(false)}>
              <X />
            </button>
          </div>
          <p>{alertMessage}</p>
          <div className="cc-modal-button-group">
            <button className="cc-modal-button" onClick={() => setShowAlertModal(false)}>
              확인
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default CustomerCenter;
