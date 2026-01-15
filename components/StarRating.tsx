interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
  showNumber?: boolean;
}

export default function StarRating({ rating, size = 'md', showNumber = true }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={starSize}
            viewBox="0 0 24 24"
            fill={index < fullStars ? '#FFB836' : 'none'}
            stroke="#FFB836"
            strokeWidth={index < fullStars ? 0 : 1}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      {showNumber && (
        <span className={`text-black font-semibold font-['Outfit'] ${textSize}`}>
          {rating}
        </span>
      )}
    </div>
  );
}
