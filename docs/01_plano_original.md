# Plano de Implementação: Plataforma CIPA SENAI-SP (Gestão de EPIs e Alertas)

Sistema web completo voltado para a **CIPA (Comissão Interna de Prevenção de Acidentes e Assédio)** da rede **SENAI-SP**, focado na gestão individualizada e setorial de Equipamentos de Proteção Individual (EPIs), controle de entregas, identificação de itens em falta, monitoramento de Certificados de Aprovação (CA) e alertas automatizados de vencimento de prazos de validade e troca conforme a NR-6.

---

## 🎨 Identidade Visual e Experiência do Usuário (UI/UX)
- **Cores Oficiais SENAI-SP**:
  - Vermelho SENAI (`#E30613` / `#D00000`)
  - Azul Marinho / Slate Escuro (`#0F172A` / `#1E293B`)
  - Cinza Claro & Branco Puro para Superfícies (`#F8FAFC` / `#FFFFFF`)
  - Acentos de Alerta: Verde Sucesso (`#10B981`), Âmbar Alerta (`#F59E0B`), Vermelho Crítico (`#EF4444`)
- **Estilo**: Interface Dashboard moderna, responsiva, com suporte a micro-animações, cards com efeito glassmorphism suave, tipografia corporativa (*Plus Jakarta Sans / Inter* via Google Fonts).

---

## 🛠️ Funcionalidades Principais

### 1. Dashboard de Métricas & Indicadores CIPA
- **Cards KPI**:
  - Total de Colaboradores Monitorados
  - Taxa Geral de Conformidade CIPA (% de colaboradores com 100% dos EPIs em dia)
  - Quantidade de EPIs Entregues & Ativos
  - Quantidade de EPIs em Falta / Pendentes
  - Alertas de Vencimento Próximo (< 30 dias)
  - EPIs Vencidos / CA Expirados
- **Painel de Gráficos e Status por Unidade SENAI & Departamento** (Ex.: Usinagem, Soldagem, Elétrica, Manutenção, Automotiva, Químicos, T.I./Adm).

### 2. Segmentador de Dados Inteligente (Filtros Avançados)
- **Painel lateral/superior de Segmentação**:
  - **Unidade SENAI-SP** (Ex: SENAI Ipiranga, Vila Mariana, Suíço-Brasileira, Santo André, Campinas, etc.)
  - **Departamento / Setor**
  - **Função / Cargo**
  - **Status do Colaborador** (Conforme, Com Faltas, Com Vencimento Próximo, Crítico/Vencido)
- **Busca Rápida**: por Nome, RE (Registro de Empregado), CPF ou tipo de EPI.

### 3. Matriz de Colaboradores x EPIs
- **Visão em Lista / Cards de Colaboradores**:
  - Foto/Avatar do Colaborador, Nome, RE, Cargo, Unidade SENAI.
  - Indicadores visuais de quais EPIs ele possui, quais estão faltando e os prazos de cada um.
- **Gaveta / Modal de Detalhes do Colaborador**:
  - **EPIs Em Posse**: Nome do EPI, Marca/Modelo, Número do C.A., Data de Entrega, Data de Vencimento da Validade/Troca, Status com badge colorido (Válido, Vence em X dias, Vencido).
  - **EPIs Em Falta / Requeridos**: Matriz de exigência NR-6 por cargo do SENAI (ex: Soldador necessita Máscara de Solda, Avental de Raspa, Luva Vaqueta, Óculos, Botina Bico de Aço).
  - **Ficha Eletrônica de EPI (NR-6)**: Histórico completo de entregas com simulação de assinatura digital do colaborador e emissão de Termo de Responsabilidade em formato PDF impresso.

### 4. Central de Alertas e Prazos de Vencimento
- **Painel Notificador de Prazos**:
  - Classificação por urgência: **Crítico (Vencido)**, **Alerta (Vence em 15/30 dias)**, **Regular**.
  - Ação rápida de **Registrar Renovação / Substituição de EPI**.
  - Simulador de Notificação via E-mail / WhatsApp para o Colaborador e Gestor de CIPA.

### 5. Formulários de Gestão Rápida
- **Registrar Nova Entrega de EPI**: Seleção de colaborador, EPI, CA, validade, termo de entrega.
- **Cadastrar Novo Colaborador / Atualizar Cargo**: Atribuição de riscos e EPIs obrigatórios.
- **Configuração da Matriz de Riscos por Função**: Definir quais EPIs são obrigatórios para cada área do SENAI-SP.

---

## 📁 Estrutura do Projeto

O projeto será estruturado em uma aplicação web moderna, responsiva e performática em `C:\Users\Instrutor\.gemini\antigravity-ide\scratch\cipa-senaisp`:

```
cipa-senaisp/
├── index.html              # Interface Principal (Dashboard, Segmentador, Tabelas, Modais)
├── css/
│   ├── main.css            # Estilos globais, tokens de design SENAI-SP, layout responsivo
│   ├── dashboard.css       # Estilos específicos dos cards, gráficos e segmentadores
│   └── components.css      # Modais, badges, fichas de EPI, tabelas e formulários
├── js/
│   ├── app.js              # Controlador principal da aplicação
│   ├── state.js            # Gerenciamento de estado (filtros, dados de colaboradores e EPIs)
│   ├── mockData.js         # Dados realistas da equipe SENAI-SP (Docentes, Técnicos, Manutenção, Alunos CIPA)
│   ├── ui.js               # Renderização dinâmica do DOM e componentes
│   ├── alerts.js           # Lógica de cálculo de vencimento de C.A. e notificações
│   └── export.js           # Gerador de relatório PDF / Impressão de Ficha NR-6 e Excel/CSV
└── assets/                 # Logotipos SENAI-SP e ícones
```

---

## 🧪 Plano de Verificação e Validação

### Testes Manuais de Navegação & Funcionalidade
1. **Filtros e Segmentação**: Testar a filtragem simultânea por Unidade SENAI, Departamento e Status de EPI. Verificar se a contagem dos cards KPI atualiza dinamicamente.
2. **Alertas de Vencimento**: Validar o cálculo dos prazos (itens vencidos, itens prestes a vencer em 30 dias) e verificar se o sistema sinaliza com as cores e badges correspondentes.
3. **Fluxo de Entrega de EPI**: Testar a adição de um novo EPI para um colaborador e verificar se o item sai da lista "Em Falta" e passa para "Possuídos/Entregues" atualizando o histórico.
4. **Ficha de EPI / Termo de Responsabilidade**: Gerar a Ficha NR-6 de um colaborador e validar a formatação pronta para impressão ou exportação.
5. **Responsividade & Estética**: Testar a interface em diferentes resoluções (Desktop HD, Notebook, Tablet e Mobile).

---

## ❓ Questões para Revisão do Usuário
> [!NOTE]
> 1. Deseja incluir unidades SENAI-SP específicas como opções padrão no filtro (ex: SENAI Ipiranga, SENAI Vila Mariana, SENAI Suíço-Brasileira, SENAI Santo André, etc.)?
> 2. Além da consulta e registro no navegador, prefere que o sistema salve as alterações no armazenamento local (`LocalStorage`) para manter os dados mesmo ao recarregar a página?
