"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { PROCESSED_MENU, CATEGORIES, STRATEGIC_COMBOS } from "@/lib/data-store";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit3,
    Trash2,
    Database,
    CloudUpload,
    ChevronRight,
    LayoutGrid,
    Utensils,
    Soup as SoupIcon,
    Coffee,
    Waves,
    IceCream,
    Check,
    Zap,
    TrendingUp,
    Target,
    ShoppingBag
} from "lucide-react";
import { useState, useEffect } from "react";

const iconMap = {
    LayoutGrid,
    Utensils,
    Soup: SoupIcon,
    Coffee,
    Waves,
    IceCream,
    ShoppingBag
};

const DietBadge = ({ type }) => {
    let colors = "bg-gray-100 text-gray-600 border-gray-200";
    if (type === "veg") colors = "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (type === "non-veg") colors = "bg-rose-50 text-rose-600 border-rose-100";
    if (type === "jain") colors = "bg-orange-50 text-orange-600 border-orange-100";

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${colors}`}>
            {type}
        </span>
    );
};

const Badge = ({ children, className = "", variant = "default" }) => {
    const variants = {
        default: "bg-slate-900 text-white",
        outline: "border border-slate-200 text-slate-600 bg-transparent",
        secondary: "bg-slate-100 text-slate-900"
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

const Toggle = ({ active, onChange }) => (
    <button
        onClick={onChange}
        className={`w-10 h-5 rounded-full transition-all relative ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}
    >
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-6' : 'left-1'}`} />
    </button>
);

