export interface Question {
  questionId: number;
  title: string;
  content: string;
  regDate: string;
  modDate: string;
  userDTO: {
    id: number;
    email: string;
    name: string;
  };
  answerDTO?: Answer;
  isOpen: boolean; // UI 전용
}

export interface Answer {
  answerId: number;
  contents: string;
  regDate: string;
  modDate: string;
}

export interface QuestionFormData {
  title: string;
  content: string;
}
