// ==================== TYPE DEFINITIONS ====================

export interface Manga {
  id: string;
  title: string;
  chapter: string;
  rating: number;
  price: number;
  imageUrl: string;
  category?: 'trending' | 'new' | 'top';
}

export interface MangaDetail {
  id: string;
  title: string;
  author: string;
  authorHandle: string;
  tags: string[];
  description: string;
  rating: number;
  coverImage: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  createdAt: string;
  isNew?: boolean;
  pages: string[];
}

export interface Comment {
  id: string;
  author: string;
  authorHandle: string;
  avatar: string;
  content: string;
  date: string;
  time: string;
}

export interface RecommendationManga {
  id: string;
  title: string;
  subtitle: string;
  chapter: string;
  rating: number;
  price: number;
  imageUrl: string;
}

// ==================== MOCK DATA ====================

export const mockMangaList: Manga[] = [
  // Trending
  { id: '1', title: 'Adventures of the Yeti into the deep', chapter: 'Chp.12', rating: 4.5, price: 2.5, imageUrl: '/manga/yeti.png', category: 'trending' },
  { id: '2', title: 'Mirai Taipei', chapter: 'Chp.12', rating: 4.5, price: 3.0, imageUrl: '/manga/mirai.png', category: 'trending' },
  { id: '3', title: 'Night of the dragon', chapter: 'Chp.12', rating: 4.5, price: 1.8, imageUrl: '/manga/suiball.png', category: 'trending' },
  { id: '4', title: 'Xociety', chapter: 'Chp.12', rating: 4.5, price: 4.2, imageUrl: '/manga/xociety.png', category: 'trending' },
  { id: '5', title: 'xcom', chapter: 'Chp.12', rating: 4.5, price: 2.0, imageUrl: '/manga/yeti.png', category: 'trending' },
  { id: '6', title: 'Deep Sea Chronicles', chapter: 'Chp.8', rating: 4.3, price: 3.5, imageUrl: '/manga/mirai.png', category: 'trending' },
  { id: '7', title: 'Mountain Peak Saga', chapter: 'Chp.15', rating: 4.7, price: 2.8, imageUrl: '/manga/suiball.png', category: 'trending' },
  { id: '8', title: 'City Lights', chapter: 'Chp.9', rating: 4.4, price: 1.5, imageUrl: '/manga/xociety.png', category: 'trending' },

  // New Releases
  { id: '18', title: 'Frost Kingdom', chapter: 'Chp.1', rating: 4.2, price: 3.3, imageUrl: '/manga/mirai.png', category: 'new' },
  { id: '19', title: 'Electric Dreams', chapter: 'Chp.2', rating: 4.3, price: 1.6, imageUrl: '/manga/suiball.png', category: 'new' },
  { id: '20', title: 'Shadow Realm', chapter: 'Chp.1', rating: 4.6, price: 5.5, imageUrl: '/manga/xociety.png', category: 'new' },
  { id: '21', title: 'Ocean Warriors', chapter: 'Chp.3', rating: 4.1, price: 2.4, imageUrl: '/manga/yeti.png', category: 'new' },
  { id: '22', title: 'Tech Revolution', chapter: 'Chp.1', rating: 4.5, price: 3.6, imageUrl: '/manga/mirai.png', category: 'new' },
  { id: '23', title: 'Ancient Spirits', chapter: 'Chp.2', rating: 4.4, price: 4.8, imageUrl: '/manga/suiball.png', category: 'new' },
  { id: '24', title: 'Galaxy Explorers', chapter: 'Chp.1', rating: 4.3, price: 2.1, imageUrl: '/manga/xociety.png', category: 'new' },

  // Top Rated
  { id: '9', title: 'Legendary Quest', chapter: 'Chp.20', rating: 4.9, price: 5.0, imageUrl: '/manga/yeti.png', category: 'top' },
  { id: '10', title: 'Divine Warriors', chapter: 'Chp.18', rating: 4.8, price: 2.2, imageUrl: '/manga/mirai.png', category: 'top' },
  { id: '11', title: 'Eternal Flame', chapter: 'Chp.25', rating: 4.9, price: 3.8, imageUrl: '/manga/suiball.png', category: 'top' },
  { id: '12', title: 'Crystal Chronicles', chapter: 'Chp.16', rating: 4.7, price: 4.5, imageUrl: '/manga/xociety.png', category: 'top' },
  { id: '13', title: 'Storm Riders', chapter: 'Chp.22', rating: 4.8, price: 2.0, imageUrl: '/manga/yeti.png', category: 'top' },
  { id: '14', title: 'Phoenix Rising', chapter: 'Chp.14', rating: 4.7, price: 3.2, imageUrl: '/manga/mirai.png', category: 'top' },

  // Others
  { id: '15', title: 'Ninja Legends', chapter: 'Chp.10', rating: 4.3, price: 1.9, imageUrl: '/manga/suiball.png' },
  { id: '16', title: 'Samurai Code', chapter: 'Chp.7', rating: 4.2, price: 4.0, imageUrl: '/manga/xociety.png' },
  { id: '17', title: 'Dragon Slayer', chapter: 'Chp.11', rating: 4.5, price: 2.7, imageUrl: '/manga/yeti.png' },
  { id: '25', title: 'Mystic Powers', chapter: 'Chp.13', rating: 4.4, price: 3.9, imageUrl: '/manga/yeti.png' },
];

