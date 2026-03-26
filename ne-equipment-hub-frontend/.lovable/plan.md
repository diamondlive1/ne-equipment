# Painel Administrativo — NE Equipment

## Fase 1: Fundação ✅
- [x] Layout admin com sidebar (9 módulos) em `/admin`
- [x] Dashboard Overview com KPIs, gráficos (Recharts), alertas, tabela de pedidos
- [ ] Activar Lovable Cloud (Auth + DB + RBAC)

## Fase 2: Operações
- [ ] Gestão de Produtos (CRUD, imagens, preços B2B/B2C, bulk import CSV)
- [ ] Gestão de Categorias (árvore hierárquica, drag-drop)
- [ ] Gestão de Pedidos (master-detail, timeline, documentos, workflow status)
- [ ] Gestão de RFQs (thread mensagens, conversão em pedido, templates)
- [ ] Tracking / Logística (stepper milestones, bulk update, notificações)
- [ ] CMS Institucional (editor WYSIWYG, SEO, banners)

## Fase 3: Integrações & Analytics
- [ ] Marketplace import (Alibaba/AliExpress — margem, frete, mapeamento categorias)
- [ ] Gestão Utilizadores & RBAC (perfis granulares, auditoria, 2FA)
- [ ] Dashboard KPIs com dados reais (substituir mock)
- [ ] Notificações automáticas (WhatsApp, email, push)
- [ ] Validação NUIT (9 dígitos, integração futura AT)
- [ ] Export batch (CSV, Excel, PDF)

## Notas Técnicas
- Backend: Lovable Cloud (Supabase) — necessário para Fase 2+
- Roles: tabela separada `user_roles` com enum `app_role`
- Mobile-first: tabelas → cards em mobile, bottom sheets
- Idioma: Português moçambicano
