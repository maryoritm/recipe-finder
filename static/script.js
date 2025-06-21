// Añade esta receta al array de FALLBACK_RECIPES (al principio del array)
const FALLBACK_RECIPES = [
    {
        recipe: {
            uri: "fallback#chicken",
            label: "Creamy Garlic Chicken",
            image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600",
            ingredientLines: [
                "2 chicken breasts",
                "2 tbsp olive oil",
                "4 garlic cloves, minced",
                "1 cup heavy cream",
                "1/2 cup chicken broth",
                "1 tsp paprika",
                "1/2 tsp salt",
                "1/4 tsp black pepper",
                "1/4 cup grated parmesan",
                "1 tsp dried thyme"
            ],
            totalTime: 30,
            calories: 480,
            yield: 2,
            dietLabels: ["High-Protein"],
            healthLabels: ["Sugar-Conscious"],
            cuisineType: ["Mediterranean"],
            mealType: ["lunch/dinner"]
        }
    },
    // ... (el resto de tus recetas de respaldo existentes si las tienes)
];

// DOM Elements
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const recipeResults = document.getElementById('recipe-results');
const dietFilter = document.getElementById('diet-filter');
const timeFilter = document.getElementById('time-filter');
const timeValue = document.getElementById('time-value');
const mealPlannerSection = document.getElementById('meal-planner');
const favoritesSection = document.getElementById('favorites');

// Global Variables
let currentRecipes = [];
let favorites = [];
let mealPlan = {};
let searchTimeout;

// Initialize Application
document.addEventListener('DOMContentLoaded', initApp);
searchBtn.addEventListener('click', searchRecipes);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchRecipes();
});
timeFilter.addEventListener('input', updateTimeFilter);

// Initialize the app
function initApp() {
    updateTimeFilter();

    // Load data with error handling
    favorites = loadFromLocalStorage('favorites') || [];
    mealPlan = loadFromLocalStorage('mealPlan') || {
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
        Friday: [], Saturday: [], Sunday: []
    };

    renderMealPlanner();
    loadFavorites();
    getRandomRecipe();

    // Estado inicial vacío (sin recetas precargadas)
    recipeResults.innerHTML = `
        <div class="info-message">
            <i class="fas fa-info-circle"></i>
            <p>Enter ingredients to find delicious recipes!</p>
        </div>
    `;
}

// LocalStorage helper functions
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("LocalStorage error:", error);
        if (error.name === 'QuotaExceededError') {
            alert("Your storage is full. Some features may not work properly.");
            localStorage.clear();
        }
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("LocalStorage error:", error);
        return null;
    }
}

// Modifica la función searchRecipes así:
async function searchRecipes(defaultQuery = null) {
    const query = defaultQuery || searchInput.value.trim().toLowerCase();

    if (!query) {
        showError("Please enter ingredients");
        return;
    }

    showLoading(true);
    recipeResults.innerHTML = '';

    // Primero verifica si es una búsqueda específica de pollo
    if (query.includes('chicken')) {
        const chickenRecipe = FALLBACK_RECIPES.find(r => r.recipe.uri === "fallback#chicken");
        if (chickenRecipe) {
            recipeResults.innerHTML = `
                <div class="featured-recipe">
                    <h3>Featured Chicken Recipe</h3>
                </div>
            `;
            currentRecipes = [chickenRecipe];
            displayRecipes(currentRecipes);
            showLoading(false);
            return;
        }
    }

    try {
        const diet = dietFilter.value;
        const time = timeFilter.value;
        const recipes = await apiService.searchBothAPIs(query, { diet, time });
        currentRecipes = recipes.map(recipe => ({ recipe }));

        if (currentRecipes.length === 0) {
            showFallbackRecipes(diet);
        } else {
            displayRecipes(currentRecipes);
        }
    } catch (error) {
        console.error("API search failed:", error);
        showFallbackRecipes();
    } finally {
        showLoading(false);
    }
}

// También puedes mejorar la función getRandomRecipe para que incluya chicken como opción preferente:
function getRandomRecipe() {
    const randomBtn = document.createElement('button');
    randomBtn.id = 'random-btn';
    randomBtn.className = 'btn btn-primary';
    randomBtn.innerHTML = '<i class="fas fa-random"></i> Surprise Me!';
    document.querySelector('.search-box').appendChild(randomBtn);

    randomBtn.addEventListener('click', () => {
        // 40% de probabilidad de que salga chicken, 60% para otros
        const showChicken = Math.random() < 0.9;
        const randomIngredients = showChicken ?
            ['chicken'] :
            ['pasta', 'vegetables', 'beef', 'fish', 'rice', 'salad'];

        const randomIngredient = randomIngredients[Math.floor(Math.random() * randomIngredients.length)];
        searchInput.value = randomIngredient;
        searchRecipes();
    });
}

