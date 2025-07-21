export interface PostDTO {
  postId: number;
  userId: number;
  title: string;
  content: string;
  nickname: string;
  fileName: string; // 썸네일 이미지 파일명 (UUID)
  boardNo: number; // 게시판 번호 (예: 5 for Art)
  views: number | null;
  tag: string; // 쉼표로 구분된 태그 문자열
  thumbnailImagePath: string | null; // 썸네일 이미지 경로 (null 가능)
  resizedImagePath?: string; // 중간 크기 이미지 경로 (null 가능)
  originImagePath: string[]; // 원본 이미지 경로 (null 가능)
  followers: number | 0;
  downloads: number | 0;
  favoriteCnt: number | 0; // 좋아요 수
  tradeDTO: TradeDTO | null; // 경매 정보 (Art 게시판에 해당)
  pictureDTOList: PictureDTO[] | null; // 첨부 이미지 목록 (null 가능)
  profileImage: string | null; // 작성자 프로필 이미지 경로
  replyCnt: number | 0; // 댓글 수
  regDate: string | null; // 등록일시
  modDate: string | null; // 수정일시
}

export interface Comment {
  replyId: number;
  content: string;
  userDTO: {
    userId: number;
    nickname: string;
  };
  regDate: string | null; // 등록일시 (null 가능)
  modDate: string | null; // 수정일시 (null 가능)
}

import { TradeDTO } from "./tradeTypes";
import { PictureDTO } from "./pictureTypes";
