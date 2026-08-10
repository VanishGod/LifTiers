// components/FoodTracker.tsx
import { useState, useMemo, useEffect } from 'react';
import foodData from '../../foods.json';

// ============================================================
// TIPOS
// ============================================================

interface FoodItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  nutrients: {
    per100g: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sugar: number;
    };
    perServing: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sugar: number;
      servingSize: number;
      servingUnit: string;
    };
  };
}

interface FoodEntry {
  id: string;
  foodId: string;
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  isCustom?: boolean;
}

interface Meal {
  id: string;
  name: string;
  date: string;
  entries: FoodEntry[];
  totalNutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
}

// ============================================================
// EMOJIS POR CATEGORÍA
// ============================================================

const categoryEmojis: Record<string, string> = {
  'Frutas': '🍎',
  'Verduras': '🥬',
  'Carnes': '🥩',
  'Pescados': '🐟',
  'Lácteos y Huevos': '🥛',
  'Cereales y Legumbres': '🌾',
  'Frutos Secos': '🥜',
  'Aceites y Grasas': '🫒',
  'Bebidas': '🥤',
  'Snacks': '🍿',
  'Dulces': '🍫',
  'Condimentos': '🧂',
  'Suplementos': '💊',
  'Platos preparados': '🍽️',
  'Personalizado': '✏️',
  'Otros': '🍽️',
};

const categoryColors: Record<string, string> = {
  'Frutas': 'bg-red-100 text-red-700',
  'Verduras': 'bg-green-100 text-green-700',
  'Carnes': 'bg-rose-100 text-rose-700',
  'Pescados': 'bg-blue-100 text-blue-700',
  'Lácteos y Huevos': 'bg-yellow-100 text-yellow-700',
  'Cereales y Legumbres': 'bg-amber-100 text-amber-700',
  'Frutos Secos': 'bg-orange-100 text-orange-700',
  'Aceites y Grasas': 'bg-lime-100 text-lime-700',
  'Bebidas': 'bg-cyan-100 text-cyan-700',
  'Snacks': 'bg-purple-100 text-purple-700',
  'Dulces': 'bg-pink-100 text-pink-700',
  'Condimentos': 'bg-gray-100 text-gray-700',
  'Suplementos': 'bg-indigo-100 text-indigo-700',
  'Platos preparados': 'bg-teal-100 text-teal-700',
  'Personalizado': 'bg-teal-100 text-teal-700',
  'Otros': 'bg-gray-100 text-gray-700',
};

const customCategories = [
  'Personalizado',
  'Frutas',
  'Verduras',
  'Carnes',
  'Pescados',
  'Lácteos y Huevos',
  'Cereales y Legumbres',
  'Frutos Secos',
  'Aceites y Grasas',
  'Bebidas',
  'Snacks',
  'Dulces',
  'Condimentos',
  'Suplementos',
  'Platos preparados',
  'Otros',
];

// ============================================================
// FUNCIÓN PARA CALCULAR NUTRIENTES
// ============================================================

