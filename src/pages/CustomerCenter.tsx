import React, { useState, useEffect } from "react";
import type { Question, QuestionFormData } from "../types/Question";
import { Search, X } from "lucide-react";
import "../styles/CustomerCenter.css";
import { useNavigate } from "react-router-dom";

// 원본 FAQ 데이터
const originalFaqs: Question[] = [
  {
    questionId: 1,
    title: "로그인이 안 돼요.",
    content:
      "로그인이 안 되는 경우, 아이디와 비밀번호를 다시 한 번 확인해주세요. 계속해서 로그인이 안 되는 경우 고객센터로 문의해주시기 바랍니다.",
    regDate: "2024-01-20",
    modDate: "2024-01-20",
    userDTO: {
      id: 1,
      email: "admin@example.com",
      nickname: "관리자",
    },
    isOpen: false,
  },
  {
    questionId: 2,
    title: "비밀번호를 잊어버렸어요.",
    content:
      "로그인 페이지에서 '비밀번호 찾기'를 클릭하시면 가입하신 이메일로 임시 비밀번호를 발송해드립니다.",
    regDate: "2024-01-20",
    modDate: "2024-01-20",
    userDTO: {
      id: 1,
      email: "admin@example.com",
      nickname: "관리자",
    },
    isOpen: false,
  },
  {
    questionId: 3,
    title: "회원가입은 어떻게 하나요?",
    content:
      "메인 페이지에서 '회원가입' 버튼을 클릭하시면 회원가입 페이지로 이동합니다. 필요한 정보를 입력하시고 '가입하기' 버튼을 클릭하시면 회원가입이 완료됩니다.",
    regDate: "2024-01-20",
    modDate: "2024-01-20",
    userDTO: {
      id: 1,
      email: "admin@example.com",
      nickname: "관리자",
    },
    isOpen: false,
  },
  {
    questionId: 4,
    title: "회원탈퇴는 어떻게 하나요?",
    content:
      "회원탈퇴는 로그인 후 [마이페이지]-[회원탈퇴]에서 할 수 있습니다. 탈퇴와 동시에 회원님의 개인정보 및 모든 이용정보가 즉시 삭제되며 절대 복구할 수 없으니 탈퇴시 유의해주시기 바랍니다.",
    regDate: "2024-01-20",
    modDate: "2024-01-20",
    userDTO: {
      id: 1,
      email: "admin@example.com",
      nickname: "관리자",
    },
    isOpen: false,
  },
];

