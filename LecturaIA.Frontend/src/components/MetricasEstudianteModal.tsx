import { useEffect, useState } from 'react';
import { metricasService, type MetricasEstudiante } from '../services/metricasService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar } from 'recharts';
import { BarChart2, AlertCircle, BookOpen, Target, Zap, Activity, Radar, X, User, Sparkles, Download } from 'lucide-react';
import { alertaInformativa } from '../utils/alerts';

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

  const generarInsight = () => {
    if (!metricas) return null;
    
    const hab = metricas.analisisHabilidad;
    if (hab.porcentajeCritico < 60) {
      return `El estudiante muestra un área de oportunidad en "Preguntas Críticas" (${hab.porcentajeCritico.toFixed(1)}%). La IA sugiere asignarle textos de tipo Argumentativo para fortalecer su capacidad de análisis profundo y toma de postura.`;
    } else if (hab.porcentajeInferencial < 60) {
      return `El estudiante tiene dificultades con las "Preguntas Inferenciales" (${hab.porcentajeInferencial.toFixed(1)}%). Se recomienda practicar con textos Narrativos o Expositivos complejos donde deba deducir el mensaje implícito.`;
    } else {
      return `¡El rendimiento cognitivo del estudiante es sobresaliente! Mantiene un excelente balance en todas las habilidades de comprensión. Se sugiere proponerle lecturas de mayor nivel o extensión para mantener el reto intelectual.`;
    }
  };

  const handleExportarPDF = () => {
    alertaInformativa(`Preparando el documento de ${nombreEstudiante} para exportar...`);
    setTimeout(() => {
      window.print();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg uppercase tracking-wider mb-2 w-max">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Reporte de Analíticas</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800">Métricas de Estudiante</h2>
              <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center space-x-1.5">
                <User className="w-4 h-4" />
                <span>Estudiante:</span> <span className="text-slate-700">{nombreEstudiante}</span>
              </p>
            </div>
            <div className="flex items-center space-x-3 print:hidden">
              <button
                onClick={handleExportarPDF}
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 text-white hover:bg-slate-900 transition rounded-xl font-bold text-xs shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar Reporte</span>
              </button>
              <button
                onClick={onClose}
                className="p-2.5 border-2 border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 bg-slate-50/50 space-y-8 flex-1">
          {isLoading && (
            <div className="flex flex-col justify-center items-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-b-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando expediente...</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-xl text-sm font-semibold flex items-center space-x-3">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          {metricas && !isLoading && (
            <div className="space-y-6">
              
              {/* Tarjeta AI Insights */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl p-5 sm:p-6 shadow-sm flex items-start space-x-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-bl-full -z-0 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-md relative z-10 shrink-0 mt-1">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-sm font-black text-blue-900 tracking-wide mb-1 flex items-center">
                    Recomendación Personalizada (AI Insight)
                  </h3>
                  <p className="text-sm font-medium text-blue-800/80 leading-relaxed">
                    {generarInsight()}
                  </p>
                </div>
              </div>

              {/* Resumen de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl relative z-10">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{metricas.lecturasCompletadas}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Lecturas Completadas</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl relative z-10">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{metricas.promedioQuiz.toFixed(1)}%</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Promedio de Quiz</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-violet-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="p-3.5 bg-violet-50 text-violet-600 rounded-xl relative z-10">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{metricas.nivelActual}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Nivel Actual</p>
                  </div>
                </div>
              </div>

              {/* Segunda fila de métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo de Texto Favorito</p>
                  <p className="text-lg font-black text-slate-800 mt-1 truncate">{metricas.tipoTextoFavorito}</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5 uppercase tracking-wider">Mayor rendimiento</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Última Actividad</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{formatearFecha(metricas.ultimaActividad)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiempo Promedio</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{metricas.tiempoPromedioLectura.toFixed(2)} min</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Por lectura</p>
                </div>
              </div>

              {/* Gráfica de Evolución Temporal */}
              <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-50 pb-4">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-700 tracking-wide">Evolución Temporal del Promedio</h3>
                </div>
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
              <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-50 pb-4">
                  <Radar className="w-5 h-5 text-violet-600" />
                  <h3 className="text-sm font-bold text-slate-700 tracking-wide">Análisis de Habilidad por Tipo de Pregunta</h3>
                </div>
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
                        <RechartsRadar 
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
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 rounded-b-2xl flex justify-end print:hidden">
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