const calculateNutrients = (food: FoodItem, quantity: number) => {
  const factor = quantity / 100;
  const per100g = food.nutrients.per100g;
  
  return {
    calories: Math.round(per100g.calories * factor),
    protein: Math.round(per100g.protein * factor * 10) / 10,
    carbs: Math.round(per100g.carbs * factor * 10) / 10,
    fat: Math.round(per100g.fat * factor * 10) / 10,
    fiber: Math.round(per100g.fiber * factor * 10) / 10,
    sugar: Math.round(per100g.sugar * factor * 10) / 10,
  };
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export const FoodTracker = () => {
  // ============ ESTADOS ============
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [currentMealEntries, setCurrentMealEntries] = useState<FoodEntry[]>([]);
  const [mealName, setMealName] = useState('');
  const [mealHistory, setMealHistory] = useState<Meal[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState<{ message: string; color: 'success' | 'error' | 'warning' | 'info' | 'default'; duration?: number } | null>(null);
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    category: 'Personalizado',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
  });

  // ============ CARGAR HISTORIAL DEL LOCALSTORAGE ============
  useEffect(() => {
    const saved = localStorage.getItem('mealHistory');
    if (saved) {
      try {
        setMealHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  // ============ GUARDAR HISTORIAL EN LOCALSTORAGE ============
  useEffect(() => {
    localStorage.setItem('mealHistory', JSON.stringify(mealHistory));
  }, [mealHistory]);

  // ============ FILTRAR ALIMENTOS ============
  const filteredFoods = useMemo(() => {
    return foodData.filter((food: FoodItem) => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || food.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // ============ OBTENER CATEGORÍAS ÚNICAS ============
  const categories = useMemo(() => {
    const unique = new Set(foodData.map((f: FoodItem) => f.category));
    return Array.from(unique).sort();
  }, []);

  // ============ TOAST CON TIMEOUT ============
  const showToast = (message: string, color: 'success' | 'error' | 'warning' | 'info' | 'default' = 'default', duration: number = 3000) => {
    setToast({ message, color, duration });
    setTimeout(() => setToast(null), duration);
  };

  // ============ AÑADIR A LA COMIDA ============
  const handleAddToMeal = () => {
    if (!selectedFood || quantity <= 0) {
      showToast('Selecciona un alimento y una cantidad válida', 'error', 3000);
      return;
    }

    const nutrients = calculateNutrients(selectedFood, quantity);
    
    const entry: FoodEntry = {
      id: `entry-${Date.now()}`,
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      category: selectedFood.category,
      quantity: quantity,
      unit: 'g',
      nutrients,
    };

    setCurrentMealEntries([...currentMealEntries, entry]);
    setSelectedFood(null);
    setQuantity(100);
    showToast(`${selectedFood.name} añadido a la comida`, 'success', 2500);
  };

  // ============ AÑADIR COMIDA PERSONALIZADA ============
  const handleAddCustomFoodToMeal = () => {
    if (!customFood.name.trim()) {
      showToast('Introduce un nombre para el alimento', 'error', 3000);
      return;
    }

    if (customFood.calories < 0) {
      showToast('Las calorías no pueden ser negativas', 'error', 3000);
      return;
    }

    const entry: FoodEntry = {
      id: `entry-${Date.now()}`,
      foodId: `custom-${Date.now()}`,
      foodName: customFood.name,
      category: customFood.category,
      quantity: 100,
      unit: 'g',
      nutrients: {
        calories: customFood.calories,
        protein: customFood.protein,
        carbs: customFood.carbs,
        fat: customFood.fat,
        fiber: customFood.fiber || 0,
        sugar: customFood.sugar || 0,
      },
      isCustom: true,
    };

    setCurrentMealEntries([...currentMealEntries, entry]);
    setCustomFood({
      name: '',
      category: 'Personalizado',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    });
    setShowCustomFoodForm(false);
    showToast(`"${entry.foodName}" añadido a la comida`, 'success', 2500);
  };

  // ============ ELIMINAR ENTRY ============
  const handleRemoveEntry = (id: string) => {
    setCurrentMealEntries(currentMealEntries.filter(e => e.id !== id));
  };

  // ============ ACTUALIZAR CANTIDAD DE UN ENTRY ============
  const handleUpdateEntryQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    setCurrentMealEntries(currentMealEntries.map(entry => {
      if (entry.id === id) {
        if (entry.isCustom) {
          const factor = newQuantity / 100;
          return {
            ...entry,
            quantity: newQuantity,
            nutrients: {
              calories: Math.round(entry.nutrients.calories * factor),
              protein: Math.round(entry.nutrients.protein * factor * 10) / 10,
              carbs: Math.round(entry.nutrients.carbs * factor * 10) / 10,
              fat: Math.round(entry.nutrients.fat * factor * 10) / 10,
              fiber: Math.round(entry.nutrients.fiber * factor * 10) / 10,
              sugar: Math.round(entry.nutrients.sugar * factor * 10) / 10,
            }
          };
        } else {
          const food = foodData.find((f: FoodItem) => f.id === entry.foodId) as FoodItem;
          const nutrients = calculateNutrients(food, newQuantity);
          return { ...entry, quantity: newQuantity, nutrients };
        }
      }
      return entry;
    }));
  };

  // ============ CALCULAR TOTAL DE LA COMIDA ============
  const mealTotal = useMemo(() => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    };
    
    currentMealEntries.forEach(entry => {
      totals.calories += entry.nutrients.calories;
      totals.protein += entry.nutrients.protein;
      totals.carbs += entry.nutrients.carbs;
      totals.fat += entry.nutrients.fat;
      totals.fiber += entry.nutrients.fiber;
      totals.sugar += entry.nutrients.sugar;
    });
    
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
      sugar: Math.round(totals.sugar * 10) / 10,
    };
  }, [currentMealEntries]);

  // ============ REGISTRAR COMIDA ============
  const handleSaveMeal = () => {
    if (currentMealEntries.length === 0) {
      showToast('Añade al menos un alimento a la comida', 'error', 3000);
      return;
    }

    const meal: Meal = {
      id: `meal-${Date.now()}`,
      name: mealName.trim() || `Comida ${mealHistory.length + 1}`,
      date: new Date().toISOString(),
      entries: [...currentMealEntries],
      totalNutrients: { ...mealTotal },
    };

    setMealHistory([meal, ...mealHistory]);
    setCurrentMealEntries([]);
    setMealName('');
    showToast(`¡Comida registrada! (${mealTotal.calories} kcal)`, 'success', 3500);
  };

  // ============ ELIMINAR COMIDA DEL HISTORIAL ============
  const handleDeleteMeal = (id: string) => {
    setMealHistory(mealHistory.filter(meal => meal.id !== id));
    showToast('Comida eliminada del historial', 'info', 2500);
  };

  // ============ RENDER ============
  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
      {/* ====== HEADER ====== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          🍽️ FoodTracker
        </h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowCustomFoodForm(!showCustomFoodForm)}
            className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            ✏️ Personalizado
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            {showHistory ? '📝 Registrar comida' : '📊 Historial'}
          </button>
        </div>
      </div>

      {/* ====== TOAST ====== */}
      {toast && (
        <div className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-lg transition-all max-w-[90vw] sm:max-w-md text-center ${
          toast.color === 'success' ? 'bg-green-500 text-white' :
          toast.color === 'error' ? 'bg-red-500 text-white' :
          toast.color === 'warning' ? 'bg-yellow-500 text-white' :
          toast.color === 'info' ? 'bg-blue-500 text-white' :
          'bg-gray-800 text-white'
        }`}>
          <span className="text-sm sm:text-base">{toast.message}</span>
        </div>
      )}

      {/* ====== FORMULARIO COMIDA PERSONALIZADA ====== */}
      {showCustomFoodForm && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 sm:p-4">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <h3 className="font-semibold text-teal-800 text-sm sm:text-base">✏️ Crear alimento personalizado</h3>
            <button
              onClick={() => setShowCustomFoodForm(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] sm:text-xs text-gray-600 block mb-0.5">Nombre *</label>
              <input
                type="text"
                value={customFood.name}
                onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                placeholder="Ej. Batido"
                className="w-full px-2 py-1.5 sm:px-3 sm:py-1.5 border border-teal-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs text-gray-600 block mb-0.5">Categoría</label>
              <select
                value={customFood.category}
                onChange={(e) => setCustomFood({ ...customFood, category: e.target.value })}
                className="w-full px-2 py-1.5 sm:px-3 sm:py-1.5 border border-teal-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {customCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] sm:text-xs text-gray-600 block mb-0.5">Calorías</label>
              <input
                type="number"
                value={customFood.calories}
                onChange={(e) => setCustomFood({ ...customFood, calories: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-2 py-1.5 sm:px-3 sm:py-1.5 border border-teal-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs text-gray-600 block mb-0.5">Proteínas</label>
              <input
                type="number"
                value={customFood.protein}
                onChange={(e) => setCustomFood({ ...customFood, protein: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-2 py-1.5 sm:px-3 sm:py-1.5 border border-teal-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs text-gray-600 block mb-0.5">Carbohidratos</label>
              <input
                type="number"
                value={customFood.carbs}
                onChange={(e) => setCustomFood({ ...customFood, carbs: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-2 py-1.5 sm:px-3 sm:py-1.5 border border-teal-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs text-gray-600 block mb-0.5">Grasas</label>
              <input
                type="number"
                value={customFood.fat}
                onChange={(e) => setCustomFood({ ...customFood, fat: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-2 py-1.5 sm:px-3 sm:py-1.5 border border-teal-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs text-gray-600 block mb-0.5">Fibra</label>
              <input
                type="number"
                value={customFood.fiber}
                onChange={(e) => setCustomFood({ ...customFood, fiber: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-2 py-1.5 sm:px-3 sm:py-1.5 border border-teal-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs text-gray-600 block mb-0.5">Azúcar</label>
              <input
                type="number"
                value={customFood.sugar}
                onChange={(e) => setCustomFood({ ...customFood, sugar: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-2 py-1.5 sm:px-3 sm:py-1.5 border border-teal-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                step="0.1"
              />
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-end">
              <button
                onClick={handleAddCustomFoodToMeal}
                className="w-full py-1.5 sm:py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors text-xs sm:text-sm"
              >
                + Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== HISTORIAL ====== */}
      {showHistory ? (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">📊 Historial de comidas</h2>
          {mealHistory.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500 bg-gray-50 rounded-xl">
              <p className="text-base sm:text-lg">No hay comidas registradas</p>
              <p className="text-xs sm:text-sm">Registra tu primera comida para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-400px sm:max-h-500px overflow-y-auto">
              {mealHistory.map((meal) => (
                <div key={meal.id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{meal.name}</h3>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        {new Date(meal.date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-sm font-bold text-blue-600">
                        {meal.totalNutrients.calories} kcal
                      </span>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                    {meal.entries.map((entry, idx) => (
                      <span key={idx} className={`text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded ${entry.isCustom ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700'}`}>
                        {entry.foodName} ({entry.quantity}g) {entry.isCustom && '✏️'}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 text-[10px] sm:text-xs text-gray-500">
                    <span>🔥 {meal.totalNutrients.calories} kcal</span>
                    <span>💪 {meal.totalNutrients.protein}g de proteina</span>
                    <span>🍞 {meal.totalNutrients.carbs}g de carbohidratos</span>
                    <span>🧈 {meal.totalNutrients.fat}g de grasas</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ====== REGISTRO DE COMIDA ====== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* ====== COLUMNA 1: BUSCADOR ====== */}
          <div className="lg:col-span-2 space-y-4">
            {/* Buscador */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar alimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Lista de alimentos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-350px sm:max-h-400px overflow-y-auto">
              {filteredFoods.map((food: FoodItem) => (
                <div
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className={`p-2.5 sm:p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedFood?.id === food.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">{categoryEmojis[food.category] || '🍽️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">{food.name}</p>
                      {food.brand && <p className="text-[10px] sm:text-xs text-gray-400 truncate">{food.brand}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`text-[8px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full ${categoryColors[food.category] || 'bg-gray-100 text-gray-700'}`}>
                      {food.category}
                    </span>
                    <span className="text-[8px] sm:text-xs text-gray-400">
                      {food.nutrients.per100g.calories} kcal/100g
                    </span>
                  </div>
                </div>
              ))}
              {filteredFoods.length === 0 && (
                <div className="col-span-2 text-center py-6 sm:py-8 text-gray-500 text-sm">
                  No se encontraron alimentos
                </div>
              )}
            </div>
          </div>

          {/* ====== COLUMNA 2: DETALLE Y CANTIDAD ====== */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 text-sm sm:text-base mb-3">Seleccionado</h3>
              {selectedFood ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl">{categoryEmojis[selectedFood.category] || '🍽️'}</span>
                    <div>
                      <p className="font-medium text-gray-800 text-sm sm:text-base">{selectedFood.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">{selectedFood.category}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1 text-[10px] sm:text-xs bg-gray-50 p-2 rounded-lg">
                    <span>🔥 {selectedFood.nutrients.per100g.calories} kcal</span>
                    <span>💪 {selectedFood.nutrients.per100g.protein}g</span>
                    <span>🍞 {selectedFood.nutrients.per100g.carbs}g</span>
                    <span>🧈 {selectedFood.nutrients.per100g.fat}g</span>
                    <span>🌾 {selectedFood.nutrients.per100g.fiber}g</span>
                    <span>🍬 {selectedFood.nutrients.per100g.sugar}g</span>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm text-gray-600 block mb-1">Cantidad (g)</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="5"
                    />
                    {quantity > 0 && selectedFood && (
                      <div className="mt-2 text-[10px] sm:text-xs text-gray-500">
                        {(() => {
                          const nutrients = calculateNutrients(selectedFood, quantity);
                          return `${nutrients.calories} kcal | ${nutrients.protein}g P | ${nutrients.carbs}g C | ${nutrients.fat}g G`;
                        })()}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleAddToMeal}
                    className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    + Añadir a la comida
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-400 text-xs sm:text-sm">
                  Selecciona un alimento de la lista<br/>
                  <span className="text-[10px]">o usa "Personalizado" para crear uno</span>
                </div>
              )}
            </div>

            {/* ====== RESUMEN DE LA COMIDA ====== */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700 text-sm sm:text-base">🍽️ Comida actual</h3>
                <span className="text-xs sm:text-sm text-gray-400">{currentMealEntries.length} items</span>
              </div>

              {currentMealEntries.length > 0 ? (
                <div className="space-y-2 max-h-180px sm:max-h-200px overflow-y-auto">
                  {currentMealEntries.map((entry) => (
                    <div key={entry.id} className={`flex flex-wrap items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm ${entry.isCustom ? 'bg-teal-50' : 'bg-gray-50'}`}>
                      <span className="text-base sm:text-lg">{categoryEmojis[entry.category] || '🍽️'}</span>
                      <span className="flex-1 font-medium truncate text-xs sm:text-sm">
                        {entry.foodName}
                        {entry.isCustom && <span className="text-[10px] text-teal-500 ml-0.5">✏️</span>}
                      </span>
                      <input
                        type="number"
                        value={entry.quantity}
                        onChange={(e) => handleUpdateEntryQuantity(entry.id, Number(e.target.value))}
                        className="w-12 sm:w-16 px-1 py-0.5 border border-gray-300 rounded text-center text-xs sm:text-sm"
                        min="1"
                        step="5"
                      />
                      <span className="text-[10px] sm:text-xs text-gray-400">g</span>
                      <span className="text-[10px] sm:text-xs font-medium w-12 sm:w-16 text-right">{entry.nutrients.calories} kcal</span>
                      <button
                        onClick={() => handleRemoveEntry(entry.id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 sm:py-4 text-gray-400 text-xs sm:text-sm">
                  No hay alimentos añadidos
                </div>
              )}

              {currentMealEntries.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Nombre de la comida (opcional)"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
                    <div className="text-sm font-medium text-blue-600 text-center sm:text-left">
                      {mealTotal.calories} kcal
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setCurrentMealEntries([]); setMealName(''); }}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
                      >
                        Limpiar
                      </button>
                      <button
                        onClick={handleSaveMeal}
                        className="flex-1 sm:flex-none px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Registrar ✅
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodTracker;