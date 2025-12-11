'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSidebarContext } from '@/lib/context/SidebarContext';

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);

  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex flex-row items-center gap-2">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill={index < fullStars ? '#FFB836' : 'none'}
            stroke="#FFB836"
            strokeWidth={index < fullStars ? 0 : 1}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-black text-xl font-semibold font-['Outfit'] leading-[160%]">
        {rating}
      </span>
    </div>
  );
};

// Mock manga data - in a real app this would come from an API
interface MangaData {
  id: string;
  title: string;
  author: string;
  tags: string[];
  description: string;
  rating: number;
  coverImage: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  pages: string[]; // Array of page image URLs
}

// Mock data
const mockMangaData: MangaData = {
  id: '1',
  title: 'Adventures of the Yeti into the deep',
  author: 'Matteo.sui',
  tags: ['NFT', 'Action', 'Advemture', 'Shounen', 'Gaming'],
  description: 'Bacon ipsum dolor amet prosciutto boudin tail landjaeger, tongue tenderloin turducken sirloin fatback biltong t-bone cow short loin ribeye chicken. Drumstick tongue pig tail. Filet mignon bresaola venison salami, tail beef fatback cow picanha pork.',
  rating: 4.5,
  coverImage: '/manga/yeti.png',
  chapters: [
    {
      id: '12',
      number: 12,
      title: 'Chapter 12',
      pages: [
        '/manga/chapter-page-1.png',
        '/manga/chapter-page-2.png',
        '/manga/chapter-page-3.png',
        '/manga/chapter-page-4.jpg',
        '/manga/chapter-page-5.jpg',
        '/manga/chapter-page-6.jpg',
        '/manga/chapter-page-7.jpg',
        '/manga/chapter-page-8.jpg',
        '/manga/chapter-page-9.jpg',
        '/manga/chapter-page-10.jpg',
      ]
    },
    {
      id: '11',
      number: 11,
      title: 'Chapter 11',
      pages: [
        'https://picsum.photos/seed/manga11-1/800/1200',
        'https://picsum.photos/seed/manga11-2/800/1200',
        'https://picsum.photos/seed/manga11-3/800/1200',
      ]
    },
    {
      id: '10',
      number: 10,
      title: 'Chapter 10',
      pages: [
        'https://picsum.photos/seed/manga10-1/800/1200',
        'https://picsum.photos/seed/manga10-2/800/1200',
      ]
    },
    { id: '9', number: 9, title: 'Chapter 9', pages: ['https://picsum.photos/seed/manga9-1/800/1200'] },
    { id: '8', number: 8, title: 'Chapter 8', pages: ['https://picsum.photos/seed/manga8-1/800/1200'] },
    { id: '7', number: 7, title: 'Chapter 7', pages: ['https://picsum.photos/seed/manga7-1/800/1200'] },
    { id: '6', number: 6, title: 'Chapter 6', pages: ['https://picsum.photos/seed/manga6-1/800/1200'] },
    { id: '5', number: 5, title: 'Chapter 5', pages: ['https://picsum.photos/seed/manga5-1/800/1200'] },
    { id: '4', number: 4, title: 'Chapter 4', pages: ['https://picsum.photos/seed/manga4-1/800/1200'] },
    { id: '3', number: 3, title: 'Chapter 3', pages: ['https://picsum.photos/seed/manga3-1/800/1200'] },
    { id: '2', number: 2, title: 'Chapter 2', pages: ['https://picsum.photos/seed/manga2-1/800/1200'] },
    { id: '1', number: 1, title: 'Chapter 1', pages: ['https://picsum.photos/seed/manga1-1/800/1200'] },
  ],
};

// Comment interface
interface Comment {
  id: string;
  author: string;
  authorHandle: string;
  avatar: string;
  content: string;
  date: string;
  time: string;
}

// Mock comments data
const mockComments: Comment[] = [
  {
    id: '1',
    author: 'Matteo.sui',
    authorHandle: '@Matteo.sui',
    avatar: '/logos/eason.svg',
    content: 'This chapter was amazing! The art style really captures the emotion of the scene.',
    date: 'jun 30, 2025',
    time: '6:20PM',
  },
  {
    id: '2',
    author: 'CryptoFan',
    authorHandle: '@CryptoFan',
    avatar: '/logos/eason.svg',
    content: 'Love how the story is progressing. Cant wait for the next chapter!',
    date: 'jun 29, 2025',
    time: '3:15PM',
  },
  {
    id: '3',
    author: 'MangaLover',
    authorHandle: '@MangaLover',
    avatar: '/logos/eason.svg',
    content: 'The glowing ball scene gave me chills. Such great storytelling!',
    date: 'jun 28, 2025',
    time: '9:45AM',
  },
  {
    id: '4',
    author: 'SuiEnthusiast',
    authorHandle: '@SuiEnthusiast',
    avatar: '/logos/eason.svg',
    content: 'Best manga on the platform. The NFT integration is genius!',
    date: 'jun 27, 2025',
    time: '11:30PM',
  },
];