const EditItemModal = ({ item, isOpen, onClose, onSave }) => {
    if (!item) return null;

    const [editData, setEditData] = useState({ ...item });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 leading-tight">Edit Item Detail</h2>
                                <p className="text-slate-500 font-bold text-sm tracking-tight">Configure all properties for <span className="text-indigo-600">#{item.foodId}</span></p>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100">
                                <Plus className="rotate-45 text-slate-400" size={24} />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Basic Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-black text-slate-500 uppercase mb-2 block">Food Name</label>
                                            <input
                                                type="text"
                                                value={editData.foodName}
                                                onChange={(e) => setEditData({ ...editData, foodName: e.target.value })}
                                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none font-bold text-slate-900"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-black text-slate-500 uppercase mb-2 block">Base Price</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                                                    <input
                                                        type="number"
                                                        value={editData.price}
                                                        onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                                                        className="w-full pl-8 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none font-bold text-slate-900"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-black text-slate-500 uppercase mb-2 block">Category</label>
                                                <select
                                                    value={editData.category}
                                                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none font-bold text-slate-900 appearance-none bg-white"
                                                >
                                                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                                        <option key={c.id} value={c.name}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cost & Margin */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Financials</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-black text-slate-500 uppercase mb-2 block">Food Cost</label>
                                                <input
                                                    type="number"
                                                    value={editData.foodCost}
                                                    onChange={(e) => setEditData({ ...editData, foodCost: parseFloat(e.target.value) })}
                                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none font-bold text-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-black text-slate-500 uppercase mb-2 block">Op Cost</label>
                                                <input
                                                    type="number"
                                                    value={editData.opCost}
                                                    onChange={(e) => setEditData({ ...editData, opCost: parseFloat(e.target.value) })}
                                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none font-bold text-slate-900"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex justify-between items-center">
                                            <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Projected Margin</span>
                                            <span className="text-xl font-black text-emerald-600">₹{(editData.price - editData.foodCost - (editData.opCost || 0)).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ingredients Management */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ingredients List</h3>
                                    <button
                                        onClick={() => setEditData({ ...editData, ingredients: [...(editData.ingredients || []), { name: "", quantity: "", unit: "g" }] })}
                                        className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase"
                                    >
                                        <Plus size={14} /> Add Ingredient
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {editData.ingredients?.map((ing, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                            <input
                                                type="text"
                                                value={ing.name}
                                                placeholder="Ingredient Name"
                                                onChange={(e) => {
                                                    const newIngs = [...editData.ingredients];
                                                    newIngs[i].name = e.target.value;
                                                    setEditData({ ...editData, ingredients: newIngs });
                                                }}
                                                className="flex-1 bg-transparent font-bold text-sm text-slate-700 outline-none"
                                            />
                                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                                                <input
                                                    type="text"
                                                    value={ing.quantity}
                                                    onChange={(e) => {
                                                        const newIngs = [...editData.ingredients];
                                                        newIngs[i].quantity = e.target.value;
                                                        setEditData({ ...editData, ingredients: newIngs });
                                                    }}
                                                    className="w-12 text-center font-black text-xs text-slate-900 outline-none"
                                                />
                                                <select
                                                    value={ing.unit}
                                                    onChange={(e) => {
                                                        const newIngs = [...editData.ingredients];
                                                        newIngs[i].unit = e.target.value;
                                                        setEditData({ ...editData, ingredients: newIngs });
                                                    }}
                                                    className="text-[10px] font-black text-slate-400 uppercase bg-transparent outline-none"
                                                >
                                                    <option value="g">g</option>
                                                    <option value="ml">ml</option>
                                                    <option value="pcs">pcs</option>
                                                    <option value="leaves">leaves</option>
                                                </select>
                                            </div>
                                            <button
                                                onClick={() => setEditData({ ...editData, ingredients: editData.ingredients.filter((_, idx) => idx !== i) })}
                                                className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Variants & Addons Management */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Variants */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sizes / Variants</h3>
                                        <button
                                            onClick={() => setEditData({ ...editData, variants: [...(editData.variants || []), { name: "", price: 0 }] })}
                                            className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase"
                                        >
                                            <Plus size={14} /> Add Size
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {editData.variants?.map((v, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                <input
                                                    type="text"
                                                    value={v.name}
                                                    placeholder="Size Name"
                                                    onChange={(e) => {
                                                        const newVariants = [...editData.variants];
                                                        newVariants[i].name = e.target.value;
                                                        setEditData({ ...editData, variants: newVariants });
                                                    }}
                                                    className="flex-1 bg-transparent font-bold text-sm text-slate-700 outline-none"
                                                />
                                                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                                                    <span className="text-[10px] font-black text-slate-400">₹</span>
                                                    <input
                                                        type="number"
                                                        value={v.price}
                                                        onChange={(e) => {
                                                            const newVariants = [...editData.variants];
                                                            newVariants[i].price = parseFloat(e.target.value) || 0;
                                                            setEditData({ ...editData, variants: newVariants });
                                                        }}
                                                        className="w-16 bg-transparent font-black text-sm text-slate-900 outline-none text-right"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => setEditData({ ...editData, variants: editData.variants.filter((_, idx) => idx !== i) })}
                                                    className="p-1 px-2 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 rounded-lg"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Addons */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Addons</h3>
                                        <button
                                            onClick={() => setEditData({ ...editData, addons: [...(editData.addons || []), { name: "", price: 0 }] })}
                                            className="flex items-center gap-1 text-[10px] font-black text-orange-600 uppercase"
                                        >
                                            <Plus size={14} /> Add Addon
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {editData.addons?.map((a, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-orange-400">
                                                <input
                                                    type="text"
                                                    value={a.name}
                                                    placeholder="Addon Name"
                                                    onChange={(e) => {
                                                        const newAddons = [...editData.addons];
                                                        newAddons[i].name = e.target.value;
                                                        setEditData({ ...editData, addons: newAddons });
                                                    }}
                                                    className="flex-1 bg-transparent font-bold text-sm text-slate-700 outline-none"
                                                />
                                                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                                                    <span className="text-[10px] font-black text-slate-400">+₹</span>
                                                    <input
                                                        type="number"
                                                        value={a.price}
                                                        onChange={(e) => {
                                                            const newAddons = [...editData.addons];
                                                            newAddons[i].price = parseFloat(e.target.value) || 0;
                                                            setEditData({ ...editData, addons: newAddons });
                                                        }}
                                                        className="w-12 bg-transparent font-black text-sm text-slate-900 outline-none text-right"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => setEditData({ ...editData, addons: editData.addons.filter((_, idx) => idx !== i) })}
                                                    className="p-1 px-2 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 rounded-lg"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                            <button onClick={onClose} className="px-8 py-3.5 rounded-2xl border border-slate-200 font-black text-sm text-slate-500 hover:bg-white transition-all">
                                Discard Changes
                            </button>
                            <button
                                onClick={() => onSave(editData)}
                                className="px-12 py-3.5 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                            >
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default function EditMenuPage() {
    const [items, setItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [categoryStates, setCategoryStates] = useState(
        CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
    );
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMenuData();
    }, []);

    const fetchMenuData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/menu');
            const result = await res.json();
            if (result.success) {
                setItems(result.data);
                // Set first item as selected by default if we have data and none selected
                if (result.data.length > 0 && !selectedItem) {
                    setSelectedItem(result.data[0]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch menu items:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleActivateCombo = async (combo) => {
        const totalFoodCost = combo.items.reduce((acc, i) => acc + (i.foodCost || 0), 0);
        const totalOpCost = combo.items.reduce((acc, i) => acc + (i.opCost || 0), 0);
        const calculatedMargin = combo.discountedPrice - totalFoodCost - totalOpCost;

        const newComboItem = {
            foodId: `combo_${Date.now()}`,
            foodName: combo.name,
            price: combo.discountedPrice,
            foodCost: totalFoodCost,
            opCost: totalOpCost,
            margin: calculatedMargin,
            category: "Combos",
            dietType: combo.items.some(i => i.dietType === 'non-veg') ? 'non-veg' : 'veg',
            isVeg: !combo.items.some(i => i.dietType === 'non-veg'),
            popularityScore: 100,
            status: true,
            orderHistory: [0, 0, 0],
            ingredients: combo.items.flatMap(i => i.ingredients),
            variants: [{ name: "Standard", price: combo.discountedPrice }],
            addons: combo.items.flatMap(i => i.addons)
        };

        try {
            const res = await fetch('/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComboItem)
            });
            const result = await res.json();
            if (result.success) {
                setItems(prev => [result.data, ...prev]);
                alert(`Strategic Bundle "${combo.name}" has been activated and added to your menu!`);
            }
        } catch (error) {
            console.error("Error saving combo:", error);
            alert("Failed to activate combo in database.");
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.foodName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || item.category === catName(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    function catName(id) {
        if (id === "all") return "All Items";
        return CATEGORIES.find(c => c.id === id)?.name || id;
    }

    const handleToggleStatus = async (item) => {
        const newStatus = !item.status;
        try {
            const res = await fetch('/api/menu', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ foodId: item.foodId, status: newStatus })
            });

            if (res.ok) {
                setItems(prev => prev.map(i =>
                    i.foodId === item.foodId ? { ...i, status: newStatus } : i
                ));
            }
        } catch (error) {
            console.error("Failed to toggle status:", error);
        }
    };

    const activeItem = filteredItems.find(i => i.foodId === selectedItem?.foodId) || (filteredItems.length > 0 ? filteredItems[0] : null);

    const handleSave = async (updatedItem) => {
        try {
            if (isAddingNew) {
                // Ensure it gets a unique ID if it doesn't have one
                const itemToSave = { ...updatedItem, foodId: updatedItem.foodId || `sku_${Date.now()}` };
                const res = await fetch('/api/menu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(itemToSave)
                });
                const result = await res.json();
                if (result.success) {
                    setItems(prev => [...prev, result.data]);
                }
            } else {
                const res = await fetch('/api/menu', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedItem)
                });
                const result = await res.json();
                if (result.success) {
                    setItems(prev => prev.map(i => i.foodId === updatedItem.foodId ? result.data : i));
                }
            }
            setIsEditModalOpen(false);
            setIsAddingNew(false);
        } catch (error) {
            console.error("Failed to save item:", error);
            alert("Error saving your item.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this item?")) {
            try {
                const res = await fetch(`/api/menu?foodId=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setItems(prev => prev.filter(i => i.foodId !== id));
                    if (selectedItem?.foodId === id) setSelectedItem(null);
                }
            } catch (error) {
                console.error("Delete failed:", error);
            }
        }
    };

    const openAddModal = () => {
        setSelectedItem({
            foodName: "",
            price: 0,
            foodCost: 0,
            opCost: 0,
            category: CATEGORIES[1]?.name || "Mains",
            dietType: "veg",
            ingredients: [],
            variants: [],
            addons: []
        });
        setIsAddingNew(true);
        setIsEditModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Menu Management</h1>
                        <p className="text-slate-400 font-medium mt-1">Configure your restaurant's digital menu with AI insights</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={openAddModal}
                            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <Plus size={20} /> Add New Item
                        </button>
                    </div>
                </div>

                {/* Strategic AI Bundles */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="bg-orange-500 p-1.5 rounded-lg shadow-lg shadow-orange-100">
                                <Zap className="text-white w-4 h-4" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Strategic AI Bundles</h2>
                        </div>
                        <Badge variant="outline" className="border-orange-100 text-orange-600 font-black text-[10px] uppercase tracking-widest bg-orange-50 py-1">Optimized for Profit</Badge>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-4 px-2 custom-scrollbar snap-x">
                        {Object.values(STRATEGIC_COMBOS).flat().map((combo, idx) => (
                            <motion.div
                                key={combo.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="min-w-[380px] flex-shrink-0 bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-premium transition-all group snap-start relative overflow-hidden"
                            >


                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <Badge className="bg-slate-900 text-white border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                                            {combo.strategy}
                                        </Badge>
                                        <h3 className="text-lg font-black text-slate-900">{combo.name}</h3>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-2xl text-xs font-black">
                                        -{combo.discount}%
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {combo.items.map((item, i) => (
                                        <div key={item.foodId} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg">
                                                {item.category === 'Beverage' ? '🥤' : item.category === 'Dessert' ? '🍰' : '🍔'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{item.foodName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-black text-slate-900">₹{combo.discountedPrice}</span>
                                            <span className="text-xs font-bold text-slate-400 line-through">₹{combo.basePrice}</span>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Combo Margin</p>
                                        <p className="text-lg font-black text-emerald-600">+₹{combo.newMargin}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleActivateCombo(combo)}
                                    className="w-full mt-4 py-3 bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                                >
                                    Click to Activate Bundle
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8 items-start">
                    {/* Left Sidebar: Categories */}
                    <div className="col-span-12 lg:col-span-3 space-y-4">
                        <div className="glass rounded-[32px] border border-slate-200/50 p-6 shadow-premium">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <LayoutGrid size={20} /> Categories
                            </h2>
                            <div className="space-y-2">
                                {CATEGORIES.map(cat => {
                                    const Icon = iconMap[cat.icon] || LayoutGrid;
                                    const isActive = selectedCategory === cat.id;
                                    return (
                                        <div
                                            key={cat.id}
                                            className={`group flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${isActive ? 'bg-slate-900 shadow-xl' : 'hover:bg-slate-50'}`}
                                            onClick={() => setSelectedCategory(cat.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white'}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-600'}`}>{cat.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Items Table */}
                    <div className="col-span-12 lg:col-span-9 space-y-6">
                        {/* Search & Bulk Edit */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="flex-1 relative w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search your items by name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none font-medium transition-all shadow-sm"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none px-6 py-3.5 bg-white rounded-2xl border border-slate-200 font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                                    <Filter size={18} /> Advanced
                                </button>
                                <button
                                    onClick={openAddModal}
                                    className="flex-1 sm:flex-none px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
                                >
                                    <Plus size={18} /> New Item
                                </button>
                            </div>
                        </div>

                        {/* Items Table Container */}
                        <div className="glass rounded-[32px] border border-slate-200/50 shadow-premium overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Price</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Margin</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Op Cost</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Mark as</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <AnimatePresence mode="popLayout">
                                            {filteredItems.map((item) => {
                                                const isSelected = activeItem?.foodId === item.foodId;
                                                return (
                                                    <motion.tr
                                                        layout
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        key={item.foodId}
                                                        className={`group cursor-pointer transition-all ${isSelected ? 'bg-slate-100/50' : 'hover:bg-slate-50/50'}`}
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                        }}
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-slate-900' : 'border-slate-200 hover:border-slate-400'}`}>
                                                                    <div className={`w-2.5 h-2.5 rounded-full transition-all ${isSelected ? 'bg-slate-900' : 'bg-emerald-500 shadow-sm shadow-emerald-200'}`} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-bold text-slate-900">{item.foodName}</span>
                                                                    <DietBadge type={item.dietType} />
                                                                </div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.foodId}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="font-black text-slate-900">₹{item.price?.toFixed(2)}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="font-bold text-emerald-600">₹{item.margin?.toFixed(2)}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="font-bold text-slate-500">₹{item.opCost?.toFixed(2)}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-end gap-3">
                                                                <div className="flex items-center gap-2 mr-2">
                                                                    <span className={`text-[9px] font-black uppercase tracking-tighter ${item.status ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                                        {item.status ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                    <Toggle
                                                                        active={item.status}
                                                                        onChange={(e) => {
                                                                            e.stopPropagation();
                                                                            handleToggleStatus(item.foodId);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(item.foodId);
                                                                    }}
                                                                    className="p-2 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Trash2 size={16} className="text-slate-400 hover:text-rose-500" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedItem(item);
                                                                        setIsAddingNew(false);
                                                                        setIsEditModalOpen(true);
                                                                    }}
                                                                    className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Edit3 size={16} className="text-slate-400 hover:text-slate-900" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <EditItemModal
                item={selectedItem}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
            />
        </DashboardLayout >
    );
}
