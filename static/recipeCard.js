class RecipeCard {
    constructor(recipe) {
        this.recipe = recipe;
        this.id = recipe.uri?.split('#')[1] || recipe.id;
        this.element = this.createCard();
    }

    createCard() {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.id = this.id;

        card.innerHTML = `
            <div class="recipe-card-inner">
                <div class="recipe-front">
                    <!-- Front content -->
                </div>
                <div class="recipe-back">
                    <!-- Back content -->
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
}