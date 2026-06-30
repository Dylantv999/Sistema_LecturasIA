import { useEffect, useState } from 'react';
import { perfilService } from '../services/perfilService';
import type { PerfilUsuario } from '../types/user.types';
import { motion, AnimatePresence } from 'framer-motion';

interface MiPerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiPerfilModal({ isOpen, onClose }: MiPerfilModalProps) {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      cargarPerfil();
    }
  }, [isOpen]);

  const cargarPerfil = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await perfilService.obtenerPerfil();
      setPerfil(data);
    } catch (err: any) {
      console.error('Error al cargar perfil:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-body">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-slate-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-500 text-white p-6 md:p-8 rounded-t-[28px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-[16px] flex items-center justify-center backdrop-blur-sm border-2 border-white/30 rotate-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black tracking-tight">Mi Perfil</h2>
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
          <AnimatePresence>
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

          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary"></div>
              <p className="text-slate-500 font-bold">Cargando tu perfil...</p>
            </div>
          ) : perfil ? (
            <div className="space-y-8">
              {/* Información General */}
              <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-[24px]">
                <h3 className="text-lg font-black text-primary uppercase tracking-wider mb-5 flex items-center">
                  <span className="w-8 h-8 bg-primary/10 rounded-[10px] flex items-center justify-center mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-[16px] border-2 border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</label>
                    <p className="text-slate-800 font-bold text-lg mt-1">{perfil.nombreCompleto}</p>
                  </div>
                  <div className="bg-white p-4 rounded-[16px] border-2 border-slate-100 overflow-hidden">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
                    <p className="text-slate-800 font-bold text-base mt-1 truncate" title={perfil.email}>{perfil.email}</p>
                  </div>
                  <div className="bg-white p-4 rounded-[16px] border-2 border-slate-100 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Rol en el Juego</label>
                    <span className={`inline-flex px-4 py-2 rounded-full text-sm font-black uppercase ${
                      perfil.tipoUsuario === 'Estudiante' 
                        ? 'bg-tertiary/20 text-tertiary border-2 border-tertiary/30' 
                        : 'bg-primary/20 text-primary border-2 border-primary/30'
                    }`}>
                      {perfil.tipoUsuario}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de Estudiante */}
              {perfil.tipoUsuario === 'Estudiante' && (
                <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-[24px]">
                  <h3 className="text-lg font-black text-purple-600 uppercase tracking-wider mb-5 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 rounded-[10px] flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </span>
                    Tus Estadísticas
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {perfil.grado && (
                      <div className="bg-white p-4 rounded-[16px] border-2 border-slate-100 text-center">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grado</label>
                        <p className="text-2xl font-black text-slate-800 mt-1">{perfil.grado}</p>
                      </div>
                    )}
                    {perfil.edad && (
                      <div className="bg-white p-4 rounded-[16px] border-2 border-slate-100 text-center">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Edad</label>
                        <p className="text-2xl font-black text-slate-800 mt-1">{perfil.edad}</p>
                      </div>
                    )}
                    {perfil.nivelDificultad && (
                      <div className="bg-purple-100 border-2 border-purple-300 p-4 rounded-[16px] text-center col-span-2 md:col-span-1 flex flex-col justify-center">
                        <label className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Nivel de Lectura
                        </label>
                        <p className="text-xl font-black text-purple-900 mt-1">{perfil.nivelDificultad}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Clase Actual (solo estudiantes) */}
              {perfil.tipoUsuario === 'Estudiante' && (
                <div>
                  {perfil.claseActual ? (
                    <div className="bg-tertiary/10 border-2 border-tertiary/20 p-6 rounded-[24px] flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-tertiary uppercase tracking-wider mb-1">Clase Actual</p>
                        <p className="text-2xl font-black text-slate-800">{perfil.claseActual.nombre}</p>
                        <p className="text-sm font-bold text-slate-500 mt-2">
                          🧑‍🏫 Docente: {perfil.claseActual.nombreDocente}
                        </p>
                      </div>
                      <div className="bg-tertiary p-3 rounded-[16px] shadow-md shadow-tertiary/20">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-secondary/10 border-2 border-secondary/20 p-5 rounded-[24px]">
                      <div className="flex items-center space-x-3">
                        <div className="bg-secondary/20 p-2 rounded-[12px]">
                          <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <p className="text-secondary font-bold">¡No estás en ninguna clase! Únete desde "Mi Clase".</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 md:px-8 py-5 border-t-2 border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-200 text-slate-700 rounded-[16px] hover:bg-slate-300 transition-colors font-black text-lg"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
