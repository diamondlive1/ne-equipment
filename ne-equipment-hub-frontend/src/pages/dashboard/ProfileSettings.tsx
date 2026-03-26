import { Shield, Bell, Save, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/i18n/LanguageContext';

const ProfileSettings = () => {
  const { t } = useLanguage();
  const d = t.dashboard.profile;

  const addresses = [
    { type: d.fiscal, province: 'Maputo Cidade', district: 'KaMpfumo', bairro: 'Polana Cimento A', rua: 'Av. Julius Nyerere, 1234', default: true },
    { type: d.delivery, province: 'Maputo', district: 'Matola', bairro: 'Machava', rua: 'Rua da Indústria, 567', default: false },
  ];

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
              <Input className="border-gray-200 focus-visible:ring-black h-11" defaultValue="João Manuel Silva" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">{d.phone}</label>
              <Input className="border-gray-200 focus-visible:ring-black h-11" defaultValue="+258 84 311 4354" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Email</label>
              <Input className="border-gray-200 focus-visible:ring-black h-11" type="email" defaultValue="joao.silva@empresa.co.mz" />
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide mb-3">{d.nuitTitle}</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1.5">
                <Input className="border-gray-200 focus-visible:ring-black h-11" placeholder="000 000 000" defaultValue="123456789" />
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
            <button className="text-navy hover:underline text-sm font-medium mt-3 inline-flex items-center gap-1.5">
              <Upload className="w-4 h-4 cursor-pointer" /> Enviar Cópia do NUIT
            </button>
          </div>

          <div className="pt-4 flex justify-end">
            <Button className="bg-navy hover:bg-navy-dark text-white rounded-lg px-8 h-11 font-medium shadow-sm transition-all duration-300">
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
              <Input className="border-gray-200 focus-visible:ring-black h-11" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">{d.newPassword}</label>
              <Input className="border-gray-200 focus-visible:ring-black h-11" type="password" placeholder="••••••••" />
            </div>
          </div>

          <div className="flex justify-start">
            <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50 h-11 px-6">
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
          {addresses.map((addr, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-5 relative hover:border-navy transition-colors">
              {addr.default && (
                <span className="absolute top-0 right-0 bg-navy text-white text-[10px] uppercase font-bold px-2 py-1 tracking-wider rounded-bl-lg">
                  Padrao
                </span>
              )}
              <div className="mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {addr.type}
                </span>
              </div>

              <div className="space-y-1 mb-6">
                <p className="font-medium text-gray-900">{addr.rua}</p>
                <p className="text-gray-600 text-sm">{addr.bairro}</p>
                <p className="text-gray-600 text-sm">{addr.district}, {addr.province}</p>
              </div>

              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <button className="text-sm font-medium text-navy hover:underline">Editar</button>
                <span className="text-gray-300">|</span>
                <button className="text-sm font-medium text-red-600 hover:underline">Remover</button>
              </div>
            </div>
          ))}
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
