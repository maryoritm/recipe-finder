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
const APP_KEY = '58f37b72af3540ac35a564c3fd959a29';
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
    getRandomRecipe();

    // Show some default recipes on first load
    searchRecipes('chicken');
}

// Search Recipes Function - UPDATED
async function searchRecipes(defaultQuery = null) {
    const query = defaultQuery || searchInput.value.trim();
    if (!query) {
        showError("Please enter some ingredients");
        return;
    }

    showLoading(true);
    recipeResults.innerHTML = ''; // Clear previous results

    try {
        const diet = dietFilter.value;
        const time = timeFilter.value;
        const url = `${API_URL}&q=${encodeURIComponent(query)}&time=${time}${diet ? `&diet=${diet}` : ''}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        currentRecipes = data.hits || [];

        if (currentRecipes.length === 0) {
            showError("No recipes found. Try different ingredients.");
        } else {
            displayRecipes(currentRecipes);
        }
    } catch (error) {
        console.error('Search error:', error);
        showError("Error loading recipes. Please try again.");
    } finally {
        showLoading(false);
    }
}

// Display Recipes - UPDATED
function displayRecipes(recipes) {
    if (recipes.length === 0) {
        recipeResults.innerHTML = `<p class="empty-state">No recipes found. Try different ingredients.</p>`;
        return;
    }

    recipeResults.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" data-id="${recipe.recipe.uri.split('#')[1]}">
            <div class="recipe-card-inner">
                <div class="recipe-front">
                    <img src="${recipe.recipe.image}" alt="${recipe.recipe.label}" class="recipe-img">
                    <h3 class="recipe-title">${recipe.recipe.label}</h3>
                    <div class="recipe-meta">
                        <span><i class="fas fa-clock"></i> ${recipe.recipe.totalTime || 'N/A'} mins</span>
                        <span><i class="fas fa-fire"></i> ${Math.round(recipe.recipe.calories)} calories</span>
                    </div>
                    <button class="flip-btn">See Details</button>
                </div>
                <div class="recipe-back">
                    <h4>Ingredients:</h4>
                    <ul>${recipe.recipe.ingredientLines.map(i => `<li>${i}</li>`).join('')}</ul>
                    <p>Servings: ${recipe.recipe.yield}</p>
                    <p>Diet: ${recipe.recipe.dietLabels.join(', ') || 'None specified'}</p>
                    <button class="flip-btn">Back to Recipe</button>
                </div>
            </div>
            <div class="recipe-actions">
                <button class="btn btn-primary add-to-plan">Add to Plan</button>
                <button class="btn btn-outline favorite-btn">
                    <i class="${isFavorite(recipe.recipe.uri) ? 'fas' : 'far'} fa-heart"></i> Favorite
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', toggleFavorite);
    });

    document.querySelectorAll('.add-to-plan').forEach(btn => {
        btn.addEventListener('click', showAddToPlanDialog);
    });

    document.querySelectorAll('.flip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.recipe-card');
            card.classList.toggle('flipped');
        });
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
    loadFavorites(); // Refresh favorites display
}

function isFavorite(recipeUri) {
    return favorites.some(fav => fav.uri === recipe.uri);
}

function loadFavorites() {
    if (favorites.length > 0) {
        favoritesSection.classList.remove('hidden');
        const favoritesContainer = favoritesSection.querySelector('.favorites-container');
        favoritesContainer.innerHTML = favorites.map(recipe => `
            <div class="recipe-card" data-id="${recipe.uri.split('#')[1]}">
                <img src="${recipe.image}" alt="${recipe.label}" class="recipe-img">
                <div class="recipe-info">
                    <h3>${recipe.label}</h3>
                    <button class="btn btn-primary add-to-plan">Add to Plan</button>
                </div>
            </div>
        `).join('');
    } else {
        favoritesSection.classList.add('hidden');
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
                <div class="planned-recipe" draggable="true" data-id="${recipe.uri.split('#')[1]}">
                    <img src="${recipe.image}" alt="${recipe.label}" class="planned-recipe-img">
                    <p>${recipe.label}</p>
                    <button class="remove-btn"><i class="fas fa-times"></i></button>
                </div>
            `).join('')}
            <div class="drop-zone">Drop recipe here</div>
        </div>
    `).join('');

    setupDragAndDrop();
    setupRemoveButtons();
}

function showAddToPlanDialog(e) {
    const recipeCard = e.target.closest('.recipe-card');
    const recipeId = recipeCard.dataset.id;
    const recipe = currentRecipes.find(r => r.recipe.uri.includes(recipeId)).recipe;

    const dialog = document.createElement('div');
    dialog.className = 'plan-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <h3>Add to Meal Plan</h3>
            <select id="day-select">
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
            </select>
            <div class="dialog-buttons">
                <button id="cancel-plan">Cancel</button>
                <button id="confirm-plan">Add</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    document.getElementById('cancel-plan').addEventListener('click', () => {
        dialog.remove();
    });

    document.getElementById('confirm-plan').addEventListener('click', () => {
        const day = document.getElementById('day-select').value;
        addRecipeToPlan(recipe, day);
        dialog.remove();
    });
}

function addRecipeToPlan(recipe, day) {
    if (!mealPlan[day].some(r => r.uri === recipe.uri)) {
        mealPlan[day].push(recipe);
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        renderMealPlanner();
    }
}

function setupDragAndDrop() {
    const recipeCards = document.querySelectorAll('.recipe-card');
    const dropZones = document.querySelectorAll('.drop-zone');

    recipeCards.forEach(card => {
        card.draggable = true;
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.dataset.id);
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');

            const recipeId = e.dataTransfer.getData('text/plain');
            const recipe = currentRecipes.find(r => r.recipe.uri.includes(recipeId)).recipe;
            const day = zone.closest('.day-card').dataset.day;

            addRecipeToPlan(recipe, day);
        });
    });
}

function setupRemoveButtons() {
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const recipeEl = e.target.closest('.planned-recipe');
            const day = recipeEl.closest('.day-card').dataset.day;
            const recipeId = recipeEl.dataset.id;

            mealPlan[day] = mealPlan[day].filter(recipe => !recipe.uri.includes(recipeId));
            localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
            renderMealPlanner();
        });
    });
}

// Random Recipe Function
function getRandomRecipe() {
    const randomBtn = document.createElement('button');
    randomBtn.id = 'random-btn';
    randomBtn.className = 'btn btn-primary';
    randomBtn.innerHTML = '<i class="fas fa-random"></i> Surprise Me!';
    document.querySelector('.search-box').appendChild(randomBtn);

    randomBtn.addEventListener('click', () => {
        const randomIngredients = ['chicken', 'pasta', 'vegetables', 'beef', 'fish', 'rice'];
        const randomIngredient = randomIngredients[Math.floor(Math.random() * randomIngredients.length)];
        searchInput.value = randomIngredient;
        searchRecipes();
    });
}

// Helper Functions
function updateTimeFilter() {
    timeValue.textContent = `${timeFilter.value} mins`;
}

function showError(message) {
    recipeResults.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            <button class="btn btn-primary" onclick="searchRecipes()">Try Again</button>
        </div>
    `;
}

function showLoading(show) {
    const loading = document.getElementById('loading-spinner');
    if (show) {
        if (!loading) {
            const spinner = document.createElement('div');
            spinner.id = 'loading-spinner';
            spinner.innerHTML = '<div class="spinner"></div>';
            recipeResults.appendChild(spinner);
        }
    } else if (loading) {
        loading.remove();
    }
}

// Recipe Class
class Recipe {
    constructor(data) {
        this.id = data.uri.split('#')[1];
        this.title = data.label;
        this.ingredients = data.ingredientLines;
    }
}