class GamePortal {
    constructor() {
        this.games = [];
        this.favorites = JSON.parse(localStorage.getItem('gameFavorites')) || [];
        this.recent = JSON.parse(localStorage.getItem('gameRecent')) || [];
        this.currentView = 'grid';
        this.currentSection = 'games';

        this.init();
    }

    async init() {
        await this.loadGamesFromJSON();
        this.bindEvents();
        this.renderGames();
        this.updateFavorites();
        this.updateRecent();
        this.loadTheme();
    }

    async loadGamesFromJSON() {
        try {
            const response = await fetch('./game_links.json');
            const data = await response.json();
            this.games = data.games || [];
            
            // Load any custom games from localStorage and merge
            const customGames = JSON.parse(localStorage.getItem('customGames')) || [];
            if (customGames.length > 0) {
                // Add custom games with higher IDs to avoid conflicts
                customGames.forEach(game => {
                    game.id = game.id || Date.now() + Math.random();
                });
                this.games = [...this.games, ...customGames];
            }
        } catch (error) {
            console.error('Error loading games from JSON:', error);
            // Fallback to default games if JSON fails
            this.loadDefaultGames();
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

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Fullscreen
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeGameModal();
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshGame();
        });

        document.getElementById('fullscreenGameBtn').addEventListener('click', () => {
            this.toggleGameFullscreen();
        });

        document.getElementById('modalFavoriteBtn').addEventListener('click', () => {
            this.toggleGameFavorite();
        });

        // Add game modal
        document.getElementById('addGameBtn').addEventListener('click', () => {
            this.openAddGameModal();
        });

        document.getElementById('closeAddModal').addEventListener('click', () => {
            this.closeAddGameModal();
        });

        document.getElementById('cancelAdd').addEventListener('click', () => {
            this.closeAddGameModal();
        });

