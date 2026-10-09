# Plataforma CIPA SENAI-SP (Gestão de EPIs e Alertas)

Bem-vindo ao repositório oficial da Plataforma CIPA SENAI-SP!  
Este projeto é focado no controle, emissão de alertas e conformidade (NR-6) de Equipamentos de Proteção Individual (EPIs) para a Escola SENAI 8.50 Euclides Facchini e demais unidades.

## 🌐 Acesso Online em Produção
- 🔗 **Vercel (Principal):** [https://cipa-senai.vercel.app](https://cipa-senai.vercel.app)
- 🔗 **GitHub Pages:** [https://allanbeneduzzi-cyber.github.io/CIPA-SENAI/](https://allanbeneduzzi-cyber.github.io/CIPA-SENAI/)

## 🎯 Objetivo
Sistema web completo para a gestão individualizada e setorial de EPIs, com controle de entregas, identificação de itens em falta, monitoramento de Certificados de Aprovação (CA), módulo integrado de almoxarifado/estoque e emissão de alertas automáticos de vencimento e troca.

## 📂 Estrutura do Projeto
- `index.html`: Dashboard, interface principal, tabelas e modais.
- `css/`: Estilos da aplicação (main.css, dashboard.css, components.css).
- `js/`: Lógica central, gerenciamento de estado (LocalStorage), base oficial de colaboradores, mock de dados, gerador de alertas e exportação (CSV/PDF Ficha NR-6).
- `assets/`: Imagens (logo SENAI).
- `docs/`: **Histórico completo de implementações.** Consulte sempre antes de novas sessões.
- `server.ps1`: Script PowerShell para rodar a aplicação local na porta 3000.

## 🧠 Histórico de Sessões (pasta `docs/`)
| Arquivo | Conteúdo |
|---|---|
| `01_plano_original.md` | Escopo funcional planejado, métricas, cargos e cronograma. |
| `02_historico_walkthrough.md` | Estado do projeto após primeira entrega. |
| `03_sessao_02set2026.md` | **Sessão 02/09/2026** — Correção de KPIs, exclusão/edição de colaboradores, cadastro de setores, correção de modais aninhados, refatoração de eventos, fix de botão Cancelar. |
| `04_sessao_23set2026.md` | **Sessão 23/09/2026** — Autocomplete inteligente de EPIs nos modais com C.A. e validade automática. |
| `05_sessao_25set2026.md` | **Sessão 25/09/2026** — Módulo de Controle de Estoque & Almoxarifado NR-6, baixa automática em entregas, modal de inventário entregue, alinhamento dos 7 cards em linha única. |
| `06_sessao_30set2026.md` | **Sessão 30/09/2026** — Ajuste de nomenclatura do cabeçalho da tabela para "Status de EPI's" e snapshot de segurança. |
| `07_sessao_02out2026.md` | **Sessão 02/10/2026** — Estruturação oficial de Áreas e Setores, importação integral dos 76 colaboradores, filtro do Segmentador por Área/Setor e deploy em produção (GitHub Pages e Vercel). |
| `08_sessao_09out2026.md` | **Sessão 09/10/2026** — Sistema de Notificação e Disparo de Alertas Corporativos por E-mail (NR-6 / CIPA), disparo individual via Outlook, central de disparos em lote (CCO) e fix de modais responsivos. |

## 🔑 Regras Críticas de Desenvolvimento

> ⚠️ **Modais** devem ser sempre **filhos diretos do `<body>`**. Modais aninhados dentro de outros `.modal-backdrop` herdam `visibility: hidden` e nunca aparecem.

> ⚠️ **Botão Cancelar nos modais**: Use `class="btn-secondary btn-close-modal"`. O CSS em `components.css` já trata o override do estilo circular.

> 🗄️ **LocalStorage Keys:**
> - Colaboradores & EPIs Entregues: `CIPA_SENAI_SP_COLLABORATORS_V2`
> - Áreas & Setores: `CIPA_SENAI_SP_DEPARTMENTS_V2`
> - Almoxarifado / Estoque NR-6: `CIPA_SENAI_SP_STOCK_V1`
> - Logs de Movimentação de Estoque: `CIPA_SENAI_SP_STOCK_LOGS_V1`

## 🚀 Como Rodar Localmente
Abra um terminal (PowerShell) na pasta raiz do projeto e execute:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Acesso: **http://localhost:3000** ou **http://127.0.0.1:3000**

---
*Para próximos passos e histórico detalhado, consulte o arquivo `docs/07_sessao_02out2026.md`.*
