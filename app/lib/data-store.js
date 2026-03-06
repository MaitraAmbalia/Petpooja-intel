/**
 * CENTRALIZED DATA STORE
 * 
 * This file replaces hardcoded mock data in components.
 * It strictly adheres to the schemas defined in schemas.js.
 */

import { calculateMargin, classifyMenuItems } from "./revenue-engine";

// Initial Menu Data
export const INITIAL_MENU = [
    {
        foodId: "sku_101",
        foodName: "Classic Burger",
        price: 12.00,
        foodCost: 4.50,
        margin: 7.50,
        opCost: 1.20,
        category: "Mains",
        isVeg: false,
        dietType: "non-veg",
        popularityScore: 85,
        spiceLevel: 2,
        ingredients: [
            { name: "Bun", quantity: "1", unit: "pcs" },
            { name: "Beef Patty", quantity: "150", unit: "g" },
            { name: "Lettuce", quantity: "20", unit: "g" }
        ],
        variants: [
            { name: "Regular", price: 12.00 },
            { name: "Double Patty", price: 16.00 }
        ],
        addons: [
            { name: "Extra Cheese", price: 1.50 },
            { name: "Bacon", price: 2.00 }
        ]
    },
    {
        foodId: "sku_102",
        foodName: "Truffle Fries",
        price: 6.50,
        foodCost: 1.50,
        margin: 5.00,
        opCost: 0.80,
        category: "Sides",
        isVeg: true,
        dietType: "veg",
        popularityScore: 92,
        spiceLevel: 1,
        ingredients: [
            { name: "Potato", quantity: "200", unit: "g" },
            { name: "Truffle Oil", quantity: "5", unit: "ml" }
        ],
        variants: [
            { name: "Small", price: 6.50 },
            { name: "Large", price: 9.00 }
        ],
        addons: [
            { name: "Truffle Mayo", price: 1.00 }
        ]
    },
    {
        foodId: "sku_103",
        foodName: "Spicy Paneer Wrap",
        price: 10.00,
        foodCost: 3.00,
        margin: 7.00,
        opCost: 1.00,
        category: "Mains",
        isVeg: true,
        dietType: "veg",
        popularityScore: 45,
        spiceLevel: 4,
        ingredients: [
            { name: "Tortilla", quantity: "1", unit: "pcs" },
            { name: "Paneer", quantity: "100", unit: "g" },
            { name: "Spicy Sauce", quantity: "30", unit: "ml" }
        ],
        variants: [
            { name: "Standard", price: 10.00 }
        ],
        addons: [
            { name: "Extra Paneer", price: 2.50 }
        ]
    },
    {
        foodId: "sku_104",
        foodName: "Jain Dal Tadka",
        price: 9.00,
        foodCost: 2.50,
        margin: 6.50,
        opCost: 0.90,
        category: "Mains",
        isVeg: true,
        dietType: "jain",
        popularityScore: 35,
        spiceLevel: 2,
        ingredients: [
            { name: "Lentils", quantity: "150", unit: "g" },
            { name: "Ghee", quantity: "10", unit: "ml" }
        ],
        variants: [
            { name: "Full", price: 9.00 },
            { name: "Half", price: 5.50 }
        ],
        addons: []
    },
    {
        foodId: "sku_108",
        foodName: "Margherita Pizza",
        price: 15.00,
        foodCost: 4.00,
        margin: 11.00,
        opCost: 1.50,
        category: "Mains",
        isVeg: true,
        dietType: "veg",
        popularityScore: 88,
        spiceLevel: 1,
        ingredients: [
            { name: "Dough", quantity: "200", unit: "g" },
            { name: "Tomato Sauce", quantity: "50", unit: "ml" },
            { name: "Mozzarella", quantity: "100", unit: "g" }
        ],
        variants: [
            { name: "10-inch", price: 15.00 },
            { name: "12-inch", price: 19.00 }
        ],
        addons: [
            { name: "Extra Cheese", price: 2.00 },
            { name: "Olive Topping", price: 1.00 }
        ]
    },
    {
        foodId: "sku_109",
        foodName: "Tomato Cream Soup",
        price: 5.50,
        foodCost: 1.20,
        margin: 4.30,
        opCost: 0.50,
        category: "Soup",
        isVeg: true,
        dietType: "veg",
        popularityScore: 65,
        spiceLevel: 1,
        ingredients: [
            { name: "Tomato", quantity: "150", unit: "g" },
            { name: "Cream", quantity: "20", unit: "ml" },
            { name: "Basil", quantity: "2", unit: "leaves" }
        ],
        variants: [{ name: "Standard", price: 5.50 }],
        addons: [{ name: "Croutons", price: 0.50 }, { name: "Cheese", price: 1.00 }]
    },
    {
        foodId: "sku_110",
        foodName: "Fresh Lime Soda",
        price: 4.00,
        foodCost: 0.50,
        margin: 3.50,
        opCost: 0.30,
        category: "Beverage",
        isVeg: true,
        dietType: "veg",
        popularityScore: 80,
        spiceLevel: 0,
        ingredients: [
            { name: "Lemon", quantity: "1", unit: "pcs" },
            { name: "Soda", quantity: "200", unit: "ml" },
            { name: "Sugar Syrup", quantity: "20", unit: "ml" }
        ],
        variants: [{ name: "Sweet", price: 4.00 }, { name: "Salted", price: 4.00 }],
        addons: []
    },
    {
        foodId: "sku_111",
        foodName: "Cold Coffee",
        price: 6.00,
        foodCost: 1.50,
        margin: 4.50,
        opCost: 0.80,
        category: "Beverage",
        isVeg: true,
        dietType: "veg",
        popularityScore: 90,
        spiceLevel: 0,
        ingredients: [
            { name: "Milk", quantity: "200", unit: "ml" },
            { name: "Coffee Powder", quantity: "5", unit: "g" },
            { name: "Chocolate Syrup", quantity: "10", unit: "ml" }
        ],
        variants: [{ name: "Regular", price: 6.00 }, { name: "With Ice Cream", price: 8.00 }],
        addons: [{ name: "Chocolate Chips", price: 1.00 }]
    },
];

