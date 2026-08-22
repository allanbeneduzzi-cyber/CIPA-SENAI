# Plataforma CIPA SENAI-SP (Gestão de EPIs e Alertas)

Bem-vindo ao repositório oficial da Plataforma CIPA SENAI-SP! 
Este projeto é focado no controle, emissão de alertas e conformidade (NR-6) de Equipamentos de Proteção Individual (EPIs) para a Escola SENAI 8.50 Euclides Facchini e demais unidades.

## 🎯 Objetivo
Sistema web completo para a gestão individualizada e setorial de EPIs, com controle de entregas, identificação de itens em falta, monitoramento de Certificados de Aprovação (CA) e emissão de alertas (Simulação Email/WhatsApp) automáticos de vencimento e troca.

## 📂 Estrutura do Projeto
- `index.html`: Dashboard, interface principal, tabelas e modais.
- `css/`: Estilos da aplicação (main, dashboard, components).
- `js/`: Lógica central, gerenciamento de estado (LocalStorage), mock de dados, gerador de alertas e exportação (CSV/PDF Ficha NR-6).
- `assets/`: Imagens (como o logo do SENAI).
- `docs/`: Histórico do projeto. **Contém as memórias das implementações originais** para que possamos sempre consultar nosso planejamento anterior.
- `server.ps1`: Script PowerShell para rodar a aplicação via servidor local na porta 3000.

## 🧠 Memórias e Histórico
Para garantir que possamos evoluir a ferramenta sem perder o contexto inicial, foram armazenados documentos valiosos no diretório `docs/`:
1. **01_plano_original.md**: Contém todo o nosso escopo funcional planejado, métricas definidas, estrutura de cargos e cronograma de implementação.
2. **02_historico_walkthrough.md**: Documenta o estado em que o projeto foi finalizado pela primeira vez, incluindo cada script e sua funcionalidade específica.

## 🚀 Como Rodar
Abra um terminal (PowerShell) na pasta raiz do projeto e execute:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Em seguida, acesse no seu navegador: `http://localhost:3000/`.

---
*Projeto inicialmente concebido e documentado em colaboração contínua. Para próximos passos, verifique os artefatos gerados.*