// ====== RESTANTE DE TU CÓDIGO ORIGINAL (sin modificaciones) ====== //
// Display Recipes
function displayRecipes(recipes) {
    if (recipes.length === 0) {
        recipeResults.innerHTML = `<p class="empty-state">No recipes found. Try different ingredients.</p>`;
        return;
    }

    recipeResults.innerHTML = recipes.map(recipe => {
        const card = new RecipeCard(recipe.recipe);
        card.element.addEventListener('favoriteToggled', (e) => {
            handleFavoriteToggle(e.detail.recipe, e.detail.isFavorite);
        });
        return card.element.outerHTML;
    }).join('');

    // Add event listeners for plan buttons
    document.querySelectorAll('.add-to-plan').forEach(btn => {
        btn.addEventListener('click', showAddToPlanDialog);
    });
}

// Handle favorite toggles
function handleFavoriteToggle(recipe, isFavorite) {
    const index = favorites.findIndex(fav => fav.uri === recipe.uri);

    if (isFavorite && index === -1) {
        favorites.push(recipe);
    } else if (!isFavorite && index !== -1) {
        favorites.splice(index, 1);
    }

    saveToLocalStorage('favorites', favorites);
    loadFavorites();
}

// Favorite Functions
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

        // Add event listeners to favorite cards
        document.querySelectorAll('.favorites-container .add-to-plan').forEach(btn => {
            btn.addEventListener('click', showAddToPlanDialog);
        });
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

// Improved Drag and Drop with touch support
function setupDragAndDrop() {
    const recipeCards = document.querySelectorAll('.recipe-card');
    const dropZones = document.querySelectorAll('.drop-zone');
    let touchDraggedId = null;

    recipeCards.forEach(card => {
        card.draggable = true;

        // For mouse drag events
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.dataset.id);
            e.dataTransfer.effectAllowed = 'move';
        });

        // For touch devices
        card.addEventListener('touchstart', (e) => {
            touchDraggedId = card.dataset.id;
        }, { passive: true });
    });

    dropZones.forEach(zone => {
        // Mouse events
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
            e.dataTransfer.dropEffect = 'move';
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            handleDrop(e, zone);
        });

        // Touch events
        zone.addEventListener('touchenter', (e) => {
            zone.classList.add('drag-over');
        });

        zone.addEventListener('touchleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('touchend', (e) => {
            if (touchDraggedId) {
                handleDrop(e, zone, touchDraggedId);
                touchDraggedId = null;
            }
        });
    });

    function handleDrop(event, zone, recipeId = null) {
        zone.classList.remove('drag-over');

        const id = recipeId || event.dataTransfer.getData('text/plain');
        const recipe = currentRecipes.find(r => r.recipe.uri.includes(id))?.recipe ||
            favorites.find(fav => fav.uri.includes(id));

        if (recipe) {
            const day = zone.closest('.day-card').dataset.day;
            addRecipeToPlan(recipe, day);
        }
    }
}

function setupRemoveButtons() {
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const recipeEl = e.target.closest('.planned-recipe');
            const day = recipeEl.closest('.day-card').dataset.day;
            const recipeId = recipeEl.dataset.id;

            mealPlan[day] = mealPlan[day].filter(recipe => !recipe.uri.includes(recipeId));
            saveToLocalStorage('mealPlan', mealPlan);
            renderMealPlanner();
        });
    });
}

function showAddToPlanDialog(e) {
    const recipeCard = e.target.closest('.recipe-card');
    const recipeId = recipeCard.dataset.id;
    const recipe = currentRecipes.find(r => r.recipe.uri.includes(recipeId))?.recipe ||
        favorites.find(fav => fav.uri.includes(recipeId));

    if (!recipe) return;

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
                <button id="cancel-plan" class="btn btn-outline">Cancel</button>
                <button id="confirm-plan" class="btn btn-primary">Add</button>
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
        saveToLocalStorage('mealPlan', mealPlan);
        renderMealPlanner();
    }
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

function showFallbackRecipes(diet = '') {
    let filteredRecipes = FALLBACK_RECIPES;

    if (diet) {
        filteredRecipes = FALLBACK_RECIPES.filter(recipe => {
            return !recipe.recipe.dietLabels ||
                recipe.recipe.dietLabels.includes(diet.charAt(0).toUpperCase() + diet.slice(1));
        });
    }

    if (filteredRecipes.length > 0) {
        currentRecipes = filteredRecipes;
        displayRecipes(currentRecipes);
    } else {
        showError("No recipes found. Try different ingredients.");
    }
}