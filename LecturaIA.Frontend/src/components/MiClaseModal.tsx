import { confirmacionAccion } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { perfilService, type AulaDetalle } from '../services/perfilService';
import { motion, AnimatePresence } from 'framer-motion';

interface MiClaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiClaseModal({ isOpen, onClose }: MiClaseModalProps) {
  const [codigoVinculacion, setCodigoVinculacion] = useState('');
  const [claseActual, setClaseActual] = useState<AulaDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClase, setIsLoadingClase] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      cargarClaseActual();
    }
  }, [isOpen]);

  const cargarClaseActual = async () => {
    try {
      setIsLoadingClase(true);
      const clase = await perfilService.obtenerMiClase();
      setClaseActual(clase);
    } catch (err: any) {
      console.error('Error al cargar clase:', err);
    } finally {
      setIsLoadingClase(false);
    }
  };

  const handleUnirse = async () => {
    if (!codigoVinculacion.trim()) {
      setError('Por favor ingresa un código de vinculación');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const clase = await perfilService.unirseAClase(codigoVinculacion.trim().toUpperCase());
      
      setSuccess(`¡Te has unido a "${clase.nombre}" exitosamente! 🎉`);
      setCodigoVinculacion('');
      setClaseActual(clase);
      
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err: any) {
      const mensaje = err.response?.data?.mensaje || 'Error al unirse a la clase';
      setError(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalir = async () => {
    if (!(await confirmacionAccion('¿Estás seguro de que deseas salir de esta clase?'))) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await perfilService.salirDeClase();
      setClaseActual(null);
      setSuccess('Has salido de la clase exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al salir de la clase');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleUnirse();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-body">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border-4 border-slate-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-orange-400 text-white p-6 md:p-8 rounded-t-[28px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-[16px] flex items-center justify-center backdrop-blur-sm border-2 border-white/30 rotate-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black tracking-tight">Mi Clase</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Mensajes de éxito/error */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-tertiary/10 border-2 border-tertiary/30 rounded-[20px] p-4">
                <div className="flex items-center space-x-3 text-tertiary">
                  <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold">{success}</span>
                </div>
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 border-2 border-red-200 rounded-[20px] p-4">
                <div className="flex items-center space-x-3 text-red-600">
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Estado de Vinculación */}
          {isLoadingClase ? (
            <div className="flex flex-col justify-center items-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-secondary"></div>
              <p className="text-slate-500 font-bold">Buscando tu clase...</p>
            </div>
          ) : claseActual ? (
            <div className="bg-slate-50 border-2 border-slate-100 p-6 md:p-8 rounded-[24px]">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-tertiary rounded-[16px] p-3 shadow-md shadow-tertiary/20">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-black text-tertiary uppercase tracking-wider mb-1">Clase Actual</p>
                    <p className="text-2xl font-black text-slate-800 leading-none">{claseActual.nombre}</p>
                  </div>
                </div>
              </div>

              {claseActual.descripcion && (
                <p className="text-slate-600 mb-6 font-medium bg-white p-4 rounded-[16px] border-2 border-slate-100">{claseActual.descripcion}</p>
              )}

              <div className="space-y-3 text-sm font-bold text-slate-600 mb-8 bg-white p-5 rounded-[20px] border-2 border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">🧑‍🏫</div>
                  <span><strong>Docente:</strong> {claseActual.nombreDocente}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">👥</div>
                  <span><strong>Estudiantes:</strong> {claseActual.cantidadEstudiantes}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">📅</div>
                  <span><strong>Creada:</strong> {claseActual.fechaCreacion ? new Date(claseActual.fechaCreacion).toLocaleDateString() : 'No disponible'}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSalir}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-[20px] disabled:opacity-50 transition-all font-black text-lg border-2 border-red-200 hover:border-red-500"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-4 border-red-600 border-t-transparent hover:border-white"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Salir de la Clase</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-secondary/10 border-2 border-secondary/20 p-5 rounded-[24px] mb-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-secondary/20 p-2 rounded-[12px] flex-shrink-0">
                    <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-secondary font-black text-lg mb-1">¡No tienes clase todavía!</p>
                    <p className="text-secondary/80 text-sm font-bold leading-relaxed">
                      Pídele a tu profesor el código secreto de vinculación de 6 letras para unirte a tus compañeros.
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulario de unirse */}
              <div className="bg-slate-50 p-6 rounded-[24px] border-2 border-slate-100">
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">
                  Código de Vinculación
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={codigoVinculacion}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      if (value.length <= 6) {
                        setCodigoVinculacion(value);
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="BCH47X"
                    maxLength={6}
                    className="flex-1 px-6 py-4 border-4 border-slate-200 rounded-[20px] focus:ring-0 focus:border-secondary text-center text-3xl font-black tracking-[0.25em] uppercase text-slate-800 placeholder-slate-300 transition-colors"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs font-bold text-slate-400 mt-3 text-center">
                  Introduce los 6 caracteres (letras y números)
                </p>

                <button
                  onClick={handleUnirse}
                  disabled={isLoading || codigoVinculacion.length !== 6}
                  className="w-full mt-6 flex items-center justify-center space-x-2 px-6 py-4 bg-secondary text-white rounded-[20px] hover:bg-orange-600 disabled:opacity-50 disabled:bg-slate-300 transition-all font-black text-xl shadow-lg shadow-secondary/30 disabled:shadow-none hover:scale-[1.02] active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                      <span>Verificando magia...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>¡Unirme a la Clase!</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
