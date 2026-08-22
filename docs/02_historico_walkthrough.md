# Registro de Histórico & Walkthrough: Plataforma CIPA SENAI 8.50 EUCLIDES FACCHINI

Este documento registra o estado completo da aplicação desenvolvida para a **CIPA da Escola SENAI 8.50 Euclides Facchini**, pronta para ser retomada.

---

## 📌 Status do Projeto
- **Unidade Padrão**: Escola SENAI 8.50 Euclides Facchini (Votuporanga - SP).
- **Logotipo**: Imagem oficial fiel do SENAI integrada ao cabeçalho e termos de entrega.
- **Servidor Local**: Configurado via PowerShell (`server.ps1`) rodando em `http://localhost:3000`.

---

## 🛠️ Funcionalidades Desenvolvidas

### 1. 📊 Segmentador de Dados (Side Panel)
- **Filtro por Unidade SENAI-SP** (*SENAI 8.50 Euclides Facchini* como unidade principal).
- **Filtro por Departamento / Setor** (*Usinagem CNC, Caldeiraria & Soldagem, Eletroeletrônica, Laboratório de Química, Manutenção, Automotiva, Adm*).
- **Filtro por Status de Conformidade**:
  - 🟢 100% Conforme
  - 🟡 Vencimento Próximo (< 30 dias)
  - 🔴 EPI / C.A. Vencido
  - 🔵 EPIs em Falta

### 2. 🛡️ Controle de EPIs & Alertas de Vencimento
- **Visualização em Tabela e Cards (Grid)**.
- **Gaveta Lateral de Perfil do Colaborador**: Mostra EPIs em posse com contagem de dias restantes para o vencimento do C.A., EPIs em falta requeridos para o cargo e histórico.
- **Central de Notificações**: Alertas de renovação e disparos simulados em lote.

### 3. 📄 Emissão de Ficha de Registro NR-6 (PDF / Impressão)
- Documento legal completo com o **Logotipo Oficial SENAI**, dados do colaborador, tabela de EPIs, Termo de Responsabilidade (NR-6.7.1) e linhas de assinatura.
- **Exportação CSV/Excel**: Relatório completo para auditorias CIPA.

### 4. 🆕 Atualizações Recentes (Hoje)
- **Navegação Interativa nos KPIs**: O card de alerta "Vencidos / Expirados" (🚨) agora é clicável, redirecionando o usuário diretamente para a Central de Alertas para facilitar a visualização dos itens críticos.
- **Cadastro de Novos EPIs**: Implementado o botão e o modal "Cadastrar EPI" no painel principal, abrindo caminho para o cadastro e gerenciamento de novos tipos de equipamentos no catálogo da plataforma.

---

## 📂 Estrutura de Arquivos

| Caminho | Descrição |
| :--- | :--- |
| [index.html](file:///C:/Users/Instrutor/.gemini/antigravity-ide/scratch/cipa-senaisp/index.html) | Página principal com o logotipo oficial SENAI e estrutura visual |
| [assets/senai-logo-official.png](file:///C:/Users/Instrutor/.gemini/antigravity-ide/scratch/cipa-senaisp/assets/senai-logo-official.png) | Logotipo bitmap oficial fiel do SENAI |
| [css/main.css](file:///C:/Users/Instrutor/.gemini/antigravity-ide/scratch/cipa-senaisp/css/main.css) | Estilos globais e variáveis de design SENAI |
| [css/dashboard.css](file:///C:/Users/Instrutor/.gemini/antigravity-ide/scratch/cipa-senaisp/css/dashboard.css) | Estilos dos cards KPI, tabelas e matrizes |
| [css/components.css](file:///C:/Users/Instrutor/.gemini/antigravity-ide/scratch/cipa-senaisp/css/components.css) | Modais, gaveta lateral e Ficha NR-6 |
| [js/mockData.js](file:///C:/Users/Instrutor/.gemini/antigravity-ide/scratch/cipa-senaisp/js/mockData.js) | Dados de colaboradores da escola 8.50 e matriz de EPIs por cargo |
| [js/state.js](file:///C:/Users/Instrutor/.gemini/antigravity-ide/scratch/cipa-senaisp/js/state.js) | Gerenciador de estado com persistência em `LocalStorage` |
| [js/alerts.js](file:///C:/Users/Instrutor/.gemini/antigravity-ide/scratch/cipa-senaisp/js/alerts.js) | Cálculo de datas de vencimento de C.A. e taxas de conformidade |
| [js/export.js](file:///C:/Users/Instrutor/.gemini/antigravity-ide/scratch/cipa-senaisp/js/export.js) | Gerador de Ficha NR-6 em PDF impresso com o logo oficial |
| [js/ui.js](file:///C:/Users/Instrutor/.gemini/antigravity-ide/scratch/cipa-senaisp/js/ui.js) | Renderizador dinâmico de componentes |
| [js/app.js](file:///C:/Users/Instrutor/.gemini/antigravity-ide/scratch/cipa-senaisp/js/app.js) | Inicializador de eventos |
| [server.ps1](file:///C:/Users/Instrutor/.gemini/antigravity-ide/scratch/cipa-senaisp/server.ps1) | Script do servidor HTTP PowerShell |

---

## 🚀 Como Iniciar Amanhã

Para reabrir o projeto amanhã:
1. Abra a pasta do projeto: `C:\Users\Instrutor\.gemini\antigravity-ide\scratch\cipa-senaisp`.
2. Se necessário, inicie o servidor rodando no terminal: `powershell -ExecutionPolicy Bypass -File server.ps1`.
3. Acesse no seu navegador: **`http://localhost:3000`**.
