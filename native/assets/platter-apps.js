// Handle product visibility based on screen width
const handleProductVisibility = () => {
    const products = document.querySelectorAll('.product-card');
    const isMobile = window.innerWidth < 768;

    products.forEach((product, index) => {
        if (isMobile) {
            // On mobile, immediately hide products after first 4
            product.style.cssText = index > 3 ? 'display: none;' : 'display: block;';
        } else {
            // On desktop, show all products with fade animation
            if (product.style.display === 'none') {
                // If product was hidden, fade it in
                product.style.cssText = 'display: block; opacity: 0;';
                requestAnimationFrame(() => {
                    product.style.cssText = 'display: block; opacity: 1; transition: opacity 0.3s ease-in-out;';
                });
            } else {
                // Product already visible, ensure it stays that way
                product.style.cssText = 'display: block; opacity: 1;';
            }
        }
    });
};

// Custom scrollbar implementation
const customScrollBar = () => {
    const elements = {
        list: document.querySelector('.collection-lists'),
        scrollbar: document.querySelector('.custom-scrollbar'),
        thumb: document.querySelector('.scrollbar-thumb'),
        track: document.querySelector('.scrollbar-track')
    };

    // Early return if elements missing
    if (!Object.values(elements).every(Boolean)) return;

    let isDragging = false;

    // Cache commonly used values
    const { list, scrollbar, thumb, track } = elements;
    const baseStyles = 'height: 2px; transition: height 0.2s ease';
    
    // Set initial styles
    track.style.cssText = baseStyles;
    thumb.style.cssText = baseStyles;

    const updateThumbDimensions = (clientWidth, scrollWidth, scrollLeft) => {
        const thumbWidth = (clientWidth / scrollWidth) * 100;
        const maxScroll = scrollWidth - clientWidth;
        const thumbPosition = maxScroll > 0 
            ? (scrollLeft / maxScroll) * (100 - thumbWidth)
            : 0;
            
        thumb.style.width = `${thumbWidth}%`;
        thumb.style.left = `${thumbPosition}%`;
    };

    const updateScrollbar = () => {
        const { scrollWidth, clientWidth, scrollLeft } = list;
        
        // Update visibility based on need for scrolling
        scrollbar.style.display = 
            window.innerWidth >= 768 && scrollWidth > clientWidth ? 'block' : 'none';
        
        updateThumbDimensions(clientWidth, scrollWidth, scrollLeft);
    };

    const handleScroll = (percentage) => {
        const maxScroll = list.scrollWidth - list.clientWidth;
        list.scrollLeft = percentage * maxScroll;
    };

    const getScrollPercentage = (e) => {
        const rect = track.getBoundingClientRect();
        return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    };

    // Event handlers
    const handleTrackClick = (e) => handleScroll(getScrollPercentage(e));
    const handleThumbDrag = (e) => isDragging && handleScroll(getScrollPercentage(e));
    const handleMouseEnter = () => {
        track.style.height = '6px';
        thumb.style.height = '6px';
    };
    const handleMouseLeave = () => {
        track.style.height = '2px';
        thumb.style.height = '2px';
    };

    // Event listeners
    list.addEventListener('scroll', updateScrollbar);
    window.addEventListener('resize', updateScrollbar);
    track.addEventListener('click', handleTrackClick);
    thumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    scrollbar.addEventListener('mouseenter', handleMouseEnter);
    scrollbar.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousemove', handleThumbDrag);
    document.addEventListener('mouseup', () => isDragging = false);

    // Initial update
    updateScrollbar();
};

document.addEventListener('DOMContentLoaded', () => {
    handleProductVisibility();
    customScrollBar();
});

window.addEventListener('resize', () => {
    handleProductVisibility();
});