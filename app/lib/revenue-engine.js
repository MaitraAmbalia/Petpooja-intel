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
 * Real-time upselling logic based on margin/popularity
 * To be called by the Voice Copilot during order capture.
 * 
 * @param {Object} currentOrder - The items currently in the voice order
 * @param {Array} menuItems - The full menu with metadata (expected to be classified)
 * @returns {Object|null} An item or combo to suggest
 */
export const getSmartUpsell = (currentOrder, menuItems) => {
    // Priority: Challenges (High Margin, need promotion) > Stars (Safe bets)
    const candidates = menuItems
        .filter(item => item.classification === "Challenge" || item.classification === "Star")
        .sort((a, b) => b.margin - a.margin);

    return candidates[0] || null;
};
