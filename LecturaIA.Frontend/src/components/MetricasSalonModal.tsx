import { useEffect, useState } from 'react';
import { metricasService, type MetricasAula } from '../services/metricasService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, TrendingUp, Clock, ClipboardList, AlertCircle, X, BarChart2, LayoutTemplate, Activity, Sparkles, Download } from 'lucide-react';
import { alertaInformativa } from '../utils/alerts';

interface MetricasSalonModalProps {
  aulaId: number;
  nombreAula: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MetricasSalonModal({ aulaId, nombreAula, isOpen, onClose }: MetricasSalonModalProps) {
  const [metricas, setMetricas] = useState<MetricasAula | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      cargarMetricas();
    }
  }, [isOpen, aulaId]);

  const cargarMetricas = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await metricasService.obtenerMetricasAula(aulaId);
      setMetricas(data);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar las métricas del aula');
      console.error('Error al cargar métricas del aula:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generarInsight = () => {
    if (!metricas) return null;
    
    const promedios = [
      { tipo: 'Narrativo', val: metricas.distribucionTiposTexto.promedioNarrativo },
      { tipo: 'Descriptivo', val: metricas.distribucionTiposTexto.promedioDescriptivo },
      { tipo: 'Expositivo', val: metricas.distribucionTiposTexto.promedioExpositivo },
      { tipo: 'Argumentativo', val: metricas.distribucionTiposTexto.promedioArgumentativo },
      { tipo: 'Instructivo', val: metricas.distribucionTiposTexto.promedioInstructivo }
    ];
    
    promedios.sort((a, b) => a.val - b.val);
    const menor = promedios[0];
    
    if (menor.val < 70) {
      return `El sistema detecta un bajo rendimiento general (${menor.val.toFixed(1)}%) en textos de tipo ${menor.tipo}. Se sugiere usar la herramienta "Crear Examen con IA" para generar lecturas de este tipo enfocadas en el nivel de complejidad actual de la clase.`;
    } else {
      return `¡El rendimiento general de la clase es sólido! Todos los tipos de texto mantienen promedios superiores a 70%. La IA recomienda aumentar ligeramente la complejidad en la próxima asignación grupal.`;
    }
  };

  const handleExportarPDF = () => {
    alertaInformativa('Preparando el documento para exportar...');
    setTimeout(() => {
      window.print();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-100 px-3 py-1.5 rounded-lg uppercase tracking-wider mb-2 w-max">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Analíticas Grupales</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800">Métricas del Salón</h2>
              <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center space-x-1.5">
                <Users className="w-4 h-4" />
                <span>Aula:</span> <span className="text-slate-700">{nombreAula}</span>
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
              <div className="w-12 h-12 border-4 border-cyan-500 border-b-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Procesando datos grupales...</p>
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
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-2xl p-5 sm:p-6 shadow-sm flex items-start space-x-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/30 rounded-bl-full -z-0 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-md relative z-10 shrink-0 mt-1">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-sm font-black text-indigo-900 tracking-wide mb-1 flex items-center">
                    Recomendaciones Pedagógicas (AI Insight)
                  </h3>
                  <p className="text-sm font-medium text-indigo-800/80 leading-relaxed">
                    {generarInsight()}
                  </p>
                </div>
              </div>

              {/* Resumen General */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-cyan-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="p-3.5 bg-cyan-50 text-cyan-600 rounded-xl relative z-10">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{metricas.totalEstudiantes}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Estudiantes</p>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl relative z-10">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{metricas.promedioClase.toFixed(1)}%</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Promedio Clase</p>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl relative z-10">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="relative z-10 min-w-0">
                    <p className="text-3xl font-black text-slate-800 tracking-tight truncate">{metricas.tiempoPromedioLectura.toFixed(1)}m</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Prom. Lectura</p>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-violet-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="p-3.5 bg-violet-50 text-violet-600 rounded-xl relative z-10">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div className="relative z-10 min-w-0">
                    <p className="text-3xl font-black text-slate-800 tracking-tight truncate">{metricas.tiempoPromedioCuestionario.toFixed(1)}m</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Prom. Quiz</p>
                  </div>
                </div>
              </div>

              {/* Gráfica de Progreso Semanal */}
              <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-50 pb-4">
                  <Activity className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-sm font-bold text-slate-700 tracking-wide">Progreso Semanal de la Clase <span className="text-slate-400 font-medium">(Últimas 8 Semanas)</span></h3>
                </div>
                <div className="w-full h-80 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricas.progresoSemanal} margin={{ top: 10, right: -5, left: -20, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="numeroSemana" 
                        stroke="#94a3b8"
                        tickLine={false}
                        label={{ value: 'Semana', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontWeight: 'bold' }}
                      />
                      <YAxis 
                        stroke="#94a3b8"
                        tickLine={false}
                        label={{ value: 'Promedio (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontWeight: 'bold' }}
                        domain={[0, 100]}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        stroke="#94a3b8"
                        tickLine={false}
                        label={{ value: 'Quizzes Evaluados', angle: 90, position: 'insideRight', fill: '#94a3b8', fontWeight: 'bold' }}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-md space-y-1 text-xs">
                                <p className="font-bold text-slate-800">Semana {data.numeroSemana}</p>
                                <p className="text-cyan-600 font-bold">Promedio: {data.promedioSemana.toFixed(1)}%</p>
                                <p className="text-amber-500 font-bold">Total Quizzes: {data.cantidadQuizzes}</p>
                                <p className="text-slate-400 text-[10px] font-medium">
                                  {new Date(data.fechaInicio).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - {new Date(data.fechaFin).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line 
                        type="monotone" 
                        dataKey="promedioSemana" 
                        name="Promedio Semanal" 
                        stroke="#06b6d4" 
                        strokeWidth={2.5}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 7 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cantidadQuizzes" 
                        name="Cantidad de Quizzes" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        yAxisId="right"
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribución por Tipo de Texto */}
              <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-50 pb-4">
                  <LayoutTemplate className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-700 tracking-wide">Rendimiento por Tipo de Texto</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Gráfica de Barras */}
                  <div className="w-full h-72 text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[
                          { tipo: 'Narrativo', cantidad: metricas.distribucionTiposTexto.cantidadNarrativo, promedio: metricas.distribucionTiposTexto.promedioNarrativo },
                          { tipo: 'Descriptivo', cantidad: metricas.distribucionTiposTexto.cantidadDescriptivo, promedio: metricas.distribucionTiposTexto.promedioDescriptivo },
                          { tipo: 'Expositivo', cantidad: metricas.distribucionTiposTexto.cantidadExpositivo, promedio: metricas.distribucionTiposTexto.promedioExpositivo },
                          { tipo: 'Argumentativo', cantidad: metricas.distribucionTiposTexto.cantidadArgumentativo, promedio: metricas.distribucionTiposTexto.promedioArgumentativo },
                          { tipo: 'Instructivo', cantidad: metricas.distribucionTiposTexto.cantidadInstructivo, promedio: metricas.distribucionTiposTexto.promedioInstructivo }
                        ]}
                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="tipo" angle={-15} textAnchor="end" height={55} stroke="#94a3b8" tickLine={false} />
                        <YAxis stroke="#94a3b8" tickLine={false} label={{ value: 'Promedio (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontWeight: 'bold' }} domain={[0, 100]} />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-md space-y-1 text-xs">
                                  <p className="font-bold text-slate-800">{data.tipo}</p>
                                  <p className="text-blue-600 font-bold">Promedio: {data.promedio.toFixed(1)}%</p>
                                  <p className="text-slate-500 font-medium">Lecturas totales: {data.cantidad}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Bar dataKey="promedio" name="Rendimiento Promedio" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tarjetas de Detalle */}
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Narrativo</p>
                        <p className="text-[10px] text-slate-400 font-medium">{metricas.distribucionTiposTexto.cantidadNarrativo} lecturas completadas</p>
                      </div>
                      <span className="text-xl font-black text-blue-600">
                        {metricas.distribucionTiposTexto.promedioNarrativo.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Descriptivo</p>
                        <p className="text-[10px] text-slate-400 font-medium">{metricas.distribucionTiposTexto.cantidadDescriptivo} lecturas completadas</p>
                      </div>
                      <span className="text-xl font-black text-emerald-600">
                        {metricas.distribucionTiposTexto.promedioDescriptivo.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Expositivo</p>
                        <p className="text-[10px] text-slate-400 font-medium">{metricas.distribucionTiposTexto.cantidadExpositivo} lecturas completadas</p>
                      </div>
                      <span className="text-xl font-black text-violet-600">
                        {metricas.distribucionTiposTexto.promedioExpositivo.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Argumentativo</p>
                        <p className="text-[10px] text-slate-400 font-medium">{metricas.distribucionTiposTexto.cantidadArgumentativo} lecturas completadas</p>
                      </div>
                      <span className="text-xl font-black text-orange-600">
                        {metricas.distribucionTiposTexto.promedioArgumentativo.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Instructivo</p>
                        <p className="text-[10px] text-slate-400 font-medium">{metricas.distribucionTiposTexto.cantidadInstructivo} lecturas completadas</p>
                      </div>
                      <span className="text-xl font-black text-pink-600">
                        {metricas.distribucionTiposTexto.promedioInstructivo.toFixed(1)}%
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