import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, type RegistroDocenteDto, type AuthResponseDto } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import VerificacionCodigo from '../components/VerificacionCodigo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, Lock, Mail, ArrowLeft, LogIn, Sparkles } from 'lucide-react';

export default function DocenteAuth() {
  const { login } = useAuth();
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [requiereVerificacion, setRequiereVerificacion] = useState(false);
  const [emailVerificacion, setEmailVerificacion] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [emailRegistrado, setEmailRegistrado] = useState('');
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false);

  const [formDataLogin, setFormDataLogin] = useState({ email: '', password: '' });
  const [formDataRegistro, setFormDataRegistro] = useState<RegistroDocenteDto>({
    email: '', password: '', confirmarPassword: '', nombreCompleto: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resultado = await authService.login(formDataLogin);
      if ('requiereVerificacion' in resultado) {
        setEmailVerificacion(formDataLogin.email);
        setRequiereVerificacion(true);
        setLoading(false);
        return;
      }
      if (resultado.tipoUsuario !== 'Docente' && resultado.tipoUsuario !== 'Administrador') {
        setError('Este acceso es solo para docentes');
        return;
      }
      login(resultado as AuthResponseDto);
      if (resultado.tipoUsuario === 'Administrador') navigate('/admin');
      else navigate('/docente/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.status === 403 && err.response?.data?.cuentaSuspendida) {
        setError('Tu cuenta ha sido suspendida. Contacta al administrador.');
      } else {
        const msg = err.response?.data?.mensaje || err.response?.data || 'Correo o contraseña incorrectos';
        setError(typeof msg === 'string' ? msg : 'Error al iniciar sesión');
      }
    } finally { setLoading(false); }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aceptaPoliticas) { setError('Debes aceptar las políticas de privacidad para continuar'); return; }
    if (formDataRegistro.password !== formDataRegistro.confirmarPassword) { setError('Las contraseñas no coinciden'); return; }
    if (formDataRegistro.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    
    setLoading(true);
    setError('');
    
    try {
      await authService.registrarDocente(formDataRegistro);
      setEmailRegistrado(formDataRegistro.email);
      setRegistroExitoso(true);
    } catch (err: any) {
      console.error('Registro error:', err);
      let mensaje = 'Error en el registro';
      if (err.response?.data?.mensaje) mensaje = err.response.data.mensaje;
      else if (typeof err.response?.data === 'string') mensaje = err.response.data;
      else if (err.request && !err.response) mensaje = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
      
      setError(mensaje);
    } finally { setLoading(false); }
  };

  if (registroExitoso) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden'>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary/20 blur-[100px]" />
        <Card className="w-full max-w-md relative z-10 border-tertiary/30">
          <CardContent className="pt-10 flex flex-col items-center text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }} className='bg-tertiary/20 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner'>
              <Sparkles className='w-12 h-12 text-tertiary' />
            </motion.div>
            <h2 className='text-3xl font-bold text-slate-800 mb-4'>¡Registro Exitoso!</h2>
            <p className='text-slate-600 mb-2 text-lg'>Hemos enviado un email de verificación a:</p>
            <p className='text-tertiary font-bold text-xl mb-6 bg-tertiary/10 px-4 py-2 rounded-2xl'>{emailRegistrado}</p>
            <p className='text-slate-500 text-sm mb-8'>Por favor revisa tu correo y haz clic en el enlace para activar tu cuenta de docente.</p>
            <Button onClick={() => { setRegistroExitoso(false); setModo('login'); }} variant="tertiary" size="lg" className='w-full'>Ir a Iniciar Sesión</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiereVerificacion) {
    return <VerificacionCodigo email={emailVerificacion} onVolver={() => { setRequiereVerificacion(false); setFormDataLogin({ email: '', password: '' }); }} />;
  }

  return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Background blobs for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[100px]" />

      <Card className="w-full max-w-lg relative z-10 shadow-2xl border-white border-4">
        <CardHeader className="text-center pb-2">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className='bg-tertiary/10 w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-4 border-2 border-tertiary/20 shadow-sm'>
            <BookOpen className='w-10 h-10 text-tertiary' />
          </motion.div>
          <CardTitle className="text-3xl font-bold text-slate-800">Docentes</CardTitle>
          <CardDescription className="text-lg">Portal de administración educativa</CardDescription>
        </CardHeader>

        <CardContent>
          <div className='flex mb-8 bg-slate-100 rounded-[20px] p-1.5 shadow-inner'>
            <button onClick={() => { setModo('login'); setError(''); }} className={`flex-1 py-3 rounded-[16px] font-bold text-base transition-all duration-300 ${modo === 'login' ? 'bg-white text-tertiary shadow-md scale-[1.02]' : 'text-slate-500 hover:text-tertiary'}`}>Iniciar Sesión</button>
            <button onClick={() => { setModo('registro'); setError(''); setAceptaPoliticas(false); }} className={`flex-1 py-3 rounded-[16px] font-bold text-base transition-all duration-300 ${modo === 'registro' ? 'bg-white text-tertiary shadow-md scale-[1.02]' : 'text-slate-500 hover:text-tertiary'}`}>Registrarse</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={modo} initial={{ opacity: 0, x: modo === 'login' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: modo === 'login' ? 20 : -20 }} transition={{ duration: 0.3, type: "spring" }}>
              {modo === 'login' ? (
                <form onSubmit={handleLogin} className='space-y-5'>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                    <Input type='email' placeholder='Correo electrónico' value={formDataLogin.email} onChange={(e) => { setFormDataLogin({ ...formDataLogin, email: e.target.value }); setError(''); }} required className='pl-12 focus-visible:ring-tertiary/20 focus-visible:border-tertiary hover:border-tertiary/40 border-tertiary/20' />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                    <Input type='password' placeholder='Contraseña' value={formDataLogin.password} onChange={(e) => { setFormDataLogin({ ...formDataLogin, password: e.target.value }); setError(''); }} required className='pl-12 focus-visible:ring-tertiary/20 focus-visible:border-tertiary hover:border-tertiary/40 border-tertiary/20' />
                  </div>
                  
                  {error && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='p-4 bg-red-50 border-2 border-red-200 rounded-[16px] flex items-center gap-3'>
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">😕</div>
                      <p className='text-red-600 font-medium'>{error}</p>
                    </motion.div>
                  )}
                  
                  <Button type='submit' variant="tertiary" disabled={loading} size="lg" className='w-full mt-2'>
                    {loading ? 'Accediendo...' : 'Iniciar Sesión'} <LogIn className="ml-2 w-5 h-5" />
                  </Button>
                  <div className='text-center mt-4'>
                    <Link to='/recuperar-password' className='text-sm text-slate-500 hover:text-tertiary font-bold transition-colors'>¿Olvidaste tu contraseña?</Link>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegistro} className='space-y-5'>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                    <Input type='email' placeholder='Correo electrónico' value={formDataRegistro.email} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, email: e.target.value }); setError(''); }} required className='pl-12 focus-visible:ring-tertiary/20 focus-visible:border-tertiary hover:border-tertiary/40 border-tertiary/20' />
                  </div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                    <Input type='text' placeholder='Nombre completo' value={formDataRegistro.nombreCompleto} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, nombreCompleto: e.target.value }); setError(''); }} required className='pl-12 focus-visible:ring-tertiary/20 focus-visible:border-tertiary hover:border-tertiary/40 border-tertiary/20' />
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                    <Input type='password' placeholder='Contraseña (Mínimo 8 caracteres)' value={formDataRegistro.password} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, password: e.target.value }); setError(''); }} required className='pl-12 focus-visible:ring-tertiary/20 focus-visible:border-tertiary hover:border-tertiary/40 border-tertiary/20' />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                    <Input type='password' placeholder='Confirmar contraseña' value={formDataRegistro.confirmarPassword} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, confirmarPassword: e.target.value }); setError(''); }} required className='pl-12 focus-visible:ring-tertiary/20 focus-visible:border-tertiary hover:border-tertiary/40 border-tertiary/20' />
                  </div>
                  
                  <div className='flex items-start gap-3 bg-slate-100 p-4 rounded-[16px]'>
                    <input type='checkbox' id='aceptaPoliticasDocente' checked={aceptaPoliticas} onChange={(e) => { setAceptaPoliticas(e.target.checked); setError(''); }} className='mt-1 w-6 h-6 text-tertiary border-2 border-slate-300 rounded-[8px] focus:ring-tertiary' />
                    <label htmlFor='aceptaPoliticasDocente' className='text-sm text-slate-600 cursor-pointer select-none leading-relaxed'>
                      Acepto las <Link to='/politicas-privacidad' target='_blank' className='text-tertiary hover:text-tertiary/80 font-bold underline'>políticas de privacidad y protección de datos</Link>
                    </label>
                  </div>
                  
                  {error && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='p-4 bg-red-50 border-2 border-red-200 rounded-[16px] flex items-center gap-3'>
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">😕</div>
                      <p className='text-red-600 font-medium'>{error}</p>
                    </motion.div>
                  )}
                  
                  <Button type='submit' variant="tertiary" disabled={loading} size="lg" className='w-full'>
                    {loading ? 'Procesando...' : 'Crear Cuenta Docente'} <Sparkles className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
          
          <div className='mt-8 text-center'>
            <Link to='/' className='inline-flex items-center text-slate-500 hover:text-slate-800 font-bold transition-colors bg-slate-100 px-4 py-2 rounded-full'>
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}