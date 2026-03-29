# Manual de Procedimentos - NE Equipment Platform

Este manual define o fluxo de atividades, responsabilidades e processos operacionais da plataforma.

## 1. Gestão de Produtos

### Fluxo de Inserção e Aprovação
1. **Cadastro:** O colaborador responsável pela categoria insere o produto no sistema via painel administrativo.
2. **Estado Inicial:** Todo produto recém-criado entra com o status `is_approved = false` e não fica visível no catálogo público.
3. **Revisão:** Um **Supervisor** revisa as informações, imagens e preços.
4. **Aprovação:** O Supervisor altera o status para `Aprovado`. O sistema registra automaticamente quem aprovou (`approved_by`).
5. **Publicação:** Apenas produtos aprovados são exibidos aos clientes.

## 2. Divisão de Responsabilidades

As tarefas são divididas por **Categorias Industriais**. Cada colaborador é atribuído a uma ou mais categorias específicas no seu perfil de usuário (`assigned_category_id`).

| Função | Responsabilidade |
| :--- | :--- |
| **Colaborador** | Cadastro de produtos, atualização de estoque e preços da sua categoria. |
| **Supervisor** | Aprovação final de produtos, gestão de equipa e resolução de conflitos. |
| **Admin** | Gestão de configurações globais, usuários e relatórios financeiros. |

## 3. Fluxo de Newsletter

As subscrições realizadas no rodapé do site são processadas automaticamente:
- O sistema valida o e-mail corporativo.
- Uma notificação é enviada para `geral@neequipment.co.mz`.
- Periodicamente, a lista de e-mails deve ser exportada para campanhas de marketing.

## 4. Atendimento B2B (Cotações)

1. O cliente empresarial solicita "Registar Conta" para acesso aos preços corporativos.
2. Após o login, o cliente adiciona itens ao carrinho de cotação.
3. A solicitação cai no painel de cotações, onde o colaborador da categoria correspondente deve responder em até 24h.

---
*Última atualização: 29 de Março de 2026*