const CustomerCenter: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    "faq" | "inquiry" | "questionlist"
  >("faq");
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null
  );
  const [editingInquiry, setEditingInquiry] = useState<Question | null>(null);
  const [inquiryForm, setInquiryForm] = useState<QuestionFormData>({
    title: "",
    content: "",
  });

  const [selectedInquiry, setSelectedInquiry] = useState<Question | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [faqs, setFaqs] = useState<Question[]>(originalFaqs);

  // 검색어에 따른 FAQ 필터링
  const filteredFaqs = searchTerm
    ? faqs.filter(
        (faq) =>
          faq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqs;

  const [inquiries, setInquiries] = useState<Question[]>([]);

  const scrollToSection = (section: "faq" | "inquiry" | "questionlist") => {
    setActiveSection(section);
    const sectionRefs = {
      faq: document.getElementById("faq"),
      inquiry: document.getElementById("inquiry"),
      questionlist: document.getElementById("questionlist"),
    };
    sectionRefs[section]?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleQuestion = (questionId: number) => {
    setFaqs(
      faqs.map((faq) =>
        faq.questionId === questionId ? { ...faq, isOpen: !faq.isOpen } : faq
      )
    );
  };

  const handleEditInquiry = (inquiry: Question) => {
    setEditingInquiry(inquiry);
    setInquiryForm({
      title: inquiry.title,
      content: inquiry.content,
    });
    setShowInquiryModal(true);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    console.log("token", token);

    if (editingInquiry) {
      // 수정
      await fetch("http://localhost:8080/ourlog/question/editingInquiry", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          questionId: editingInquiry.questionId,
          title: inquiryForm.title,
          content: inquiryForm.content,
        }),
      });
    } else {
      // 등록
      await fetch("http://localhost:8080/ourlog/question/inquiry", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: inquiryForm.title,
          content: inquiryForm.content,
        }),
      });
    }

    // 등록/수정 후 내 문의 목록 새로고침
    fetchMyQuestions();
    setInquiryForm({ title: "", content: "" });
    setEditingInquiry(null);
    setShowInquiryModal(false);
  };
  const fetchMyQuestions = async () => {
    const token = localStorage.getItem("token");
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    const res = await fetch(
      "http://localhost:8080/ourlog/question/my-questions",
      { headers }
    );
    if (res.ok) {
      const data = await res.json();
      setInquiries(data); // 문의 목록 갱신
    }
  };

  // 컴포넌트 마운트 시 호출
  useEffect(() => {
    fetchMyQuestions();

    if (isAdmin) {
      fetchAllQuestions();
    }
  }, [isAdmin]);

  const handleDeleteInquiry = (questionId: number) => {
    setSelectedQuestionId(questionId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuestionId) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    console.log("삭제 시도", selectedQuestionId);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const res = await fetch(
        `http://localhost:8080/ourlog/question/deleteQuestion/${selectedQuestionId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("삭제 실패:", res.status, errorText);
        setAlertMessage(`삭제 실패: ${res.status} ${errorText}`);
      } else {
        setShowDeleteModal(false);
        fetchMyQuestions();
      }
    } catch (e) {
      console.error("삭제 중 네트워크 에러:", e);
      setAlertMessage("삭제 중 네트워크 에러 발생");
    }
  };

  const handleRestrictedAction = (action: "edit" | "delete") => {
    setAlertMessage(
      `답변이 완료된 문의는 ${
        action === "edit" ? "수정" : "삭제"
      }할 수 없습니다.`
    );
    setShowAlertModal(true);
  };

  // 운영자(Admin) 답글 달기
  const [isAdmin, setIsAdmin] = useState(false);
  const [answerContent, setAnswerContent] = useState("");
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  // 관리자용 전체 질문 목록 가져오기
  const fetchAllQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const res = await fetch(
        "http://localhost:8080/ourlog/questionList?page=1&size=20",
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        setAllQuestions(data.dtoList); // PageResultDTO의 dtoList만 추출
      }
    } catch (e) {
      console.error("전체 질문 목록 불러오기 실패:", e);
    }
  };

  const handleAnswerSubmit = async (
    questionId: number,
    answerContent: string
  ) => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const res = await fetch(
      `http://localhost:8080/ourlog/question-answer/${questionId}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          contents: answerContent,
        }),
      }
    );
    if (res.ok) {
      alert("답변이 등록되었습니다.");
      // 문의내역 새로고침 등
    } else {
      const errorText = await res.text();
      alert("답변 등록 실패: " + errorText);
    }
  };

  return (
    <>
      <div className="cc-container">
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
                className={`cc-nav-item ${
                  activeSection === "inquiry" ? "active" : ""
                }`}
                onClick={() => scrollToSection("inquiry")}
              >
                1:1 문의하기
              </div>
              <div
                className={`cc-nav-item ${
                  activeSection === "questionlist" ? "active" : ""
                }`}
                onClick={() => scrollToSection("questionlist")}
              >
                1:1 문의내역
              </div>
            </>
          )}
        </nav>

        <div className="cc-content">
          <section id="faq">
            <h1 className="cc-styled-h1">
              무엇이든 물어보세요
              <br />
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
              {searchTerm
                ? `"${searchTerm}"에 대한 검색 결과`
                : "자주 묻는 질문"}
            </div>

            <div className="faq-list">
              {filteredFaqs.map((faq) => (
                <div className="faq-item" key={faq.questionId}>
                  <div
                    className="question-box"
                    onClick={() => toggleQuestion(faq.questionId)}
                    aria-expanded={faq.isOpen}
                  >
                    {faq.title}
                  </div>
                  <div className={`answer ${faq.isOpen ? "open" : ""}`}>
                    {faq.content}
                  </div>
                </div>
              ))}
              {filteredFaqs.length === 0 && searchTerm && (
                <p className="no-results">검색 결과가 없습니다.</p>
              )}
            </div>
          </section>

          {!searchTerm && (
            <>
              <section id="inquiry">
                <h2 className="cc-section-title">1:1 문의하기</h2>
                <p className="info-text">
                  서비스 이용 중 불편하신 점이나 문의사항을 남겨주시면 신속하게
                  답변 드리도록 하겠습니다.
                </p>
                <p className="info-text">
                  영업일 기준(주말·공휴일 제외) 3일 이내에 답변드리겠습니다. 단,
                  문의가 집중되는 경우 답변이 지연될 수 있는 점 너그러이 양해
                  부탁드립니다.
                </p>
                <div className="warning-box">
                  산업안전보건법에 따라 폭언, 욕설, 성희롱, 반말, 비하, 반복적인
                  요구 등에는 회신 없이 상담을 즉시 종료하며, 이후 다른 문의에도
                  회신하지 않습니다. 고객응대 근로자를 보호하기 위해 이같은
                  이용자의 서비스 이용을 제한하고, 업무방해, 모욕죄 등으로
                  민형사상 조치를 취할 수 있음을 알려드립니다.
                </div>
                <button
                  className="button"
                  onClick={() => setShowInquiryModal(true)}
                >
                  문의하기
                </button>
              </section>

              <section id="questionlist">
                <h2 className="cc-section-title">1:1 문의내역</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th className="th">번호</th>
                      <th className="th">제목</th>
                      <th className="th">작성일</th>
                      <th className="th">상태</th>
                      <th className="th">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inquiry) => (
                      <tr key={inquiry.questionId}>
                        <td className="td">{inquiry.questionId}</td>
                        <td
                          className="td"
                          onClick={() => {
                            console.log("문의글 클릭:", inquiry);
                            setSelectedInquiry(inquiry);
                            setShowDetailModal(true);
                          }}
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          {inquiry.title}
                        </td>
                        <td className="td">
                          {inquiry.regDate ? inquiry.regDate.split("T")[0] : ""}
                        </td>
                        <td className="td">
                          <span
                            className={`status-badge ${
                              inquiry.answerDTO ? "completed" : "waiting"
                            }`}
                          >
                            {inquiry.answerDTO ? "답변 완료" : "답변 대기"}
                          </span>
                        </td>
                        <td className="td">
                          <div className="button-group">
                            <button
                              className="action-button"
                              onClick={() =>
                                inquiry.answerDTO
                                  ? handleRestrictedAction("edit")
                                  : handleEditInquiry(inquiry)
                              }
                            >
                              수정
                            </button>
                            <button
                              className="action-button delete"
                              onClick={() =>
                                inquiry.answerDTO
                                  ? handleRestrictedAction("delete")
                                  : handleDeleteInquiry(inquiry.questionId)
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

      {showInquiryModal && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingInquiry ? "문의 수정하기" : "1:1 문의하기"}</h2>
              <button
                className="close-button"
                onClick={() => {
                  setShowInquiryModal(false);
                  setEditingInquiry(null);
                  setInquiryForm({ title: "", content: "" });
                }}
              >
                <X />
              </button>
            </div>
            <form onSubmit={handleInquirySubmit}>
              <div className="form-group">
                <label>제목</label>
                <input
                  type="text"
                  value={inquiryForm.title}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>내용</label>
                <textarea
                  value={inquiryForm.content}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, content: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit" className="button">
                {editingInquiry ? "수정하기" : "제출하기"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>삭제 확인</h3>
              <button
                className="close-button"
                onClick={() => setShowDeleteModal(false)}
              >
                <X />
              </button>
            </div>
            <p>문의를 삭제하시겠습니까?</p>
            <div className="modal-button-group">
              <button
                className="modal-button cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </button>
              <button className="modal-button" onClick={handleDeleteConfirm}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlertModal && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>알림</h3>
              <button
                className="close-button"
                onClick={() => setShowAlertModal(false)}
              >
                <X />
              </button>
            </div>
            <p>{alertMessage}</p>
            <div className="modal-button-group">
              <button
                className="modal-button"
                onClick={() => setShowAlertModal(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedInquiry && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>문의 상세</h3>
              <button
                className="close-button"
                onClick={() => setShowDetailModal(false)}
              >
                <X />
              </button>
            </div>
            <form>
              <div className="form-group">
                <label>제목</label>
                <input type="text" value={selectedInquiry.title} readOnly />
              </div>
              <div className="form-group">
                <label>내용</label>
                <textarea value={selectedInquiry.content} readOnly />
              </div>
              <div className="form-group">
                <label>작성일</label>
                <input
                  type="text"
                  value={
                    selectedInquiry.regDate
                      ? selectedInquiry.regDate.split("T")[0]
                      : ""
                  }
                  readOnly
                />
              </div>

              {selectedInquiry.answerDTO && (
                <div className="form-group">
                  <label>답변</label>
                  <textarea
                    value={selectedInquiry.answerDTO.contents}
                    readOnly
                  />
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {isAdmin && activeSection === "questionlist" && (
        <section id="questionlist">
          <h2>전체 질문 목록</h2>
          {allQuestions.map((question) => (
            <div key={question.questionId} className="admin-question-card">
              <h3>{question.title}</h3>
              <p>{question.content}</p>
              <p>작성자: {question.userDTO?.name || "익명"}</p>
              {question.answerDTO ? (
                <div className="answer-box">
                  <strong>답변:</strong>
                  <p>{question.answerDTO.contents}</p>
                </div>
              ) : (
                <div className="answer-form">
                  <textarea
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    placeholder="답변을 입력하세요"
                  />
                  <button
                    onClick={() =>
                      handleAnswerSubmit(question.questionId, answerContent)
                    }
                  >
                    답변 등록
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </>
  );
};
export default CustomerCenter;
