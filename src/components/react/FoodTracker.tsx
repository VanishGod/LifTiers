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
  quantity: number; // en gramos o ml
  unit: string;
  nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
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
  'Otros': 'bg-gray-100 text-gray-700',
};

// ============================================================
// FUNCIÓN PARA CALCULAR NUTRIENTES SEGÚN CANTIDAD
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
  const [toast, setToast] = useState<{ message: string; color: string } | null>(null);

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

  // ============ AÑADIR A LA COMIDA ============
  const handleAddToMeal = () => {
    if (!selectedFood || quantity <= 0) {
      setToast({ message: 'Selecciona un alimento y una cantidad válida', color: 'error' });
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
    setToast({ message: `${selectedFood.name} añadido a la comida`, color: 'success' });
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
        const food = foodData.find((f: FoodItem) => f.id === entry.foodId) as FoodItem;
        const nutrients = calculateNutrients(food, newQuantity);
        return { ...entry, quantity: newQuantity, nutrients };
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
      setToast({ message: 'Añade al menos un alimento a la comida', color: 'error' });
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
    setToast({ message: `¡Comida registrada! (${mealTotal.calories} kcal)`, color: 'success' });
  };

  // ============ ELIMINAR COMIDA DEL HISTORIAL ============
  const handleDeleteMeal = (id: string) => {
    setMealHistory(mealHistory.filter(meal => meal.id !== id));
    setToast({ message: 'Comida eliminada del historial', color: 'info' });
  };

  // ============ MOSTRAR TOAST ============
  const showToast = (message: string, color: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  };

  // ============ RENDER ============
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* ====== HEADER ====== */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🍽️ FoodTracker
        </h1>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showHistory ? '📝 Registrar comida' : '📊 Historial'}
        </button>
      </div>

      {/* ====== TOAST ====== */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg transition-all ${
          toast.color === 'success' ? 'bg-green-500 text-white' :
          toast.color === 'error' ? 'bg-red-500 text-white' :
          toast.color === 'warning' ? 'bg-yellow-500 text-white' :
          'bg-gray-800 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* ====== HISTORIAL ====== */}
      {showHistory ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">📊 Historial de comidas</h2>
          {mealHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
              <p className="text-lg">No hay comidas registradas</p>
              <p className="text-sm">Registra tu primera comida para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-500px overflow-y-auto">
              {mealHistory.map((meal) => (
                <div key={meal.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{meal.name}</h3>
                      <p className="text-xs text-gray-400">
                        {new Date(meal.date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
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
                  <div className="flex flex-wrap gap-2 mt-2">
                    {meal.entries.map((entry, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {entry.foodName} ({entry.quantity}g)
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>🔥 {meal.totalNutrients.calories} kcal</span>
                    <span>💪 {meal.totalNutrients.protein}g</span>
                    <span>🍞 {meal.totalNutrients.carbs}g</span>
                    <span>🧈 {meal.totalNutrients.fat}g</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ====== REGISTRO DE COMIDA ====== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ====== COLUMNA 1: BUSCADOR ====== */}
          <div className="lg:col-span-2 space-y-4">
            {/* Buscador */}
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar alimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Lista de alimentos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-400px overflow-y-auto">
              {filteredFoods.map((food: FoodItem) => (
                <div
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedFood?.id === food.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{categoryEmojis[food.category] || '🍽️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{food.name}</p>
                      {food.brand && <p className="text-xs text-gray-400">{food.brand}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[food.category] || 'bg-gray-100 text-gray-700'}`}>
                      {food.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {food.nutrients.per100g.calories} kcal/100g
                    </span>
                  </div>
                </div>
              ))}
              {filteredFoods.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  No se encontraron alimentos
                </div>
              )}
            </div>
          </div>

          {/* ====== COLUMNA 2: DETALLE Y CANTIDAD ====== */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">Seleccionado</h3>
              {selectedFood ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{categoryEmojis[selectedFood.category] || '🍽️'}</span>
                    <div>
                      <p className="font-medium text-gray-800">{selectedFood.name}</p>
                      <p className="text-xs text-gray-400">{selectedFood.category}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 text-xs bg-gray-50 p-2 rounded-lg">
                    <span>🔥 {selectedFood.nutrients.per100g.calories} kcal</span>
                    <span>💪 {selectedFood.nutrients.per100g.protein}g</span>
                    <span>🍞 {selectedFood.nutrients.per100g.carbs}g</span>
                    <span>🧈 {selectedFood.nutrients.per100g.fat}g</span>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Cantidad (g)</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="5"
                    />
                    {quantity > 0 && selectedFood && (
                      <div className="mt-2 text-xs text-gray-500">
                        {(() => {
                          const nutrients = calculateNutrients(selectedFood, quantity);
                          return `${nutrients.calories} kcal | ${nutrients.protein}g P | ${nutrients.carbs}g C | ${nutrients.fat}g G`;
                        })()}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleAddToMeal}
                    className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    + Añadir a la comida
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Selecciona un alimento de la lista
                </div>
              )}
            </div>

            {/* ====== RESUMEN DE LA COMIDA ====== */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">🍽️ Comida actual</h3>
                <span className="text-sm text-gray-400">{currentMealEntries.length} items</span>
              </div>

              {currentMealEntries.length > 0 ? (
                <div className="space-y-2 max-h-200px overflow-y-auto">
                  {currentMealEntries.map((entry) => {
                    const food = foodData.find((f: FoodItem) => f.id === entry.foodId) as FoodItem;
                    return (
                      <div key={entry.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg text-sm">
                        <span className="text-lg">{categoryEmojis[entry.category] || '🍽️'}</span>
                        <span className="flex-1 font-medium truncate">{entry.foodName}</span>
                        <input
                          type="number"
                          value={entry.quantity}
                          onChange={(e) => handleUpdateEntryQuantity(entry.id, Number(e.target.value))}
                          className="w-16 px-1 py-0.5 border border-gray-300 rounded text-center text-sm"
                          min="1"
                          step="5"
                        />
                        <span className="text-xs text-gray-400">g</span>
                        <span className="text-xs font-medium w-16 text-right">{entry.nutrients.calories} kcal</span>
                        <button
                          onClick={() => handleRemoveEntry(entry.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No hay alimentos añadidos
                </div>
              )}

              {currentMealEntries.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Nombre de la comida (opcional)"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-blue-600">
                      {mealTotal.calories} kcal
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setCurrentMealEntries([]); setMealName(''); }}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
                      >
                        Limpiar
                      </button>
                      <button
                        onClick={handleSaveMeal}
                        className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Registrar comida ✅
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