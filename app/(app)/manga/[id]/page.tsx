'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSidebarContext } from '@/lib/context/SidebarContext';
import StarRating from '@/components/StarRating';
import { mockMangaDetail, mockRecommendations, extendedRecommendations, type RecommendationManga } from '@/lib/mock-data/manga';
import { ChainLogo } from '@/components/ChainLogo';

// Recommendation Card Component
const RecommendationCard = ({
  id,
  title,
  subtitle,
  chapter,
  rating,
  price,
  imageUrl,
}: RecommendationManga) => {
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
          <ChainLogo size={16} />
        </div>
      </div>

      {/* Content Container */}
      <div className="mt-2 p-2 bg-white border-2 border-black rounded-lg flex flex-col items-start justify-center min-h-[100px]">
        {/* Title */}
        <h3 className="text-black text-sm font-bold font-['Outfit'] leading-[140%] line-clamp-2 text-left w-full">
          {title} {subtitle}
        </h3>

        {/* Chapter */}
        <p className="text-black text-sm font-normal font-['Outfit'] leading-[140%] text-left">
          {chapter}
        </p>

        {/* Star Rating */}
        <StarRating rating={rating} size="sm" />
      </div>
    </Link>
  );
};

export default function MangaChapterSelectPage() {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  const [isRecommendationsClosing, setIsRecommendationsClosing] = useState(false);
  // Sidebar context available if needed for layout adjustments
  useSidebarContext();

  const handleCloseRecommendations = () => {
    setIsRecommendationsClosing(true);
    setTimeout(() => {
      setIsRecommendationsOpen(false);
      setIsRecommendationsClosing(false);
    }, 400); // Match animation duration
  };

  const manga = mockMangaDetail;

  const sortedChapters = [...manga.chapters].sort((a, b) =>
    sortOrder === 'desc' ? b.number - a.number : a.number - b.number
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0668A6] via-[#0668A6] to-[#1AAACE]">
      {/* ==================== HERO CONTENT FRAME ==================== */}
      <div className="px-16 pt-10">
        <div className="flex items-center gap-[19px]">
          {/* Cover Image */}
          <div className="w-[271px] h-[289px] flex-shrink-0 relative">
            <img
              src={manga.coverImage}
              alt={manga.title}
              className="w-full h-full object-cover border-[3px] border-black rounded-xl shadow-[5px_5px_0px_1px_#000000]"
            />
          </div>

          {/* Content Card */}
          <div className="flex-1 flex flex-col justify-center items-center py-8 px-6 gap-[10px] h-[289px] bg-[#FFEFE6] border-[3px] border-black shadow-[5px_5px_0px_1px_#000000] rounded-2xl">
            {/* Content Inner */}
            <div className="flex flex-col items-start gap-[10px] w-full">
              {/* Container for title, tags, description */}
              <div className="flex flex-col items-start gap-[7px] w-full">
                {/* Title and Author */}
                <div className="flex flex-col items-start w-full">
                  <h1 className="text-black text-[40px] font-semibold font-['Outfit'] leading-[160%] flex items-center h-[41px]">
                    {manga.title}
                  </h1>
                  <p className="text-black text-xl font-medium font-['Outfit'] leading-[160%] flex items-center flex-grow h-8">
                    Author: {manga.author}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-row items-center gap-2">
                  {manga.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex flex-row justify-center items-center px-3 py-0 h-[22px] bg-white border-2 border-black rounded-[5px] text-black text-sm font-semibold font-['Outfit'] leading-[17px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-black text-base font-normal font-['Outfit'] leading-5 w-full h-[60px]">
                  {manga.description}
                </p>
              </div>

              {/* Action Buttons and Rating Row */}
              <div className="flex flex-row justify-between items-center w-full h-10">
                {/* Actions */}
                <div className="flex flex-row items-center gap-[10px] h-10">
                  {/* Read Button */}
                  <button className="flex flex-col items-start px-4 py-[10px] h-10 bg-gradient-to-br from-[#00579B] via-[#0B79B0] to-[#1AAACE] rounded-[20px] border-2 border-white shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                    <span className="text-white text-base font-bold font-['Outfit'] leading-5">
                      Read Chp.{manga.chapters[0].number}
                    </span>
                  </button>

                  {/* Add to Playlist Button */}
                  <button className="flex flex-row justify-center items-center px-2 py-[10px] gap-2 h-10 bg-white rounded-[20px] border-2 border-black shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                    <img src="/logos/tabler_playlist-add.svg" alt="Add to playlist" width={24} height={24} />
                    <span className="text-black text-base font-bold font-['Outfit'] leading-5">
                      Add to playlist
                    </span>
                  </button>
                </div>

                {/* Rating */}
                <StarRating rating={manga.rating} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CHAPTERS SECTION ==================== */}
      <div className="px-16 mt-12">
        {/* Section Header */}
        <div className="flex items-end justify-between pb-2 border-b-[3px] border-black mb-[14px]">
          <h2 className="text-black text-xl font-semibold font-['Outfit']">
            Chapters ({manga.chapters.length})
          </h2>
          {/* Sort Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-1"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l4-4l4 4M7 5v14" />
              <path d="M21 15l-4 4l-4-4M17 19V5" />
            </svg>
          </button>
        </div>

        {/* Chapters List */}
        <div className="flex flex-col gap-3">
          {sortedChapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/manga/${manga.id}/chapter/${chapter.id}`}
              className="px-6 py-3 bg-[#FFEFE6] border-2 border-black shadow-[3px_3px_0px_#000000] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#FFE4D4] hover:scale-x-[1.02] hover:shadow-[4px_4px_0px_#000000] transition-all duration-200 origin-center"
            >
              <div className="flex flex-col">
                <span className="text-black text-xl font-semibold font-['Outfit']">
                  {chapter.title}
                </span>
                <span className="text-black text-sm font-medium font-['Outfit']">
                  {chapter.createdAt}
                </span>
              </div>
              {chapter.isNew && (
                <img src="/logos/mdi_new-box.svg" alt="New" width={24} height={24} />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* ==================== RECOMMENDATIONS SECTION ==================== */}
      <div className="px-16 mt-12 pb-8">
        <h2 className="text-white text-2xl font-semibold font-['Fredoka'] leading-[160%] mb-4">
          Recommendations
        </h2>

        {/* Recommendations Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mockRecommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              {...rec}
            />
          ))}
        </div>

        {/* See More Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsRecommendationsOpen(true)}
            className="px-2 py-[10px] bg-white rounded-[20px] border-2 border-black shadow-[3px_3px_0px_#000000] inline-flex items-center gap-2 hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <span className="text-black text-base font-bold font-['Outfit']">See more</span>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="black">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Recommendations Modal - slides up from bottom */}
      {isRecommendationsOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 z-[60] transition-opacity ${isRecommendationsClosing ? 'opacity-0' : 'opacity-100'}`}
            style={{ transitionDuration: '400ms' }}
            onClick={handleCloseRecommendations}
          />

          {/* Recommendations Panel - slides up from bottom */}
          <div className={`fixed bottom-0 left-16 right-16 z-[70] rounded-t-[32px] border-t-[3px] border-x-[3px] border-black bg-[#FFEFE6] shadow-[0_-4px_20px_rgba(0,0,0,0.2)] max-h-[80vh] flex flex-col ${isRecommendationsClosing ? 'animate-slide-down' : 'animate-slide-up'}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-[2px] border-black/10">
              <h2 className="text-2xl font-bold font-['Fredoka'] text-black">More Recommendations</h2>
              <div className="flex items-center gap-4">
                <span className="text-base font-medium font-['Outfit'] text-black/70">
                  {mockRecommendations.length + extendedRecommendations.length} manga
                </span>
                <button
                  onClick={handleCloseRecommendations}
                  className="w-10 h-10 rounded-full bg-black flex items-center justify-center transition-colors hover:bg-black/80"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Manga Grid */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...mockRecommendations, ...extendedRecommendations].map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    {...rec}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
