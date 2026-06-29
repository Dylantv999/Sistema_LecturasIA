import { useEffect, useState } from 'react';
import { metricasService, type MetricasEstudiante } from '../services/metricasService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface MetricasEstudianteModalProps {
  estudianteId: number;
  nombreEstudiante: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MetricasEstudianteModal({ estudianteId, nombreEstudiante, isOpen, onClose }: MetricasEstudianteModalProps) {
  const [metricas, setMetricas] = useState<MetricasEstudiante | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      cargarMetricas();
    }
  }, [isOpen, estudianteId]);

  const cargarMetricas = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await metricasService.obtenerMetricasEstudiante(estudianteId);
      setMetricas(data);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar las métricas');
      console.error('Error al cargar métricas del estudiante:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                📊 Reporte de Analíticas
              </span>
              <h2 className="text-xl font-bold text-slate-800 mt-2">Métricas de Estudiante</h2>
              <p className="text-sm font-semibold text-slate-400 mt-0.5">Estudiante: <span className="text-slate-600">{nombreEstudiante}</span></p>
            </div>
            <button
              onClick={onClose}
              className="p-2 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition rounded-xl cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 bg-slate-50/50 space-y-6 flex-1">
          {isLoading && (
            <div className="flex flex-col justify-center items-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-b-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Cargando expediente...</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center space-x-2">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {metricas && !isLoading && (
            <div className="space-y-6">
              {/* Resumen de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">📖</div>
                  <div>
                    <p className="text-2xl font-black text-slate-800">{metricas.lecturasCompletadas}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lecturas Completadas</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs flex items-center space-x-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl">🎯</div>
                  <div>
                    <p className="text-2xl font-black text-slate-800">{metricas.promedioQuiz.toFixed(1)}%</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Promedio de Quiz</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs flex items-center space-x-4">
                  <div className="p-3 bg-violet-50 text-violet-600 rounded-xl text-xl">⚡</div>
                  <div>
                    <p className="text-2xl font-black text-slate-800">{metricas.nivelActual}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nivel Actual</p>
                  </div>
                </div>
              </div>

              {/* Segunda fila de métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo de Texto Favorito</p>
                  <p className="text-base font-bold text-slate-700 mt-1 truncate">{metricas.tipoTextoFavorito}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Mayor rendimiento</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Última Actividad</p>
                  <p className="text-base font-bold text-slate-700 mt-1">{formatearFecha(metricas.ultimaActividad)}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiempo Promedio</p>
                  <p className="text-base font-bold text-slate-700 mt-1">{metricas.tiempoPromedioLectura.toFixed(2)} min</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Por lectura</p>
                </div>
              </div>

              {/* Gráfica de Evolución Temporal */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-3xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">📈 Evolución Temporal del Promedio</h3>
                {/* Se aumentó la altura a h-80 para dar más holgura */}
                <div className="w-full h-80 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    {/* Se agregó bottom: 15 al margin para que la etiqueta del eje X tenga espacio suficiente y no se corte */}
                    <LineChart data={metricas.evolucionTemporal} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="numeroQuiz" 
                        stroke="#94a3b8"
                        tickLine={false}
                        label={{ value: 'Número de Quiz', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontWeight: 'bold' }}
                      />
                      <YAxis 
                        stroke="#94a3b8"
                        tickLine={false}
                        label={{ value: 'Calificación (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontWeight: 'bold' }}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-md space-y-1 text-xs">
                                <p className="font-bold text-slate-800">{data.tituloLectura}</p>
                                <p className="text-blue-600 font-bold">Calificación: {data.calificacion.toFixed(1)}%</p>
                                <p className="text-slate-400 text-[10px] font-medium">{formatearFecha(data.fecha)}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line 
                        type="monotone" 
                        dataKey="calificacion" 
                        name="Calificación" 
                        stroke="#3b82f6" 
                        strokeWidth={2.5}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Análisis de Habilidad por Pregunta */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-3xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">📊 Análisis de Habilidad por Tipo de Pregunta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Gráfica de Radar */}
                  <div className="w-full h-64 text-xs flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart 
                        data={[
                          { habilidad: 'Literal', porcentaje: metricas.analisisHabilidad.porcentajeLiteral },
                          { habilidad: 'Inferencial', porcentaje: metricas.analisisHabilidad.porcentajeInferencial },
                          { habilidad: 'Crítico', porcentaje: metricas.analisisHabilidad.porcentajeCritico }
                        ]}
                        margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                      >
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="habilidad" stroke="#64748b" fontStyle="bold" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#cbd5e1" tick={false} />
                        <Radar 
                          name="Rendimiento" 
                          dataKey="porcentaje" 
                          stroke="#8b5cf6" 
                          fill="#8b5cf6" 
                          fillOpacity={0.15} 
                        />
                        <Legend verticalAlign="top" height={36} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tabla de porcentajes */}
                  <div className="flex flex-col justify-center space-y-3">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-xs font-bold text-slate-700">Preguntas Literales</span>
                      <span className="text-xl font-black text-blue-600">
                        {metricas.analisisHabilidad.porcentajeLiteral.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-xs font-bold text-slate-700">Preguntas Inferenciales</span>
                      <span className="text-xl font-black text-emerald-600">
                        {metricas.analisisHabilidad.porcentajeInferencial.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-xs font-bold text-slate-700">Preguntas Críticas</span>
                      <span className="text-xl font-black text-violet-600">
                        {metricas.analisisHabilidad.porcentajeCritico.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-slate-200 text-slate-600 bg-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}