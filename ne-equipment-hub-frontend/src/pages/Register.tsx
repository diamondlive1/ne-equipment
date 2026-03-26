import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, AlertCircle, ArrowLeft, User, Phone } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language } = useLanguage();

    const from = location.state?.from?.pathname;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirmation) {
            setError(language === 'PT' ? 'As palavras-passe não coincidem.' : 'Passwords do not match.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response: any = await register(formData);
            const registeredUser = response?.user;

            toast.success(language === 'PT' ? 'Conta criada com sucesso!' : 'Account created successfully!');

            // Redirecionamento dinâmico
            let dest = from || (registeredUser?.role === 'admin' ? '/admin' : '/dashboard');

            // Se for admin e estiver a tentar voltar para a home, forçamos o painel de admin
            if (registeredUser?.role === 'admin' && (dest === '/' || !from)) {
                dest = '/admin';
            }

            navigate(dest, { replace: true });
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                (language === 'PT' ? 'Erro ao criar conta. Verifique os dados fornecidos.' : 'Error creating account. Check the provided data.')
            );
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
                    {language === 'PT' ? 'Criar uma nova conta' : 'Create a new account'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {language === 'PT' ? 'Ou' : 'Or'}{' '}
                    <Link to="/login" state={{ from: location.state?.from }} className="font-medium text-gold hover:text-gold-light transition-colors">
                        {language === 'PT' ? 'aceda à sua conta existente' : 'sign in to your existing account'}
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
                            <Label htmlFor="name">{language === 'PT' ? 'Nome Completo' : 'Full Name'}</Label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="pl-10"
                                    placeholder="João Silva"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

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
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="phone">{language === 'PT' ? 'Telemóvel' : 'Phone Number'}</Label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    className="pl-10"
                                    placeholder="+258 8X XXX XXXX"
                                    value={formData.phone}
                                    onChange={handleChange}
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
                                    required
                                    className="pl-10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password_confirmation">{language === 'PT' ? 'Confirmar Palavra-passe' : 'Confirm Password'}</Label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    required
                                    className="pl-10"
                                    placeholder="••••••••"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 shadow-sm text-sm font-medium bg-navy hover:bg-navy-light text-white rounded-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (language === 'PT' ? 'A criar...' : 'Creating...') : (language === 'PT' ? 'Criar Conta' : 'Create Account')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
