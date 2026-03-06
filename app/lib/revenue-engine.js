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
    if (!item.price || !item.foodCost) return 0;
    return item.price - item.foodCost;
};

/**
 * Classifies menu items based on popularity and profitability.
 * 
 * - Star: High Profit, High Popularity
 * - Workhorse: Low Profit, High Popularity
 * - Challenge: High Profit, Low Popularity (Under-promoted)
 * - Dog: Low Profit, Low Popularity (Underperforming)
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
            classification = "Star";
        } else if (margin < avgMargin && popularityScore >= avgPopularity) {
            classification = "Workhorse";
        } else if (margin >= avgMargin && popularityScore < avgPopularity) {
            classification = "Challenge";
        } else {
            classification = "Dog";
        }

        return { ...item, margin, popularityScore, classification };
    });
};

/**
 * Detects underperforming SKUs or risky high-volume low-margin items.
 */
export const detectRiskyItems = (classifiedItems) => {
    return classifiedItems.filter(item => {
        // High volume but very thin margins (Workhorses that might become losses if food cost rises)
        const isRiskyWorkhorse = item.classification === "Workhorse" && (item.margin / item.price) < 0.15;
        // Underperforming Dog items
        const isUnderperformingDog = item.classification === "Dog";

        return isRiskyWorkhorse || isUnderperformingDog;
    });
};

/**
 * Association Analysis (Simplified Basket Analysis)
 * Recommends combos by pairing 'Challenges' (high profit) with 'Workhorses' (high popularity).
 * 
 * @param {Array} classifiedItems - Array of items with calculated margins and classification
 * @param {Array} orderHistory - Order history data (not fully utilized in this simplified example)
 * @returns {Array} Recommended combos
 */
export const recommendCombos = (classifiedItems, orderHistory) => {
    const workhorses = classifiedItems.filter(i => i.classification === "Workhorse");
    const challenges = classifiedItems.filter(i => i.classification === "Challenge");

    const recommendations = [];

    // Simple strategy: Bundle a popular item with an under-promoted high-margin item
    challenges.forEach(challenge => {
        const matchingWorkhorse = workhorses[0]; // Simplification for logic flow
        if (matchingWorkhorse) {
            recommendations.push({
                name: `${challenge.foodName} & ${matchingWorkhorse.foodName} Combo`,
                items: [challenge.foodId, matchingWorkhorse.foodId],
                suggestedPrice: (challenge.price + matchingWorkhorse.price) * 0.9, // 10% discount
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
    if (item.classification === "Star") {
        return { suggestion: "Maintain price or subtle increase", confidence: "High" };
    }
    if (item.classification === "Workhorse") {
        return { suggestion: "Investigate cost reduction or combo bundling", confidence: "Medium" };
    }
    if (item.classification === "Challenge") {
        return { suggestion: "Promote via Voice Copilot / Special Offers", confidence: "High" };
    }
    return { suggestion: "Consider removing or rebranding", confidence: "Low" };
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
    // 1. Calculate WMA for all items
    const processedItems = items.map(item => {
        const history = item.orderHistory || [0, 0, 0];
        const wma = (history[0] * 0.5) + (history[1] * 0.3) + (history[2] * 0.2);
        return { ...item, wma };
    });

    // 2. Separate by Categories
    const snacks = processedItems.filter(i => i.category === "Snack");
    const beverages = processedItems.filter(i => i.category === "Beverage");
    const desserts = processedItems.filter(i => i.category === "Dessert");

    // 3. Normalization Helper (Min-Max)
    const normalize = (arr, key) => {
        const values = arr.map(i => i[key]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        if (max === min) return arr.map(i => ({ ...i, [`${key}_norm`]: 1 }));
        return arr.map(i => ({
            ...i,
            [`${key}_norm`]: (i[key] - min) / (max - min)
        }));
    };

    // Normalize each category separately to ensure fair ranking
    const scoreItems = (pool) => {
        if (pool.length === 0) return [];
        let p = normalize(pool, 'margin');
        p = normalize(p, 'wma');
        return p.map(i => ({
            ...i,
            score: i.margin_norm + i.wma_norm
        })).sort((a, b) => b.score - a.score);
    };

    const scoredSnacks = scoreItems(snacks);
    const scoredBeverages = scoreItems(beverages);
    const scoredDesserts = scoreItems(desserts);

    // 4. Bundling Logic
    const configs = [
        {
            id: 'combo_1',
            name: "Combo 1 (Star Performers)",
            strategy: "High Pop + High Margin (WMA)",
            discount: 0.05,
            get: () => [scoredSnacks[0], scoredBeverages[0], scoredDesserts[0]]
        },
        {
            id: 'combo_2',
            name: "Combo 2 (Traffic Builders)",
            strategy: "High Volume Staples",
            discount: 0.08,
            get: () => [scoredSnacks[1], scoredBeverages[1]]
        },
        {
            id: 'combo_3',
            name: "Combo 3 (Hidden Gems)",
            strategy: "High Margin Potential",
            discount: 0.10,
            get: () => {
                // Pick items with high margin but lower popularity (lower score index)
                const s = scoredSnacks.find(i => i.wma_norm < 0.5) || scoredSnacks[scoredSnacks.length - 1];
                const b = scoredBeverages.find(i => i.wma_norm < 0.5) || scoredBeverages[scoredBeverages.length - 1];
                return [s, b];
            }
        }
    ];

    return configs.map(config => {
        const comboItems = config.get().filter(Boolean);
        if (comboItems.length < 2) return null;

        const basePrice = comboItems.reduce((acc, i) => acc + i.price, 0);
        const baseMargin = comboItems.reduce((acc, i) => acc + i.margin, 0);
        const discountAmount = basePrice * config.discount;

        return {
            id: config.id,
            name: config.name,
            items: comboItems,
            strategy: config.strategy,
            discount: config.discount * 100,
            basePrice: Number(basePrice.toFixed(2)),
            discountedPrice: Number((basePrice - discountAmount).toFixed(2)),
            originalMargin: Number(baseMargin.toFixed(2)),
            newMargin: Number((baseMargin - discountAmount).toFixed(2)),
        };
    }).filter(Boolean);
};
