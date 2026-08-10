// components/react/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Routines as RoutinesComponent } from './Routines';

interface WorkoutSet {
  exerciseName?: string;
  actualReps?: number;
  [key: string]: unknown;
}

interface Workout {
  id: string;
  name: string;
  date: string;
  exercises?: WorkoutSet[];
  [key: string]: unknown;
}

interface WorkoutStorage {
  state?: {
    workouts?: Workout[];
    personalRecords?: unknown[];
  };
}

interface FavoriteItem {
  name: string;
  count: number;
}

export const Dashboard = () => {
  const [streakDays, setStreakDays] = useState(0);
  const [monthWorkouts, setMonthWorkouts] = useState(0);
  const [totalPRs, setTotalPRs] = useState(0);
  const [favoriteExercise, setFavoriteExercise] = useState<FavoriteItem | null>(null);
  const [favoriteMuscleGroup, setFavoriteMuscleGroup] = useState<FavoriteItem | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [showAll, setShowAll] = useState(false);

  // ============================================
  // FUNCIONES DE CÁLCULO
  // ============================================

  const calculateStreak = (workouts: Workout[]): number => {
    if (!workouts || workouts.length === 0) return 0;

    const sorted = [...workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStr = today.toDateString();
    const hasToday = sorted.some((w) => new Date(w.date).toDateString() === todayStr);

    if (!hasToday) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const hasYesterday = sorted.some(
        (w) => new Date(w.date).toDateString() === yesterday.toDateString()
      );
      if (!hasYesterday) return 0;
    }

    for (let i = 0; i < sorted.length; i++) {
      const workoutDate = new Date(sorted[i].date);
      workoutDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (workoutDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getMonthWorkouts = (workouts: Workout[]): number => {
    if (!workouts || workouts.length === 0) return 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return workouts.filter((w) => {
      const date = new Date(w.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
  };

  const getFavoriteExercise = (workouts: Workout[]): FavoriteItem | null => {
    if (!workouts || workouts.length === 0) return null;

    const exerciseCount: Record<string, number> = {};

    workouts.forEach((workout) => {
      if (workout.exercises && Array.isArray(workout.exercises)) {
        workout.exercises.forEach((set) => {
          const name = set.exerciseName;
          if (name && typeof name === 'string') {
            exerciseCount[name] = (exerciseCount[name] || 0) + 1;
          }
        });
      }
    });

    let favorite: FavoriteItem | null = null;
    let maxCount = 0;

    for (const [name, count] of Object.entries(exerciseCount)) {
      if (count > maxCount) {
        maxCount = count;
        favorite = { name, count };
      }
    }

    return favorite;
  };

  const getFavoriteMuscleGroup = (workouts: Workout[]): FavoriteItem | null => {
    if (!workouts || workouts.length === 0) return null;

    const muscleMap: Record<string, string> = {
      'press': 'Pecho',
      'bench': 'Pecho',
      'pecho': 'Pecho',
      'squat': 'Piernas',
      'sentadilla': 'Piernas',
      'peso muerto': 'Espalda',
      'deadlift': 'Espalda',
      'remo': 'Espalda',
      'row': 'Espalda',
      'pull': 'Espalda',
      'dominada': 'Espalda',
      'pull-up': 'Espalda',
      'curl': 'Bíceps',
      'bíceps': 'Bíceps',
      'tríceps': 'Tríceps',
      'triceps': 'Tríceps',
      'pushdown': 'Tríceps',
      'press militar': 'Hombros',
      'shoulder': 'Hombros',
      'hombro': 'Hombros',
      'elevación': 'Hombros',
      'lateral': 'Hombros',
      'abdominal': 'Abdomen',
      'crunch': 'Abdomen',
      'plancha': 'Abdomen',
      'pierna': 'Piernas',
      'leg': 'Piernas',
      'pantorrilla': 'Piernas',
      'calf': 'Piernas',
    };

    const muscleCount: Record<string, number> = {};

    workouts.forEach((workout) => {
      if (workout.exercises && Array.isArray(workout.exercises)) {
        workout.exercises.forEach((set) => {
          const name = (set.exerciseName || '').toLowerCase();
          let assigned = false;

          for (const [key, muscle] of Object.entries(muscleMap)) {
            if (name.includes(key)) {
              muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;
              assigned = true;
              break;
            }
          }

          if (!assigned && name) {
            muscleCount['Otros'] = (muscleCount['Otros'] || 0) + 1;
          }
        });
      }
    });

    let favorite: FavoriteItem | null = null;
    let maxCount = 0;

    for (const [name, count] of Object.entries(muscleCount)) {
      if (count > maxCount) {
        maxCount = count;
        favorite = { name, count };
      }
    }

    return favorite;
  };

  // ============================================
  // CARGA DE DATOS
  // ============================================

  useEffect(() => {
    const loadData = () => {
      try {
        const workoutStorage = localStorage.getItem('workout-storage');
        let workouts: Workout[] = [];
        let personalRecords: unknown[] = [];

        if (workoutStorage) {
          const parsed = JSON.parse(workoutStorage) as WorkoutStorage;
          workouts = parsed.state?.workouts || [];
          personalRecords = parsed.state?.personalRecords || [];
        }

        setStreakDays(calculateStreak(workouts));
        setMonthWorkouts(getMonthWorkouts(workouts));
        setTotalPRs(personalRecords.length);
        setFavoriteExercise(getFavoriteExercise(workouts));
        setFavoriteMuscleGroup(getFavoriteMuscleGroup(workouts));

        // Últimos entrenamientos (ordenados por fecha)
        const sorted = [...workouts].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRecentWorkouts(sorted);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();

    // Escuchar cambios en localStorage (cuando se guardan entrenamientos)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'workout-storage') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ============================================
  // RENDER
  // ============================================

  const displayedWorkouts = showAll ? recentWorkouts : recentWorkouts.slice(0, 5);
  const hasMore = recentWorkouts.length > 5;

  return (
    <div className="container mx-auto px-4">
      {/* ====== VERSIÓN DE LA APP ====== */}
      <div className="pt-2">
        <p className="text-right text-[30px] p-2.5 text-gray-400 font-mono">Open Beta 0.3</p>
      </div>

      {/* ====== HERO SECTION ====== */}
      <div className="bg-linear-to-r from-blue-500 to-blue-600 text-white py-8 md:py-12 mb-6 rounded-xl">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">💪 Bienvenido a LifTiers</h1>
          <p className="text-blue-100 text-sm md:text-lg max-w-2xl mx-auto">
            Gestiona tus rutinas, registra tus entrenamientos y mejora tu rendimiento
          </p>
        </div>
      </div>

      {/* ====== ACCIONES RÁPIDAS ====== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <a
          href="/routines"
          className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all text-center"
        >
          <div className="text-2xl md:text-3xl mb-1 md:mb-2">📋</div>
          <h3 className="font-semibold text-gray-800 text-xs md:text-sm">Mis Rutinas</h3>
        </a>
        <a
          href="/workout"
          className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 transition-all text-center"
        >
          <div className="text-2xl md:text-3xl mb-1 md:mb-2">🏋️</div>
          <h3 className="font-semibold text-gray-800 text-xs md:text-sm">Entrenar</h3>
        </a>
        <a
          href="/exercises"
          className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all text-center"
        >
          <div className="text-2xl md:text-3xl mb-1 md:mb-2">📚</div>
          <h3 className="font-semibold text-gray-800 text-xs md:text-sm">Ejercicios</h3>
        </a>
      </div>

      {/* ====== SECCIÓN DE ESTADÍSTICAS ====== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-2xl md:text-3xl mb-1">🔥</div>
          <p className="text-xl md:text-2xl font-bold text-orange-500">{streakDays}</p>
          <p className="text-xs text-gray-500">días de racha</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-2xl md:text-3xl mb-1">📏</div>
          <p className="text-xl md:text-2xl font-bold text-blue-500">--</p>
          <p className="text-xs text-gray-500">última medida</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-2xl md:text-3xl mb-1">📅</div>
          <p className="text-xl md:text-2xl font-bold text-purple-500">{monthWorkouts}</p>
          <p className="text-xs text-gray-500">entrenos este mes</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-2xl md:text-3xl mb-1">🏆</div>
          <p className="text-xl md:text-2xl font-bold text-yellow-500">{totalPRs}</p>
          <p className="text-xs text-gray-500">récords personales</p>
        </div>
      </div>

      {/* ====== EJERCICIO FAVORITO Y GRUPO MUSCULAR FAVORITO ====== */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ejercicio favorito</h4>
          <p className="text-lg md:text-xl font-semibold text-gray-800">
            {favoriteExercise?.name || '--'}
          </p>
          <p className="text-xs text-gray-400">{favoriteExercise?.count || 0} veces</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Grupo muscular favorito</h4>
          <p className="text-lg md:text-xl font-semibold text-gray-800">
            {favoriteMuscleGroup?.name || '--'}
          </p>
          <p className="text-xs text-gray-400">{favoriteMuscleGroup?.count || 0} veces</p>
        </div>
      </div>

      {/* ====== ÚLTIMOS ENTRENAMIENTOS ====== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">📊 Últimos entrenamientos</h3>
          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
            >
              {showAll ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-400px overflow-y-auto">
          {recentWorkouts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Carga tu primer entrenamiento para verlo aquí
            </p>
          ) : (
            displayedWorkouts.map((workout, index) => {
              const date = new Date(workout.date);
              const dateStr = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
              const exercises = workout.exercises?.length || 0;
              const sets =
                workout.exercises?.reduce(
                  (sum, set) => sum + (set.actualReps && set.actualReps > 0 ? 1 : 0),
                  0
                ) || 0;

              return (
                <div
                  key={workout.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {workout.name || 'Entrenamiento'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {dateStr} • {exercises} ejercicios • {sets} series
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{exercises} ejercicios</p>
                    {index === 0 && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                        Último
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {!showAll && recentWorkouts.length > 5 && (
            <p className="text-xs text-gray-400 text-center pt-2">
              Mostrando 5 de {recentWorkouts.length} entrenamientos
            </p>
          )}
        </div>
      </div>

      {/* ====== COMPONENTE DE RUTINAS ====== */}
      <RoutinesComponent
        onNavigateToWorkout={() => {
          window.location.href = '/workout';
        }}
      />
    </div>
  );
};

export default Dashboard;