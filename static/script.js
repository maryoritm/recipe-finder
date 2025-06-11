// DOM Elements
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const recipeResults = document.getElementById('recipe-results');
const dietFilter = document.getElementById('diet-filter');
const timeFilter = document.getElementById('time-filter');
const timeValue = document.getElementById('time-value');
const mealPlannerSection = document.getElementById('meal-planner');
const favoritesSection = document.getElementById('favorites');

// API Configuration
const APP_ID = '335addd8'; 
const APP_KEY = '149c4d9a0591ba45a41d9d7138080054'; 
const API_URL = `https://api.edamam.com/search?app_id=${APP_ID}&app_key=${APP_KEY}`;

// Global Variables
let currentRecipes = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
    Friday: [], Saturday: [], Sunday: []
};

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);
searchBtn.addEventListener('click', searchRecipes);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchRecipes();
});
timeFilter.addEventListener('input', updateTimeFilter);

// Initialize Application
function initApp() {
    updateTimeFilter();
    loadFavorites();
    renderMealPlanner();

    // Show some default recipes on first load
    searchRecipes('chicken');
}

// Search Recipes Function
async function searchRecipes(defaultQuery = null) {
    const query = defaultQuery || searchInput.value.trim();
    if (!query) return;

    const diet = dietFilter.value;
    const time = timeFilter.value;

    try {
        const url = `${API_URL}&q=${query}&time=${time}${diet ? `&diet=${diet}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();

        currentRecipes = data.hits || [];
        displayRecipes(currentRecipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        recipeResults.innerHTML = `<p class="error">Error loading recipes. Please try again.</p>`;
    }
}

// Display Recipes
function displayRecipes(recipes) {
    if (recipes.length === 0) {
        recipeResults.innerHTML = `<p>No recipes found. Try different ingredients.</p>`;
        return;
    }

    recipeResults.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" data-id="${recipe.recipe.uri.split('#')[1]}">
            <img src="${recipe.recipe.image}" alt="${recipe.recipe.label}" class="recipe-img">
            <div class="recipe-info">
                <h3 class="recipe-title">${recipe.recipe.label}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.recipe.totalTime || 'N/A'} mins</span>
                    <span><i class="fas fa-fire"></i> ${Math.round(recipe.recipe.calories)} calories</span>
                </div>
                <div class="recipe-actions">
                    <button class="btn btn-primary add-to-plan">Add to Plan</button>
                    <button class="btn btn-outline favorite-btn">
                        <i class="${isFavorite(recipe.recipe.uri) ? 'fas' : 'far'} fa-heart"></i> Favorite
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners to new buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', toggleFavorite);
    });

    document.querySelectorAll('.add-to-plan').forEach(btn => {
        btn.addEventListener('click', showAddToPlanDialog);
    });
}

// Favorite Functions
function toggleFavorite(e) {
    const recipeCard = e.target.closest('.recipe-card');
    const recipeId = recipeCard.dataset.id;
    const recipe = currentRecipes.find(r => r.recipe.uri.includes(recipeId)).recipe;

    const index = favorites.findIndex(fav => fav.uri === recipe.uri);

    if (index === -1) {
        favorites.push(recipe);
        e.target.innerHTML = `<i class="fas fa-heart"></i> Favorite`;
    } else {
        favorites.splice(index, 1);
        e.target.innerHTML = `<i class="far fa-heart"></i> Favorite`;
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function isFavorite(recipeUri) {
    return favorites.some(fav => fav.uri === recipeUri);
}

function loadFavorites() {
    if (favorites.length > 0) {
        favoritesSection.classList.remove('hidden');
        const favoritesContainer = favoritesSection.querySelector('.favorites-container');
        favoritesContainer.innerHTML = favorites.map(recipe => `
            <div class="recipe-card">
                <img src="${recipe.image}" alt="${recipe.label}" class="recipe-img">
                <div class="recipe-info">
                    <h3>${recipe.label}</h3>
                    <button class="btn btn-primary add-to-plan">Add to Plan</button>
                </div>
            </div>
        `).join('');
    }
}

// Meal Planner Functions
function renderMealPlanner() {
    mealPlannerSection.classList.remove('hidden');
    const weekContainer = mealPlannerSection.querySelector('.week-container');

    weekContainer.innerHTML = Object.entries(mealPlan).map(([day, recipes]) => `
        <div class="day-card" data-day="${day}">
            <h3 class="day-title">${day}</h3>
            ${recipes.map(recipe => `
                <div class="planned-recipe">
                    <p>${recipe.label}</p>
                    <button class="remove-btn"><i class="fas fa-times"></i></button>
                </div>
            `).join('')}
            <div class="drop-zone">Drop recipe here</div>
        </div>
    `).join('');

    setupDragAndDrop();
}

function showAddToPlanDialog(e) {
    // Implementation for adding to meal plan
    console.log('Add to plan clicked');
}

function setupDragAndDrop() {
    // Implementation for drag and drop functionality
    console.log('Setting up drag and drop');
}

// Helper Functions
function updateTimeFilter() {
    timeValue.textContent = `${timeFilter.value} mins`;
}