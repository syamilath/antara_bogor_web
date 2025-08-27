import { useRef, useEffect } from 'react';

/**
 * CategoryNavigation Component
 * A draggable category navigation with keyboard support
 * 
 * @param {Object} props - Component props
 * @param {Array} props.categories - Array of category objects
 * @param {string} props.selectedCategory - Currently selected category slug
 * @param {function} props.onSelectCategory - Callback when a category is selected
 * @param {Array} [props.fallbackCategories=[]] - Fallback categories if none provided
 * @returns {JSX.Element} The rendered category navigation
 */
const CategoryNavigation = ({
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  fallbackCategories = []
}) => {
  const navMenuRef = useRef(null);
  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  // Draggable Navigation with Keyboard Support
  useEffect(() => {
    const navMenu = navMenuRef.current;
    if (!navMenu) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
      isDown = true;
      startX = e.pageX - navMenu.offsetLeft;
      scrollLeft = navMenu.scrollLeft;
      navMenu.style.cursor = 'grabbing';
    };

    const handleMouseLeave = () => {
      isDown = false;
      navMenu.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
      isDown = false;
      navMenu.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - navMenu.offsetLeft;
      const walk = (x - startX) * 2;
      navMenu.scrollLeft = scrollLeft - walk;
    };

    const handleTouchStart = (e) => {
      isDown = true;
      startX = e.touches[0].pageX - navMenu.offsetLeft;
      scrollLeft = navMenu.scrollLeft;
    };

    const handleTouchEnd = () => {
      isDown = false;
    };

    const handleTouchMove = (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - navMenu.offsetLeft;
      const walk = (x - startX) * 2;
      navMenu.scrollLeft = scrollLeft - walk;
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') navMenu.scrollLeft += 100;
      if (e.key === 'ArrowLeft') navMenu.scrollLeft -= 100;
    };

    navMenu.addEventListener('mousedown', handleMouseDown);
    navMenu.addEventListener('mouseleave', handleMouseLeave);
    navMenu.addEventListener('mouseup', handleMouseUp);
    navMenu.addEventListener('mousemove', handleMouseMove);
    navMenu.addEventListener('touchstart', handleTouchStart);
    navMenu.addEventListener('touchend', handleTouchEnd);
    navMenu.addEventListener('touchmove', handleTouchMove);
    navMenu.addEventListener('keydown', handleKeyDown);

    return () => {
      navMenu.removeEventListener('mousedown', handleMouseDown);
      navMenu.removeEventListener('mouseleave', handleMouseLeave);
      navMenu.removeEventListener('mouseup', handleMouseUp);
      navMenu.removeEventListener('mousemove', handleMouseMove);
      navMenu.removeEventListener('touchstart', handleTouchStart);
      navMenu.removeEventListener('touchend', handleTouchEnd);
      navMenu.removeEventListener('touchmove', handleTouchMove);
      navMenu.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <nav className="p-2 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4" role="navigation">
      <ul
        ref={navMenuRef}
        className="flex space-x-6 overflow-x-auto pb-2 scrollbar-hide w-full"
        tabIndex={0}
        role="tablist"
        aria-label="Article categories"
      >
        <li role="presentation">
          <button
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => onSelectCategory('all')}
            className={`nav-link relative py-2 px-1 font-bold transition-all duration-300 ease-in-out ${
              selectedCategory === 'all' ? 'active-nav' : ''
            }`}
          >
            All
          </button>
        </li>
        {displayCategories.map((category) => (
          <li key={category.id} role="presentation">
            <button
              role="tab"
              aria-selected={selectedCategory === category.slug}
              onClick={() => onSelectCategory(category.slug)}
              className={`nav-link relative py-2 px-1 font-bold transition-all duration-300 ease-in-out ${
                selectedCategory === category.slug ? 'active-nav' : ''
              }`}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryNavigation;
