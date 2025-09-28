
// Optimized product visibility state management
const productVisibilityState = {
    isInitialized: false,
    currentlyShown: 4,
    isMobile: false,
    products: null,
    mobileButton: null
};

// Cache DOM elements for better performance
const cacheElements = () => {
    productVisibilityState.products = document.querySelectorAll('.product-card');
    productVisibilityState.mobileButton = document.querySelector('.mobile-button');
};

// Debounced resize handler for better performance
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Handle mobile button visibility
const updateMobileButtonVisibility = () => {
    const { mobileButton, products } = productVisibilityState;
    if (!mobileButton || !products?.length) return;

    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        // Show button if there are hidden products
        const hiddenProducts = Array.from(products).filter(product => 
            product.classList.contains('hidden')
        );
        
        if (hiddenProducts.length > 0) {
            mobileButton.classList.remove('hidden');
            mobileButton.classList.add('block');
        } else {
            mobileButton.classList.add('hidden');
            mobileButton.classList.remove('block');
        }
    } else {
        // Hide button on desktop
        mobileButton.classList.add('hidden');
        mobileButton.classList.remove('block');
    }
};

// Handle product visibility with optimized DOM manipulation
const handleProductVisibility = (forceReset = false) => {
    const { products } = productVisibilityState;
    if (!products?.length) return;
    
    const isMobile = window.innerWidth < 768;
    const shouldReset = forceReset || (productVisibilityState.isMobile !== isMobile);
    
    if (shouldReset) {
        productVisibilityState.isMobile = isMobile;
        productVisibilityState.currentlyShown = 4;
    }

    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    const hiddenProducts = [];
    
    products.forEach((product, index) => {
        if (isMobile) {
            if (shouldReset || !productVisibilityState.isInitialized) {
                if (index >= productVisibilityState.currentlyShown) {
                    product.classList.add('hidden');
                    hiddenProducts.push(product);
                } else {
                    product.classList.remove('hidden');
                }
            }
        } else {
            // Use Tailwind classes instead of inline styles
            product.classList.remove('hidden', 'opacity-0');
            product.classList.add('block', 'opacity-100', 'transition-opacity', 'duration-300', 'ease-in-out');
        }
    });
    
    productVisibilityState.isInitialized = true;
    
    // Update mobile button visibility after product visibility changes
    updateMobileButtonVisibility();
};

// Optimized mobile "show more" button handler
const handleMobileButtonClick = () => {
    const { mobileButton, products } = productVisibilityState;
    if (!mobileButton || !products?.length) return;

    const productsPerLoad = 6;

    const showMoreProducts = () => {
        const nextBatch = products.length - productVisibilityState.currentlyShown;
        const productsToShow = Math.min(productsPerLoad, nextBatch);
        
        if (productsToShow <= 0) {
            mobileButton.classList.add('hidden');
            mobileButton.classList.remove('block');
            return;
        }

        const firstHiddenProduct = products[productVisibilityState.currentlyShown];

        // Show next batch of products using Tailwind classes
        for (let i = productVisibilityState.currentlyShown; i < productVisibilityState.currentlyShown + productsToShow; i++) {
            products[i].classList.remove('hidden');
            products[i].classList.add('block');
        }

        // Update the global state
        productVisibilityState.currentlyShown += productsToShow;

        // Update button visibility after showing more products
        updateMobileButtonVisibility();

        // Smooth scroll to first newly visible product
        if (firstHiddenProduct) {
            const scrollOffset = firstHiddenProduct.getBoundingClientRect().top + window.pageYOffset - 36;
            window.scrollTo({
                top: scrollOffset,
                behavior: 'smooth'
            });
        }
    };

    mobileButton.addEventListener('click', showMoreProducts);
};

