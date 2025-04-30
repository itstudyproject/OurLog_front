import React from 'react'
import { cn } from '../utils/cn'
import type { AuctionItem } from '../types'

const SAMPLE_AUCTIONS: AuctionItem[] = [
  {
    id: '1',
    title: 'Abstract Forms',
    price: 300000,
    imageUrl: '/images/abstract-forms.jpg',
    artist: '김민수',
    endTime: new Date('2024-05-01'),
    currentBid: 300000,
    bidCount: 5
  },
  {
    id: '2',
    title: 'Blue Landscape',
    price: 1200000,
    imageUrl: '/images/blue-landscape.jpg',
    artist: '이지원',
    endTime: new Date('2024-05-02'),
    currentBid: 1200000,
    bidCount: 3
  },
  {
    id: '3',
    title: 'Colorful Composition',
    price: 900000,
    imageUrl: '/images/colorful-composition.jpg',
    artist: '박서연',
    endTime: new Date('2024-05-03'),
    currentBid: 900000,
    bidCount: 7
  }
]

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-5xl font-semibold leading-tight">
              당신의 이야기가<br />
              작품이 되는 곳,<br />
              <span className="text-primary-mint">OurLog</span>
            </h1>
            <p className="text-xl text-text-medium">
              아티스트와 컬렉터가 만나는 특별한 공간
            </p>
          </div>
        </div>
      </section>

      {/* Current Auctions */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold mb-8">진행 중인 경매</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SAMPLE_AUCTIONS.map((auction) => (
            <div key={auction.id} className="bg-black/20 rounded-lg overflow-hidden">
              <div className="aspect-[4/3] relative">
                <img 
                  src={auction.imageUrl} 
                  alt={auction.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-4">
                <h3 className="text-xl font-medium">{auction.title}</h3>
                <p className="text-text-medium">
                  ₩{auction.price.toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <button className={cn(
                    "btn",
                    auction.id === '1' && "btn-orange",
                    auction.id === '2' && "btn-mint",
                    auction.id === '3' && "btn-blue"
                  )}>
                    {auction.id === '1' && "팜하기"}
                    {auction.id === '2' && "림하기"}
                    {auction.id === '3' && "알감하기"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
} 