/**
 * REVENUE INTELLIGENCE & MENU OPTIMIZATION ENGINE
 * 
 * This module handles the analytical logic for optimizing restaurant revenue.
 */

import { FoodItemSchema, ComboSchema } from "./schemas";

/**
 * Calculates the contribution margin for a menu item.
 * Contribution Margin = Selling Price - Food Cost
 * 
 * @param {Object} item - FoodItemSchema instance
 * @returns {number}
 */
export const calculateMargin = (item) => {
    if (!item.price || !item.cost) return 0;
    return item.price - item.cost;
};

/**
 * Classifies menu items based on popularity and profitability.
 * 
 * - Hero Item: High Profit, High Popularity
 * - Volume Driver: Low Profit, High Popularity
 * - Hidden Gem: High Profit, Low Popularity (Under-promoted)
 * - Underperformer: Low Profit, Low Popularity
 * 
 * @param {Array} items - Array of items with calculated margins and sales data
 * @param {number} avgMargin - Mean margin across menu
 * @param {number} avgPopularity - Mean popularity across menu
 * @returns {Array} Items with classification
 */
export const classifyMenuItems = (items, avgMargin, avgPopularity) => {
    return items.map(item => {
        const margin = calculateMargin(item);

        // Calculate popularityScore from orderHistory if missing (using 3-day WMA)
        const popularityScore = item.popularityScore !== undefined
            ? item.popularityScore
            : (item.orderHistory ? (item.orderHistory[0] * 0.5 + item.orderHistory[1] * 0.3 + item.orderHistory[2] * 0.2) : 0);

        let classification = "";

        if (margin >= avgMargin && popularityScore >= avgPopularity) {
            classification = "Hero Item";
        } else if (margin < avgMargin && popularityScore >= avgPopularity) {
            classification = "Volume Driver";
        } else if (margin >= avgMargin && popularityScore < avgPopularity) {
            classification = "Hidden Gem";
        } else {
            classification = "Underperformer";
        }

        return { ...item, margin, popularityScore, classification };
    });
};

/**
 * Detects underperforming SKUs or risky high-volume low-margin items.
 */
export const detectRiskyItems = (classifiedItems) => {
    return classifiedItems.filter(item => {
        // High volume but very thin margins (Volume Drivers that might become losses if food cost rises)
        const isRiskyVolumeDriver = item.classification === "Volume Driver" && (item.margin / item.price) < 0.15;
        // Underperforming items
        const isUnderperformer = item.classification === "Underperformer";

        return isRiskyVolumeDriver || isUnderperformer;
    });
};

/**
 * Association Analysis (Simplified Basket Analysis)
 * Recommends combos by pairing 'Hidden Gems' (high profit) with 'Volume Drivers' (high popularity).
 * 
 * @param {Array} classifiedItems - Array of items with calculated margins and classification
 * @param {Array} orderHistory - Order history data (not fully utilized in this simplified example)
 * @returns {Array} Recommended combos
 */
export const recommendCombos = (classifiedItems, orderHistory) => {
    const volumeDrivers = classifiedItems.filter(i => i.classification === "Volume Driver");
    const hiddenGems = classifiedItems.filter(i => i.classification === "Hidden Gem");

    const recommendations = [];

    // Simple strategy: Bundle a popular item with an under-promoted high-margin item
    hiddenGems.forEach(gem => {
        const matchingDriver = volumeDrivers[0]; // Simplification for logic flow
        if (matchingDriver) {
            recommendations.push({
                name: `${gem.name} & ${matchingDriver.name} Combo`,
                items: [gem.foodId, matchingDriver.foodId],
                suggestedPrice: (gem.price + matchingDriver.price) * 0.9, // 10% discount
                profitImpact: "High",
                reason: "Pairs a popular staple with a high-margin specialty."
            });
        }
    });

    return recommendations;
};

/**
 * Price Optimization Strategy
 * 
 * @param {Object} item - A classified menu item
 * @returns {Object} Price optimization suggestion
 */
export const getPriceOptimization = (item) => {
    let suggestedPrice = item.price;
    let suggestion = "";
    let confidence = "";

    // Quantitative Price Elasticity Model
    if (item.classification === "Hero Item") {
        suggestedPrice = Number((item.price * 1.05).toFixed(2)); // +5% (Inelastic demand)
        suggestion = "Increase price (+5%)";
        confidence = "High";
    } else if (item.classification === "Volume Driver") {
        suggestedPrice = Number((item.price * 1.02).toFixed(2)); // +2% (Price sensitive)
        suggestion = "Slight increase (+2%)";
        confidence = "Medium";
    } else if (item.classification === "Hidden Gem") {
        suggestedPrice = Number((item.price * 0.95).toFixed(2)); // -5% (Promotional to drive volume)
        suggestion = "Discount (-5%)";
        confidence = "High";
    } else {
        suggestedPrice = item.price;
        suggestion = "Maintain / Re-evaluate";
        confidence = "Low";
    }

    return { suggestedPrice, suggestion, confidence };
};

