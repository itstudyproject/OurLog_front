export interface UserDTO {
  id: number;
  email: string;
  name: string;
}

export interface AnswerDTO {
  answerId: number;
  contents: string;
  regDate: string;
  modDate: string;
}

export interface Question {
  questionId: number;
  title: string;
  content: string;
  regDate: string;
  modDate: string;
  userDTO: UserDTO;
  answerDTO?: AnswerDTO;
  isOpen: boolean;
}

export interface QuestionFormData {
  title: string;
  content: string;
}
