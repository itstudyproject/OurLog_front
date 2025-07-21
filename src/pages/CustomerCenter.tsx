import React, { useState, useEffect } from "react";
import type { Question, QuestionFormData } from "../types/Question";
import { Search, X } from "lucide-react";
import "../styles/CustomerCenter.css";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders, getToken, hasToken, removeToken } from "../utils/auth";

// 원본 FAQ 데이터
const originalFaqs: Question[] = [
  {
    questionId: 1,
    title: "회원가입을 하고 싶어요.",
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
    questionId: 2,
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
    questionId: 3,
    title: "프로필을 수정하고 싶어요.",
    content:
      "프로필 수정은 로그인 후 [마이페이지]-[프로필수정]을 통해 수정할 수 있습니다.",
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
    title: "회원탈퇴를 하고 싶어요.",
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
  {
    questionId: 5,
    title: "작품을 등록하고 싶어요.",
    content: "작품등록은 [아트]-[아트등록]에서 작품을 등록할 수 있습니다.",
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
    questionId: 6,
    title: "제가 관심있는 작가님께 개인적으로 작품을 요청하고 싶어요.",
    content:
      "관심있는 작가님의 프로필 또는 작가님의 작품 화면의 [채팅창]을 통해 작품을 요청하거나 대화할 수 있습니다.",
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
  const navigate = useNavigate();

  const [selectedInquiry, setSelectedInquiry] = useState<Question | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [faqs, setFaqs] = useState<Question[]>(originalFaqs);

  const [inquiries, setInquiries] = useState<Question[]>([]);

  // 운영자(Admin) 답글 달기
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [answerContent, setAnswerContent] = useState<Record<number, string>>(
    {}
  );
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  // 관리자용 전용 페이지네이션
  const [adminPage, setAdminPage] = useState(1);
  const [adminTotalPages, setAdminTotalPages] = useState(1);

  // 사용자 권한 확인 함수 추가
  const checkAdminStatus = async () => {
    const token = getToken();
    if (!token) {
      setIsAdmin(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/ourlog/user/check-admin",
        {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin); // true면 관리자, false면 일반유저
      } else {
        setIsAdmin(false); // 인증 실패시 일반유저로 처리(혹은 로그아웃 처리)
      }
    } catch (error) {
      setIsAdmin(false);
    }
  };

  // 컴포넌트 마운트 시 호출
  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin === null) return;

    const token = getToken();
    if (!token) return;

    if (isAdmin) {
      console.log("token : ", token);
      fetchAllQuestions();
    } else {
      console.log("token : ", token);
      fetchMyQuestions();
    }
    console.log("isAdmin 값 변경됨:", isAdmin);
  }, [isAdmin]);

  // 관리자용 전체 질문 목록 가져오기
  const fetchAllQuestions = async (page: number = 1) => {
    const token = getToken();
    if (!token) {
      console.error("토큰이 없습니다.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/ourlog/question/questionList",
        {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        data.dtoList.forEach((q) => console.log(q));
        setAllQuestions(data.dtoList);
        setAdminPage(data.page);
        setAdminTotalPages(data.totalPages || 1);
      } else {
        console.error("전체 질문 목록 조회 실패:", response.status);
      }
    } catch (error) {
      console.error("전체 질문 목록 조회 실패:", error);
    }
  };

  const fetchMyQuestions = async () => {
    const token = getToken();
    if (!token) {
      console.error("토큰이 없습니다.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/ourlog/question/my-questions",
        {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInquiries(data);
      } else if (response.status === 401) {
        console.error("인증이 만료되었습니다.");
        removeToken();
      } else {
        console.error("문의 목록 조회 실패:", response.status);
      }
    } catch (error) {
      console.error("문의 목록 조회 실패:", error);
    }
  };

  // 검색어에 따른 FAQ 필터링
  const filteredFaqs = searchTerm
    ? faqs.filter(
        (faq) =>
          faq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqs;

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

    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    if (editingInquiry) {
      // 수정
      await fetch("http://localhost:8080/ourlog/question/editingInquiry", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          questionId: editingInquiry.questionId,
          title: inquiryForm.title,
          content: inquiryForm.content,
        }),
      });
      setAlertMessage("문의가 수정되었습니다.");
    } else {
      // 등록
      await fetch("http://localhost:8080/ourlog/question/inquiry", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: inquiryForm.title,
          content: inquiryForm.content,
        }),
      });
      setAlertMessage("문의가 등록되었습니다.");
    }

    // 등록/수정 후 내 문의 목록 새로고침
    fetchMyQuestions();
    setInquiryForm({ title: "", content: "" });
    setEditingInquiry(null);
    setShowInquiryModal(false);
  };

  const handleDeleteInquiry = (questionId: number) => {
    setSelectedQuestionId(questionId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuestionId) return;

    const token = getToken();
    if (!token) {
      setAlertMessage("로그인이 필요합니다.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/ourlog/question/deleteQuestion/${selectedQuestionId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("삭제 실패:", res.status, errorText);
        setAlertMessage(`삭제 실패: ${res.status} ${errorText}`);
      } else {
        setShowDeleteModal(false);
        setAlertMessage("문의가 삭제되었습니다.");
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

  const handleAnswerSubmit = async (
    questionId: number,
    answerContentValue: string
  ) => {
    const token = getToken();
    if (!token) {
      setAlertMessage("토큰이 없습니다.");
      setShowAlertModal(true);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/ourlog/question-answer/${questionId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify({
            contents: answerContentValue,
          }),
        }
      );
      if (response.ok) {
        setAlertMessage("답변이 등록되었습니다.");
        setShowAlertModal(true);
        setAnswerContent((prev) => ({
          ...prev,
          [questionId]: "",
        }));
        fetchAllQuestions();
      } else {
        const errorText = await response.text();
        setAlertMessage("답변 등록 실패: " + errorText);
        setShowAlertModal(true);
      }
    } catch (error) {
      setAlertMessage("답변 등록 중 오류가 발생했습니다.");
      setShowAlertModal(true);
    }
  };

  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [editingAnswerContent, setEditingAnswerContent] = useState<string>("");

  const handleEditAnswer = (question) => {
    setEditingAnswerId(question.answerDTO.answerId);
    setEditingAnswerContent(question.answerDTO.contents);
  };

  const handleEditAnswerSubmit = async () => {
    if (!editingAnswerContent.trim()) {
      setAlertMessage("답변 내용을 입력하세요.");
      setShowAlertModal(true);
      return;
    }
    const token = getToken();
    if (!token) {
      setAlertMessage("토큰이 없습니다.");
      setShowAlertModal(true);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/ourlog/question-answer/${editingAnswerId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ contents: editingAnswerContent }),
        }
      );
      if (response.ok) {
        setAlertMessage("답변이 수정되었습니다.");
        setShowAlertModal(true);
        setEditingAnswerId(null);
        setEditingAnswerContent("");
        fetchAllQuestions();
      } else {
        setAlertMessage("수정 실패");
        setShowAlertModal(true);
      }
    } catch (e) {
      setAlertMessage("수정 중 오류 발생");
      setShowAlertModal(true);
    }
  };

  const handleDeleteAnswer = (question) => {
    setDeleteTargetAnswer(question);
    setShowDeleteAnswerModal(true);
  };

  const [showDeleteAnswerModal, setShowDeleteAnswerModal] = useState(false);
  const [deleteTargetAnswer, setDeleteTargetAnswer] = useState<any>(null);

  const handleDeleteAnswerConfirm = async () => {
    if (!deleteTargetAnswer) return;
    if (!hasToken()) {
      setAlertMessage("로그인이 필요합니다.");
      setShowAlertModal(true);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/ourlog/question-answer/${deleteTargetAnswer.answerDTO.answerId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      if (response.ok) {
        setShowDeleteAnswerModal(false);
        setAlertMessage("답변이 삭제되었습니다.");
        setShowAlertModal(true);
        fetchAllQuestions();
      } else {
        setShowDeleteAnswerModal(false);
        setAlertMessage("삭제 실패");
        setShowAlertModal(true);
      }
    } catch (e) {
      setShowDeleteAnswerModal(false);
      setAlertMessage("삭제 중 오류 발생");
      setShowAlertModal(true);
    }
  };

  return (
    <>
      <div className="cc-container">
        <nav className="cc-sidebar">
          <h2 className="cc-sidebar-title">고객센터</h2>
          {isAdmin ? (
            // 관리자일 때
            <div
              className={`cc-nav-item ${
                activeSection === "questionlist" ? "active" : ""
              }`}
              onClick={() => setActiveSection("questionlist")}
            >
              전체 질문 목록
            </div>
          ) : (
            // 일반 유저일 때
            <>
              <div
                className={`cc-nav-item ${
                  activeSection === "faq" ? "active" : ""
                }`}
                onClick={() => scrollToSection("faq")}
              >
                자주 묻는 질문
              </div>
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
          {isAdmin ? (
            <section id="questionlist">
              <h2 className="cc-section-title">전체 질문 목록</h2>
              {allQuestions.length === 0 ? (
                <p className="cc-no-results">등록된 질문이 없습니다.</p>
              ) : (
                allQuestions.map((question) => (
                  <div
                    key={question.questionId}
                    className="cc-admin-question-card"
                  >
                    <div className="cc-form-row">
                      <div className="cc-form-group half">
                        <label>User ID</label>
                        <input
                          type="text"
                          value={question.userDTO?.nickname}
                          readOnly
                        />
                      </div>

                      <div className="cc-form-group half">
                        <label>User e-mail</label>
                        <input
                          type="text"
                          value={question.userDTO?.email}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="cc-form-group">
                      <label>제목</label>
                      <input type="text" value={question.title} readOnly />
                    </div>
                    <div className="cc-form-group">
                      <label>내용</label>
                      <input type="text" value={question.content} readOnly />
                    </div>

                    {question.answerDTO ? (
                      editingAnswerId === question.answerDTO.answerId ? (
                        <div>
                          <textarea
                            value={editingAnswerContent}
                            onChange={(e) =>
                              setEditingAnswerContent(e.target.value)
                            }
                            className="cc-admin-answer-textarea"
                          />
                          <div className="cc-button-wrapper">
                            <button
                              className="cc-action-button"
                              onClick={handleEditAnswerSubmit}
                            >
                              저장
                            </button>
                            <button
                              className="cc-action-button cancel"
                              onClick={() => setEditingAnswerId(null)}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="cc-form-group">
                          <label>답변</label>

                          <div className="cc-answer-box">
                            <input
                              type="text"
                              value={question.answerDTO.contents}
                              readOnly
                            />

                            <div className="cc-button-wrapper">
                              <button
                                className="cc-action-button"
                                onClick={() => handleEditAnswer(question)}
                              >
                                수정
                              </button>
                              <button
                                className="cc-action-button delete"
                                onClick={() => {
                                  setDeleteTargetAnswer(question);
                                  setShowDeleteAnswerModal(true);
                                }}
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="cc-answer-form">
                        <label>답변</label>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleAnswerSubmit(
                              question.questionId,
                              answerContent[question.questionId] || ""
                            );
                          }}
                        >
                          <textarea
                            value={answerContent[question.questionId] || ""}
                            onChange={(e) =>
                              setAnswerContent({
                                ...answerContent,
                                [question.questionId]: e.target.value,
                              })
                            }
                            required
                            placeholder="답변을 입력하세요"
                            className="cc-admin-answer-textarea"
                          />
                          <div className="cc-button-wrapper">
                            <button className="cc-action-button" type="submit">
                              답변 등록
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div className="cc-pagination">
                <button
                  onClick={() => fetchAllQuestions(Math.max(1, adminPage - 1))}
                  disabled={adminPage === 1}
                >
                  &lt;
                </button>
                {adminTotalPages > 0 &&
                  Array.from({ length: adminTotalPages }, (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => fetchAllQuestions(idx + 1)}
                      className={adminPage === idx + 1 ? "active" : ""}
                    >
                      {idx + 1}
                    </button>
                  ))}
                <button
                  onClick={() =>
                    fetchAllQuestions(Math.min(adminTotalPages, adminPage + 1))
                  }
                  disabled={adminPage === adminTotalPages}
                >
                  &gt;
                </button>
              </div>
            </section>
          ) : (
            <>
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

              {!searchTerm.trim() && (
                <>
                  <section id="inquiry">
                    <h2 className="cc-section-title">1:1 문의하기</h2>
                    <p className="cc-info-text">
                      서비스 이용 중 불편하신 점이나 문의사항을 남겨주시면
                      신속하게 답변 드리도록 하겠습니다.
                    </p>
                    <p className="cc-info-text">
                      영업일 기준(주말·공휴일 제외) 3일 이내에 답변드리겠습니다.
                      단, 문의가 집중되는 경우 답변이 지연될 수 있는 점 너그러이
                      양해 부탁드립니다.
                    </p>
                    <div className="cc-warning-box">
                      산업안전보건법에 따라 폭언, 욕설, 성희롱, 반말, 비하,
                      반복적인 요구 등에는 회신 없이 상담을 즉시 종료하며, 이후
                      다른 문의에도 회신하지 않습니다. 고객응대 근로자를
                      보호하기 위해 이같은 이용자의 서비스 이용을 제한하고,
                      업무방해, 모욕죄 등으로 민형사상 조치를 취할 수 있음을
                      알려드립니다.
                    </div>
                    <button
                      className="cc-button"
                      onClick={() => setShowInquiryModal(true)}
                    >
                      문의하기
                    </button>
                  </section>

                  <section id="questionlist">
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
                        {inquiries.length > 0 ? (
                          inquiries.map((inquiry, idx) => (
                            <tr key={inquiry.questionId}>
                              <td className="cc-td">{idx + 1}</td>
                              <td
                                className="cc-td"
                                onClick={() => {
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
                              <td className="cc-td">
                                {inquiry.regDate
                                  ? inquiry.regDate.split("T")[0]
                                  : ""}
                              </td>
                              <td className="cc-td">
                                <span
                                  className={`cc-status-badge ${
                                    inquiry.answerDTO ? "completed" : "waiting"
                                  }`}
                                >
                                  {inquiry.answerDTO
                                    ? "답변 완료"
                                    : "답변 대기"}
                                </span>
                              </td>
                              <td className="cc-td">
                                <div className="cc-button-group">
                                  <button
                                    className="cc-action-button"
                                    onClick={() =>
                                      inquiry.answerDTO
                                        ? handleRestrictedAction("edit")
                                        : handleEditInquiry(inquiry)
                                    }
                                  >
                                    수정
                                  </button>
                                  <button
                                    className="cc-action-button delete"
                                    onClick={() =>
                                      inquiry.answerDTO
                                        ? handleRestrictedAction("delete")
                                        : handleDeleteInquiry(
                                            inquiry.questionId
                                          )
                                    }
                                  >
                                    삭제
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="cc-td cc-empty-row" colSpan={5}>
                              문의 내역이 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {showInquiryModal && (
        <div className="cc-overlay">
          <div className="cc-modal">
            <div className="cc-modal-header">
              <h2>{editingInquiry ? "문의 수정하기" : "1:1 문의하기"}</h2>
              <button
                className="cc-close-button"
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
              <div className="cc-form-group">
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
              <div className="cc-form-group">
                <label>내용</label>
                <textarea
                  value={inquiryForm.content}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, content: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit" className="cc-button">
                {editingInquiry ? "수정하기" : "제출하기"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="cc-overlay">
          <div className="cc-modal">
            <div className="cc-modal-header">
              <h2>삭제 확인</h2>
              <button
                className="cc-close-button"
                onClick={() => setShowDeleteModal(false)}
              >
                <X />
              </button>
            </div>
            <p>문의를 삭제하시겠습니까?</p>
            <div className="cc-modal-button-group">
              <button
                className="cc-modal-button cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </button>
              <button className="cc-modal-button" onClick={handleDeleteConfirm}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlertModal && (
        <div className="cc-overlay">
          <div className="cc-modal">
            <div className="cc-modal-header">
              <h3>알림</h3>
              <button
                className="cc-close-button"
                onClick={() => setShowAlertModal(false)}
              >
                <X />
              </button>
            </div>
            <p>{alertMessage}</p>
            <div className="cc-modal-button-group">
              <button
                className="cc-modal-button"
                onClick={() => setShowAlertModal(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedInquiry && (
        <div className="cc-overlay">
          <div className="cc-modal">
            <div className="cc-modal-header">
              <h2>1:1 문의 상세내용</h2>
              <button
                className="cc-close-button"
                onClick={() => setShowDetailModal(false)}
              >
                <X />
              </button>
            </div>
            <form>
              <div className="cc-form-group">
                <label>제목</label>
                <input type="text" value={selectedInquiry.title} readOnly />
              </div>
              <div className="cc-form-group">
                <label>내용</label>
                <textarea value={selectedInquiry.content} readOnly />
              </div>
              <div className="cc-form-group">
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
                <div className="cc-form-group">
                  <label>답변</label>
                  {editingAnswerId === selectedInquiry.answerDTO.answerId ? (
                    <div>
                      <textarea
                        value={editingAnswerContent}
                        onChange={(e) =>
                          setEditingAnswerContent(e.target.value)
                        }
                        required
                      />
                      {isAdmin && (
                        <>
                          <button
                            className="cc-action-button"
                            onClick={handleEditAnswerSubmit}
                          >
                            저장
                          </button>
                          <button
                            className="cc-action-button cancle"
                            onClick={() => setEditingAnswerId(null)}
                          >
                            취소
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="cc-answer-box">
                      <div className="cc-answer-label"></div>
                      <p className="cc-answer-content">
                        {selectedInquiry.answerDTO.contents}
                      </p>
                      {isAdmin && (
                        <div className="cc-admin-answer-actions">
                          <button
                            onClick={() => handleEditAnswer(selectedInquiry)}
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteAnswer(selectedInquiry)}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {showDeleteAnswerModal && (
        <div className="cc-overlay">
          <div className="cc-modal">
            <div className="cc-modal-header">
              <h2>답변 삭제 확인</h2>
              <button
                className="cc-close-button"
                onClick={() => setShowDeleteAnswerModal(false)}
              >
                <X />
              </button>
            </div>
            <p>정말 답변을 삭제하시겠습니까?</p>
            <div className="cc-modal-button-group">
              <button
                className="cc-modal-button cancel"
                onClick={() => setShowDeleteAnswerModal(false)}
              >
                취소
              </button>
              <button
                className="cc-modal-button"
                onClick={handleDeleteAnswerConfirm}
              >
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
