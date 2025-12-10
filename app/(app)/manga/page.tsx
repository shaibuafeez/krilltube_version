'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSidebarContext } from '@/lib/context/SidebarContext';

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);

  return (
    <div className="flex items-center justify-start gap-1 w-full mt-1">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill={index < fullStars ? '#FFB836' : 'none'}
            stroke="#FFB836"
            strokeWidth={index < fullStars ? 0 : 1}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-black text-sm font-semibold font-['Outfit']">
        {rating}
      </span>
    </div>
  );
};

// Manga Card Component
const MangaCard = ({
  id,
  title,
  chapter,
  rating,
  price,
  imageUrl,
}: {
  id: string;
  title: string;
  chapter: string;
  rating: number;
  price: number;
  imageUrl: string;
}) => {
  return (
    <Link
      href={`/manga/${id}`}
      className="p-2.5 bg-[#FFEFE6] border-[3px] border-black shadow-[3px_3px_0px_0px_#000000] rounded-xl flex flex-col cursor-pointer hover:shadow-[5px_5px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all w-full"
    >
      {/* Manga Image */}
      <div className="w-full aspect-[181/200] relative overflow-hidden border-2 border-black rounded-lg">
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Price Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-white rounded-lg border-2 border-black flex items-center gap-0.5">
          <span className="text-black text-sm font-bold font-['Outfit']">{price}</span>
          <img src="/logos/sui-logo.png" alt="SUI" width={16} height={16} className="object-contain" />
        </div>
      </div>

      {/* Content Container */}
      <div className="mt-2 p-2 bg-white border-2 border-black rounded-lg flex flex-col items-start justify-center min-h-[100px]">
        {/* Title */}
        <h3 className="text-black text-sm font-bold font-['Outfit'] leading-[140%] line-clamp-2 text-left w-full">
          {title}
        </h3>

        {/* Chapter */}
        <p className="text-black text-sm font-normal font-['Outfit'] leading-[140%] text-left">
          {chapter}
        </p>

        {/* Star Rating */}
        <StarRating rating={rating} />
      </div>
    </Link>
  );
};

// Mock manga data using local images
const mockManga = [
  { id: '1', title: 'Adventures of the Yeti into the deep', chapter: 'Chp.12', rating: 4.5, price: 2.5, imageUrl: '/manga/yeti.png' },
  { id: '2', title: 'Mirai Taipei', chapter: 'Chp.12', rating: 4.5, price: 3.0, imageUrl: '/manga/mirai.png' },
  { id: '3', title: 'Night of the dragon', chapter: 'Chp.12', rating: 4.5, price: 1.8, imageUrl: '/manga/suiball.png' },
  { id: '4', title: 'Xociety', chapter: 'Chp.12', rating: 4.5, price: 4.2, imageUrl: '/manga/xociety.png' },
  { id: '5', title: 'xcom', chapter: 'Chp.12', rating: 4.5, price: 2.0, imageUrl: '/manga/yeti.png' },
  { id: '6', title: 'Adventures of the Yeti into the deep', chapter: 'Chp.12', rating: 4.5, price: 3.5, imageUrl: '/manga/mirai.png' },
  { id: '7', title: 'Adventures of the Yeti into the deep', chapter: 'Chp.12', rating: 4.5, price: 2.8, imageUrl: '/manga/suiball.png' },
  { id: '8', title: 'Mirai Taipei', chapter: 'Chp.12', rating: 4.5, price: 1.5, imageUrl: '/manga/xociety.png' },
  { id: '9', title: 'Night of the dragon', chapter: 'Chp.12', rating: 4.5, price: 5.0, imageUrl: '/manga/yeti.png' },
  { id: '10', title: 'Xociety', chapter: 'Chp.12', rating: 4.5, price: 2.2, imageUrl: '/manga/mirai.png' },
  { id: '11', title: 'xcom', chapter: 'Chp.12', rating: 4.5, price: 3.8, imageUrl: '/manga/suiball.png' },
  { id: '12', title: 'Adventures of the Yeti into the deep', chapter: 'Chp.12', rating: 4.5, price: 4.5, imageUrl: '/manga/xociety.png' },
  { id: '13', title: 'Adventures of the Yeti into the deep', chapter: 'Chp.12', rating: 4.5, price: 2.0, imageUrl: '/manga/yeti.png' },
  { id: '14', title: 'Mirai Taipei', chapter: 'Chp.12', rating: 4.5, price: 3.2, imageUrl: '/manga/mirai.png' },
  { id: '15', title: 'Night of the dragon', chapter: 'Chp.12', rating: 4.5, price: 1.9, imageUrl: '/manga/suiball.png' },
  { id: '16', title: 'Xociety', chapter: 'Chp.12', rating: 4.5, price: 4.0, imageUrl: '/manga/xociety.png' },
  { id: '17', title: 'xcom', chapter: 'Chp.12', rating: 4.5, price: 2.7, imageUrl: '/manga/yeti.png' },
  { id: '18', title: 'Adventures of the Yeti into the deep', chapter: 'Chp.12', rating: 4.5, price: 3.3, imageUrl: '/manga/mirai.png' },
  { id: '19', title: 'Adventures of the Yeti into the deep', chapter: 'Chp.12', rating: 4.5, price: 1.6, imageUrl: '/manga/suiball.png' },
  { id: '20', title: 'Mirai Taipei', chapter: 'Chp.12', rating: 4.5, price: 5.5, imageUrl: '/manga/xociety.png' },
  { id: '21', title: 'Night of the dragon', chapter: 'Chp.12', rating: 4.5, price: 2.4, imageUrl: '/manga/yeti.png' },
  { id: '22', title: 'Xociety', chapter: 'Chp.12', rating: 4.5, price: 3.6, imageUrl: '/manga/mirai.png' },
  { id: '23', title: 'xcom', chapter: 'Chp.12', rating: 4.5, price: 4.8, imageUrl: '/manga/suiball.png' },
  { id: '24', title: 'Adventures of the Yeti into the deep', chapter: 'Chp.12', rating: 4.5, price: 2.1, imageUrl: '/manga/xociety.png' },
  { id: '25', title: 'Adventures of the Yeti into the deep', chapter: 'Chp.12', rating: 4.5, price: 3.9, imageUrl: '/manga/yeti.png' },
];

