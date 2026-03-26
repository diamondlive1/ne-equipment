import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, user: authUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language } = useLanguage();

    const from = location.state?.from?.pathname;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            console.log('Attempting login with:', email);
            const response: any = await login({ email, password });
            const loggedInUser = response?.user;

            toast.success(language === 'PT' ? 'Login efetuado com sucesso!' : 'Login successful!');

            // Redirecionamento dinâmico
            let dest = from || (loggedInUser?.role === 'admin' ? '/admin' : '/dashboard');

            // Se for admin e estiver a tentar voltar para a home, forçamos o painel de admin
            if (loggedInUser?.role === 'admin' && (dest === '/' || !from)) {
                dest = '/admin';
            }

            navigate(dest, { replace: true });
        } catch (err: any) {
            console.error('Full Login Error:', err);
            const errorMessage =
                err.response?.data?.errors?.email?.[0] ||
                err.response?.data?.message ||
                err.message ||
                (language === 'PT' ? 'Erro ao efetuar login. Verifique as credenciais.' : 'Error logging in. Check your credentials.');

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-navy-dark transition-colors mb-6 mx-auto sm:mx-0"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {language === 'PT' ? 'Voltar à loja' : 'Back to store'}
                </button>
                <h2 className="text-center text-3xl font-extrabold text-navy-dark">
                    {language === 'PT' ? 'Entrar na sua conta' : 'Sign in to your account'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {language === 'PT' ? 'Ou' : 'Or'}{' '}
                    <Link to="/register" state={{ from: location.state?.from }} className="font-medium text-gold hover:text-gold-light transition-colors">
                        {language === 'PT' ? 'crie uma nova conta' : 'create a new account'}
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 flex items-center gap-2 rounded-lg text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="email">{language === 'PT' ? 'E-mail' : 'Email Address'}</Label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="pl-10"
                                    placeholder="exemplo@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password">{language === 'PT' ? 'Palavra-passe' : 'Password'}</Label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="pl-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    {language === 'PT' ? 'Lembrar de mim' : 'Remember me'}
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-gold hover:text-gold-light">
                                    {language === 'PT' ? 'Esqueceu a palavra-passe?' : 'Forgot your password?'}
                                </a>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 shadow-sm text-sm font-medium bg-navy hover:bg-navy-light text-white rounded-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (language === 'PT' ? 'A entrar...' : 'Signing in...') : (language === 'PT' ? 'Entrar' : 'Sign in')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
