class RecipeCard {
    constructor(recipe) {
        this.recipe = recipe;
        this.id = recipe.uri?.split('#')[1] || recipe.id;
        this.isFavorite = false;
        this.element = this.createCard();
        this.setupEventListeners();
    }

    createCard() {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.id = this.id;

        card.innerHTML = `
            <div class="recipe-card-inner">
                <div class="recipe-front">
                    <img src="${this.recipe.image}" alt="${this.recipe.label}" class="recipe-img">
                    <h3 class="recipe-title">${this.recipe.label}</h3>
                    <div class="recipe-meta">
                        <span><i class="fas fa-clock"></i> ${this.recipe.totalTime || 'N/A'} mins</span>
                        <span><i class="fas fa-fire"></i> ${Math.round(this.recipe.calories)} calories</span>
                    </div>
                    <button class="flip-btn">See Details</button>
                </div>
                <div class="recipe-back">
                    <h4>Ingredients:</h4>
                    <ul>${this.recipe.ingredientLines.map(i => `<li>${i}</li>`).join('')}</ul>
                    <button class="flip-btn">Back to Recipe</button>
                </div>
            </div>
            <div class="recipe-actions">
                <button class="btn btn-primary add-to-plan">Add to Plan</button>
                <button class="btn btn-outline favorite-btn">
                    <i class="far fa-heart"></i> Favorite
                </button>
            </div>
        `;

        return card;
    }

    setupEventListeners() {
        this.element.querySelector('.flip-btn').addEventListener('click', () => {
            this.element.classList.toggle('flipped');
        });

        this.element.querySelector('.favorite-btn').addEventListener('click', () => {
            this.toggleFavorite();
        });
    }

    toggleFavorite() {
        this.isFavorite = !this.isFavorite;
        const icon = this.element.querySelector('.favorite-btn i');
        icon.className = this.isFavorite ? 'fas fa-heart' : 'far fa-heart';

        this.element.dispatchEvent(new CustomEvent('favoriteToggled', {
            detail: { recipe: this.recipe, isFavorite: this.isFavorite }
        }));
    }
}