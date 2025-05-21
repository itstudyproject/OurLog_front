export interface PictureDTO {
  picId: number;
  uuid: string; // 파일 UUID
  picName: string; // 원본 파일명
  path: string; // 파일 저장 경로
  picDescribe: string | null; // 이미지 설명 (Art에서 사용될 수 있음)
  downloads: number | null; // 다운로드 수
  tag: string | null; // 이미지 관련 태그 (쉼표 구분 문자열)
  originImagePath: string | null; // 원본 이미지 경로
  thumbnailImagePath: string | null; // 썸네일 이미지 경로
  resizedImagePath: string | null; // 리사이징된 이미지 경로
  ownerId: number | null; // 이미지 소유자 ID (사용자 또는 게시물) - 주로 게시물 ID가 될 것 같습니다.
  postId: number | null; // 이미지가 연결된 게시물 ID
} 