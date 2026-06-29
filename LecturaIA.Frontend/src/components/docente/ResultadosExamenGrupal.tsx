import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import examenGrupalService from '../../services/examenGrupalService';
import type { ResultadosExamenGrupalDto } from '../../services/examenGrupalService';

const ResultadosExamenGrupal: React.FC = () => {
  const { examenId } = useParams<{ examenId: string }>();
  const navigate = useNavigate();
  const [resultados, setResultados] = useState<ResultadosExamenGrupalDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ordenColumna, setOrdenColumna] = useState<'nombre' | 'calificacion' | 'tiempo'>('calificacion');
  const [ordenAscendente, setOrdenAscendente] = useState(false);

  useEffect(() => {
    if (examenId) {
      cargarResultados();
    }
  }, [examenId]);

  const cargarResultados = async () => {
    try {
      setLoading(true);
      const data = await examenGrupalService.obtenerResultadosConsolidados(parseInt(examenId!));
      setResultados(data);
    } catch (err: any) {
      console.error('Error al cargar resultados:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar los resultados');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const ordenarResultados = (columna: typeof ordenColumna) => {
    if (ordenColumna === columna) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenColumna(columna);
      setOrdenAscendente(false);
    }
  };

  const resultadosOrdenados = React.useMemo(() => {
    if (!resultados) return [];
    
    const datos = [...resultados.resultados];
    
    datos.sort((a, b) => {
      let compareValue = 0;
      
      switch (ordenColumna) {
        case 'nombre':
          compareValue = a.nombreCompleto.localeCompare(b.nombreCompleto);
          break;
        case 'calificacion':
          compareValue = (b.calificacion || 0) - (a.calificacion || 0);
          break;
        case 'tiempo':
          compareValue = (a.tiempoTotalMinutos || 0) - (b.tiempoTotalMinutos || 0);
          break;
      }
      
      return ordenAscendente ? -compareValue : compareValue;
    });
    
    return datos;
  }, [resultados, ordenColumna, ordenAscendente]);

  const obtenerClaseCalificacion = (calificacion?: number) => {
    if (!calificacion) return 'bg-slate-100 text-slate-600 border-slate-200';
    if (calificacion >= 9) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (calificacion >= 7) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-b-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500 tracking-wide">Cargando resultados de la evaluación...</p>
        </div>
      </div>
    );
  }

  if (error || !resultados) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-xs space-y-4">
          <div className="text-3xl">⚠️</div>
          <p className="text-sm font-semibold text-slate-700">{error || 'No se encontraron resultados'}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-5 py-2 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            Volver al Aula
          </button>
        </div>
      </div>
    );
  }

  const { examenInfo, estadisticas } = resultados;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabecera / Navegación */}
        <div className="space-y-4">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <span>← Volver al Aula</span>
          </button>
          
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  📊 Reporte General de Aula
                </span>
                <h2 className="text-xl font-bold text-slate-800 mt-2">{examenInfo.titulo}</h2>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-400 pt-1 border-t border-slate-50">
              <span className="flex items-center gap-1 text-slate-600">📚 {examenInfo.nombreAula}</span>
              <span className="hidden sm:inline">•</span>
              <span>📅 Asignado: {formatearFecha(examenInfo.fechaCreacion)}</span>
              <span className="hidden sm:inline">•</span>
              <span className="truncate max-w-xs md:max-w-md">📖 Lectura: {examenInfo.tituloLectura}</span>
            </div>
          </div>
        </div>

        {/* Dashboard de Métricas y Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center space-x-3">
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-lg">👥</div>
            <div>
              <div className="text-lg font-bold text-slate-800">{estadisticas.totalEstudiantes}</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Inscritos</div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-lg text-emerald-600">✅</div>
            <div>
              <div className="text-lg font-bold text-slate-800">
                {estadisticas.completados}
                <span className="text-xs text-slate-400 font-medium"> / {estadisticas.totalEstudiantes}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                Rendidos <span className="text-emerald-600 font-black">({estadisticas.porcentajeCompletado.toFixed(0)}%)</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center space-x-3">
            <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-lg text-amber-600">⏳</div>
            <div>
              <div className="text-lg font-bold text-slate-800">{estadisticas.pendientes}</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Pendientes</div>
            </div>
          </div>

          {estadisticas.promedioGrupal !== null && (
            <div className="bg-emerald-600 text-white border border-emerald-700 rounded-2xl p-4 shadow-xs flex items-center space-x-3 col-span-2 sm:col-span-1 lg:col-span-1">
              <div className="p-2.5 bg-emerald-700/50 rounded-xl text-lg">📈</div>
              <div>
                <div className="text-lg font-bold">{resultados.estadisticas.promedioGrupal?.toFixed(2) || 'N/A'}</div>
                <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wide">Promedio</div>
                <div className="text-[9px] text-emerald-100 font-medium mt-0.5">
                  Mín: {estadisticas.calificacionMinima?.toFixed(1)} | Máx: {estadisticas.calificacionMaxima?.toFixed(1)}
                </div>
              </div>
            </div>
          )}

          {estadisticas.tiempoPromedioMinutos !== null && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center space-x-3">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-lg">⏱️</div>
              <div>
                <div className="text-lg font-bold text-slate-800">{resultados.estadisticas.tiempoPromedioMinutos?.toFixed(1) || 'N/A'} min</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tiempo Medio</div>
              </div>
            </div>
          )}
        </div>

        {/* Sección de Paneles de Control y Alertas Críticas */}
        {(estadisticas.estudiantesPendientes.length > 0 || 
          estadisticas.estudiantesConDificultad.length > 0 ||
          estadisticas.estudiantesDestacados.length > 0) && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">🔔 Foco de Atención Pedagógica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {estadisticas.estudiantesPendientes.length > 0 && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 shadow-3xs space-y-2">
                  <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
                    <span>⏳</span>
                    <h4>Pendientes ({estadisticas.estudiantesPendientes.length})</h4>
                  </div>
                  <ul className="text-xs font-semibold text-amber-900/80 space-y-1 pl-1 list-disc list-inside">
                    {estadisticas.estudiantesPendientes.map((nombre, idx) => (
                      <li key={idx} className="truncate">{nombre}</li>
                    ))}
                  </ul>
                </div>
              )}

              {estadisticas.estudiantesConDificultad.length > 0 && (
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 shadow-3xs space-y-2">
                  <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
                    <span>⚠️</span>
                    <h4>Requieren Refuerzo ({estadisticas.estudiantesConDificultad.length})</h4>
                  </div>
                  <ul className="text-xs font-semibold text-rose-900/80 space-y-1 pl-1 list-disc list-inside">
                    {estadisticas.estudiantesConDificultad.map((info, idx) => (
                      <li key={idx} className="truncate">{info}</li>
                    ))}
                  </ul>
                </div>
              )}

              {estadisticas.estudiantesDestacados.length > 0 && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 shadow-3xs space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                    <span>⭐</span>
                    <h4>Rendimiento Alto ({estadisticas.estudiantesDestacados.length})</h4>
                  </div>
                  <ul className="text-xs font-semibold text-emerald-900/80 space-y-1 pl-1 list-disc list-inside">
                    {estadisticas.estudiantesDestacados.map((info, idx) => (
                      <li key={idx} className="truncate">{info}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabla de Control de Resultados Individuales */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">📋 Reporte Detallado de Calificaciones</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th 
                    className="py-3 px-4 font-bold cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition"
                    onClick={() => ordenarResultados('nombre')}
                  >
                    Estudiante {ordenColumna === 'nombre' ? (ordenAscendente ? '↑' : '↓') : ''}
                  </th>
                  <th className="py-3 px-4 font-bold">Estado</th>
                  <th 
                    className="py-3 px-4 font-bold cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition"
                    onClick={() => ordenarResultados('calificacion')}
                  >
                    Calificación {ordenColumna === 'calificacion' ? (ordenAscendente ? '↑' : '↓') : ''}
                  </th>
                  <th 
                    className="py-3 px-4 font-bold cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition"
                    onClick={() => ordenarResultados('tiempo')}
                  >
                    Tiempo {ordenColumna === 'tiempo' ? (ordenAscendente ? '↑' : '↓') : ''}
                  </th>
                  <th className="py-3 px-4 font-bold">Fecha de Envío</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-medium">
                {resultadosOrdenados.map((resultado, idx) => (
                  <tr key={resultado.estudianteId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{resultado.nombreCompleto}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-md border ${
                        resultado.estado === 'Completado' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {resultado.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {resultado.calificacion !== null && resultado.calificacion !== undefined ? (
                        <span className={`inline-flex px-2.5 py-0.5 text-xs font-bold rounded-md border ${obtenerClaseCalificacion(resultado.calificacion)}`}>
                          {resultado.calificacion.toFixed(1)} / 10
                        </span>
                      ) : (
                        <span className="text-slate-300 font-semibold">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {resultado.tiempoTotalMinutos ? (
                        <span className="text-slate-600 text-xs bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm">
                          {resultado.tiempoTotalMinutos.toFixed(1)} min
                        </span>
                      ) : (
                        <span className="text-slate-300 font-semibold">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-400">
                      {resultado.fechaCompletado ? (
                        formatearFecha(resultado.fechaCompletado)
                      ) : (
                        <span className="text-slate-300 font-semibold">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultadosExamenGrupal;