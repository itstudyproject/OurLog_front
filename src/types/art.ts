import { BasePost, Author } from './post';

export interface ArtAuthor extends Author {
  isFollowing: boolean;
}

export interface Auction {
  startingBid: number;
  currentBid: number;
  buyNowPrice: number;
  endTime: string;
  bidCount: number;
}

export interface ArtPost extends Omit<BasePost, 'author'> {
  author: ArtAuthor;
  auction: Auction;
  description: string;
  status: 'ONGOING' | 'ENDED' | 'SOLD';
}

export interface ArtListResponse {
  status: string;
  data: {
    arts: ArtPost[];
    totalPages: number;
    currentPage: number;
    totalArts: number;
  };
}

export interface ArtDetailResponse {
  status: string;
  data: ArtPost;
}

export interface BidHistory {
  id: number;
  bidder: Author;
  amount: number;
  createdAt: string;
}

export interface BidHistoryResponse {
  status: string;
  data: {
    bids: BidHistory[];
    totalPages: number;
    currentPage: number;
    totalBids: number;
  };
}