// Tab categories
const tabs = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: 'Trending' },
  { id: 'new', label: 'New Releases' },
  { id: 'top', label: 'Top Rated' },
];

// Hero banner slideshow images
const heroBannerImages = [
  '/manga/hero-banner-1.png',
  '/manga/hero-banner-2.png',
  '/manga/hero-banner-3.png',
  '/manga/hero-banner-4.png',
  '/manga/hero-banner-5.png',
  '/manga/hero-banner-6.png',
  '/manga/hero-banner-7.png',
  '/manga/hero-banner-8.png',
  '/manga/hero-banner-9.png',
  '/manga/hero-banner-10.png',
];

export default function MangaPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const { isSidebarCollapsed, isFullyHidden } = useSidebarContext();

  // Calculate sidebar offset based on state
  const sidebarOffset = isFullyHidden ? 0 : isSidebarCollapsed ? 160 : 320;

  // Auto-slide hero banner every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % heroBannerImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Banner navigation
  const handlePrevBanner = () => {
    setCurrentBannerIndex((prev) => (prev === 0 ? heroBannerImages.length - 1 : prev - 1));
  };

  const handleNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % heroBannerImages.length);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0668A6] via-[#0668A6] to-[#1AAACE]">
      {/* ==================== HERO BANNER SECTION ==================== */}
      <div className="relative h-[320px] -mt-[60px] pt-[60px]">
        {/* Hero Background Slideshow - Extends left to touch sidebar */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            left: `-${sidebarOffset}px`,
            width: `calc(100% + ${sidebarOffset}px)`
          }}
        >
          {/* Image Container with border and shadow */}
          <div className="relative w-full h-full overflow-hidden border-b-[3px] border-black shadow-[0_5px_0_0_#000000]">
            {/* Slideshow Images */}
            {heroBannerImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Manga hero background ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </div>
        </div>


        {/* Hero Navigation Controls - Arrows and Dots */}
        <div className="absolute inset-0 z-20 opacity-0 hover:opacity-100 transition-opacity duration-300">
          {/* Navigation Arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between items-center pointer-events-none">
            <button
              onClick={handlePrevBanner}
              className="w-12 h-12 bg-white rounded-full border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center pointer-events-auto hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="black">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <button
              onClick={handleNextBanner}
              className="w-12 h-12 bg-white rounded-full border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center pointer-events-auto hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="black">
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
              </svg>
            </button>
          </div>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {heroBannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-3 h-3 rounded-full border-2 border-black transition-all ${
                  index === currentBannerIndex
                    ? 'bg-white shadow-[2px_2px_0px_#000000]'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ==================== CATEGORY FILTER TABS ==================== */}
      <div className="px-16 py-6">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full shadow-[2px_2px_0_0_black] outline outline-[2px] outline-offset-[-2px] whitespace-nowrap transition-all hover:shadow-[1px_1px_0_0_black] hover:translate-x-[1px] hover:translate-y-[1px] ${
                activeTab === tab.id
                  ? 'bg-black outline-white text-white'
                  : 'bg-[#0668A6] outline-black text-white'
              }`}
            >
              <span className="text-sm font-semibold font-['Outfit']">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ==================== MANGA CARDS GRID ==================== */}
      <div className="px-16 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mockManga.map((manga) => (
            <MangaCard
              key={manga.id}
              id={manga.id}
              title={manga.title}
              chapter={manga.chapter}
              rating={manga.rating}
              price={manga.price}
              imageUrl={manga.imageUrl}
            />
          ))}
        </div>
      </div>

      {/* ==================== LOAD MORE BUTTON ==================== */}
      <div className="flex justify-center pb-8">
        <button className="px-6 py-3 bg-gradient-to-br from-[#0668A6] via-[#0668A6] to-[#1AAACE] rounded-[32px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)] outline outline-2 outline-offset-[-2px] outline-black inline-flex items-center gap-3 hover:shadow-[2px_2px_0_0_black] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
          <span className="text-white text-lg font-bold font-['Outfit']">Load more</span>
          <div className="w-8 h-8 bg-black rounded-full flex justify-center items-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
