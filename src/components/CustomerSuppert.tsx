import React, { useState, useRef } from "react";
import type { Question, QuestionFormData } from "../types/Question";
import styled, { createGlobalStyle } from "styled-components"; // npm i --save-dev @types/styled-components
import { Search } from "lucide-react"; // lucide 돋보기 아이콘(npm install lucide-react)

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #000000;
  }
`;

const Container = styled.div`
  display: flex;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #000000;
  min-height: 100vh;
  position: relative;
  color: #ffffff;
`;

const Sidebar = styled.nav`
  width: 240px;
  background: #111111;
  border-radius: 8px;
  padding: 1rem;
  height: fit-content;
  transform: translateY(43%);
`;

const SidebarTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
  color: #ffffff;
`;

const NavItem = styled.div<{ active: boolean }>`
  padding: 1rem 1.5rem;
  cursor: pointer;
  background-color: ${(props) => (props.active ? "#4a90e2" : "transparent")};
  color: ${(props) => (props.active ? "#ffffff" : "#cccccc")};
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.active ? "#357abd" : "#222222")};
  }
`;

const Content = styled.div`
  flex: 1;
  background: #111111;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
`;

const StyledH1 = styled.h1`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #ffffff;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #333;
`;

const FAQItem = styled.div`
  border: 1px solid #333;
  border-radius: 6px;
  margin-bottom: 1rem;
  overflow: hidden;
`;

const QuestionBox = styled.div`
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  background-color: #222222;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background-color: #333333;
  }

  &::after {
    content: "▼";
    font-size: 0.8rem;
    transition: transform 0.2s ease;
  }

  &[aria-expanded="true"]::after {
    transform: rotate(180deg);
  }
`;

const Answer = styled.div<{ isOpen: boolean }>`
  padding: ${(props) => (props.isOpen ? "1rem 1.5rem" : "0 1.5rem")};
  background-color: #111111;
  max-height: ${(props) => (props.isOpen ? "500px" : "0")};
  opacity: ${(props) => (props.isOpen ? "1" : "0")};
  transition: all 0.3s ease-in-out;
  overflow: hidden;
`;

const InfoText = styled.p`
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #ccc;
  line-height: 1.6;
  white-space: pre-line;
`;

const WarningBox = styled.div`
  border: 1px solid #ff6b6b;
  color: #ff9999;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
  background-color: rgba(255, 107, 107, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  color: #ffffff;
`;

const Th = styled.th`
  background-color: #222222;
  padding: 1rem;
  text-align: center;
  border-bottom: 2px solid #333;
  color: #ffffff;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #333;
  color: #ffffff;
`;

const StatusBadge = styled.span<{ status: "waiting" | "completed" }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  background-color: ${(props) =>
    props.status === "waiting" ? "#2c3e50" : "#2c4a3e"};
  color: ${(props) => (props.status === "waiting" ? "#f1c40f" : "#2ecc71")};
  border: 1px solid
    ${(props) => (props.status === "waiting" ? "#f1c40f" : "#2ecc71")};
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #111111;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  width: 500px;
  max-width: 90vw;
  color: #ffffff;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Button = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #357abd;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #cccccc;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #222222;
  color: white;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.25);
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 98%;
  margin-bottom: 20px;
`;

const StyledSearchInput = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #333;
  border-radius: 8px;
  color: white;
  background-color: #222222;
  z-index: 1;
  position: relative;
  pointer-events: auto;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.25);
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  top: 50%;
  right: 5px;
  transform: translateY(-50%);
  color: #888;
  width: 18px;
  height: 18px;
  pointer-events: none;
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  background-color: #222222;
  color: white;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.25);
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  background: none;
  border: none;
  color: #cccccc;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    color: #4a90e2;
  }

  &.delete {
    &:hover {
      color: #ff4d4d;
    }
  }

  &:disabled {
    color: #444;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

const AnswerSection = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? "block" : "none")};
  padding: 1rem;
  background-color: #333;
  border-radius: 4px;
  margin-top: 0.5rem;
`;

const AnswerContent = styled.div`
  padding: 1rem;
  background-color: #1e1e1e;
  border-radius: 4px;
  margin-top: 0.5rem;
`;

const AnswerDate = styled.div`
  color: #888;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const QuestionTitle = styled.div`
  color: #ffffff;
