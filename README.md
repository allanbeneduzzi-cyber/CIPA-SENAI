# Plataforma CIPA SENAI-SP (Gestão de EPIs e Alertas)

Bem-vindo ao repositório oficial da Plataforma CIPA SENAI-SP!  
Este projeto é focado no controle, emissão de alertas e conformidade (NR-6) de Equipamentos de Proteção Individual (EPIs) para a Escola SENAI 8.50 Euclides Facchini e demais unidades.

## 🎯 Objetivo
Sistema web completo para a gestão individualizada e setorial de EPIs, com controle de entregas, identificação de itens em falta, monitoramento de Certificados de Aprovação (CA) e emissão de alertas automáticos de vencimento e troca.

## 📂 Estrutura do Projeto
- `index.html`: Dashboard, interface principal, tabelas e modais.
- `css/`: Estilos da aplicação (main.css, dashboard.css, components.css).
- `js/`: Lógica central, gerenciamento de estado (LocalStorage), mock de dados, gerador de alertas e exportação (CSV/PDF Ficha NR-6).
- `assets/`: Imagens (logo SENAI).
- `docs/`: **Histórico completo de implementações.** Consulte sempre antes de novas sessões.
- `server.ps1`: Script PowerShell para rodar a aplicação na porta 3000.

## 🧠 Histórico de Sessões (pasta `docs/`)
| Arquivo | Conteúdo |
|---|---|
| `01_plano_original.md` | Escopo funcional planejado, métricas, cargos e cronograma. |
| `02_historico_walkthrough.md` | Estado do projeto após primeira entrega. |
| `03_sessao_02set2026.md` | **Sessão 02/09/2026** — Correção de KPIs, exclusão/edição de colaboradores, cadastro de setores, correção de modais aninhados, refatoração de eventos, fix de botão Cancelar. |
| `04_sessao_23set2026.md` | **Sessão 23/09/2026** — Autocomplete inteligente de EPIs nos modais com C.A. e validade automática. |
| `05_sessao_25set2026.md` | **Sessão 25/09/2026** — Módulo de Controle de Estoque & Almoxarifado NR-6, baixa automática em entregas, modal de inventário entregue, alinhamento dos 7 cards em linha única. |

## 🔑 Regras Críticas de Desenvolvimento

> ⚠️ **Modais** devem ser sempre **filhos diretos do `<body>`**. Modais aninhados dentro de outros `.modal-backdrop` herdam `visibility: hidden` e nunca aparecem.

> ⚠️ **Botão Cancelar nos modais**: Use `class="btn-secondary btn-close-modal"`. O CSS em `components.css` já trata o override do estilo circular.

> 🗄️ **LocalStorage Keys:**
> - Colaboradores & EPIs Entregues: `CIPA_SENAI_SP_COLLABORATORS_V1`
> - Departamentos & Setores: `CIPA_SENAI_SP_DEPARTMENTS_V1`
> - Almoxarifado / Estoque NR-6: `CIPA_SENAI_SP_STOCK_V1`
> - Logs de Movimentação de Estoque: `CIPA_SENAI_SP_STOCK_LOGS_V1`

## 🚀 Como Rodar
Abra um terminal (PowerShell) na pasta raiz do projeto e execute:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Acesso: **http://localhost:3000** ou **http://localhost:8080**

---
*Para próximos passos e histórico detalhado, consulte o arquivo `docs/05_sessao_25set2026.md`.*

