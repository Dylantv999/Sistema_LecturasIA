import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { passwordService } from '../services/passwordService';
import type { ValidacionPasswordDto } from '../types/auth.types';
import { useAuth } from '../hooks/useAuth';
import { UI_CONFIG } from '../config/constants';
import { motion, AnimatePresence } from 'framer-motion';

interface CambiarPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CambiarPasswordModal({ isOpen, onClose }: CambiarPasswordModalProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [validacion, setValidacion] = useState<ValidacionPasswordDto | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Validar fortaleza de contraseña en tiempo real
  useEffect(() => {
    if (nuevaPassword.length > 0) {
      const timer = setTimeout(async () => {
        try {
          const result = await passwordService.validarFortaleza(nuevaPassword);
          setValidacion(result);
        } catch (err) {
          console.error('Error validando contraseña:', err);
        }
      }, UI_CONFIG.DEBOUNCE_DELAY_MS);

      return () => clearTimeout(timer);
    } else {
      setValidacion(null);
    }
  }, [nuevaPassword]);

  // Countdown para cerrar sesión
  useEffect(() => {
    if (showSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSuccess && countdown === 0) {
      let redirectUrl = '/';
      if (user) {
        if (user.tipoUsuario === 'Estudiante') {
          redirectUrl = '/estudiante';
        } else if (user.tipoUsuario === 'Docente' || user.tipoUsuario === 'Administrador') {
          redirectUrl = '/docente'; 
        }
      }
      logout();
      navigate(redirectUrl);
    }
  }, [showSuccess, countdown, user, logout, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordActual || !nuevaPassword || !confirmarPassword) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (validacion && validacion.nivel !== 'Fuerte') {
      setError('La contraseña no es lo suficientemente fuerte');
      return;
    }

    setLoading(true);

    try {
      await passwordService.cambiarPassword({
        passwordActual,
        nuevaPassword,
        confirmarPassword,
      });
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cambiar la contraseña');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPasswordActual('');
    setNuevaPassword('');
    setConfirmarPassword('');
    setValidacion(null);
    setError('');
    setLoading(false);
    setShowSuccess(false);
    setCountdown(3);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 font-body">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1, transition: { type: "spring", bounce: 0.5 } }} 
          className="bg-white rounded-[32px] p-8 md:p-12 max-w-md w-full mx-4 text-center border-4 border-tertiary shadow-2xl shadow-tertiary/20"
        >
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1, rotate: 360, transition: { delay: 0.2, type: "spring" } }} 
            className="mx-auto w-24 h-24 bg-tertiary/20 rounded-full flex items-center justify-center mb-6"
          >
            <svg className="w-12 h-12 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">¡Súper Seguro! 🛡️</h2>
          <p className="text-lg text-slate-600 mb-8 font-medium">Tu contraseña ha sido actualizada y está protegida.</p>
          
          <div className="bg-slate-50 border-2 border-slate-100 rounded-[20px] p-6 mb-2">
            <p className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-wider">Reiniciando sesión en</p>
            <p className="text-6xl font-black text-primary">{countdown}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-body">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border-4 border-slate-100"
      >
        <div className="bg-gradient-to-r from-tertiary to-emerald-400 text-white p-6 md:p-8 rounded-t-[28px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-[16px] flex items-center justify-center backdrop-blur-sm border-2 border-white/30 rotate-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black tracking-tight leading-tight">Cambiar<br/>Contraseña</h2>
            </div>
            <button onClick={handleClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors" disabled={loading}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">
                Contraseña Actual
              </label>
              <input
                type="password"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-4 border-slate-100 rounded-[20px] focus:outline-none focus:border-tertiary focus:bg-white text-lg font-bold text-slate-800 transition-colors"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">
                Nueva Contraseña Secreta
              </label>
              <input
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-4 border-slate-100 rounded-[20px] focus:outline-none focus:border-tertiary focus:bg-white text-lg font-bold text-slate-800 transition-colors"
                disabled={loading}
                required
              />
              <AnimatePresence>
                {validacion && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 bg-slate-50 p-4 rounded-[16px] border-2 border-slate-100 overflow-hidden">
                    {validacion.nivel === 'Fuerte' ? (
                      <div className="flex items-center text-tertiary font-bold">
                        <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        ¡Contraseña súper segura!
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center text-red-500 font-bold mb-2">
                          <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Debe ser más fuerte
                        </div>
                        <ul className="text-sm font-medium text-red-400 ml-8 list-disc space-y-1">
                          {validacion.feedback.map((mensaje: string, idx: number) => (
                            <li key={idx}>{mensaje}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">
                Confirma tu Contraseña
              </label>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-4 border-slate-100 rounded-[20px] focus:outline-none focus:border-tertiary focus:bg-white text-lg font-bold text-slate-800 transition-colors"
                disabled={loading}
                required
              />
              <AnimatePresence>
                {confirmarPassword.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 overflow-hidden">
                    {nuevaPassword === confirmarPassword ? (
                      <div className="flex items-center text-tertiary font-bold text-sm bg-tertiary/10 p-2 rounded-[12px] border-2 border-tertiary/20">
                        <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        ¡Las contraseñas coinciden!
                      </div>
                    ) : (
                      <div className="flex items-center text-red-500 font-bold text-sm bg-red-50 p-2 rounded-[12px] border-2 border-red-100">
                        <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        Las contraseñas no son iguales
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-[16px] font-bold flex items-center space-x-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-4 bg-slate-100 text-slate-600 font-black text-lg rounded-[20px] hover:bg-slate-200 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-4 bg-tertiary text-white font-black text-lg rounded-[20px] hover:bg-green-600 transition-all shadow-lg shadow-tertiary/30 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed flex justify-center items-center"
                disabled={
                  loading ||
                  !passwordActual ||
                  !nuevaPassword ||
                  !confirmarPassword ||
                  nuevaPassword !== confirmarPassword ||
                  (validacion ? validacion.nivel !== 'Fuerte' : false)
                }
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                ) : (
                  '¡Guardar!'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