/**
 * 
 * 
 * 1. Calculates Weighted Moving Average (WMA) for popularity: (D1*0.5 + D2*0.3 + D3*0.2)
 * 2. Normalizes Margin and WMA Popularity using Min-Max scaling.
 * 3. Calculates a Performance Score: (Margin_norm + Orders_norm)
 * 4. Generates 3 Strategic Bundles:
 *    - Combo 1 (Star Performers): 3-item Trio (Snack + Bev + Dessert) - 5% Discount
 *    - Combo 2 (Traffic Builders): Top 2 categories paired (Snack + Bev) - 8% Discount
 *    - Combo 3 (Hidden Gems): Under-promoted high scorers (Snack + Bev) - 10% Discount
 */
export const getStrategicCombos = (items) => {
    // 1. Calculate WMA and score items by category
    const processedItems = items.map(item => {
        const history = item.orderHistory || [0, 0, 0];
        const wma = (history[0] * 0.5) + (history[1] * 0.3) + (history[2] * 0.2);
        return { ...item, wma };
    });

    const snacks = processedItems.filter(i => i.category === "Snack");
    const beverages = processedItems.filter(i => i.category === "Beverage");
    const desserts = processedItems.filter(i => i.category === "Dessert");

    const normalize = (arr, key) => {
        if (arr.length === 0) return [];
        const values = arr.map(i => i[key]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        if (max === min) return arr.map(i => ({ ...i, [`${key}_norm`]: 1 }));
        return arr.map(i => ({ ...i, [`${key}_norm`]: (i[key] - min) / (max - min) }));
    };

    const scoreItems = (pool) => {
        if (pool.length === 0) return [];
        let p = normalize(pool, 'margin');
        p = normalize(p, 'wma');
        return p.map(i => ({
            ...i,
            score: (i.margin_norm || 0) + (i.wma_norm || 0)
        })).sort((a, b) => b.score - a.score);
    };

    const scoredSnacks = scoreItems(snacks);
    const scoredBeverages = scoreItems(beverages);
    const scoredDesserts = scoreItems(desserts);

    const createCombo = (items, discount, nameSuffix, strategy) => {
        const comboItems = items.filter(Boolean);
        if (comboItems.length < 2) return null;

        const basePrice = comboItems.reduce((acc, i) => acc + i.price, 0);
        const baseMargin = comboItems.reduce((acc, i) => acc + i.margin, 0);
        const discountAmount = basePrice * discount;

        // Weighted Average Popularity — each item contributes proportionally to its price share
        const weightedPopularity = basePrice > 0
            ? comboItems.reduce((acc, i) => {
                const priceWeight = i.price / basePrice;
                return acc + ((i.popularityScore || i.wma || 0) * priceWeight);
            }, 0)
            : 0;

        return {
            id: `combo_${Math.random().toString(36).substr(2, 9)}`,
            name: `${nameSuffix} Bundle`,
            items: comboItems,
            strategy: strategy,
            discount: Number((discount * 100).toFixed(0)),
            basePrice: Number(basePrice.toFixed(2)),
            discountedPrice: Number((basePrice - discountAmount).toFixed(2)),
            newMargin: Number((baseMargin - discountAmount).toFixed(2)),
            popularityScore: Number(weightedPopularity.toFixed(2)),
        };
    };

    // Engine 1: Trio (Snack + Bev + Dessert) - 3 Combos
    const trioEngine = [
        createCombo([scoredSnacks[0], scoredBeverages[0], scoredDesserts[0]], 0.05, "Supreme Trio I", "High-Performance Stars"),
        createCombo([scoredSnacks[1], scoredBeverages[1], scoredDesserts[1]], 0.05, "Supreme Trio II", "Balanced Profit Trio"),
        createCombo([scoredSnacks[2], scoredBeverages[2], scoredDesserts[2]], 0.05, "Supreme Trio III", "High-Margin Potential")
    ].filter(Boolean);

    // Engine 2: Snack + Beverage - 3 Combos
    const snackBevEngine = [
        createCombo([scoredSnacks[0], scoredBeverages[1]], 0.05, "Quick Bite I", "Popularity Driver"),
        createCombo([scoredSnacks[1], scoredBeverages[0]], 0.08, "Quick Bite II", "Margin Optimizer"),
        createCombo([scoredSnacks[2], scoredBeverages[2]], 0.10, "Quick Bite III", "Profit Generator")
    ].filter(Boolean);

    // Engine 3: Snack + Dessert - 3 Combos
    const snackDessertEngine = [
        createCombo([scoredSnacks[0], scoredDesserts[1]], 0.05, "Sweet Treat I", "Popularity Driver"),
        createCombo([scoredSnacks[1], scoredDesserts[0]], 0.08, "Sweet Treat II", "Margin Optimizer"),
        createCombo([scoredSnacks[2], scoredDesserts[2]], 0.10, "Sweet Treat III", "Profit Generator")
    ].filter(Boolean);

    return {
        trio: trioEngine,
        snackBev: snackBevEngine,
        snackDessert: snackDessertEngine
    };
};
