document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const ingredientInput = document.getElementById('ingredient-input');
    const resultsContainer = document.getElementById('results-container');
    const dietFilter = document.getElementById('diet-filter');

    searchBtn.addEventListener('click', searchRecipes);
    ingredientInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchRecipes();
    });

    async function searchRecipes() {
        const ingredients = ingredientInput.value.trim();
        const diet = dietFilter.value;

        if (!ingredients) return;

        try {
            const response = await fetch(`/search?q=${ingredients}&diet=${diet}`);
            const recipes = await response.json();

            displayRecipes(recipes);
        } catch (error) {
            console.error('Error:', error);
            resultsContainer.innerHTML = '<p>Error loading recipes. Please try again.</p>';
        }
    }

    function displayRecipes(recipes) {
        resultsContainer.innerHTML = '';

        if (recipes.length === 0) {
            resultsContainer.innerHTML = '<p>No recipes found. Try different ingredients.</p>';
            return;
        }

        recipes.forEach(recipe => {
            const recipeData = recipe.recipe;
            const card = document.createElement('div');
            card.className = 'recipe-card';

            card.innerHTML = `
                <img src="${recipeData.image}" alt="${recipeData.label}">
                <div class="recipe-info">
                    <h3>${recipeData.label}</h3>
                    <p>Cook time: ${recipeData.totalTime || 'N/A'} mins</p>
                    <p>Calories: ${Math.round(recipeData.calories)}</p>
                    <button class="save-btn">Save Recipe</button>
                </div>
            `;

            resultsContainer.appendChild(card);
        });
    }
});