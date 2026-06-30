import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, type RegistroEstudianteDto, type GradoOption } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useAsync } from '../hooks/useAsync';
import { HTTP_STATUS, ROLES, GRADOS, TIMEOUTS, VALIDATION, DEFAULT_VALUES } from '../config/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { School, User, Lock, Mail, ChevronRight, Sparkles, LogIn, ArrowLeft } from 'lucide-react';

export default function EstudianteAuth() {
  const { login } = useAuth();
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [grados, setGrados] = useState<GradoOption[]>([]);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [emailRegistrado, setEmailRegistrado] = useState('');
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false);
  
  const [formDataLogin, setFormDataLogin] = useState({ email: '', password: '' });
  const [formDataRegistro, setFormDataRegistro] = useState<RegistroEstudianteDto>({
    email: '', 
    password: '', 
    confirmarPassword: '', 
    nombreCompleto: '', 
    grado: DEFAULT_VALUES.ESTUDIANTE_GRADO, 
    edad: DEFAULT_VALUES.ESTUDIANTE_EDAD
  });

  const [error, setError] = useState('');
  const { loading, execute } = useAsync();
  const navigate = useNavigate();

  useEffect(() => { if (modo === 'registro') cargarGrados(); }, [modo]);

  const cargarGrados = async () => {
    try {
      const gradosData = await authService.obtenerGrados();
      setGrados(gradosData);
    } catch { 
      setGrados([
        { value: GRADOS.CUARTO, label: '4to Grado' }, 
        { value: GRADOS.QUINTO, label: '5to Grado' }, 
        { value: GRADOS.SEXTO, label: '6to Grado' }
      ]); 
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await execute(async () => {
        const resultado = await authService.login(formDataLogin);
        if ('requiereVerificacion' in resultado) { throw new Error('Este acceso es solo para estudiantes'); }
        if (resultado.tipoUsuario !== ROLES.ESTUDIANTE) { throw new Error('Este acceso es solo para estudiantes'); }
        
        const usuarioAdaptado = {
          ...resultado,
          // @ts-ignore
          expiracion: resultado.fechaExpiracion || (resultado as any).expiracion || '' 
        };
        
        login(usuarioAdaptado as any); 
        setTimeout(() => navigate('/estudiante/dashboard'), TIMEOUTS.LOGIN_REDIRECT_DELAY);
        return resultado;
      });
    } catch (err: any) {
      if (err.message === 'Este acceso es solo para estudiantes') {
        setError(err.message);
      } else if (err.response?.status === HTTP_STATUS.FORBIDDEN && err.response?.data?.cuentaSuspendida) {
        setError('Tu cuenta ha sido suspendida. Contacta a tu profesor.');
      } else {
        setError(err.response?.data?.mensaje || 'Correo o contraseña incorrectos');
      }
    }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceptaPoliticas) { setError('Debes aceptar las políticas para continuar.'); return; }
    if (formDataRegistro.password !== formDataRegistro.confirmarPassword) { setError('Las contraseñas no coinciden.'); return; }
    if (formDataRegistro.password.length < VALIDATION.MIN_PASSWORD_LENGTH) { setError(`La contraseña debe tener al menos ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres.`); return; }
    setError('');
    
    try {
      await execute(async () => {
        await authService.registrarEstudiante(formDataRegistro);
        setEmailRegistrado(formDataRegistro.email);
        setRegistroExitoso(true);
      });
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error en el registro');
    }
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
            <h2 className='text-3xl font-bold text-slate-800 mb-4'>¡Súper Registro!</h2>
            <p className='text-slate-600 mb-2 text-lg'>Le enviamos una varita mágica (email) a:</p>
            <p className='text-primary font-bold text-xl mb-6 bg-primary/10 px-4 py-2 rounded-2xl'>{emailRegistrado}</p>
            <p className='text-slate-500 text-sm mb-8'>Dile a tus papás que revisen el correo y hagan clic en el enlace secreto para activar tu cuenta.</p>
            <Button onClick={() => { setRegistroExitoso(false); setModo('login'); }} size="lg" className='w-full'>¡Ir a Iniciar Sesión!</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Background blobs for fun premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[100px]" />

      <Card className="w-full max-w-lg relative z-10 shadow-2xl border-white border-4">
        <CardHeader className="text-center pb-2">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className='bg-primary/10 w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-4 border-2 border-primary/20 shadow-sm'>
            <School className='w-10 h-10 text-primary' />
          </motion.div>
          <CardTitle className="text-3xl font-bold text-slate-800">¡Hola Estudiante!</CardTitle>
          <CardDescription className="text-lg">Entra a jugar y aprender</CardDescription>
        </CardHeader>

        <CardContent>
          <div className='flex mb-8 bg-slate-100 rounded-[20px] p-1.5 shadow-inner'>
            <button onClick={() => { setModo('login'); setError(''); }} className={`flex-1 py-3 rounded-[16px] font-bold text-base transition-all duration-300 ${modo === 'login' ? 'bg-white text-primary shadow-md scale-[1.02]' : 'text-slate-500 hover:text-primary'}`}>Entrar</button>
            <button onClick={() => { setModo('registro'); setError(''); setAceptaPoliticas(false); }} className={`flex-1 py-3 rounded-[16px] font-bold text-base transition-all duration-300 ${modo === 'registro' ? 'bg-white text-primary shadow-md scale-[1.02]' : 'text-slate-500 hover:text-primary'}`}>Crear Cuenta</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={modo} initial={{ opacity: 0, x: modo === 'login' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: modo === 'login' ? 20 : -20 }} transition={{ duration: 0.3, type: "spring" }}>
              {modo === 'login' ? (
                <form onSubmit={handleLogin} className='space-y-5'>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                    <Input type='email' placeholder='Tu correo electrónico' value={formDataLogin.email} onChange={(e) => { setFormDataLogin({ ...formDataLogin, email: e.target.value }); setError(''); }} required className='pl-12' />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                    <Input type='password' placeholder='Tu contraseña secreta' value={formDataLogin.password} onChange={(e) => { setFormDataLogin({ ...formDataLogin, password: e.target.value }); setError(''); }} required className='pl-12' />
                  </div>
                  
                  {error && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='p-4 bg-red-50 border-2 border-red-200 rounded-[16px] flex items-center gap-3'>
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">😕</div>
                      <p className='text-red-600 font-medium'>{error}</p>
                    </motion.div>
                  )}
                  
                  <Button type='submit' disabled={loading} size="lg" className='w-full mt-2'>
                    {loading ? 'Entrando a la aventura...' : '¡A Jugar!'} <LogIn className="ml-2 w-5 h-5" />
                  </Button>
                  <div className='text-center mt-4'>
                    <Link to='/recuperar-password' className='text-sm text-slate-500 hover:text-primary font-bold transition-colors'>¿Perdiste tu contraseña?</Link>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegistro} className='space-y-5'>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                    <Input type='email' placeholder='Correo electrónico (pídeselo a tus papás)' value={formDataRegistro.email} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, email: e.target.value }); setError(''); }} required className='pl-12' />
                  </div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                    <Input type='text' placeholder='¿Cómo te llamas?' value={formDataRegistro.nombreCompleto} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, nombreCompleto: e.target.value }); setError(''); }} required className='pl-12' />
                  </div>
                  
                  <div className='grid grid-cols-2 gap-4'>
                    <div className="relative">
                      <select value={formDataRegistro.grado} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, grado: Number(e.target.value) }); }} required className='w-full h-14 min-w-0 rounded-[20px] border-2 border-primary/20 bg-white/50 px-5 py-2 text-lg transition-all duration-300 outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 hover:border-primary/40 appearance-none'>
                        {grados.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 rotate-90 pointer-events-none" />
                    </div>
                    <Input type='number' placeholder='Años' value={formDataRegistro.edad} min='5' max='100' required onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, edad: Number(e.target.value) }); }} />
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                    <Input type='password' placeholder='Crea una súper contraseña' value={formDataRegistro.password} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, password: e.target.value }); setError(''); }} required className='pl-12' />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                    <Input type='password' placeholder='Repite tu súper contraseña' value={formDataRegistro.confirmarPassword} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, confirmarPassword: e.target.value }); setError(''); }} required className='pl-12' />
                  </div>
                  
                  <div className='flex items-start gap-3 bg-slate-100 p-4 rounded-[16px]'>
                    <input type='checkbox' id='aceptaPoliticas' checked={aceptaPoliticas} onChange={(e) => { setAceptaPoliticas(e.target.checked); setError(''); }} className='mt-1 w-6 h-6 text-primary border-2 border-slate-300 rounded-[8px] focus:ring-primary' />
                    <label htmlFor='aceptaPoliticas' className='text-sm text-slate-600 cursor-pointer select-none leading-relaxed'>
                      Acepto las <Link to='/politicas-privacidad' target='_blank' className='text-primary hover:text-primary/80 font-bold underline'>reglas del juego (Políticas de privacidad)</Link>
                    </label>
                  </div>
                  
                  {error && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='p-4 bg-red-50 border-2 border-red-200 rounded-[16px] flex items-center gap-3'>
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">😕</div>
                      <p className='text-red-600 font-medium'>{error}</p>
                    </motion.div>
                  )}
                  
                  <Button type='submit' disabled={loading} size="lg" className='w-full'>
                    {loading ? 'Creando personaje...' : '¡Crear Mi Cuenta!'} <Sparkles className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
          
          <div className='mt-8 text-center'>
            <Link to='/' className='inline-flex items-center text-slate-500 hover:text-slate-800 font-bold transition-colors bg-slate-100 px-4 py-2 rounded-full'>
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a casa
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
