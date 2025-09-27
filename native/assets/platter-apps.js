
// Track the current state of product visibility
let productVisibilityState = {
    isInitialized: false,
    currentlyShown: 4,
    isMobile: false
};

// Handle product visibility based on screen width
const handleProductVisibility = (forceReset = false) => {
    const products = document.querySelectorAll('.product-card');
    const isMobile = window.innerWidth < 768;
    
    // Only reset if we're switching between mobile/desktop or if forced
    const shouldReset = forceReset || (productVisibilityState.isMobile !== isMobile);
    
    if (shouldReset) {
        productVisibilityState.isMobile = isMobile;
        productVisibilityState.currentlyShown = 4;
    }

    products.forEach((product, index) => {
        if (isMobile) {
            // On mobile, only hide products if we're resetting or it's the initial load
            if (shouldReset || !productVisibilityState.isInitialized) {
                product.style.display = index >= productVisibilityState.currentlyShown ? 'none' : 'block';
            }
        } else {
            // On desktop, show all products
            product.style.cssText = 'display: block; opacity: 0;';
            requestAnimationFrame(() => {
                product.style.cssText = 'display: block; opacity: 1; transition: opacity 0.3s ease-in-out;';
            });
        }
    });
    
    productVisibilityState.isInitialized = true;
};

// Handle mobile "show more" button click
const handleMobileButtonClick = () => {
    const mobileButton = document.querySelector('.mobile-button');
    if (!mobileButton) return;

    const productsPerLoad = 6;

    const showMoreProducts = () => {
        const products = document.querySelectorAll('.product-card');
        const nextBatch = products.length - productVisibilityState.currentlyShown;
        const productsToShow = Math.min(productsPerLoad, nextBatch);
        
        if (productsToShow <= 0) {
            mobileButton.style.display = 'none';
            return;
        }

        const firstHiddenProduct = products[productVisibilityState.currentlyShown];

        // Show next batch of products
        for (let i = productVisibilityState.currentlyShown; i < productVisibilityState.currentlyShown + productsToShow; i++) {
            products[i].style.display = 'block';
        }

        // Update the global state
        productVisibilityState.currentlyShown += productsToShow;

        // Scroll to first newly visible product
        if (firstHiddenProduct) {
            window.scrollTo({
                top: firstHiddenProduct.getBoundingClientRect().top + window.pageYOffset - 36,
                behavior: 'smooth'
            });
        }
    };

    mobileButton.addEventListener('click', showMoreProducts);
};

// Custom scrollbar implementation
const customScrollBar = () => {
    const elements = {
        list: document.querySelector('.collection-lists'),
        scrollbar: document.querySelector('.custom-scrollbar'),
        thumb: document.querySelector('.scrollbar-thumb'),
        track: document.querySelector('.scrollbar-track')
    };

    if (!Object.values(elements).every(Boolean)) return;

    let isDragging = false;

    const shouldShowScrollbar = () => 
        window.innerWidth >= 768 && elements.list.scrollWidth > elements.list.clientWidth;

    const updateScrollbar = () => {
        const { list, scrollbar, thumb } = elements;
        const scrollLeft = list.scrollLeft;
        const { scrollWidth, clientWidth } = list;
        
        // Update visibility
        scrollbar.style.display = shouldShowScrollbar() ? 'block' : 'none';
        
        // Update thumb dimensions
        const thumbWidth = (clientWidth / scrollWidth) * 100;
        const maxScroll = scrollWidth - clientWidth;
        const thumbPosition = maxScroll > 0 
            ? (scrollLeft / maxScroll) * (100 - thumbWidth)
            : 0;
            
        thumb.style.width = `${thumbWidth}%`;
        thumb.style.left = `${thumbPosition}%`;
    };

    const handleTrackClick = (e) => {
        const { track, list } = elements;
        const rect = track.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        const maxScroll = list.scrollWidth - list.clientWidth;
        
        list.scrollLeft = percentage * maxScroll;
    };

    const handleThumbDrag = (e) => {
        if (!isDragging) return;
        
        const { track, list } = elements;
        const rect = track.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const maxScroll = list.scrollWidth - list.clientWidth;
        
        list.scrollLeft = percentage * maxScroll;
    };

    // Set default styles with transitions
    const setScrollbarStyles = () => {
        const { track, thumb } = elements;
        const styles = {
            transition: 'height 0.2s ease-in-out',
            height: '2px'
        };
        
        Object.assign(track.style, styles);
        Object.assign(thumb.style, styles);
    };

    // Handle hover effects with smooth transitions
    const setHoverHeight = (height) => {
        const { track, thumb } = elements;
        track.style.height = height;
        thumb.style.height = height;
    };

    // Initialize styles
    setScrollbarStyles();

    // Handle hover effects
    elements.scrollbar.addEventListener('mouseenter', () => {
        setHoverHeight('6px');
    });

    elements.scrollbar.addEventListener('mouseleave', () => {
        setHoverHeight('2px');
    });

    // Event listeners
    elements.list.addEventListener('scroll', updateScrollbar);
    window.addEventListener('resize', updateScrollbar);
    elements.track.addEventListener('click', handleTrackClick);
    elements.thumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    document.addEventListener('mousemove', handleThumbDrag);
    document.addEventListener('mouseup', () => isDragging = false);

    // Initial update
    updateScrollbar();
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    handleProductVisibility(true); // Force initial setup
    handleMobileButtonClick();
    customScrollBar();
});

// Update product visibility on resize (but preserve state)
window.addEventListener('resize', () => {
    handleProductVisibility(false); // Don't force reset on resize
});
