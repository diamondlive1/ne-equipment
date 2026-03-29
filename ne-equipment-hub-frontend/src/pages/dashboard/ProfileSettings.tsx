import { useState, useEffect } from 'react';
import { Shield, Bell, Save, Upload, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth, Address as UserAddress } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import api from '@/services/api';

const ProfileSettings = () => {
  const { t, language } = useLanguage();
  const { user, updateUser } = useAuth();
  const d = t.dashboard.profile;

  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    nuit: user?.nuit || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        phone: user.phone || '',
        email: user.email,
        nuit: user.nuit || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.put('/user/profile', {
        name: profileData.name,
        phone: profileData.phone,
        nuit: profileData.nuit,
      });
      updateUser(response.data);
      toast.success(language === 'PT' ? 'Perfil atualizado com sucesso!' : 'Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || (language === 'PT' ? 'Erro ao atualizar perfil.' : 'Error updating profile.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error(language === 'PT' ? 'As palavras-passe não coincidem.' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.put('/user/password', passwordData);
      toast.success(language === 'PT' ? 'Palavra-passe alterada com sucesso!' : 'Password updated successfully!');
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || (language === 'PT' ? 'Erro ao atualizar palavra-passe.' : 'Error updating password.'));
    } finally {
      setIsLoading(false);
    }
  };

  const userAddresses: UserAddress[] = user?.addresses || [];

  return (
    <div className="max-w-3xl space-y-16 animate-in fade-in duration-500 pb-12">

      {/* Profile Info Section */}
      <section>
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-navy-dark">Informações da Conta</h2>
          <p className="text-gray-500 text-sm mt-1">Atualize os seus dados pessoais e fiscais B2B.</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">{d.fullName}</label>
              <Input
                className="border-gray-200 focus-visible:ring-black h-11"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">{d.phone}</label>
              <Input
                className="border-gray-200 focus-visible:ring-black h-11"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Email</label>
              <Input
                className="border-gray-200 focus-visible:ring-black h-11 bg-gray-50"
                type="email"
                value={profileData.email}
                disabled
              />
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide mb-3">{d.nuitTitle}</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1.5">
                <Input
                  className="border-gray-200 focus-visible:ring-black h-11"
                  placeholder="000 000 000"
                  value={profileData.nuit}
                  onChange={(e) => setProfileData({ ...profileData, nuit: e.target.value })}
                />
              </div>
              <div className="w-full sm:w-1/3 space-y-1.5">
                <Select defaultValue="bi">
                  <SelectTrigger className="border-gray-200 focus:ring-black h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bi">BI</SelectItem>
                    <SelectItem value="passport">{d.passport}</SelectItem>
                    <SelectItem value="dire">DIRE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="bg-navy hover:bg-navy-dark text-white rounded-lg px-8 h-11 font-medium shadow-sm transition-all duration-300"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {d.save} Alterações
            </Button>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section>
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-navy-dark">Segurança & Acesso</h2>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">{d.currentPassword}</label>
              <Input
                className="border-gray-200 focus-visible:ring-black h-11"
                type="password"
                placeholder="••••••••"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">{d.newPassword}</label>
              <Input
                className="border-gray-200 focus-visible:ring-black h-11"
                type="password"
                placeholder="••••••••"
                value={passwordData.password}
                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">{language === 'PT' ? 'Confirmar Palavra-passe' : 'Confirm Password'}</label>
              <Input
                className="border-gray-200 focus-visible:ring-black h-11"
                type="password"
                placeholder="••••••••"
                value={passwordData.password_confirmation}
                onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-start">
            <Button
              onClick={handleSavePassword}
              disabled={isLoading}
              variant="outline"
              className="text-gray-700 border-gray-300 hover:bg-gray-50 h-11 px-6"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Alterar Palavra-passe
            </Button>
          </div>

          <div className="flex items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-gray-200 bg-gray-50/50">
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" /> {d.twoFactor}
              </p>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">{d.twoFactorDesc}</p>
            </div>
            <Switch className="data-[state=checked]:bg-navy" />
          </div>
        </div>
      </section>

      {/* Addresses Section */}
      <section id="addresses">
        <div className="border-b border-gray-200 pb-4 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-navy-dark">Os Meus Endereços</h2>
            <p className="text-gray-500 text-sm mt-1">Gerencie locais para entrega e faturação comercial.</p>
          </div>
          <Button variant="outline" className="border-gray-300 text-navy hover:bg-gray-50 rounded-lg gap-1.5 hidden sm:flex">
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userAddresses.length === 0 ? (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30">
              <p className="text-gray-500">{language === 'PT' ? 'Nenhum endereço registado.' : 'No addresses registered.'}</p>
            </div>
          ) : (
            userAddresses.map((addr, i) => (
              <div key={addr.id} className="border border-gray-200 rounded-lg p-5 relative hover:border-navy transition-colors">
                {addr.is_default && (
                  <span className="absolute top-0 right-0 bg-navy text-white text-[10px] uppercase font-bold px-2 py-1 tracking-wider rounded-bl-lg">
                    {language === 'PT' ? 'Padrão' : 'Default'}
                  </span>
                )}
                <div className="mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {addr.type === 'fiscal' ? d.fiscal : d.delivery}
                  </span>
                </div>

                <div className="space-y-1 mb-6">
                  <p className="font-medium text-gray-900">{addr.street_address}</p>
                  <p className="text-gray-600 text-sm">{addr.neighborhood}</p>
                  <p className="text-gray-600 text-sm">{addr.district}, {addr.province}</p>
                </div>

                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <button className="text-sm font-medium text-navy hover:underline">Editar</button>
                  <span className="text-gray-300">|</span>
                  <button className="text-sm font-medium text-red-600 hover:underline">Remover</button>
                </div>
              </div>
            ))
          )}
        </div>

        <Button variant="outline" className="w-full mt-4 border-gray-300 text-navy hover:bg-gray-50 rounded-lg gap-1.5 sm:hidden items-center justify-center">
          <Plus className="w-4 h-4" /> Adicionar Novo
        </Button>
      </section>

      {/* Notifications Section */}
      <section>
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-navy-dark flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notificações
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {[
            { label: 'Notificações por WhatsApp', desc: d.whatsappNotif, defaultChecked: true },
            { label: 'Alertas por Email', desc: d.emailNotif, defaultChecked: true },
            { label: 'Alertas por SMS', desc: d.smsNotif, defaultChecked: false },
          ].map((ch) => (
            <div key={ch.label} className="flex items-center justify-between py-4">
              <div className="pr-4">
                <p className="font-medium text-gray-900 leading-snug">{ch.label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{ch.desc}</p>
              </div>
              <Switch className="data-[state=checked]:bg-navy flex-shrink-0" defaultChecked={ch.defaultChecked} />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default ProfileSettings;