export const CATEGORIES = [
    { id: "all", name: "All Items", icon: "LayoutGrid" },
    { id: "mains", name: "Mains", icon: "Utensils" },
    { id: "sides", name: "Sides", icon: "Soup" },
    { id: "beverage", name: "Beverage", icon: "Coffee" },
    { id: "soup", name: "Soup", icon: "Waves" },
    { id: "desserts", name: "Desserts", icon: "IceCream" }
];

// Mock Restaurant Data
export const MOCK_RESTAURANT = {
    name: "The Gourmet Voice Bistro",
    address: "123 AI Lane, Tech City, 560001",
    cuisine: "Modern International",
    contact: "+1 234 567 890"
};

/**
 * Processed Menu Data with Revenue Intelligence
 */
const avgMargin = INITIAL_MENU.reduce((acc, i) => acc + (i.price - i.foodCost), 0) / INITIAL_MENU.length;
const avgPopularity = 50; // Median popularity

export const PROCESSED_MENU = classifyMenuItems(INITIAL_MENU, avgMargin, avgPopularity);

// 15-Day Revenue Data for Charts
export const REVENUE_HISTORY = Array.from({ length: 15 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (14 - i));
    const revenue = 4000 + Math.random() * 2000;
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: revenue,
        profit: 1500 + Math.random() * 800,
        costs: 2500 + Math.random() * 500,
        orders: Math.floor(80 + Math.random() * 50),
    };
});

// Live Stats Initial State
export const LIVE_STATS = {
    todayOrders: 142,
    totalCalls: 185,
    aiSuccessRate: 94.5,
    activeTables: 12,
    totalRevenue: "$5,240.00"
};

// Mock Auth Users
export const USERS = [
    { id: "1", name: "Admin User", email: "admin@petpooja.com", role: "ADMIN" },
    { id: "2", name: "Staff Member", email: "staff@petpooja.com", role: "STAFF" },
];

// Live Voice Order History
export const VOICE_ORDERS = [
    {
        id: "VO_1001",
        time: "10:30 AM",
        customer: "Rahul Sharma",
        transcript: "Ek Classic Burger aur do Coke dena please.",
        structuredJson: {
            items: [{ name: "Classic Burger", qty: 1 }, { name: "Coke", qty: 2 }],
            total: 18.00
        },
        status: "COMPLETED",
        aiUpsell: "Suggested Truffle Fries (Accepted)"
    }
];
// Mock Team Members
export const TEAM_MEMBERS = [
    { id: 1, name: "Jackson", role: "Manager", status: "Present", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jackson" },
    { id: 2, name: "James David", role: "Service Male", status: "Present", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=James" },
    { id: 3, name: "Adam Mccall", role: "Service Male", status: "Present", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adam" },
    { id: 4, name: "Keon Gregg", role: "Service Male", status: "Present", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Keon" },
    { id: 5, name: "Warren Daniel", role: "Service Male", status: "Present", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Warren" },
    { id: 6, name: "Elsie Bond", role: "Service Male", status: "Absent", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elsie" },
    { id: 7, name: "Alabas", role: "Service Male", status: "Present", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alabas" },
];
