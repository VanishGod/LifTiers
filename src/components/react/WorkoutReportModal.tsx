// components/workout/WorkoutReportModal.tsx
import { useState } from 'react';
import { type WorkoutReport } from '../../types/exercises.types';

interface WorkoutReportModalProps {
  report: WorkoutReport;
  onClose: () => void;
  onViewHistory: () => void;
}

export const WorkoutReportModal = ({
  report,
  onClose,
  onViewHistory,
}: WorkoutReportModalProps) => {
  const [activeSection, setActiveSection] = useState(0);
  
  const sections = [
    { id: 'records', label: ' Nuevos Récords', icon: '🏆' },
    { id: 'prs', label: ' PRs Estimados', icon: '📊' },
    { id: 'summary', label: ' Resumen', icon: '📈' },
    { id: 'comparison', label: ' Comparativa', icon: '📉' },
  ];

  const hasNewRecords = report.newRecords.length > 0;

  // Calcular el total de ejercicios completados
  const totalExercisesCompleted = report.summary.exercises.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* ===== HEADER ===== */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>📋</span>
                Informe de Entrenamiento
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(report.date).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-sm text-gray-500">
                {report.workoutName}
                {report.comparison?.previousWorkout && (
                  <span className="ml-2 text-xs text-gray-400">
                    vs {new Date(report.comparison.previousWorkout.date).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ===== NAVEGACIÓN ===== */}
        <div className="flex gap-1 p-4 border-b border-gray-200 bg-gray-50 overflow-x-auto">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeSection === index
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section.icon} {section.label}
            </button>
          ))}
        </div>

        {/* ===== CONTENIDO ===== */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* SECCIÓN 1: NUEVOS RÉCORDS */}
          {activeSection === 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🏆</span>
                Nuevos Récords Personales
              </h3>
              {hasNewRecords ? (
                <div className="space-y-4">
                  {report.newRecords.map((record, index) => (
                    <div key={index} className="bg-linear-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800">{record.exerciseName}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm">
                            <div>
                              <span className="text-gray-500">Anterior:</span>
                              {record.previousRecord ? (
                                <span className="ml-1 text-gray-600 line-through">
                                  {record.previousRecord.weight}{record.previousRecord.unit} x {record.previousRecord.reps} reps
                                </span>
                              ) : (
                                <span className="ml-1 text-gray-400">Sin registro previo</span>
                              )}
                            </div>
                            <div>
                              <span className="text-green-600 font-bold">→</span>
                              <span className="ml-1 text-green-600 font-bold">
                                {record.newRecord.weight}{record.newRecord.unit} x {record.newRecord.reps} reps
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-green-600">
                            +{record.improvement.toFixed(1)}%
                          </span>
                          <p className="text-xs text-gray-500">mejora</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">💪</p>
                  <p>No se establecieron nuevos récords en este entrenamiento</p>
                  <p className="text-sm mt-1">¡Sigue esforzándote! El próximo será el bueno</p>
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN 2: PRs ESTIMADOS */}
          {activeSection === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📊</span>
                PRs Estimados (1RM)
              </h3>
              {report.estimatedPRs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.estimatedPRs.map((pr, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-gray-800">{pr.exerciseName}</h4>
                      <div className="flex items-end gap-3 mt-2">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {Math.round(pr.estimated1RM)}{pr.unit}
                          </p>
                          <p className="text-xs text-gray-500">1RM estimado</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>Basado en: {pr.weight}{pr.unit} x {pr.reps} reps</p>
                          <p className="text-xs">
                            {new Date(pr.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay PRs estimados disponibles</p>
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN 3: RESUMEN */}
          {activeSection === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📈</span>
                Resumen del Entrenamiento
              </h3>
              
              {/* Estadísticas principales */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{totalExercisesCompleted}</p>
                  <p className="text-sm text-gray-500">Ejercicios</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{report.summary.totalSets}</p>
                  <p className="text-sm text-gray-500">Series</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(report.summary.totalVolume)}
                  </p>
                  <p className="text-sm text-gray-500">Volumen Total ({report.summary.unit})</p>
                </div>
              </div>

              {/* Comparación con objeto */}
              <div className="bg-linear-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">🦏</div>
                  <div>
                    <p className="text-sm text-gray-600">Equivalente a levantar:</p>
                    <p className="text-lg font-bold text-orange-700">
                      {report.summary.volumeComparison.object}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(report.summary.totalVolume / report.summary.volumeComparison.weight)}x el peso de {report.summary.volumeComparison.object}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desglose por ejercicio */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Desglose por ejercicio</h4>
                <div className="space-y-2">
                  {report.summary.exercises.map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-800">{exercise.name}</p>
                        <p className="text-sm text-gray-500">{exercise.sets} series</p>
                      </div>
                      <p className="font-semibold text-gray-700">
                        {Math.round(exercise.volume)} kg
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 4: COMPARATIVA */}
          {activeSection === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📉</span>
                Comparativa con Entrenamientos Anteriores
              </h3>
              
              {report.comparison?.previousWorkout ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Entrenamiento anterior</p>
                        <p className="font-medium text-gray-700">
                          {new Date(report.comparison.previousWorkout.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Volumen</p>
                        <p className="font-bold text-gray-700">
                          {Math.round(report.comparison.previousWorkout.volume)} kg
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Este entrenamiento</p>
                        <p className="font-medium text-gray-700">
                          {new Date(report.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Volumen</p>
                        <p className="font-bold text-gray-700">
                          {Math.round(report.summary.totalVolume)} kg
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Diferencia */}
                  <div className={`rounded-lg p-4 border ${
                    report.comparison.trend === 'up' 
                      ? 'bg-green-50 border-green-200' 
                      : report.comparison.trend === 'down'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {report.comparison.trend === 'up' && (
                        <span className="text-2xl">📈</span>
                      )}
                      {report.comparison.trend === 'down' && (
                        <span className="text-2xl">📉</span>
                      )}
                      {report.comparison.trend === 'same' && (
                        <span className="text-2xl">➡️</span>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Diferencia de volumen</p>
                        // En la sección donde muestras la comparación
  <p className="text-sm font-medium">
    {report.comparison.difference !== null && report.comparison.difference !== undefined ? (
      <>
        {report.comparison.difference > 0 ? '+' : ''}
        {Math.round(report.comparison.difference)} kg
        {report.comparison.trend === 'up' && ' 🎉'}
        {report.comparison.trend === 'down' && ' 💪'}
      </>
    ) : (
      <span className="text-gray-400">Sin datos previos</span>
    )}
  </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📭</p>
                  <p>No hay entrenamientos anteriores para comparar</p>
                  <p className="text-sm mt-1">¡Este es tu primer entrenamiento registrado!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onViewHistory}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            📊 Ver historial completo
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Cerrar informe
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutReportModal;