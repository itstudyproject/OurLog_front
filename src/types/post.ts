export interface Author {
  id: number;
  name: string;
  profileImage: string;
}

export interface BasePost {
  post_id: number;
  boardNo: number;
  title: string;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  likes: number;
  views: number;
  images?: string[];
  isLiked?: boolean;
}

export interface PostListResponse {
  status: string;
  data: {
    posts: BasePost[];
    totalPages: number;
    currentPage: number;
    totalPosts: number;
  };
}

export interface PostDetailResponse {
  status: string;
  data: BasePost;
}
