class ChefMateApp {
    constructor() {
        this.ingredients = [];
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {};
        this.currentRecipes = [];
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.loadFavorites();
        this.loadMealPlan();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        // Ingredient input
        const ingredientInput = document.getElementById('ingredient-input');
        ingredientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                this.addIngredient(e.target.value.trim());
                e.target.value = '';
            }
        });

        // Generate recipe button
        document.getElementById('generate-recipe').addEventListener('click', () => {
            this.generateRecipes();
        });

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('recipe-modal').addEventListener('click', (e) => {
            if (e.target.id === 'recipe-modal') {
                this.closeModal();
            }
        });

        // Meal planner slots
        document.querySelectorAll('.meal-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                this.openMealSlotSelector(e.currentTarget);
            });
        });
    }

    switchSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    addIngredient(ingredient) {
        if (!this.ingredients.includes(ingredient.toLowerCase())) {
            this.ingredients.push(ingredient.toLowerCase());
            this.renderIngredientTags();
        }
    }

    removeIngredient(ingredient) {
        this.ingredients = this.ingredients.filter(ing => ing !== ingredient);
        this.renderIngredientTags();
    }

    renderIngredientTags() {
        const container = document.getElementById('ingredient-tags');
        container.innerHTML = this.ingredients.map(ingredient => `
            <div class="ingredient-tag">
                <span>${ingredient}</span>
                <button class="remove-tag" onclick="app.removeIngredient('${ingredient}')">&times;</button>
            </div>
        `).join('');
    }

    async generateRecipes() {
        if (this.ingredients.length === 0) {
            alert('Please add at least one ingredient!');
            return;
        }

        const generateBtn = document.getElementById('generate-recipe');
        generateBtn.classList.add('loading');

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const cuisine = document.getElementById('cuisine').value;
            const cookingTime = document.getElementById('cooking-time').value;
            const dietaryPrefs = Array.from(document.querySelectorAll('.dietary-options input:checked'))
                .map(input => input.value);

            const recipes = this.generateMockRecipes(this.ingredients, cuisine, cookingTime, dietaryPrefs);
            this.currentRecipes = recipes;
            this.renderRecipes(recipes);

        } catch (error) {
            console.error('Error generating recipes:', error);
            alert('Sorry, there was an error generating recipes. Please try again.');
        } finally {
            generateBtn.classList.remove('loading');
        }
    }

    generateMockRecipes(ingredients, cuisine, cookingTime, dietaryPrefs) {
        const recipeTemplates = [
            {
                name: "Savory {ingredient} Stir-Fry",
                emoji: "🍳",
                description: "A delicious and quick stir-fry featuring fresh {ingredient} with aromatic spices and vegetables.",
                cookTime: 15,
                servings: 4,
                difficulty: "Easy",
                ingredients: [
                    "2 cups {ingredient}",
                    "1 onion, sliced",
                    "2 cloves garlic, minced",
                    "2 tbsp olive oil",
                    "1 tsp soy sauce",
                    "Salt and pepper to taste"
                ],
                instructions: [
                    "Heat olive oil in a large pan over medium-high heat",
                    "Add onion and garlic, cook until fragrant",
                    "Add {ingredient} and stir-fry for 5-7 minutes",
                    "Season with soy sauce, salt, and pepper",
                    "Serve hot with rice or noodles"
                ]
            },
            {
                name: "Creamy {ingredient} Soup",
                emoji: "🍲",
                description: "A comforting and creamy soup that highlights the natural flavors of {ingredient}.",
                cookTime: 30,
                servings: 6,
                difficulty: "Medium",
                ingredients: [
                    "3 cups {ingredient}, chopped",
                    "1 onion, diced",
                    "2 cups vegetable broth",
                    "1 cup heavy cream",
                    "2 tbsp butter",
                    "Fresh herbs for garnish"
                ],
                instructions: [
                    "Sauté onion in butter until translucent",
                    "Add {ingredient} and cook for 10 minutes",
                    "Pour in broth and simmer for 15 minutes",
                    "Blend until smooth, then stir in cream",
                    "Season and garnish with fresh herbs"
                ]
            },
            {
                name: "Grilled {ingredient} Salad",
                emoji: "🥗",
                description: "A fresh and healthy salad featuring grilled {ingredient} with a zesty vinaigrette.",
                cookTime: 20,
                servings: 4,
                difficulty: "Easy",
                ingredients: [
                    "2 cups {ingredient}",
                    "Mixed greens",
                    "Cherry tomatoes",
                    "Cucumber, sliced",
                    "Olive oil and lemon dressing",
                    "Feta cheese (optional)"
                ],
                instructions: [
                    "Preheat grill to medium-high heat",
                    "Grill {ingredient} until tender and slightly charred",
                    "Arrange mixed greens on plates",
                    "Top with grilled {ingredient}, tomatoes, and cucumber",
                    "Drizzle with dressing and add feta if desired"
                ]
            }
        ];

        const recipes = [];
        const usedIngredients = [...this.ingredients];
        
        for (let i = 0; i < Math.min(3, usedIngredients.length); i++) {
            const template = recipeTemplates[i % recipeTemplates.length];
            const ingredient = usedIngredients[i];
            
            const recipe = {
                id: Date.now() + i,
                name: template.name.replace(/{ingredient}/g, ingredient),
                emoji: template.emoji,
                description: template.description.replace(/{ingredient}/g, ingredient),
                cookTime: template.cookTime + (cookingTime ? Math.max(0, parseInt(cookingTime) - template.cookTime) : 0),
                servings: template.servings,
                difficulty: template.difficulty,
                cuisine: cuisine || 'International',
                dietaryPrefs: dietaryPrefs,
                ingredients: template.ingredients.map(ing => ing.replace(/{ingredient}/g, ingredient)),
                instructions: template.instructions.map(inst => inst.replace(/{ingredient}/g, ingredient))
            };
            
            recipes.push(recipe);
        }

        return recipes;
    }

    renderRecipes(recipes) {
        const container = document.getElementById('recipe-results');
        container.innerHTML = recipes.map(recipe => `
            <div class="recipe-card" onclick="app.openRecipeModal(${recipe.id})">
                <div class="recipe-image">
                    ${recipe.emoji}
                </div>
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <div class="recipe-meta">
                        <span>⏱️ ${recipe.cookTime} min</span>
                        <span>👥 ${recipe.servings} servings</span>
                        <span>📊 ${recipe.difficulty}</span>
                    </div>
                    <p class="recipe-description">${recipe.description}</p>
                    <div class="recipe-actions">
                        <button class="btn-secondary" onclick="event.stopPropagation(); app.openRecipeModal(${recipe.id})">
                            View Recipe
                        </button>
                        <button class="btn-favorite ${this.favorites.some(fav => fav.id === recipe.id) ? 'favorited' : ''}" 
                                onclick="event.stopPropagation(); app.toggleFavorite(${recipe.id})">
                            ❤️
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    openRecipeModal(recipeId) {
        const recipe = this.currentRecipes.find(r => r.id === recipeId) || 
                      this.favorites.find(r => r.id === recipeId);
        
        if (!recipe) return;

        document.getElementById('modal-recipe-title').textContent = recipe.name;
        document.getElementById('modal-recipe-content').innerHTML = `
            <div class="recipe-details">
                <div class="recipe-info">
                    <div class="info-item">
                        <span class="info-value">${recipe.cookTime}</span>
                        <span class="info-label">Minutes</span>
                    </div>
                    <div class="info-item">
                        <span class="info-value">${recipe.servings}</span>
                        <span class="info-label">Servings</span>
                    </div>
                    <div class="info-item">
                        <span class="info-value">${recipe.difficulty}</span>
                        <span class="info-label">Difficulty</span>
                    </div>
                    <div class="info-item">
                        <span class="info-value">${recipe.cuisine}</span>
                        <span class="info-label">Cuisine</span>
                    </div>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 16px; color: var(--primary-color);">Ingredients</h4>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ingredient => `
                            <li>
                                <span class="ingredient-amount">${ingredient.split(' ')[0]} ${ingredient.split(' ')[1] || ''}</span>
                                <span>${ingredient.split(' ').slice(2).join(' ') || ingredient.split(' ')[0]}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 16px; color: var(--primary-color);">Instructions</h4>
                    <ol class="instructions-list">
                        ${recipe.instructions.map((instruction, index) => `
                            <li>
                                <span class="step-number">${index + 1}</span>
                                <span>${instruction}</span>
                            </li>
                        `).join('')}
                    </ol>
                </div>
                
                <div style="text-align: center; margin-top: 24px;">
                    <button class="generate-btn" onclick="app.toggleFavorite(${recipe.id}); app.closeModal();">
                        ${this.favorites.some(fav => fav.id === recipe.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                </div>
            </div>
        `;

        document.getElementById('recipe-modal').classList.add('active');
    }

    closeModal() {
        document.getElementById('recipe-modal').classList.remove('active');
    }

    toggleFavorite(recipeId) {
        const recipe = this.currentRecipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const existingIndex = this.favorites.findIndex(fav => fav.id === recipeId);
        
        if (existingIndex > -1) {
            this.favorites.splice(existingIndex, 1);
        } else {
            this.favorites.push(recipe);
        }

        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.loadFavorites();
        
        // Update favorite buttons
        document.querySelectorAll('.btn-favorite').forEach(btn => {
            if (btn.onclick.toString().includes(recipeId)) {
                btn.classList.toggle('favorited');
            }
        });
    }

    loadFavorites() {
        const container = document.getElementById('favorites-grid');
        
        if (this.favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">❤️</div>
                    <h3>No favorites yet</h3>
                    <p>Start generating recipes and save your favorites!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.favorites.map(recipe => `
            <div class="recipe-card" onclick="app.openRecipeModal(${recipe.id})">
                <div class="recipe-image">
                    ${recipe.emoji}
                </div>
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <div class="recipe-meta">
                        <span>⏱️ ${recipe.cookTime} min</span>
                        <span>👥 ${recipe.servings} servings</span>
                        <span>📊 ${recipe.difficulty}</span>
                    </div>
                    <p class="recipe-description">${recipe.description}</p>
                    <div class="recipe-actions">
                        <button class="btn-secondary" onclick="event.stopPropagation(); app.openRecipeModal(${recipe.id})">
                            View Recipe
                        </button>
                        <button class="btn-secondary" onclick="event.stopPropagation(); app.addToMealPlan(${recipe.id})">
                            Add to Meal Plan
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    openMealSlotSelector(slot) {
        const day = slot.closest('.day-column').dataset.day;
        const meal = slot.dataset.meal;
        
        if (this.favorites.length === 0) {
            alert('Add some favorite recipes first to use the meal planner!');
            return;
        }

        const options = this.favorites.map(recipe => 
            `<option value="${recipe.id}">${recipe.name}</option>`
        ).join('');

        const select = document.createElement('select');
        select.innerHTML = `
            <option value="">Select a recipe...</option>
            ${options}
            <option value="remove">Remove meal</option>
        `;
        
        select.style.cssText = `
            width: 100%;
            padding: 8px;
            border: 2px solid var(--primary-color);
            border-radius: 6px;
            font-size: 0.9rem;
        `;

        select.addEventListener('change', (e) => {
            if (e.target.value === 'remove') {
                this.removeMealFromPlan(day, meal);
            } else if (e.target.value) {
                const recipe = this.favorites.find(r => r.id == e.target.value);
                this.addMealToPlan(day, meal, recipe);
            }
            slot.innerHTML = `
                <span class="meal-label">${meal}</span>
                <div class="meal-content">Click to add</div>
            `;
        });

        select.addEventListener('blur', () => {
            slot.innerHTML = `
                <span class="meal-label">${meal}</span>
                <div class="meal-content">Click to add</div>
            `;
        });

        slot.innerHTML = '';
        slot.appendChild(select);
        select.focus();
    }

    addMealToPlan(day, meal, recipe) {
        if (!this.mealPlan[day]) {
            this.mealPlan[day] = {};
        }
        this.mealPlan[day][meal] = recipe;
        localStorage.setItem('mealPlan', JSON.stringify(this.mealPlan));
        this.loadMealPlan();
    }

    removeMealFromPlan(day, meal) {
        if (this.mealPlan[day]) {
            delete this.mealPlan[day][meal];
            if (Object.keys(this.mealPlan[day]).length === 0) {
                delete this.mealPlan[day];
            }
        }
        localStorage.setItem('mealPlan', JSON.stringify(this.mealPlan));
        this.loadMealPlan();
    }

    addToMealPlan(recipeId) {
        const recipe = this.favorites.find(r => r.id === recipeId);
        if (!recipe) return;

        // Simple implementation - add to next available slot
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const meals = ['breakfast', 'lunch', 'dinner'];

        for (const day of days) {
            for (const meal of meals) {
                if (!this.mealPlan[day] || !this.mealPlan[day][meal]) {
                    this.addMealToPlan(day, meal, recipe);
                    alert(`Added "${recipe.name}" to ${day} ${meal}!`);
                    return;
                }
            }
        }

        alert('Your meal plan is full! Remove some meals to add new ones.');
    }

    loadMealPlan() {
        document.querySelectorAll('.meal-slot').forEach(slot => {
            const day = slot.closest('.day-column').dataset.day;
            const meal = slot.dataset.meal;
            
            if (this.mealPlan[day] && this.mealPlan[day][meal]) {
                const recipe = this.mealPlan[day][meal];
                slot.classList.add('filled');
                slot.innerHTML = `
                    <span class="meal-label">${meal}</span>
                    <div class="meal-content">${recipe.name}</div>
                `;
            } else {
                slot.classList.remove('filled');
                slot.innerHTML = `
                    <span class="meal-label">${meal}</span>
                    <div class="meal-content">Click to add</div>
                `;
            }
        });
    }
}

// Initialize the app when the page loads
const app = new ChefMateApp();