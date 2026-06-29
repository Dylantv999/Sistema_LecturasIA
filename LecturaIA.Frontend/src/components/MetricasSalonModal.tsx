import { useEffect, useState } from 'react';
import { metricasService, type MetricasAula } from '../services/metricasService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 border border-cyan-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                🏫 Analíticas Grupales
              </span>
              <h2 className="text-xl font-bold text-slate-800 mt-2">Métricas del Salón</h2>
              <p className="text-sm font-semibold text-slate-400 mt-0.5">Aula: <span className="text-slate-600">{nombreAula}</span></p>
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
              <div className="w-10 h-10 border-4 border-cyan-500 border-b-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Procesando datos grupales...</p>
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
              {/* Resumen General */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs flex items-center space-x-4">
                  <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl text-xl">👥</div>
                  <div>
                    <p className="text-2xl font-black text-slate-800">{metricas.totalEstudiantes}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estudiantes</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs flex items-center space-x-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl">📈</div>
                  <div>
                    <p className="text-2xl font-black text-slate-800">{metricas.promedioClase.toFixed(1)}%</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Promedio Clase</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">⏱️</div>
                  <div>
                    <p className="text-2xl font-black text-slate-800 text-ellipsis overflow-hidden">{metricas.tiempoPromedioLectura.toFixed(1)}m</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prom. Lectura</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-3xs flex items-center space-x-4">
                  <div className="p-3 bg-violet-50 text-violet-600 rounded-xl text-xl">📝</div>
                  <div>
                    <p className="text-2xl font-black text-slate-800 text-ellipsis overflow-hidden">{metricas.tiempoPromedioCuestionario.toFixed(1)}m</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prom. Quiz</p>
                  </div>
                </div>
              </div>

              {/* Gráfica de Progreso Semanal */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-3xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">📈 Progreso Semanal de la Clase (Últimas 8 Semanas)</h3>
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
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-3xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">📊 Rendimiento por Tipo de Texto</h3>
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