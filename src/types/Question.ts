export interface UserDTO {
  userId: number;
  email: string;
  nickname: string;
}

export interface AnswerDTO {
  answerId: number;
  contents: string;
  regDate: string;
  modDate: string;
}

export interface QuestionDTO {
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

export interface PageResultDTO<T> {
  dtoList: T[];   // 제네릭 타입으로 변경
  page: number;
  start: number;
  end: number;
  pageList: number[];
  prev: boolean;
  next: boolean;
}

export interface PageRequestDTO {
  page: string;
  size: string;
  type: string;
  keyword: string;
}