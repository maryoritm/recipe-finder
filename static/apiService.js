class ApiService {
    constructor() {
        this.EDAMAM_URL = `https://api.edamam.com/search?app_id=335addd8&app_key=149c4d9a0591ba45a41d9d7138080054`;
        this.SPOONACULAR_KEY = 'b4d3ce7db4774e4981fd6732cb8f1a1d'; 
    }

    async searchEdamam(query, options = {}) {
        const url = new URL(this.EDAMAM_URL);
        url.searchParams.set('q', query);
        if (options.time) url.searchParams.set('time', options.time);
        if (options.diet) url.searchParams.set('diet', options.diet);

        const response = await fetch(url);
        return (await response.json()).hits.map(hit => hit.recipe);
    }

    async searchSpoonacular(query) {
        try {
            const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${this.SPOONACULAR_KEY}&query=${query}&addRecipeInformation=true`;
            const response = await fetch(url);
            return (await response.json()).results;
        } catch (error) {
            console.error("Spoonacular failed:", error);
            return [];
        }
    }

    async searchBothAPIs(query, options) {
        const [edamam, spoonacular] = await Promise.all([
            this.searchEdamam(query, options),
            this.searchSpoonacular(query)
        ]);
        return [...edamam, ...spoonacular];
    }
}

const apiService = new ApiService();