export default function MangaChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  const mangaId = params.id as string;
  const chapterId = params.chapterId as string;

  // Get sidebar context for layout adjustments
  useSidebarContext();

  // Find the current chapter
  const manga = mockMangaData;
  const currentChapter = manga.chapters.find(ch => ch.id === chapterId);
  const currentChapterIndex = manga.chapters.findIndex(ch => ch.id === chapterId);

  // State for current page within the chapter
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // State for likes
  const [likes, setLikes] = useState(126);
  const [isLiked, setIsLiked] = useState(false);

  // State for comments
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isCommentsClosing, setIsCommentsClosing] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleCloseComments = () => {
    setIsCommentsClosing(true);
    setTimeout(() => {
      setIsCommentsOpen(false);
      setIsCommentsClosing(false);
    }, 400); // Match animation duration
  };

  if (!currentChapter) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#0668A6] via-[#0668A6] to-[#1AAACE] flex items-center justify-center">
        <div className="text-white text-2xl font-bold font-['Outfit']">Chapter not found</div>
      </div>
    );
  }

  // Page navigation handlers
  const totalPages = currentChapter.pages.length;
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === totalPages - 1;

  // Chapter navigation helpers
  const hasPrevChapter = currentChapterIndex < manga.chapters.length - 1;
  const hasNextChapter = currentChapterIndex > 0;

  const goToPrevPage = () => {
    if (!isFirstPage) {
      // Go to previous page in current chapter
      setCurrentPageIndex(currentPageIndex - 1);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } else if (hasPrevChapter) {
      // At first page, go to previous chapter
      const prevChapter = manga.chapters[currentChapterIndex + 1];
      router.push(`/manga/${mangaId}/chapter/${prevChapter.id}`);
    }
  };

  const goToNextPage = () => {
    if (!isLastPage) {
      // Go to next page in current chapter
      setCurrentPageIndex(currentPageIndex + 1);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } else if (hasNextChapter) {
      // At last page, go to next chapter
      const nextChapter = manga.chapters[currentChapterIndex - 1];
      router.push(`/manga/${mangaId}/chapter/${nextChapter.id}`);
    }
  };

  // Determine if navigation buttons should be enabled
  const canGoPrev = !isFirstPage || hasPrevChapter;
  const canGoNext = !isLastPage || hasNextChapter;

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

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
                  {/* Reading Chapter Button */}
                  <div className="flex flex-col items-start px-4 py-[10px] h-10 bg-gradient-to-br from-[#00579B] via-[#0B79B0] to-[#1AAACE] rounded-[20px] border-2 border-white shadow-[3px_3px_0px_#000000]">
                    <span className="text-white text-base font-bold font-['Outfit'] leading-5">
                      Reading Chp. {currentChapter.number}
                    </span>
                  </div>

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

      {/* ==================== MANGA PANEL SECTION ==================== */}
      <div className="px-16 pt-12 pb-8">
        <div className="flex flex-col items-start gap-12">
          {/* Manga Panel Image Container */}
          <div className="w-full overflow-hidden border-[3px] border-black shadow-[5px_5px_0px_1px_#000000] rounded-2xl">
            {/* Single page display - shows current page only */}
            <div className="w-full relative group">
              <img
                src={currentChapter.pages[currentPageIndex]}
                alt={`Page ${currentPageIndex + 1}`}
                className="w-full h-auto object-contain"
              />
              {/* Page number indicator - shows on hover */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-white text-[16px] font-semibold font-['Outfit']">
                  Page {currentPageIndex + 1} / {totalPages}
                </span>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="w-full flex flex-row justify-between items-center">
            {/* Left Side - Likes, Comments, Share */}
            <div className="flex items-center gap-4 px-6 py-3 bg-white rounded-full border-[3px] border-black shadow-[4px_4px_0px_#000000]">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-2 py-1 rounded-full transition-all hover:scale-105 ${
                  isLiked ? 'text-[#EF4330]' : 'text-black hover:text-[#EF4330]'
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill={isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="font-semibold font-['Outfit']">{likes}</span>
              </button>

              {/* Comment Button */}
              <button
                onClick={() => setIsCommentsOpen(true)}
                className="flex items-center gap-2 px-2 py-1 text-black hover:text-[#0668A6] transition-all hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="font-semibold font-['Outfit']">{mockComments.length * 183}</span>
              </button>

              {/* Share Button */}
              <button className="flex items-center gap-2 px-2 py-1 text-black hover:text-[#0668A6] transition-all hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="font-semibold font-['Outfit']">Share</span>
              </button>
            </div>

            {/* Right Side - Page Navigation */}
            <div className="flex items-center gap-4 px-6 py-3 bg-white rounded-full border-[3px] border-black shadow-[4px_4px_0px_#000000]">
              {/* Prev Page/Chapter Button */}
              <button
                onClick={canGoPrev ? goToPrevPage : undefined}
                disabled={!canGoPrev}
                className={`flex items-center gap-2 px-2 py-1 rounded-full transition-all hover:scale-105 ${
                  canGoPrev
                    ? 'text-black hover:text-[#0668A6]'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="font-semibold font-['Outfit']">
                  {isFirstPage && hasPrevChapter ? 'Prev Chapter' : 'Prev Page'}
                </span>
              </button>

              {/* Next Page/Chapter Button */}
              <button
                onClick={canGoNext ? goToNextPage : undefined}
                disabled={!canGoNext}
                className={`flex items-center gap-2 px-2 py-1 rounded-full transition-all hover:scale-105 ${
                  canGoNext
                    ? 'text-black hover:text-[#0668A6]'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="font-semibold font-['Outfit']">
                  {isLastPage && hasNextChapter ? 'Next Chapter' : isLastPage && !hasNextChapter ? 'Chapter End' : 'Next Page'}
                </span>
                {canGoNext && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Popup Modal */}
      {isCommentsOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 z-[60] transition-opacity ${isCommentsClosing ? 'opacity-0' : 'opacity-100'}`}
            style={{ transitionDuration: '400ms' }}
            onClick={handleCloseComments}
          />

          {/* Comments Panel - slides up from bottom */}
          <div className={`fixed bottom-0 left-16 right-16 z-[70] rounded-t-[32px] border-t-[3px] border-x-[3px] border-black bg-[#FFEEE5] shadow-[0_-4px_20px_rgba(0,0,0,0.2)] max-h-[80vh] flex flex-col ${isCommentsClosing ? 'animate-slide-down' : 'animate-slide-up'}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-[2px] border-black/10">
              <h2 className="text-2xl font-bold font-['Outfit'] text-black">Comments</h2>
              <div className="flex items-center gap-4">
                <span className="text-base font-medium font-['Outfit'] text-black/70">
                  {mockComments.length * 183} comments
                </span>
                <button
                  onClick={handleCloseComments}
                  className="w-10 h-10 rounded-full bg-black flex items-center justify-center transition-colors hover:bg-black/80"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add Comment Input */}
            <div className="px-6 py-4 border-b-[2px] border-black/10">
              <div className="flex items-center gap-3 p-3 rounded-2xl border-[2px] bg-white border-black">
                <img
                  src="/logos/eason.svg"
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full border-[2px] border-black"
                />
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="add a comment...."
                  className="flex-1 bg-transparent text-base font-['Outfit'] outline-none text-black placeholder-black/50"
                />
                {commentText && (
                  <button className="px-4 py-2 rounded-full text-sm font-semibold font-['Outfit'] transition-colors bg-black text-white hover:bg-black/80">
                    Post
                  </button>
                )}
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {mockComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl border-[2px] bg-white border-black"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-10 h-10 rounded-full border-[2px] flex-shrink-0 border-black"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-base font-bold font-['Outfit'] text-black">
                          From {comment.authorHandle}
                        </h3>
                      </div>
                      <p className="text-sm font-medium font-['Outfit'] mb-2 text-black/80">
                        {comment.content}
                      </p>
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-xs font-medium font-['Outfit'] text-black/50">
                          {comment.date} {comment.time}
                        </span>
                        <button className="px-3 py-1.5 rounded-full text-xs font-semibold font-['Outfit'] transition-colors bg-black text-white hover:bg-black/80">
                          View X
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
