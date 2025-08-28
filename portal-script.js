class GamePortal {
    constructor() {
        this.games = [];
        this.customGames = JSON.parse(localStorage.getItem('customGames')) || [];
        this.favorites = JSON.parse(localStorage.getItem('gameFavorites')) || [];
        this.recent = JSON.parse(localStorage.getItem('gameRecent')) || [];
        this.currentView = 'grid';
        this.currentSection = 'games';
        this.categories = [];
        this.carouselIndex = 0;
        this.carouselInterval = null;
        this.carouselSlides = [];

        this.init();
    }

    async init() {
        await this.loadGamesFromJSON();
        this.populateCategoryFilter();
        this.bindEvents();
        this.renderAllSections();
        // Add a class to the body to trigger entry animations
        document.body.classList.add('loaded');
    }

    async loadGamesFromJSON() {
        try {
            const response = await fetch('./game_links.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.games = [...(data.games || []), ...this.customGames];
            this.categories = data.categories || ['Action', 'Puzzle', 'Strategy', 'Arcade', 'Adventure', 'Simulation'];
        } catch (error) {
            console.error('Error loading games from JSON:', error);
            // Fallback to default games if JSON fails
            this.loadDefaultGames();
            this.games = [...this.games, ...this.customGames];
            this.categories = ['Action', 'Puzzle', 'Strategy', 'Arcade', 'Adventure', 'Simulation'];
        }
    }

    loadDefaultGames() {
        this.games = [
            {
                id: 1,
                title: "Red Light, Green Light (Local)",
                url: "./index.html",
                category: "Action",
                description: "Survive the deadly Squid Game challenge with 10 players competing for survival!",
                rating: 4.8,
                thumbnail: null,
                icon: "fas fa-running",
                author: "Local Game",
                tags: ["squid-game", "survival", "multiplayer"]
            },
            {
                id: 2,
                title: "Squid Game (Red Light, Green Light)",
                url: "https://aritra6524.github.io/squid-game/",
                category: "Action",
                description: "Official Squid Game Red Light, Green Light challenge. Move during green light, freeze during red light!",
                rating: 4.7,
                thumbnail: "https://images.unsplash.com/photo-1606503153255-59d8b8b3e893?w=300&h=200&fit=crop",
                icon: "fas fa-traffic-light",
                author: "Aritra",
                tags: ["squid-game", "netflix", "survival"]
            },
            {
                id: 3,
                title: "Chor Police Dakat Babu",
                url: "https://aritra6524.github.io/chor-police-dakat-babu/",
                category: "Action",
                description: "Traditional Indian chase game! Play as police or thief in this strategic multiplayer experience.",
                rating: 4.5,
                thumbnail: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&h=200&fit=crop",
                icon: "fas fa-user-ninja",
                author: "Aritra",
                tags: ["chase", "strategy", "indian"]
            },
            {
                id: 4,
                title: "FPS Shooter Game",
                url: "https://tamonash10.github.io/fps-shooter/",
                category: "Action",
                description: "First-person shooter with realistic graphics and smooth controls. Complete missions and take down enemies!",
                rating: 4.6,
                thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop",
                icon: "fas fa-crosshairs",
                author: "Tamonash",
                tags: ["fps", "shooter", "3d"]
            },
            {
                id: 5,
                title: "Dino 3D Game",
                url: "https://ayandas-official.github.io/dino-3d/",
                category: "Arcade",
                description: "Enhanced 3D version of the classic Chrome Dino game! Jump over obstacles in this endless runner.",
                rating: 4.4,
                thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
                icon: "fas fa-dragon",
                author: "Ayan Das",
                tags: ["dino", "3d", "endless-runner"]
            }
        ];
    }

    populateCategoryFilter() {
        const select = document.getElementById('gameCategory');
        if (!select) return;

        // Clear existing options except the first one
        select.innerHTML = '<option value="">Select category...</option>';

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });

        // View controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Fullscreen
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Event Delegation for Game Cards
        document.getElementById('gamesContainer').addEventListener('click', this.handleCardClick.bind(this));
        document.getElementById('favoritesContainer').addEventListener('click', this.handleCardClick.bind(this));
        document.getElementById('recentContainer').addEventListener('click', this.handleCardClick.bind(this));

        // Carousel Events
        const carouselContainer = document.getElementById('carousel-container');
        if (carouselContainer) {
            document.getElementById('carouselPrev').addEventListener('click', () => {
                this.prevSlide();
                this.startAutoSwipe(); // Reset timer on manual navigation
            });
            document.getElementById('carouselNext').addEventListener('click', () => {
                this.nextSlide();
                this.startAutoSwipe(); // Reset timer on manual navigation
            });

            // Use event delegation on the carousel to handle clicks on action buttons within slides
            carouselContainer.addEventListener('click', this.handleCardClick.bind(this));

            carouselContainer.addEventListener('mouseenter', () => this.stopAutoSwipe());
            carouselContainer.addEventListener('mouseleave', () => this.startAutoSwipe());
            document.getElementById('carouselDots').addEventListener('click', (e) => {
                if (e.target.matches('.carousel-dot')) {
                    this.showSlide(parseInt(e.target.dataset.index));
                    this.startAutoSwipe(); // Reset timer on dot click
                }
            });
        }

        // Info Modal controls
        document.getElementById('closeInfoModal').addEventListener('click', () => this.closeInfoModal());
        document.getElementById('infoPlayBtn').addEventListener('click', (e) => {
            this.playGame(parseInt(e.currentTarget.dataset.gameId));
            this.closeInfoModal();
        });
        document.getElementById('infoFavoriteBtn').addEventListener('click', (e) => {
            this.toggleFavorite(parseInt(e.currentTarget.dataset.gameId));
        });

        // Game View controls
        document.getElementById('backToHubBtn').addEventListener('click', () => this.exitGameMode());
        document.getElementById('gameViewRefreshBtn').addEventListener('click', () => {
            this.refreshGame();
        });
        document.getElementById('gameViewFullscreenBtn').addEventListener('click', () => {
            this.toggleGameFullscreen();
        });
        document.getElementById('gameViewFavoriteBtn').addEventListener('click', () => {
            this.toggleGameFavorite();
        });

        // Close modals on background click
        document.getElementById('gameInfoModal').addEventListener('click', (e) => {
            if (e.target.id === 'gameInfoModal') {
                this.closeInfoModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.exitGameMode();
                this.closeAddGameModal();
                this.closeInfoModal();
            }
        });

        // Game frame load event
        document.getElementById('gameFrame').addEventListener('load', () => {
            this.hideGameLoader();
        });
    }

    handleCardClick(e) {
        const target = e.target;
        const card = target.closest('.game-card');
        if (!card) return;

        const gameId = parseInt(card.dataset.gameId);
        const actionButton = target.closest('button[data-action]');

        if (actionButton) {
            e.stopPropagation(); // Prevent triggering multiple actions
            const action = actionButton.dataset.action;
            if (action === 'play' || action === 'quick-play') {
                this.playGame(gameId);
            } else if (action === 'favorite') {
                this.toggleFavorite(gameId);
            } else if (action === 'info') {
                this.showGameInfo(gameId);
            }
        } else {
            this.showGameInfo(gameId);
        }
    }

    switchSection(section) {
        this.currentSection = section;
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Show/hide sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');
    }

    switchView(view) {
        this.currentView = view;
        
        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Update games container
        const container = document.getElementById('gamesContainer');
        if (view === 'list') {
            container.classList.add('list-view');
        } else {
            container.classList.remove('list-view');
        }
    }

    renderAllSections() {
        this.renderGames();
        this.updateFavorites();
        this.updateRecent();
    }

    renderGames() {
        const carouselSlidesContainer = document.getElementById('carouselSlides');
        const gamesContainer = document.getElementById('gamesContainer');

        if (!carouselSlidesContainer || !gamesContainer) return;

        if (this.games.length > 0) {
            carouselSlidesContainer.innerHTML = '';
            const carouselFragment = document.createDocumentFragment();
            this.games.forEach(game => {
                carouselFragment.appendChild(this.createCarouselSlide(game));
            });
            carouselSlidesContainer.appendChild(carouselFragment);
            this.initCarousel();
            this.renderGameList(gamesContainer, this.games);
        } else {
            document.getElementById('carousel-container').style.display = 'none';
            this.renderGameList(gamesContainer, []); // Render empty state for the main grid
        }
    }

    renderGameList(container, games) {
        container.innerHTML = ''; // Clear previous content

        if (!games || games.length === 0) {
            const sectionId = container.parentElement.id;
            let message = "No games found in this section.";
            let icon = "fas fa-ghost";
            if (sectionId === 'favorites-section') {
                message = "No favorite games yet. Star some games to see them here!";
                icon = "fas fa-heart-broken";
            } else if (sectionId === 'recent-section') {
                message = "No recent games. Start playing to see your history!";
                icon = "fas fa-clock";
            }
            container.innerHTML = `<div class="empty-state"><i class="${icon}"></i><p>${message}</p></div>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        games.forEach(game => {
            const gameCard = this.createGameCard(game);
            fragment.appendChild(gameCard);
        });
        container.appendChild(fragment);
    }

    createCarouselSlide(game) {
        const slide = document.createElement('div');
        // Add 'game-card' class for the generic click handler to work
        slide.className = 'carousel-slide game-card';
        slide.dataset.gameId = game.id;

        const backgroundStyle = game.thumbnail ? `style="background-image: url('${game.thumbnail}')"` : '';

        slide.innerHTML = `
            <div class="featured-background" ${backgroundStyle}></div>
            <div class="featured-overlay">
                <div class="featured-content">
                    <h2 class="featured-title">${game.title}</h2>
                    <p class="featured-description">${game.description}</p>
                    <div class="featured-tags">
                        ${(game.tags || []).slice(0, 4).map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                    <div class="featured-actions">
                        <button class="btn btn-primary" data-action="play"><i class="fas fa-play"></i> Play Now</button>
                        <button class="btn btn-secondary" data-action="info"><i class="fas fa-info-circle"></i> View Details</button>
                    </div>
                </div>
            </div>
        `;
        return slide;
    }

    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.dataset.gameId = game.id;
        
        let thumbnailHTML;
        if (game.thumbnail) {
            thumbnailHTML = `<img src="${game.thumbnail}" alt="${game.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                           <div class="game-icon-fallback" style="display: none;">
                               <i class="${game.icon || 'fas fa-gamepad'} game-icon"></i>
                           </div>`;
        } else {
            thumbnailHTML = `<i class="${game.icon || 'fas fa-gamepad'} game-icon"></i>`;
        }

        card.innerHTML = `
            <div class="game-thumbnail">
                ${thumbnailHTML}
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <div class="game-meta">
                    <span class="category-badge">${game.category}</span>
                </div>
            </div>
        `;
        return card;
    }

    initCarousel() {
        this.carouselSlides = document.querySelectorAll('#carouselSlides .carousel-slide');
        const dotsContainer = document.getElementById('carouselDots');
        dotsContainer.innerHTML = '';

        if (this.carouselSlides.length <= 1) {
            document.getElementById('carousel-container').classList.add('single-slide');
            return;
        };

        this.carouselSlides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.dataset.index = index;
            dotsContainer.appendChild(dot);
        });

        this.showSlide(0);
        this.startAutoSwipe();
    }

    showSlide(index) {
        if (!this.carouselSlides.length) return;
        this.carouselIndex = (index + this.carouselSlides.length) % this.carouselSlides.length;

        const slidesContainer = document.getElementById('carouselSlides');
        slidesContainer.style.transform = `translateX(-${this.carouselIndex * 100}%)`;

        document.querySelectorAll('#carouselDots .carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === this.carouselIndex);
        });
    }

    nextSlide() { this.showSlide(this.carouselIndex + 1); }
    prevSlide() { this.showSlide(this.carouselIndex - 1); }

    startAutoSwipe() {
        this.stopAutoSwipe(); // Prevent multiple intervals
        this.carouselInterval = setInterval(() => this.nextSlide(), 5000);
    }
    stopAutoSwipe() { clearInterval(this.carouselInterval); }

    showGameInfo(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        const infoModal = document.getElementById('gameInfoModal');

        // Populate modal content
        infoModal.querySelector('#infoGameTitle').textContent = game.title;
        infoModal.querySelector('#infoAuthor').textContent = game.author || 'Unknown';
        infoModal.querySelector('#infoCategory').textContent = game.category;
        infoModal.querySelector('#infoDescription').textContent = game.description;

        const thumbnailImg = infoModal.querySelector('#infoThumbnailImage');
        const thumbnailIconContainer = infoModal.querySelector('#infoThumbnailIcon');
        if (game.thumbnail) {
            thumbnailImg.src = game.thumbnail;
            thumbnailImg.alt = game.title;
            thumbnailImg.style.display = 'block';
            thumbnailIconContainer.style.display = 'none';
        } else {
            thumbnailImg.style.display = 'none';
            thumbnailIconContainer.style.display = 'flex';
            thumbnailIconContainer.querySelector('i').className = game.icon || 'fas fa-gamepad';
        }

        const tagsContainer = infoModal.querySelector('#infoTags');
        tagsContainer.innerHTML = (game.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('');

        // Set up action buttons
        document.getElementById('infoPlayBtn').dataset.gameId = game.id;
        document.getElementById('infoFavoriteBtn').dataset.gameId = game.id;
        this.updateInfoFavoriteBtn(game.id);

        infoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeInfoModal() {
        const infoModal = document.getElementById('gameInfoModal');
        if (infoModal) {
            infoModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    updateInfoFavoriteBtn(gameId) {
        const favBtn = document.getElementById('infoFavoriteBtn');
        // Ensure we are updating the button for the currently displayed game
        if (!favBtn || parseInt(favBtn.dataset.gameId) !== gameId) return;

        const favText = favBtn.querySelector('.fav-text');
        const isFavorite = this.favorites.includes(gameId);

        favText.textContent = isFavorite ? 'In Favorites' : 'Add to Favorites';
        favBtn.classList.toggle('active', isFavorite);
        favBtn.title = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
    }

    playGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        // Add to recent games
        this.addToRecent(game);
        this.enterGameMode(game);
    }

    enterGameMode(game) {
        this.currentGame = game;
        const frame = document.getElementById('gameFrame');
        const gameView = document.getElementById('gameView');
        const loader = document.getElementById('gameLoader');

        // Update game view header
        document.getElementById('gameViewTitle').textContent = game.title;
        document.getElementById('gameViewAuthor').textContent = `by ${game.author || 'Unknown'}`;

        // Update favorite button in game view
        this.updateGameViewFavoriteButton();

        // Add class to body to switch views
        document.body.classList.add('game-mode-active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling of underlying content

        // Performance optimization: preload and optimize iframe
        this.optimizeGameFrame(frame, game.url);
        
        // Show loader
        loader.style.display = 'block';

        // Automatically trigger fullscreen for the game frame as requested.
        this.toggleGameFullscreen();
    }

    exitGameMode() {
        // If we are in fullscreen, exiting it will be the primary action.
        // The 'fullscreenchange' event will not trigger a second exit.
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }

        if (!document.body.classList.contains('game-mode-active')) return;

        document.body.classList.remove('game-mode-active');
        document.body.style.overflow = 'auto';

        const frame = document.getElementById('gameFrame');
        // Clear frame to stop game execution and free up resources
        frame.src = 'about:blank';
        this.currentGame = null;
    }

    optimizeGameFrame(frame, gameUrl) {
        // Clear any existing content first
        frame.src = '';
        
        // Set up performance optimizations
        frame.style.display = 'none';
        
        // Add performance attributes
        frame.setAttribute('importance', 'high');
        frame.setAttribute('loading', 'eager');
        
        // Enhanced performance optimizations for gaming
        frame.style.imageRendering = 'pixelated'; // For pixel art games
        frame.style.willChange = 'transform'; // Optimize for animations
        frame.style.transform = 'translateZ(0)'; // Force GPU layer
        frame.style.backfaceVisibility = 'hidden'; // Reduce repaints
        
        // Optimize iframe for smooth gaming (removed allow-top-navigation for security)
        frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-pointer-lock');
        
        // Add error handling
        const handleError = () => {
            const loader = document.getElementById('gameLoader');
            loader.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Game failed to load. This might be due to:</p>
                    <ul>
                        <li>Network connection issues</li>
                        <li>Game server temporarily down</li>
                        <li>Browser blocking the frame</li>
                    </ul>
                    <button class="btn btn-primary" onclick="gamePortal.retryGame()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                    <button class="btn btn-secondary" onclick="window.open('${gameUrl}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Open in New Tab
                    </button>
                </div>
            `;
        };
        
        const handleLoad = () => {
            // Hide loader and show frame
            document.getElementById('gameLoader').style.display = 'none';
            frame.style.display = 'block';
            
            // Additional performance optimizations after load
            try {
                const iframeWindow = frame.contentWindow;
                if (iframeWindow && iframeWindow.document) {
                    // Reduce visual lag by optimizing the iframe document
                    const style = iframeWindow.document.createElement('style');
                    style.textContent = `
                        * {
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                        }
                        body {
                            image-rendering: -moz-crisp-edges;
                            image-rendering: -webkit-optimize-contrast;
                            image-rendering: crisp-edges;
                            image-rendering: pixelated;
                        }
                    `;
                    iframeWindow.document.head.appendChild(style);
                }
            } catch (e) {
                // Cross-origin restrictions, ignore
                console.log('Cannot optimize cross-origin iframe content');
            }
            
            // Focus the frame for better game input
            setTimeout(() => {
                frame.focus();
            }, 100);
        };
        
        // Set up event listeners
        frame.removeEventListener('load', this.handleFrameLoad);
        frame.removeEventListener('error', this.handleFrameError);
        
        this.handleFrameLoad = handleLoad;
        this.handleFrameError = handleError;
        
        frame.addEventListener('load', this.handleFrameLoad);
        frame.addEventListener('error', this.handleFrameError);
        
        // Load with slight delay to prevent blocking
        setTimeout(() => {
            frame.src = gameUrl;
        }, 100);
    }

    retryGame() {
        if (this.currentGame) {
            this.optimizeGameFrame(document.getElementById('gameFrame'), this.currentGame.url);
        }
    }

    refreshGame() {
        if (!this.currentGame) return;
        
        const frame = document.getElementById('gameFrame');
        const loader = document.getElementById('gameLoader');
        
        // Show loader
        loader.style.display = 'block';
        loader.innerHTML = `
            <div class="spinner"></div>
            <p>Refreshing game...</p>
        `;
        
        // Use optimized loading
        this.optimizeGameFrame(frame, this.currentGame.url);
    }

    toggleGameFullscreen() {
        const frame = document.getElementById('gameFrame');
        if (!document.fullscreenElement) {
            frame.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    toggleGameFavorite() {
        if (!this.currentGame) return;
        this.toggleFavorite(this.currentGame.id);
    }

    updateGameViewFavoriteButton() {
        if (!this.currentGame) return;
        const favBtn = document.getElementById('gameViewFavoriteBtn');
        const heartIcon = favBtn.querySelector('i');
        const isFavorite = this.favorites.includes(this.currentGame.id);

        favBtn.classList.toggle('active', isFavorite);
        heartIcon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
        favBtn.title = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
    }

    toggleFavorite(gameId) {
        const index = this.favorites.indexOf(gameId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(gameId);
        }

        localStorage.setItem('gameFavorites', JSON.stringify(this.favorites));
        this.renderAllSections(); // Re-render all sections to reflect the change
        this.updateInfoFavoriteBtn(gameId); // Also update the info modal if it's open
        if (this.currentGame && this.currentGame.id === gameId) {
            this.updateGameViewFavoriteButton(); // Update game view if active
        }
    }

    addToRecent(game) {
        // Remove if already exists
        this.recent = this.recent.filter(g => g.id !== game.id);
        
        // Add to beginning
        this.recent.unshift(game);
        
        // Keep only last 10
        this.recent = this.recent.slice(0, 10);
        
        localStorage.setItem('gameRecent', JSON.stringify(this.recent));
        this.updateRecent();
    }

    updateFavorites() {
        const container = document.getElementById('favoritesContainer');
        const favoriteGames = this.games.filter(game => this.favorites.includes(game.id));
        this.renderGameList(container, favoriteGames);
    }

    updateRecent() {
        const container = document.getElementById('recentContainer');
        // The 'recent' array already contains the full game objects
        this.renderGameList(container, this.recent);
    }

    openAddGameModal() {
        const modal = document.getElementById('addGameModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeAddGameModal() {
        const modal = document.getElementById('addGameModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Clear form
        document.getElementById('addGameForm').reset();
    }

    addNewGame() {
        const form = document.getElementById('addGameForm');
        const formData = new FormData(form);
        
        const newGame = {
            id: Date.now(), // Simple ID generation
            title: formData.get('gameTitle'),
            url: formData.get('gameUrl'),
            category: formData.get('gameCategory'),
            description: formData.get('gameDescription'),
            rating: "N/A", // New games start with no rating
            thumbnail: formData.get('gameImage') || null,
            author: 'Community',
            tags: ['custom'],
            icon: this.getCategoryIcon(formData.get('gameCategory'))
        };

        // Add to live games array
        this.games.unshift(newGame);
        
        // Add to custom games list and save to localStorage
        this.customGames.unshift(newGame);
        localStorage.setItem('customGames', JSON.stringify(this.customGames));
        
        // Re-render games
        this.renderGames();
        
        // Close modal
        this.closeAddGameModal();
        
        alert('Game added successfully!');
    }

    getCategoryIcon(category) {
        const icons = {
            'Action': 'fas fa-fist-raised',
            'Puzzle': 'fas fa-puzzle-piece',
            'Strategy': 'fas fa-chess',
            'Arcade': 'fas fa-gamepad',
            'Adventure': 'fas fa-map',
            'Simulation': 'fas fa-cogs'
        };
        return icons[category] || 'fas fa-gamepad';
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
}

// Initialize the portal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gamePortal = new GamePortal();
});

// Handle iframe communication for better game integration
window.addEventListener('message', (event) => {
    // Handle messages from games if needed
    if (event.data.type === 'gameScore') {
        // Update game score, achievements, etc.
        console.log('Game score update:', event.data.score);
    }
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration failed
        console.log('Service Worker registration failed');
    });
}