export const mockMangaDetail: MangaDetail = {
  id: '1',
  title: 'Adventures of the Yeti into the deep',
  author: 'Matteo.sui',
  authorHandle: '@matteo.sui',
  tags: ['NFT', 'Action', 'Adventure', 'Shounen', 'Gaming'],
  description: 'Bacon ipsum dolor amet prosciutto boudin tail landjaeger, tongue tenderloin turducken sirloin fatback biltong t-bone cow short loin ribeye chicken. Drumstick tongue pig tail. Filet mignon bresaola venison salami, tail beef fatback cow picanha pork.',
  rating: 4.5,
  coverImage: '/manga/yeti.png',
  chapters: [
    {
      id: '12',
      number: 12,
      title: 'Chapter 12',
      createdAt: '23 hours ago',
      isNew: true,
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
    { id: '11', number: 11, title: 'Chapter 11', createdAt: '2 days ago', pages: ['https://picsum.photos/seed/manga11-1/800/1200', 'https://picsum.photos/seed/manga11-2/800/1200', 'https://picsum.photos/seed/manga11-3/800/1200'] },
    { id: '10', number: 10, title: 'Chapter 10', createdAt: '5 days ago', pages: ['https://picsum.photos/seed/manga10-1/800/1200', 'https://picsum.photos/seed/manga10-2/800/1200'] },
    { id: '9', number: 9, title: 'Chapter 9', createdAt: '1 week ago', pages: ['https://picsum.photos/seed/manga9-1/800/1200'] },
    { id: '8', number: 8, title: 'Chapter 8', createdAt: '1 week ago', pages: ['https://picsum.photos/seed/manga8-1/800/1200'] },
    { id: '7', number: 7, title: 'Chapter 7', createdAt: '2 weeks ago', pages: ['https://picsum.photos/seed/manga7-1/800/1200'] },
    { id: '6', number: 6, title: 'Chapter 6', createdAt: '2 weeks ago', pages: ['https://picsum.photos/seed/manga6-1/800/1200'] },
    { id: '5', number: 5, title: 'Chapter 5', createdAt: '3 weeks ago', pages: ['https://picsum.photos/seed/manga5-1/800/1200'] },
    { id: '4', number: 4, title: 'Chapter 4', createdAt: '3 weeks ago', pages: ['https://picsum.photos/seed/manga4-1/800/1200'] },
    { id: '3', number: 3, title: 'Chapter 3', createdAt: '1 month ago', pages: ['https://picsum.photos/seed/manga3-1/800/1200'] },
    { id: '2', number: 2, title: 'Chapter 2', createdAt: '1 month ago', pages: ['https://picsum.photos/seed/manga2-1/800/1200'] },
    { id: '1', number: 1, title: 'Chapter 1', createdAt: '2 months ago', pages: ['https://picsum.photos/seed/manga1-1/800/1200'] },
  ],
};

export const mockComments: Comment[] = [
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

export const mockRecommendations: RecommendationManga[] = [
  { id: '1', title: 'Adventures of the Yeti', subtitle: 'into the deep', chapter: 'Chp.12', rating: 4.5, price: 6, imageUrl: '/manga/yeti.png' },
  { id: '2', title: 'Mirai Taipei', subtitle: 'Night of the dragon', chapter: 'Chp.12', rating: 4.5, price: 6, imageUrl: '/manga/mirai.png' },
  { id: '3', title: 'Xociety', subtitle: 'xcom', chapter: 'Chp.12', rating: 4.5, price: 6, imageUrl: '/manga/xociety.png' },
  { id: '4', title: 'Adventures of the Yeti', subtitle: 'into the deep', chapter: 'Chp.12', rating: 4.5, price: 6, imageUrl: '/manga/suiball.png' },
  { id: '5', title: 'Adventures of the Yeti', subtitle: 'into the deep', chapter: 'Chp.12', rating: 4.5, price: 6, imageUrl: '/manga/yeti.png' },
  { id: '6', title: 'Mirai Taipei', subtitle: 'Night of the dragon', chapter: 'Chp.12', rating: 4.5, price: 6, imageUrl: '/manga/mirai.png' },
];

export const extendedRecommendations: RecommendationManga[] = [
  { id: '7', title: 'Night of the dragon', subtitle: 'Chapter 1', chapter: 'Chp.8', rating: 4.2, price: 5, imageUrl: '/manga/xociety.png' },
  { id: '8', title: 'Suiball Adventures', subtitle: 'The Beginning', chapter: 'Chp.15', rating: 4.8, price: 7, imageUrl: '/manga/suiball.png' },
  { id: '9', title: 'Yeti Chronicles', subtitle: 'Winter Storm', chapter: 'Chp.6', rating: 4.3, price: 4, imageUrl: '/manga/yeti.png' },
  { id: '10', title: 'Mirai Future', subtitle: 'New Dawn', chapter: 'Chp.20', rating: 4.6, price: 8, imageUrl: '/manga/mirai.png' },
  { id: '11', title: 'Xociety Rising', subtitle: 'Revolution', chapter: 'Chp.10', rating: 4.4, price: 6, imageUrl: '/manga/xociety.png' },
  { id: '12', title: 'Deep Sea Tales', subtitle: 'Ocean Mystery', chapter: 'Chp.3', rating: 4.1, price: 5, imageUrl: '/manga/suiball.png' },
  { id: '13', title: 'Adventures of the Yeti', subtitle: 'Mountain Peak', chapter: 'Chp.18', rating: 4.7, price: 7, imageUrl: '/manga/yeti.png' },
  { id: '14', title: 'Taipei Nights', subtitle: 'City Lights', chapter: 'Chp.9', rating: 4.5, price: 6, imageUrl: '/manga/mirai.png' },
  { id: '15', title: 'Society X', subtitle: 'Underground', chapter: 'Chp.14', rating: 4.3, price: 5, imageUrl: '/manga/xociety.png' },
  { id: '16', title: 'Ball of Sui', subtitle: 'Tournament Arc', chapter: 'Chp.22', rating: 4.9, price: 9, imageUrl: '/manga/suiball.png' },
  { id: '17', title: 'Frozen Yeti', subtitle: 'Ice Age', chapter: 'Chp.7', rating: 4.2, price: 4, imageUrl: '/manga/yeti.png' },
  { id: '18', title: 'Mirai Dreams', subtitle: 'Virtual Reality', chapter: 'Chp.11', rating: 4.6, price: 7, imageUrl: '/manga/mirai.png' },
];