`;

const AlertModal = styled(Modal)`
  max-width: 400px;
  text-align: center;
`;

const ModalButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ModalButton = styled(Button)`
  margin-top: 0;
  padding: 0.5rem 1rem;

  &.cancel {
    background-color: #555555;
    &:hover {
      background-color: #666666;
    }
  }
`;

const CustomerSupport: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    "faq" | "inquiry" | "history"
  >("faq");
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 원본 FAQ 데이터
  const originalFaqs = [
    {
      questionId: 1,
      title: "회원가입은 어떻게 하나요?",
      content:
        "회원가입을 클릭 후 이메일주소, 비밀번호, 닉네임, 모바일번호을 입력하는 간단한 절차만으로 가입이 가능합니다.",
      regDate: "2024-01-20",
      modDate: "2024-01-20",
      userDTO: {
        id: 1,
        email: "admin@example.com",
        name: "관리자",
      },
      isOpen: false,
    },
    {
      questionId: 2,
      title: "내 계정 정보는 어떻게 변경하나요?",
      content:
        "로그인 후 [마이페이지]-[내계정변경하기]에서 변경할 수 있습니다.",
      regDate: "2024-01-20",
      modDate: "2024-01-20",
      userDTO: {
        id: 1,
        email: "admin@example.com",
        name: "관리자",
      },
      isOpen: false,
    },
    {
      questionId: 3,
      title: "프로필 변경은 어떻게 하나요?",
      content: "프로필은 [마이페이지]-[프로필변경]에서 변경할 수 있습니다.",
      regDate: "2024-01-20",
      modDate: "2024-01-20",
      userDTO: {
        id: 1,
        email: "admin@example.com",
        name: "관리자",
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
        name: "관리자",
      },
      isOpen: false,
    },
  ];

  const [faqs, setFaqs] = useState(originalFaqs);

  // 검색어에 따른 FAQ 필터링
  const filteredFaqs = searchTerm
    ? originalFaqs.filter(
        (faq) =>
          faq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : originalFaqs;

  const [inquiries, setInquiries] = useState<Question[]>([
    {
      questionId: 5,
      title: "로그인 오류",
      content: "로그인이 되지 않습니다.",
      regDate: "2024-01-20",
      modDate: "2024-01-20",
      userDTO: {
        id: 2,
        email: "user@example.com",
        name: "사용자",
      },
      answerDTO: {
        answerId: 6,
        contents: "비밀번호 재설정 후 다시 시도해주세요.",
        regDate: "2024-01-20",
        modDate: "2024-01-20",
      },
      isOpen: false,
    },
    {
      questionId: 3,
      title: "결제 문의",
      content: "결제가 완료되었는데 포인트가 들어오지 않았습니다.",
      regDate: "2024-01-21",
      modDate: "2024-01-21",
      userDTO: {
        id: 2,
        email: "user@example.com",
        name: "사용자",
      },
      isOpen: false,
    },
  ]);
  const [inquiryForm, setInquiryForm] = useState<QuestionFormData>({
    title: "",
    content: "",
  });

  const faqRef = useRef<HTMLDivElement>(null);
  const inquiryRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const [editingInquiry, setEditingInquiry] = useState<Question | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(
    null
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null
  );

  const handleEditInquiry = (inquiry: Question) => {
    setEditingInquiry(inquiry);
    setInquiryForm({
      title: inquiry.title,
      content: inquiry.content,
    });
    setShowInquiryModal(true);
  };

  const handleDeleteClick = (questionId: number) => {
    setSelectedQuestionId(questionId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedQuestionId) {
      setInquiries(
        inquiries.filter((q) => q.questionId !== selectedQuestionId)
      );
      setShowDeleteModal(false);
    }
  };

  const handleRestrictedAction = (action: "edit" | "delete") => {
    setAlertMessage(
      action === "edit"
        ? "답변완료한 문의내역은 수정할 수 없습니다"
        : "답변완료한 문의내역은 삭제할 수 없습니다"
    );
    setShowAlertModal(true);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInquiry) {
      // 수정 로직
      setInquiries(
        inquiries.map((q) =>
          q.questionId === editingInquiry.questionId
            ? {
                ...q,
                title: inquiryForm.title,
                content: inquiryForm.content,
                modDate: new Date().toISOString().split("T")[0],
              }
            : q
        )
      );
    } else {
      // 새 문의 작성 로직
      const newInquiry: Question = {
        questionId: Math.max(...inquiries.map((q) => q.questionId), 0) + 1,
        title: inquiryForm.title,
        content: inquiryForm.content,
        regDate: new Date().toISOString().split("T")[0],
        modDate: new Date().toISOString().split("T")[0],
        userDTO: {
          id: 2,
          email: "user@example.com",
          name: "사용자",
        },
        isOpen: false,
      };
      setInquiries([...inquiries, newInquiry]);
    }
    setInquiryForm({ title: "", content: "" });
    setShowInquiryModal(false);
    setEditingInquiry(null);
  };

  const scrollToSection = (section: "faq" | "inquiry" | "history") => {
    setActiveSection(section);
    const refs = {
      faq: faqRef,
      inquiry: inquiryRef,
      history: historyRef,
    };
    refs[section].current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestionId(
      expandedQuestionId === questionId ? null : questionId
    );
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Sidebar>
          <SidebarTitle>고객센터</SidebarTitle>
          <NavItem
            active={activeSection === "faq"}
            onClick={() => scrollToSection("faq")}
          >
            자주 묻는 질문
          </NavItem>
          {!searchTerm && (
            <>
              <NavItem
                active={activeSection === "inquiry"}
                onClick={() => scrollToSection("inquiry")}
              >
                1:1 문의하기
              </NavItem>
              <NavItem
                active={activeSection === "history"}
                onClick={() => scrollToSection("history")}
              >
                1:1 문의내역
              </NavItem>
            </>
          )}
        </Sidebar>

        <Content>
          <div ref={faqRef}>
            <StyledH1>
              무엇이든 물어보세요! 궁금하신 점 바로 풀어드립니다.
            </StyledH1>
            <SearchWrapper>
              <StyledSearchInput
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
              <SearchIcon />
            </SearchWrapper>
            <SectionTitle>
              {searchTerm
                ? `"${searchTerm}"에 대한 검색 결과`
                : "자주 묻는 질문"}
            </SectionTitle>
            {filteredFaqs.length === 0 && searchTerm ? (
              <p
                style={{
                  color: "#e0e0e0",
                  textAlign: "center",
                  marginTop: "2rem",
                }}
              >
                검색 결과가 없습니다.
              </p>
            ) : (
              filteredFaqs.map((faq) => (
                <FAQItem key={faq.questionId}>
                  <QuestionBox
                    onClick={() => toggleQuestion(faq.questionId)}
                    aria-expanded={faq.isOpen}
                  >
                    {faq.title}
                  </QuestionBox>
                  <Answer isOpen={faq.isOpen}>{faq.content}</Answer>
                </FAQItem>
              ))
            )}
          </div>
          {!searchTerm && (
            <>
              <div ref={inquiryRef}>
                <SectionTitle>1:1 문의하기</SectionTitle>
                <InfoText>
                  저희는 항상 고객님의 편입니다. 이용 중 궁금한 점 또는 건의가
                  있다면 언제든 편하게 말씀해주세요. <br />
                  영업일 기준(주말·공휴일 제외) 3일 이내에 답변드리겠습니다. 단,
                  문의가 집중되는 경우 답변이 지연될 수 있는 점 너그러이 양해
                  부탁드립니다.
                </InfoText>
                <WarningBox>
                  산업안전보건법에 따라 폭언, 욕설, 성희롱, 반말, 비하, 반복적인
                  요구 등에는 회신 없이 상담을 즉시 종료하며, 이후 다른 문의에도
                  회신하지 않습니다. 고객응대 근로자를 보호하기 위해 이같은
                  이용자의 서비스 이용을 제한하고, 업무방해, 모욕죄 등으로
                  민형사상 조치를 취할 수 있음을 알려드립니다.
                </WarningBox>
                <Button onClick={() => setShowInquiryModal(true)}>
                  문의하기
                </Button>
              </div>

              <div ref={historyRef}>
                <SectionTitle>1:1 문의내역</SectionTitle>
                <Table>
                  <thead>
                    <tr>
                      <Th>글번호</Th>
                      <Th>답변상태</Th>
                      <Th>제목</Th>
                      <Th>작성날짜</Th>
                      <Th>수정/삭제</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inquiry) => (
                      <>
                        <tr key={inquiry.questionId}>
                          <Td>{inquiry.questionId}</Td>
                          <Td>
                            <StatusBadge
                              status={
                                inquiry.answerDTO ? "completed" : "waiting"
                              }
                            >
                              {inquiry.answerDTO ? "답변완료" : "답변대기"}
                            </StatusBadge>
                          </Td>
                          <Td
                            onClick={() => toggleQuestion(inquiry.questionId)}
                            style={{ cursor: "pointer" }}
                          >
                            <QuestionTitle>{inquiry.title}</QuestionTitle>
                          </Td>
                          <Td>{inquiry.regDate}</Td>
                          <Td>
                            <ButtonGroup>
                              <ActionButton
                                onClick={() =>
                                  inquiry.answerDTO
                                    ? handleRestrictedAction("edit")
                                    : handleEditInquiry(inquiry)
                                }
                              >
                                수정
                              </ActionButton>
                              <ActionButton
                                className="delete"
                                onClick={() =>
                                  inquiry.answerDTO
                                    ? handleRestrictedAction("delete")
                                    : handleDeleteClick(inquiry.questionId)
                                }
                              >
                                삭제
                              </ActionButton>
                            </ButtonGroup>
                          </Td>
                        </tr>
                        <tr>
                          <td colSpan={5}>
                            <AnswerSection
                              isOpen={expandedQuestionId === inquiry.questionId}
                            >
                              <div>
                                <strong>문의내용:</strong>
                                <AnswerContent>{inquiry.content}</AnswerContent>
                                {inquiry.answerDTO && (
                                  <>
                                    <strong>답변:</strong>
                                    <AnswerContent>
                                      {inquiry.answerDTO.contents}
                                    </AnswerContent>
                                    <AnswerDate>
                                      답변일: {inquiry.answerDTO.regDate}
                                      {inquiry.answerDTO.modDate !==
                                        inquiry.answerDTO.regDate &&
                                        ` (수정: ${inquiry.answerDTO.modDate})`}
                                    </AnswerDate>
                                  </>
                                )}
                              </div>
                            </AnswerSection>
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Content>

        {showInquiryModal && (
          <Overlay
            onClick={() => {
              setShowInquiryModal(false);
              setEditingInquiry(null);
              setInquiryForm({ title: "", content: "" });
            }}
          >
            <Modal onClick={(e) => e.stopPropagation()}>
              <SectionTitle>
                {editingInquiry ? "문의 수정하기" : "1:1 문의하기"}
              </SectionTitle>
              <Form onSubmit={handleInquirySubmit}>
                <FormGroup>
                  <Label>제목</Label>
                  <Input
                    type="text"
                    value={inquiryForm.title}
                    onChange={(e) =>
                      setInquiryForm({
                        ...inquiryForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>내용</Label>
                  <Textarea
                    value={inquiryForm.content}
                    onChange={(e) =>
                      setInquiryForm({
                        ...inquiryForm,
                        content: e.target.value,
                      })
                    }
                    required
                  />
                </FormGroup>
                <Button type="submit">제출하기</Button>
              </Form>
            </Modal>
          </Overlay>
        )}

        {showDeleteModal && (
          <Overlay onClick={() => setShowDeleteModal(false)}>
            <AlertModal onClick={(e) => e.stopPropagation()}>
              <h3>삭제 확인</h3>
              <p>문의를 삭제하시겠습니까?</p>
              <ModalButtonGroup>
                <ModalButton
                  className="cancel"
                  onClick={() => setShowDeleteModal(false)}
                >
                  취소
                </ModalButton>
                <ModalButton onClick={handleDeleteConfirm}>확인</ModalButton>
              </ModalButtonGroup>
            </AlertModal>
          </Overlay>
        )}

        {showAlertModal && (
          <Overlay onClick={() => setShowAlertModal(false)}>
            <AlertModal onClick={(e) => e.stopPropagation()}>
              <h3>알림</h3>
              <p>{alertMessage}</p>
              <ModalButtonGroup>
                <ModalButton onClick={() => setShowAlertModal(false)}>
                  확인
                </ModalButton>
              </ModalButtonGroup>
            </AlertModal>
          </Overlay>
        )}
      </Container>
    </>
  );
};

export default CustomerSupport;