        document.getElementById('addGameForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewGame();
        });

        // Close modals on background click
        document.getElementById('gameModal').addEventListener('click', (e) => {
            if (e.target.id === 'gameModal') {
                this.closeGameModal();
            }
        });

        document.getElementById('addGameModal').addEventListener('click', (e) => {
            if (e.target.id === 'addGameModal') {
                this.closeAddGameModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeGameModal();
                this.closeAddGameModal();
            }
        });

        // Game frame load event
        document.getElementById('gameFrame').addEventListener('load', () => {
            this.hideGameLoader();
        });
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

    renderGames() {
        const container = document.getElementById('gamesContainer');
        container.innerHTML = '';

        this.games.forEach(game => {
            const gameCard = this.createGameCard(game);
            container.appendChild(gameCard);
        });
    }

    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        // Create thumbnail HTML
        let thumbnailHTML;
        if (game.thumbnail) {
            thumbnailHTML = `<img src="${game.thumbnail}" alt="${game.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                           <div class="game-icon-fallback" style="display: none;">
                               <i class="${game.icon} game-icon"></i>
                           </div>`;
        } else {
            thumbnailHTML = `<i class="${game.icon} game-icon"></i>`;
        }

        card.innerHTML = `
            <div class="game-thumbnail">
                ${thumbnailHTML}
                <div class="game-overlay">
                    <button class="play-btn" onclick="gamePortal.playGame(${game.id})">
                        <i class="fas fa-play"></i> Play Now
                    </button>
                </div>
                <div class="game-badge">
                    <span class="category-badge">${game.category}</span>
                </div>
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <div class="game-meta">
                    <div class="author-info">
                        <i class="fas fa-user-circle"></i>
                        <span class="author">${game.author || 'Unknown'}</span>
                    </div>
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>${game.rating}</span>
                    </div>
                </div>
                <p class="game-description">${game.description}</p>
                <div class="game-tags">
                    ${(game.tags || []).slice(0, 3).map(tag => 
                        `<span class="tag">#${tag}</span>`
                    ).join('')}
                </div>
                <div class="game-actions">
                    <button class="favorite-btn ${this.favorites.includes(game.id) ? 'active' : ''}" 
                            onclick="gamePortal.toggleFavorite(${game.id}, event)"
                            title="${this.favorites.includes(game.id) ? 'Remove from favorites' : 'Add to favorites'}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="quick-play-btn" onclick="gamePortal.playGame(${game.id})" 
                            title="Quick play">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="info-btn" onclick="gamePortal.showGameInfo(${game.id})"
                            title="More info">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    showGameInfo(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        // Create or update info modal
        let infoModal = document.getElementById('gameInfoModal');
        if (!infoModal) {
            infoModal = document.createElement('div');
            infoModal.id = 'gameInfoModal';
            infoModal.className = 'game-modal';
            infoModal.innerHTML = `
                <div class="modal-content info-modal">
                    <div class="modal-header">
                        <div class="game-info-header">
                            <h3 id="infoGameTitle">${game.title}</h3>
                            <p class="info-author">by <span id="infoAuthor">${game.author || 'Unknown'}</span></p>
                        </div>
                        <button class="close-btn" onclick="gamePortal.closeInfoModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="info-content">
                        <div class="info-thumbnail">
                            ${game.thumbnail ? 
                                `<img src="${game.thumbnail}" alt="${game.title}">` : 
                                `<div class="icon-placeholder"><i class="${game.icon}"></i></div>`
                            }
                        </div>
                        <div class="info-details">
                            <div class="info-meta">
                                <span class="category-badge">${game.category}</span>
                                <div class="rating">
                                    <i class="fas fa-star"></i>
                                    <span>${game.rating}</span>
                                </div>
                            </div>
                            <p class="info-description">${game.description}</p>
                            <div class="info-tags">
                                ${(game.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('')}
                            </div>
                            <div class="info-actions">
                                <button class="btn btn-primary" onclick="gamePortal.playGame(${game.id}); gamePortal.closeInfoModal();">
                                    <i class="fas fa-play"></i> Play Game
                                </button>
                                <button class="btn btn-secondary favorite-toggle" onclick="gamePortal.toggleFavorite(${game.id}); gamePortal.updateInfoFavoriteBtn(${game.id});">
                                    <i class="fas fa-heart"></i> 
                                    <span class="fav-text">${this.favorites.includes(game.id) ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(infoModal);
            
            // Add click outside to close
            infoModal.addEventListener('click', (e) => {
                if (e.target.id === 'gameInfoModal') {
                    this.closeInfoModal();
                }
            });
        } else {
            // Update existing modal content
            infoModal.querySelector('#infoGameTitle').textContent = game.title;
            infoModal.querySelector('#infoAuthor').textContent = game.author || 'Unknown';
            // Update other content as needed
        }

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
        const favBtn = document.querySelector('.favorite-toggle');
        const favText = favBtn?.querySelector('.fav-text');
        if (favBtn && favText) {
            const isFavorite = this.favorites.includes(gameId);
            favText.textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
            favBtn.classList.toggle('active', isFavorite);
        }
    }

    playGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        // Add to recent games
        this.addToRecent(game);

        // Show game modal
        this.openGameModal(game);
    }

    openGameModal(game) {
        const modal = document.getElementById('gameModal');
        const frame = document.getElementById('gameFrame');
        const loader = document.getElementById('gameLoader');

        // Update modal content
        document.getElementById('modalGameTitle').textContent = game.title;
        document.getElementById('modalCategory').textContent = game.category;
        document.getElementById('modalRating').textContent = game.rating;
        
        // Update description with author info
        const description = document.getElementById('modalDescription');
        description.innerHTML = `
            <div class="modal-game-author">
                <i class="fas fa-user-circle"></i>
                <span>Created by: <strong>${game.author || 'Unknown Developer'}</strong></span>
            </div>
            <p>${game.description}</p>
            ${game.tags ? `
                <div class="modal-tags">
                    ${game.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            ` : ''}
        `;

        // Update favorite button
        const favBtn = document.getElementById('modalFavoriteBtn');
        const heartIcon = favBtn.querySelector('i');
        if (this.favorites.includes(game.id)) {
            favBtn.classList.add('active');
            heartIcon.className = 'fas fa-heart';
        } else {
            favBtn.classList.remove('active');
            heartIcon.className = 'far fa-heart';
        }

        // Store current game
        this.currentGame = game;

        // Show modal first
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Performance optimization: preload and optimize iframe
        this.optimizeGameFrame(frame, game.url);
        
        // Show loader
        loader.style.display = 'block';
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
        
        // Optimize iframe for smooth gaming
        frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-pointer-lock allow-top-navigation');
        
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

    closeGameModal() {
        const modal = document.getElementById('gameModal');
        const frame = document.getElementById('gameFrame');
        
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Clear frame after animation
        setTimeout(() => {
            frame.src = '';
        }, 300);
    }

    hideGameLoader() {
        const loader = document.getElementById('gameLoader');
        loader.style.display = 'none';
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
        
        if (frame.requestFullscreen) {
            frame.requestFullscreen();
        } else if (frame.webkitRequestFullscreen) {
            frame.webkitRequestFullscreen();
        } else if (frame.msRequestFullscreen) {
            frame.msRequestFullscreen();
        }
    }

    toggleGameFavorite() {
        if (!this.currentGame) return;
        
        this.toggleFavorite(this.currentGame.id);
        
        // Update modal favorite button
        const favBtn = document.getElementById('modalFavoriteBtn');
        const heartIcon = favBtn.querySelector('i');
        
        if (this.favorites.includes(this.currentGame.id)) {
            favBtn.classList.add('active');
            heartIcon.className = 'fas fa-heart';
        } else {
            favBtn.classList.remove('active');
            heartIcon.className = 'far fa-heart';
        }
    }

    toggleFavorite(gameId, event) {
        if (event) {
            event.stopPropagation();
        }

        const index = this.favorites.indexOf(gameId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(gameId);
        }

        localStorage.setItem('gameFavorites', JSON.stringify(this.favorites));
        this.updateFavorites();
        this.renderGames(); // Re-render to update heart icons
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
        
        if (this.favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart-broken"></i>
                    <p>No favorite games yet. Star some games to see them here!</p>
                </div>
            `;
            return;
        }

        const favoriteGames = this.games.filter(game => this.favorites.includes(game.id));
        container.innerHTML = '';

        favoriteGames.forEach(game => {
            const gameCard = this.createGameCard(game);
            container.appendChild(gameCard);
        });
    }

    updateRecent() {
        const container = document.getElementById('recentContainer');
        
        if (this.recent.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p>No recent games. Start playing to see your history!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        this.recent.forEach(game => {
            const gameCard = this.createGameCard(game);
            container.appendChild(gameCard);
        });
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
            title: formData.get('gameTitle') || document.getElementById('gameTitle').value,
            url: formData.get('gameUrl') || document.getElementById('gameUrl').value,
            category: formData.get('gameCategory') || document.getElementById('gameCategory').value,
            description: formData.get('gameDescription') || document.getElementById('gameDescription').value,
            rating: 0, // New games start with 0 rating
            thumbnail: formData.get('gameImage') || document.getElementById('gameImage').value,
            icon: this.getCategoryIcon(document.getElementById('gameCategory').value)
        };

        // Add to games array
        this.games.unshift(newGame);
        
        // Save to localStorage
        localStorage.setItem('customGames', JSON.stringify(this.games));
        
        // Re-render games
        this.renderGames();
        
        // Close modal
        this.closeAddGameModal();
        
        // Show success message (you could implement a toast notification here)
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

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme icon
        const icon = document.querySelector('#themeToggle i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update theme icon
        const icon = document.querySelector('#themeToggle i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    loadCustomGames() {
        const customGames = JSON.parse(localStorage.getItem('customGames')) || [];
        if (customGames.length > 0) {
            this.games = customGames;
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
