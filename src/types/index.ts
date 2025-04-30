export interface Artwork {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  artist: string;
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

export interface AuctionItem extends Artwork {
  endTime: Date;
  currentBid: number;
  bidCount: number;
} 