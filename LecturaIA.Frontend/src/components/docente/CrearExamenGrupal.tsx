import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import examenGrupalService from '../../services/examenGrupalService';
import type { CrearExamenGrupalDto } from '../../services/examenGrupalService';
import { TipoTexto, LongitudTexto, GradoEscolar, ComplejidadTexto } from '../../types/enums';

const CrearExamenGrupal: React.FC = () => {
  const navigate = useNavigate();
  const { aulaId } = useParams<{ aulaId: string }>();
  
  const [formData, setFormData] = useState<CrearExamenGrupalDto>({
    aulaId: parseInt(aulaId || '0'),
    titulo: '',
    descripcion: '',
    temaConcepto: '',
    tipoTexto: TipoTexto.NARRATIVO,
    longitudTexto: LongitudTexto.MEDIO,
    gradoEscolar: `${GradoEscolar.CUARTO}to`,
    complejidad: ComplejidadTexto.BASICA,
    cantidadPreguntas: 10,
    fechaLimite: '',
    publicado: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tiposTexto = Object.values(TipoTexto);
  const longitudesTexto = Object.values(LongitudTexto);
  const gradosEscolares = Object.values(GradoEscolar).filter(val => typeof val === 'number').map(val => `${val}to`);
  const complejidades = Object.values(ComplejidadTexto);
  const cantidadesPreguntas = [5, 8, 10, 12, 15];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'cantidadPreguntas') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validaciones
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }
    
    if (!formData.temaConcepto.trim()) {
      setError('El tema/concepto es obligatorio');
      return;
    }

    setLoading(true);
    
    try {
      const result = await examenGrupalService.crearExamenConIA(formData);
      setSuccess(result.mensaje || 'Examen creado exitosamente');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(`/docente/aula/${aulaId}`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error al crear examen:', err);
      setError(err.response?.data?.mensaje || 'Error al crear el examen. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/docente/aula/${aulaId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex items-start space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-2xl">
            📝
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Crear Examen Grupal con IA</h2>
            <p className="text-sm text-slate-500 mt-1">
              El examen se generará automáticamente y se asignará a todos los estudiantes del salón.
            </p>
          </div>
        </div>

        {/* Notificaciones de Estado */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-center space-x-2 text-sm font-medium shadow-xs">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center space-x-2 text-sm font-medium shadow-xs">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Sección 1: Información General */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              📋 Información General
            </h3>
            
            <div className="space-y-1.5">
              <label htmlFor="titulo" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Título del Examen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej: Evaluación de Comprensión Lectora - Marzo"
                maxLength={300}
                required
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="descripcion" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Descripción (opcional)
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción o instrucciones adicionales para el examen..."
                rows={3}
                maxLength={1000}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition font-medium resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="fechaLimite" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Fecha Límite (opcional)
              </label>
              <input
                type="datetime-local"
                id="fechaLimite"
                name="fechaLimite"
                value={formData.fechaLimite}
                onChange={handleChange}
                className="w-full sm:w-64 px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition font-medium"
              />
              <p className="text-xs text-slate-400 font-medium">Si no se establece, el examen no tendrá fecha de vencimiento</p>
            </div>
          </div>

          {/* Sección 2: Parámetros de Generación con IA */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              🤖 Parámetros de Generación con IA
            </h3>
            
            <div className="space-y-1.5">
              <label htmlFor="temaConcepto" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Tema o Concepto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="temaConcepto"
                name="temaConcepto"
                value={formData.temaConcepto}
                onChange={handleChange}
                placeholder="Ej: La fotosíntesis, El sistema solar, Animales vertebrados..."
                required
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition font-medium"
              />
              <p className="text-xs text-slate-400 font-medium">La IA generará una lectura sobre este tema</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="tipoTexto" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Tipo de Texto
                </label>
                <select
                  id="tipoTexto"
                  name="tipoTexto"
                  value={formData.tipoTexto}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition font-medium cursor-pointer"
                >
                  {tiposTexto.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="longitudTexto" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Longitud del Texto
                </label>
                <select
                  id="longitudTexto"
                  name="longitudTexto"
                  value={formData.longitudTexto}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition font-medium cursor-pointer"
                >
                  {longitudesTexto.map(longitud => (
                    <option key={longitud} value={longitud}>
                      {longitud} {longitud === 'Corto' ? '(200-400 palabras)' : longitud === 'Medio' ? '(400-600 palabras)' : '(600-800 palabras)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="gradoEscolar" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Grado Escolar
                </label>
                <select
                  id="gradoEscolar"
                  name="gradoEscolar"
                  value={formData.gradoEscolar}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition font-medium cursor-pointer"
                >
                  {gradosEscolares.map(grado => (
                    <option key={grado} value={grado}>{grado} Grado</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="complejidad" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Complejidad
                </label>
                <select
                  id="complejidad"
                  name="complejidad"
                  value={formData.complejidad}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition font-medium cursor-pointer"
                >
                  {complejidades.map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cantidadPreguntas" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Cantidad de Preguntas
              </label>
              <select
                id="cantidadPreguntas"
                name="cantidadPreguntas"
                value={formData.cantidadPreguntas}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition font-medium cursor-pointer"
              >
                {cantidadesPreguntas.map(cantidad => (
                  <option key={cantidad} value={cantidad}>{cantidad} preguntas</option>
                ))}
              </select>
              <div className="inline-block bg-slate-50 text-xs font-medium text-slate-500 px-3 py-1.5 rounded-lg border border-slate-100">
                📊 Distribución estándar: 40% literales, 40% inferenciales, 20% críticas
              </div>
            </div>
          </div>

          {/* Sección 3: Opciones de Publicación */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              📢 Opciones de Publicación
            </h3>
            
            <div className="space-y-1">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="publicado"
                  checked={formData.publicado}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm font-semibold text-slate-700 select-none group-hover:text-slate-900 transition">
                  Publicar inmediatamente (los estudiantes podrán verlo)
                </span>
              </label>
              <p className="text-xs text-slate-400 font-medium pl-7">
                Si no se publica, quedará como borrador y deberá publicarse manualmente después
              </p>
            </div>
          </div>

          {/* Acciones del Formulario */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 text-xs font-semibold tracking-wide uppercase rounded-xl hover:bg-slate-100 active:bg-slate-200/70 transition disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-slate-800 text-white text-xs font-semibold tracking-wide uppercase rounded-xl hover:bg-slate-900 active:bg-slate-950 transition shadow-xs disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin"></div>
                  <span>Generando con IA...</span>
                </>
              ) : (
                <>
                  <span>🤖</span>
                  <span>Crear Examen</span>
                </>
              )}
            </button>
          </div>

          {/* Mensaje Informativo en Carga */}
          {loading && (
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 text-center space-y-1 animate-pulse">
              <p className="text-sm font-semibold text-emerald-800">⏳ Generando lectura y preguntas con Inteligencia Artificial...</p>
              <p className="text-xs text-emerald-600/90">Esto puede tomar entre 10 y 30 segundos.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CrearExamenGrupal;