# Sistema de Planejamento Financeiro Pessoal 💰

Um ecossistema web de alto padrão voltado para a gestão, controle e projeção da saúde financeira patrimonial. Com uma interface minimalista inspirada em dashboards de bancos digitais (*Dark Mode* como padrão), a plataforma combina ferramentas práticas de simulação a um painel analítico dinâmico, além de módulos integrados de educação financeira.

---

## 🚀 Funcionalidades Principais

* **Simulador Orçamentário Dinâmico:** Entrada parametrizada de Receita Líquida, Meta Financeira Alvo e Prazo em meses, acompanhado de gerenciador de despesas síncrono (adição/remoção individual).
* **Alertas Inteligentes e Insights:** Sistema automatizado baseado em regras de negócio que valida a viabilidade de metas e emite diretrizes operacionais de consumo baseadas no comprometimento de renda.
* **Dashboard Analítico Avançado:** Renderização gráfica automatizada em tempo real através da biblioteca **Chart.js** (Gráfico de barras comparativo e gráfico de pizza para distribuição percentual de custos).
* **Persistência Local Automática:** Salvamento e recuperação síncrona do estado da aplicação utilizando `LocalStorage`.
* **Módulo de Educação Financeira:** Cards didáticos integrando conceitos de *Reserva de Emergência*, *Juros Compostos*, *Regra 50-30-20* com barra de progresso visual, dicas rápidas e acordeões interativos (FAQ).
* **Exportação Multiformato:** Rotinas nativas para conversão de dados analíticos para relatórios em formatos **CSV (Excel/Sheets)** e layout customizado de **Impressão/PDF via CSS Print**.

---

## 🎨 Arquitetura de Design (UI/UX)

* **Tema Principal:** *Dark Mode* nativo (`#0D1117` e `#161B22`) com realces em Ciano Digital (`#00E5FF`). Suporte a alternância para *Light Mode*.
* **Efeitos Premium:** Layouts construídos utilizando **CSS Grid** e **Flexbox**, cards baseados em **Glassmorphism** (`backdrop-filter`), efeito tátil *Ripple* nos botões e transições fluidas de estado.
* **Acessibilidade:** Suporte integral à navegação via teclado, focos visíveis customizados (`:focus-visible`), contraste validado e mapeamento semântico através de atributos **ARIA**.
* **Responsividade Total:** Redirecionamento e adaptação estrutural imediata para resoluções Desktop, Notebook, Tablet e Smartphones (Menu Hambúrguer estruturado para resoluções mobile).

---

## 📁 Estrutura de Arquivos

O projeto é estritamente estático, independente de compiladores ou frameworks, otimizado para execução local imediata em qualquer navegador: