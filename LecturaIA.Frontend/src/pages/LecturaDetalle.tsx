import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cuestionarioService, type ResultadoDto } from '../services/cuestionarioService';
import { lecturaService } from '../services/lecturaService';

export default function HistorialResultados() {
  const { id: lecturaId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [historial, setHistorial] = useState<ResultadoDto[]>([]);
  const [tituloLectura, setTituloLectura] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarHistorial();
  }, [lecturaId]);

  const cargarHistorial = async () => {
    try {
      setCargando(true);

      const lectura = await lecturaService.obtenerLectura(Number(lecturaId));
      setTituloLectura(lectura.titulo);

      const resultados = await cuestionarioService.obtenerHistorialLectura(Number(lecturaId));
      setHistorial(resultados);

      setCargando(false);
    } catch (err: any) {
      console.error('Error al cargar historial:', err);
      setError(err.message || 'Error al cargar el historial');
      setCargando(false);
    }
  };

  const handleVerDetalle = (resultado: ResultadoDto) => {
    navigate(`/estudiante/cuestionario/${lecturaId}/resultados?cuestionarioId=${resultado.cuestionarioId}`, {
      state: { resultado }
    });
  };

  const getColorPorPuntaje = (puntaje: number) => {
    if (puntaje >= 8) return 'text-emerald-600';
    if (puntaje >= 6) return 'text-sky-600';
    if (puntaje >= 4) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getBgColorPorPuntaje = (puntaje: number) => {
    if (puntaje >= 8) return 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-200';
    if (puntaje >= 6) return 'bg-sky-50/40 border-sky-100 hover:border-sky-200';
    if (puntaje >= 4) return 'bg-amber-50/40 border-amber-100 hover:border-amber-200';
    return 'bg-rose-50/40 border-rose-100 hover:border-rose-200';
  };

  const getEmojiPorPuntaje = (puntaje: number) => {
    if (puntaje >= 9) return '🎉';
    if (puntaje >= 7) return '😊';
    if (puntaje >= 5) return '🙂';
    if (puntaje >= 3) return '😐';
    return '😔';
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-sky-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg font-medium text-sky-800">Cargando historial...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-sky-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-sky-950 mb-2">Error al cargar historial</h2>
          <p className="text-sky-800 mb-6">{error}</p>
          <button
            onClick={() => navigate('/estudiante/dashboard')}
            className="w-full bg-sky-600 text-white py-3 px-6 rounded-full font-bold hover:bg-sky-700 transition shadow-md"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50/40 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Encabezado / Card Principal */}
        <div className="bg-white rounded-3xl shadow-xs border border-sky-100 p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
              <span>📊 Relleno de Progreso</span>
              <span>•</span>
              <span>{historial.length} {historial.length === 1 ? 'intento total' : 'intentos totales'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-sky-950 leading-tight mb-2">
              Historial de Resultados
            </h1>
            <p className="text-slate-600 text-sm md:text-base">
              Lectura: <span className="font-bold text-sky-900">"{tituloLectura}"</span>
            </p>
          </div>

          <button
            onClick={() => navigate('/estudiante/dashboard')}
            className="flex items-center gap-2 bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 font-bold px-5 py-2.5 rounded-full text-sm transition shadow-2xs w-full md:w-auto justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </button>
        </div>

        {/* Lista de resultados */}
        {historial.length === 0 ? (
          <div className="bg-white rounded-3xl border border-sky-100 p-12 text-center shadow-xs">
            <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4 text-sky-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-sky-950 mb-1">Aún no hay intentos</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Completa tu primer cuestionario personalizado para empezar a registrar métricas de comprensión.</p>
            <button
              onClick={() => navigate('/estudiante/dashboard')}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3 rounded-full text-sm transition shadow-md shadow-sky-100"
            >
              Ir a mis Lecturas
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {historial.map((resultado, index) => (
              <div
                key={resultado.id}
                className={`bg-white rounded-3xl p-6 border-2 ${getBgColorPorPuntaje(resultado.puntajeTotal)} transition-all duration-200 shadow-2xs flex flex-col gap-6`}
              >
                {/* Bloque Superior: Identificador, Puntaje e Información general */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-dashed border-sky-100 pb-5">

                  {/* Intento + Nota */}
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-sky-600 to-cyan-500 text-white font-black text-lg rounded-2xl w-14 h-14 flex flex-col items-center justify-center shadow-sm shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-0.5">N°</span>
                      <span className="leading-none">{historial.length - index}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-4xl filter drop-shadow-xs shrink-0" role="img" aria-label="Score emoji">
                        {getEmojiPorPuntaje(resultado.puntajeTotal)}
                      </span>
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-black tracking-tight ${getColorPorPuntaje(resultado.puntajeTotal)}`}>
                            {resultado.puntajeTotal}
                          </span>
                          <span className="text-slate-400 font-bold text-sm">/10 pts</span>
                        </div>
                        <div className="text-xs font-bold text-slate-500">
                          Equivale al {resultado.porcentaje.toFixed(0)}% del total
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Datos analíticos y de tiempos agrupados */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">

                    {/* Tiempos de Resolución */}
                    <div className="bg-white border border-sky-100 rounded-2xl p-3 flex items-center gap-3 shadow-3xs">
                      <span className="text-xl bg-sky-50 p-2 rounded-xl text-sky-600">⏱️</span>
                      <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tiempos invertidos</div>
                        <div className="text-xs text-slate-700 font-medium mt-0.5">
                          Lectura: <span className="font-bold text-sky-700">{Math.floor(resultado.tiempoLecturaMinutos)}m {String(Math.round((resultado.tiempoLecturaMinutos % 1) * 60)).padStart(2, '0')}s</span>
                        </div>
                        <div className="text-xs text-slate-700 font-medium">
                          Quiz: <span className="font-bold text-purple-600">{Math.floor(resultado.tiempoCuestionarioMinutos)}m {String(Math.round((resultado.tiempoCuestionarioMinutos % 1) * 60)).padStart(2, '0')}s</span>
                        </div>
                      </div>
                    </div>

                    {/* Desglose de Respuestas Correctas */}
                    <div className="bg-white border border-sky-100 rounded-2xl p-3 flex items-center gap-3 shadow-3xs">
                      <span className="text-xl bg-sky-50 p-2 rounded-xl text-sky-600">📝</span>
                      <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Desglose de aciertos</div>
                        <div className="flex gap-3 text-xs font-bold mt-1">
                          <span className="text-sky-600" title="Literales">Literal: {resultado.correctasLiterales}/4</span>
                          <span className="text-purple-600" title="Analíticas">Inferencial: {resultado.correctasAnaliticas}/4</span>
                          <span className="text-amber-600" title="Críticas">Crítica: {resultado.puntajeCriticas.toFixed(1)}/2</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bloque Inferior: Meta-información de niveles y acciones */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  {/* Flujo de Niveles de Dificultad */}
                  <div className="flex items-center gap-3 bg-white/60 border border-sky-100/50 px-4 py-2 rounded-2xl w-fit text-sm shadow-3xs">
                    <span className="text-slate-500 font-medium">Progreso de IA:</span>
                    <span className="bg-slate-100 font-bold text-slate-700 px-2.5 py-0.5 rounded-lg text-xs">
                      {resultado.nivelAnterior}
                    </span>
                    <span className="text-slate-400 font-bold">→</span>
                    <span className="bg-sky-600 font-bold text-white px-2.5 py-0.5 rounded-lg text-xs shadow-xs">
                      {resultado.nivelNuevo}
                    </span>
                  </div>

                  {/* Acciones principales */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    {index === 0 && (
                      <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide animate-pulse">
                        ✨ Último intento
                      </span>
                    )}

                    <button
                      onClick={() => handleVerDetalle(resultado)}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-5 py-2.5 rounded-full transition shadow-sm flex items-center gap-2 active:scale-98 ml-auto sm:ml-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Ver Detalle</span>
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}