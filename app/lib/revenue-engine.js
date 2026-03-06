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
        let classification = "";

        if (margin >= avgMargin && item.popularityScore >= avgPopularity) {
            classification = "Star";
        } else if (margin < avgMargin && item.popularityScore >= avgPopularity) {
            classification = "Workhorse";
        } else if (margin >= avgMargin && item.popularityScore < avgPopularity) {
            classification = "Challenge";
        } else {
            classification = "Dog";
        }

        return { ...item, margin, classification };
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
 * Strategic Combo Generation Logic
 * 
 * Implements the High/Low quadrant strategy:
 * - Combo 1: High Pop + High Margin (Star) - 5% discount
 * - Combo 2: High Pop + Low Margin (Workhorse) - 8% discount
 * - Combo 3: Low Pop + High Margin (Challenge) - 10% discount
 */
export const getStrategicCombos = (items) => {
    // Separate by relevant categories for bundling
    const snacks = items.filter(i => i.category === "Mains" || i.category === "Sides");
    const beverages = items.filter(i => i.category === "Beverage");
    const desserts = items.filter(i => i.category === "Desserts");

    const getMedian = (arr, key) => {
        const values = arr.map(i => i[key]).sort((a, b) => a - b);
        const mid = Math.floor(values.length / 2);
        return values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
    };

    const findItem = (pool, popType, marType) => {
        if (pool.length === 0) return null;

        const medPop = getMedian(pool, 'popularityScore');
        const medMar = getMedian(pool, 'margin');

        const popCond = (i) => popType === 'High' ? i.popularityScore >= medPop : i.popularityScore < medPop;
        const marCond = (i) => marType === 'High' ? i.margin >= medMar : i.margin < medMar;

        let candidates = pool.filter(i => popCond(i) && marCond(i));
        if (candidates.length === 0) candidates = pool;

        // Sort to pick best representative
        return [...candidates].sort((a, b) => {
            if (popType === 'High' && marType === 'High') return b.popularityScore - a.popularityScore || b.margin - a.margin;
            if (popType === 'High' && marType === 'Low') return b.popularityScore - a.popularityScore || a.margin - b.margin;
            if (popType === 'Low' && marType === 'High') return b.margin - a.margin || a.popularityScore - b.popularityScore;
            return b.margin - a.margin;
        })[0];
    };

    const configs = [
        { name: "Combo 1", strategy: "Star Performers", desc: "High Pop + High Margin", discount: 0.05, types: ['snack', 'beverage'], sType: 'High', mType: 'High' },
        { name: "Combo 2", strategy: "Traffic Builders", desc: "High Pop + Low Margin", discount: 0.08, types: ['snack', 'beverage'], sType: 'High', mType: 'Low' },
        { name: "Combo 3", strategy: "Hidden Gems", desc: "Low Pop + High Margin", discount: 0.10, types: ['snack', 'beverage'], sType: 'Low', mType: 'High' }
    ];

    return configs.map(config => {
        const snack = findItem(snacks, config.sType, config.mType);
        const beverage = findItem(beverages, config.sType, config.mType);

        if (!snack || !beverage) return null;

        const basePrice = snack.price + beverage.price;
        const baseMargin = snack.margin + beverage.margin;
        const discountAmount = basePrice * config.discount;

        return {
            id: `bundle_${config.name.toLowerCase().replace(' ', '_')}`,
            name: `${config.name} (${config.strategy})`,
            items: [snack, beverage],
            strategy: config.desc,
            discount: config.discount * 100,
            basePrice: basePrice,
            discountedPrice: Number((basePrice - discountAmount).toFixed(2)),
            originalMargin: baseMargin,
            newMargin: Number((baseMargin - discountAmount).toFixed(2)),
        };
    }).filter(Boolean);
};