// Optimized custom scrollbar with better Tailwind integration
const customScrollBar = () => {
    const elements = {
        list: document.querySelector('.collection-lists'),
        scrollbar: document.querySelector('.custom-scrollbar'),
        thumb: document.querySelector('.scrollbar-thumb'),
        track: document.querySelector('.scrollbar-track')
    };

    if (!Object.values(elements).every(Boolean)) return;

    let isDragging = false;
    let animationFrameId = null;

    const shouldShowScrollbar = () => 
        window.innerWidth >= 768 && elements.list.scrollWidth > elements.list.clientWidth;

    // Throttled scrollbar update for better performance
    const updateScrollbar = () => {
        if (animationFrameId) return;
        
        animationFrameId = requestAnimationFrame(() => {
            const { list, scrollbar, thumb } = elements;
            const scrollLeft = list.scrollLeft;
            const { scrollWidth, clientWidth } = list;
            
            // Update visibility using Tailwind classes
            if (shouldShowScrollbar()) {
                scrollbar.classList.remove('hidden');
                scrollbar.classList.add('block');
            } else {
                scrollbar.classList.add('hidden');
                scrollbar.classList.remove('block');
            }
            
            // Update thumb dimensions
            const thumbWidth = (clientWidth / scrollWidth) * 100;
            const maxScroll = scrollWidth - clientWidth;
            const thumbPosition = maxScroll > 0 
                ? (scrollLeft / maxScroll) * (100 - thumbWidth)
                : 0;
                
            // Use CSS custom properties for better performance
            thumb.style.setProperty('--thumb-width', `${thumbWidth}%`);
            thumb.style.setProperty('--thumb-left', `${thumbPosition}%`);
            thumb.style.width = `var(--thumb-width)`;
            thumb.style.left = `var(--thumb-left)`;
            
            animationFrameId = null;
        });
    };

    const handleTrackClick = (e) => {
        const { track, list } = elements;
        const rect = track.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        const maxScroll = list.scrollWidth - list.clientWidth;
        
        list.scrollTo({
            left: percentage * maxScroll,
            behavior: 'smooth'
        });
    };

    const handleThumbDrag = (e) => {
        if (!isDragging) return;
        
        const { track, list } = elements;
        const rect = track.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const maxScroll = list.scrollWidth - list.clientWidth;
        
        list.scrollLeft = percentage * maxScroll;
    };

    // Initialize with Tailwind classes
    const initializeScrollbar = () => {
        const { track, thumb } = elements;
        
        // Add Tailwind classes for transitions
        track.classList.add('transition-all', 'duration-200', 'ease-in-out');
        thumb.classList.add('transition-all', 'duration-200', 'ease-in-out');
        
        // Set initial height using Tailwind
        track.classList.add('h-0.5');
        thumb.classList.add('h-full');
    };

    // Handle hover effects with Tailwind classes
    const handleHoverEnter = () => {
        const { track, thumb } = elements;
        track.classList.remove('h-0.5');
        track.classList.add('h-1.5');
        thumb.classList.remove('h-full');
        thumb.classList.add('h-full');
    };

    const handleHoverLeave = () => {
        const { track, thumb } = elements;
        track.classList.remove('h-1.5');
        track.classList.add('h-0.5');
        thumb.classList.remove('h-full');
        thumb.classList.add('h-full');
    };

    // Initialize
    initializeScrollbar();

    // Event listeners with proper cleanup
    const eventListeners = {
        scroll: updateScrollbar,
        resize: debounce(updateScrollbar, 100),
        trackClick: handleTrackClick,
        thumbMouseDown: (e) => {
            isDragging = true;
            e.preventDefault();
        },
        mouseMove: handleThumbDrag,
        mouseUp: () => { isDragging = false; },
        hoverEnter: handleHoverEnter,
        hoverLeave: handleHoverLeave
    };

    // Add event listeners
    elements.list.addEventListener('scroll', eventListeners.scroll);
    window.addEventListener('resize', eventListeners.resize);
    elements.track.addEventListener('click', eventListeners.trackClick);
    elements.thumb.addEventListener('mousedown', eventListeners.thumbMouseDown);
    document.addEventListener('mousemove', eventListeners.mouseMove);
    document.addEventListener('mouseup', eventListeners.mouseUp);
    elements.scrollbar.addEventListener('mouseenter', eventListeners.hoverEnter);
    elements.scrollbar.addEventListener('mouseleave', eventListeners.hoverLeave);

    // Initial update
    updateScrollbar();

    // Return cleanup function
    return () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        elements.list.removeEventListener('scroll', eventListeners.scroll);
        window.removeEventListener('resize', eventListeners.resize);
        elements.track.removeEventListener('click', eventListeners.trackClick);
        elements.thumb.removeEventListener('mousedown', eventListeners.thumbMouseDown);
        document.removeEventListener('mousemove', eventListeners.mouseMove);
        document.removeEventListener('mouseup', eventListeners.mouseUp);
        elements.scrollbar.removeEventListener('mouseenter', eventListeners.hoverEnter);
        elements.scrollbar.removeEventListener('mouseleave', eventListeners.hoverLeave);
    };
};

// Optimized initialization with proper cleanup
let cleanupScrollbar = null;

const initializeApp = () => {
    // Cache DOM elements first
    cacheElements();
    
    // Initialize components
    handleProductVisibility(true);
    handleMobileButtonClick();
    cleanupScrollbar = customScrollBar();
};

// Cleanup function for proper memory management
const cleanup = () => {
    if (cleanupScrollbar) {
        cleanupScrollbar();
        cleanupScrollbar = null;
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initializeApp);

// Debounced resize handler for better performance
const debouncedResize = debounce(() => {
    handleProductVisibility(false);
    // Ensure button visibility is updated on resize
    updateMobileButtonVisibility();
}, 150);

window.addEventListener('resize', debouncedResize);

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);
