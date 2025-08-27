import Image from 'next/image';
import Link from 'next/link';
import { getFormattedDate } from '@/utils/dateUtils';

/**
 * ArticleCard Component
 * Displays an article preview with image, title, category, and date
 * 
 * @param {Object} props - Component props
 * @param {Object} props.article - The article object to display
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.priority] - Whether to prioritize image loading
 * @returns {JSX.Element} The rendered article card
 */
const ArticleCard = ({ 
  article, 
  className = '',
  priority = false
}) => {
  if (!article) return null;

  return (
    <div className={`relative rounded-xl overflow-hidden group ${className}`}>
      <Link 
        href={`/article/${article.slug}`} 
        aria-label={`Read ${article.title}`}
        className="block h-full focus:outline-none"
      >
        {/* Image Container with Smoother Hover Effect */}
        <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
          {/* Background Image with Enhanced Transitions */}
          <div className="absolute inset-0 transform transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] will-change-transform">
            <div className="relative w-full h-full transform transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 will-change-transform">
              <Image
                src={article.image_url || '/images/placeholder-article.jpg'}
                alt={article.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 will-change-transform"
                loading={priority ? 'eager' : 'lazy'}
                priority={priority}
                quality={80}
              />
            </div>
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-100 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-end p-5 transform transition-all duration-500 group-hover:translate-y-0 translate-y-2">
            {/* Category Badge with Hover Effect */}
            {article.category?.name && (
              <span className="inline-block bg-[#013f6e] text-white text-xs px-3 py-1 rounded-full self-start mb-3 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300 opacity-0 group-hover:opacity-100">
                {article.category.name}
              </span>
            )}
            
            {/* Title with Hover Effect */}
            <h3 className="text-white text-xl font-bold leading-snug mb 2 group-hover:mb-3 transition-all duration-300 line-clamp-2">
              {article.title}
            </h3>
            
            {/* Date with Hover Effect */}
            <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <div className="h-px w-8 bg-white/50 mb-3 group-hover:w-12 transition-all duration-500" />
              <time 
                dateTime={article.created_at} 
                className="text-gray-200 text-sm font-medium"
              >
                {getFormattedDate(article.created_at, { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </time>
              
              {/* Read More CTA */}
              <div className="mt-3 text-sm text-white/80 font-medium flex items-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Read more
                <svg className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ArticleCard;
