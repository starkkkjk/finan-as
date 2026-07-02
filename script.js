/**
 * SISTEMA DE PLANEJAMENTO FINANCEIRO PESSOAL
 * Arquivo de Regras de Negócio e Controle de Interface de Usuário (UI)
 */

document.addEventListener("DOMContentLoaded", () => {
    // Inicialização de Módulos Globais
    AppCore.init();
});

// Namespacing para evitar poluição de escopo global
const AppCore = {
    state: {
        receita: 0,
        meta: 0,
        prazo: 0,
        despesas: [] // Array de objetos: { id: string, nome: string, valor: number }
    },
    charts: {
        bar: null,
        pie: null
    },

    init() {
        this.cacheElements();
        this.bindEvents();
        this.carregarLocalStorage();
        this.initScrollReveal();
        this.processarLoader();
    },

    cacheElements() {
        this.loader = document.getElementById("loader");
        this.toast = document.getElementById("toast");
        this.menuToggle = document.getElementById("menuToggle");
        this.navMenu = document.getElementById("navMenu");
        this.themeToggle = document.getElementById("themeToggle");
        this.backToTop = document.getElementById("backToTop");
        
        // Elementos Form
        this.form = document.getElementById("financeForm");
        this.inputReceita = document.getElementById("receitaMensal");
        this.inputMeta = document.getElementById("metaFinanceira");
        this.inputPrazo = document.getElementById("prazoMeta");
        this.inputNomeDespesa = document.getElementById("nomeDespesa");
        this.inputValorDespesa = document.getElementById("valorDespesa");
        this.listaDespesasUI = document.getElementById("listaDespesas");
        
        // Botões de Ação
        this.btnAddDespesa = document.getElementById("btnAddDespesa");
        this.btnCalcular = document.getElementById("btnCalcular");
        this.btnExemplo = document.getElementById("btnExemplo");
        this.btnLimpar = document.getElementById("btnLimpar");
        
        // Container Dashboard
        this.dashboardSection = document.getElementById("dashboard");
    },

    bindEvents() {
        // Menu Hamburguer Mobile
        this.menuToggle.addEventListener("click", () => {
            const isOpen = this.navMenu.classList.toggle("open");
            this.menuToggle.setAttribute("aria-expanded", isOpen);
            this.menuToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
        });

        // Alternador de Temas (Dark/Light)
        this.themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");
            const isLight = document.body.classList.contains("light-mode");
            this.themeToggle.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
            this.showToast("Preferência de tema atualizada.");
            if(this.dashboardSection.classList.contains("hidden") === false) {
                this.atualizarGraficos(); // Redesenha com novas cores de variáveis se necessário
            }
        });

        // Fechamento automático de menu ao clicar em links linkados
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", (e) => {
                document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
                link.classList.add("active");
                this.navMenu.classList.remove("open");
                this.menuToggle.setAttribute("aria-expanded", "false");
                this.menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });

        // Botão Adicionar Despesa
        this.btnAddDespesa.addEventListener("click", () => this.adicionarDespesa());
        
        // Tecla Enter no campo de despesa para facilitar usabilidade
        this.inputValorDespesa.addEventListener("keypress", (e) => {
            if(e.key === 'Enter') { e.preventDefault(); this.adicionarDespesa(); }
        });

        // Botões de Controle Principal
        this.btnCalcular.addEventListener("click", () => this.executarCalculosFinanceiros());
        this.btnExemplo.addEventListener("click", () => this.preencherExemplo());
        this.btnLimpar.addEventListener("click", () => this.limparDados());

       // Ações de Relatórios
        const btnPDF = document.getElementById("btnExportPDF");
        const btnExcel = document.getElementById("btnExportExcel");
        const btnPrint = document.getElementById("btnPrint");

        if (btnPDF) btnPDF.addEventListener("click", () => this.exportarPDF());
        if (btnExcel) btnExcel.addEventListener("click", () => this.exportarExcel());
        if (btnPrint) btnPrint.addEventListener("click", () => window.print());
        // FAQ Acordeão
        document.querySelectorAll(".faq-question").forEach(btn => {
            btn.addEventListener("click", () => {
                const item = btn.parentElement;
                const isOpen = item.classList.contains("open");
                document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
                if(!isOpen) item.classList.add("open");
            });
        });

        // Botão de Retorno ao Topo
        window.addEventListener("scroll", () => {
            if (window.scrollY > 400) this.backToTop.classList.add("show");
            else this.backToTop.classList.remove("show");
            this.trackScrollPosition();
        });
        this.backToTop.addEventListener("click", () => window.scrollTo({top:0, behavior:'smooth'}));

        // Aplicação do Efeito Ripple em todos os elementos elegíveis
document.querySelectorAll(".ripple").forEach(button => {
    button.addEventListener("click", (e) => {
        let rect = button.getBoundingClientRect();
        let x = e.clientX - rect.left;
                let y = e.clientY - e.target.getBoundingClientRect().top;
                let ripples = document.createElement("span");
                ripples.classList.add("ripple-effect");
                ripples.style.left = x + "px";
                ripples.style.top = y + "px";
                this.appendChild(ripples);
                setTimeout(() => { ripples.remove(); }, 600);
            });
        });
    },

    processarLoader() {
        setTimeout(() => {
            this.loader.style.opacity = "0";
            this.loader.style.visibility = "hidden";
        }, 800);
    },

    showToast(msg) {
        this.toast.textContent = msg;
        this.toast.classList.add("show");
        setTimeout(() => { this.toast.classList.remove("show"); }, 3500);
    },

    initScrollReveal() {
        const revealElements = document.querySelectorAll(".scroll-reveal");
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach(el => observer.observe(el));
    },

    trackScrollPosition() {
        const sections = document.querySelectorAll("section");
        const scrollPos = window.scrollY + 120;
        sections.forEach(section => {
            if(section.offsetTop <= scrollPos && (section.offsetTop + section.offsetHeight) > scrollPos) {
                const id = section.getAttribute("id");
                document.querySelectorAll(".nav-link").forEach(l => {
                    l.classList.remove("active");
                    if(l.getAttribute("href") === `#${id}`) l.classList.add("active");
                });
            }
        });
    },

    /* ==========================================================================
       LÓGICA GERENCIAL DO SIMULADOR DE DESPESAS
       ========================================================================== */
    adicionarDespesa() {
        const nome = this.inputNomeDespesa.value.trim();
        const valor = parseFloat(this.inputValorDespesa.value);

        if(!nome || isNaN(valor) || valor <= 0) {
            this.showToast("Informe dados válidos para a despesa.");
            return;
        }

        const novaDespesa = {
            id: 'desp_' + Date.now(),
            nome: nome,
            valor: valor
        };

        this.state.despesas.push(novaDespesa);
        this.renderizarItemDespesaUI(novaDespesa);
        this.salvarLocalStorage();

        // Limpeza dos campos de inserção despesa
        this.inputNomeDespesa.value = "";
        this.inputValorDespesa.value = "";
        this.inputNomeDespesa.focus();
        this.showToast(`Despesa "${nome}" adicionada.`);
    },

    renderizarItemDespesaUI(despesa) {
        const li = document.createElement("li");
        li.className = "despesa-item";
        li.setAttribute("id", despesa.id);
        li.innerHTML = `
            <span>${despesa.nome}</span>
            <div>
                <strong style="margin-right: 15px;">R$ ${despesa.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
                <button type="button" class="btn-remove-item" aria-label="Remover despesa ${despesa.nome}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        
        li.querySelector(".btn-remove-item").addEventListener("click", () => this.removerDespesa(despesa.id));
        this.listaDespesasUI.appendChild(li);
    },

    removerDespesa(id) {
        const index = this.state.despesas.findIndex(d => d.id === id);
        if(index > -1) {
            const nomeRemovido = this.state.despesas[index].nome;
            this.state.despesas.splice(index, 1);
            const elemento = document.getElementById(id);
            if(elemento) elemento.remove();
            this.salvarLocalStorage();
            this.showToast(`Despesa "${nomeRemovido}" removida.`);
        }
    },

    /* ==========================================================================
       LÓGICA MATEMÁTICA E PROCESSAMENTO DE MÉTRICAS FINANCEIRAS
       ========================================================================== */
    executarCalculosFinanceiros() {
        const receita = parseFloat(this.inputReceita.value);
        const meta = parseFloat(this.inputMeta.value);
        const prazo = parseInt(this.inputPrazo.value);

        if(isNaN(receita) || receita <= 0 || isNaN(meta) || meta <= 0 || isNaN(prazo) || prazo <= 0) {
            this.showToast("Por favor, preencha os três campos estruturais da simulação.");
            return;
        }

        this.state.receita = receita;
        this.state.meta = meta;
        this.state.prazo = prazo;
        this.salvarLocalStorage();

        // Operações de Soma
        const despesasTotais = this.state.despesas.reduce((acc, curr) => acc + curr.valor, 0);
        const saldoMensal = receita - despesasTotais;
        
        // Regra de Metas e Viabilidade
        const economiaNecessariaPorMes = meta / prazo;
        const economiaPossivel = saldoMensal > 0 ? saldoMensal : 0;
        const diferencaMeta = economiaPossivel - economiaNecessariaPorMes;
        
        const percentualGasto = (despesasTotais / receita) * 100;
        const metaAlcancada = economiaPossivel >= economiaNecessariaPorMes;

        // Atualização dos Cards com Efeito de Contador Animado
        this.animarContadorMonetario("cardReceita", receita);
        this.animarContadorMonetario("cardDespesas", despesasTotais);
        this.animarContadorMonetario("cardSaldo", saldoMensal);
        this.animarContadorMonetario("cardMeta", meta);
        this.animarContadorMonetario("cardEcoNecessaria", economiaNecessariaPorMes);
        this.animarContadorMonetario("cardEcoAtual", economiaPossivel);
        
        document.getElementById("cardPrazo").textContent = `${prazo} meses`;
        document.getElementById("cardPercentual").textContent = `${percentualGasto.toFixed(1)}%`;

        // Modificação de cor do Ícone de Saldo com base no resultado líq.
        const saldoIcon = document.querySelector(".id-saldo-icon");
        if(saldoMensal >= 0) {
            saldoIcon.className = "metric-icon bg-success-alpha text-success id-saldo-icon";
        } else {
            saldoIcon.className = "metric-icon bg-danger-alpha text-danger id-saldo-icon";
        }

        // Construção e Disparo do Alerta de Insight Inteligente
        this.construirInsightsAlerta(metaAlcancada, diferencaMeta, percentualGasto);

        // Exibição do Painel Oculto
        this.dashboardSection.classList.remove("hidden");
        
        // Renderização/Atualização dos Componentes Gráficos e Tabela
        this.atualizarGraficos(receita, despesasTotais, saldoMensal);
        this.gerarTabelaResumo(receita, despesasTotais, saldoMensal, economiaNecessariaPorMes, economiaPossivel);

        // Deslocar tela suavemente até o painel construído
        setTimeout(() => {
            this.dashboardSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        this.showToast("Cálculos consolidados e painel atualizado!");
    },

    animarContadorMonetario(idElemento, valorFinal) {
        const el = document.getElementById(idElemento);
        let start = 0;
        const duration = 1000;
        const stepTime = Math.abs(Math.floor(duration / 30));
        const increment = valorFinal / (duration / stepTime);
        
        // Evita animação infinita ou travamentos caso valor seja zero/negativo
       if (valorFinal === 0 || isNaN(increment) || !isFinite(increment)) {
    el.textContent = `R$ ${valorFinal.toLocaleString('pt-BR', {minimumFractionDigits:2})}`;
    return;
}

        const timer = setInterval(() => {
            start += increment;
            if (start >= valorFinal) {
                clearInterval(timer);
                start = valorFinal;
            }
            el.textContent = `R$ ${start.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }, stepTime);
    },

    construirInsightsAlerta(sucesso, diferenca, percentualGasto) {
        const container = document.getElementById("insightAlert");
        container.innerHTML = "";

        const titulo = document.createElement("h4");
        if(sucesso) {
            titulo.className = "text-success";
            titulo.innerHTML = `<i class="fa-solid fa-circle-check"></i> ✅ Parabéns! Você conseguirá atingir sua meta financeira no prazo estipulado.`;
        } else {
            titulo.className = "text-danger";
            titulo.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ❌ Sua economia atual não é suficiente. Faltam R$ ${Math.abs(diferenca).toLocaleString('pt-BR', {minimumFractionDigits: 2})} mensais para sua meta.`;
        }

        const desc = document.createElement("p");
        desc.textContent = `Sua taxa de consumo atual compromete ${percentualGasto.toFixed(1)}% de sua receita total mapeada.`;

        const sugestoesTitulo = document.createElement("strong");
        sugestoesTitulo.style.display = "block";
        sugestoesTitulo.style.marginTop = "12px";
        sugestoesTitulo.textContent = "Sugestões operacionais automáticas recomendadas:";

        const lista = document.createElement("ul");
        lista.className = "insight-suggestions";
        
        const dicasBase = [
            "Reduza gastos supérfluos com lazer de alta recorrência.",
            "Revise assinaturas ativas de serviços digitais subutilizados.",
            "Planeje melhor as compras do supermercado utilizando listas estritas.",
            "Economize no transporte optando por modais alternativos sempre que possível.",
            "Evite compras por impulso através da aplicação da regra de espera de 24 horas."
        ];

        // Se o gasto for crítico (>70%), personaliza a criticidade das dicas
        if(percentualGasto > 70) {
            dicasBase.unshift("⚠️ ALERTA CRÍTICO: Seus custos fixos estão perigosamente altos. Considere renegociar contratos imediatamente.");
        }

        dicasBase.forEach(dica => {
            const li = document.createElement("li");
            li.textContent = dica;
            lista.appendChild(li);
        });

        container.appendChild(titulo);
        container.appendChild(desc);
        container.appendChild(sugestoesTitulo);
        container.appendChild(lista);
    },

    /* ==========================================================================
       CONSTRUÇÃO E ATUALIZAÇÃO DE GRÁFICOS (CHART.JS)
       ========================================================================== */
atualizarGraficos(receita = this.state.receita, despesas = null, saldo = null) {
    if (despesas === null) {despesas = this.state.despesas.reduce((acc, curr) => acc + curr.valor, 0);
            saldo = receita - despesas;
        }

        // Resgate dinâmico das cores de variáveis do tema CSS computado
        const estiloComputado = getComputedStyle(document.body);
        const corCyan = estiloComputado.getPropertyValue('--color-cyan').trim() || '#00E5FF';
        const corDanger = estiloComputado.getPropertyValue('--color-danger').trim() || '#FF1744';
        const corSuccess = estiloComputado.getPropertyValue('--color-success').trim() || '#00E676';
        const corText = estiloComputado.getPropertyValue('--text-primary').trim() || '#FFFFFF';

        // Destruição prévia para evitar vazamentos em re-renderizações e sobreposição visual
        if(this.charts.bar) this.charts.bar.destroy();
        if(this.charts.pie) this.charts.pie.destroy();

        // 1. Instanciação Gráfico de Barras Comparativo
        const ctxBar = document.getElementById('barChart').getContext('2d');
        this.charts.bar = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Receitas', 'Despesas', 'Saldo Líquido'],
                datasets: [{
                    label: 'Valores Mensais (R$)',
                    data: [receita, despesas, saldo],
                    backgroundColor: [corCyan, corDanger, saldo >= 0 ? corSuccess : corDanger],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: { ticks: { color: corText }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { ticks: { color: corText }, grid: { display: false } }
                }
            }
        });

        // 2. Instanciação Gráfico de Pizza Distribuição Despesas
        const labelsDespesas = this.state.despesas.map(d => d.nome);
        const valoresDespesas = this.state.despesas.map(d => d.valor);

        // Fallback estrutural caso não existam despesas salvas
        const dataPie = valoresDespesas.length > 0 ? valoresDespesas : [1];
        const labelPie = labelsDespesas.length > 0 ? labelsDespesas : ['Sem despesas cadastradas'];
        const coresPie = valoresDespesas.length > 0 ? 
            this.gerarPaletaCoresEstatica(valoresDespesas.length) : ['rgba(150,150,150,0.2)'];

        const ctxPie = document.getElementById('pieChart').getContext('2d');
        this.charts.pie = new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: labelPie,
                datasets: [{
                    data: dataPie,
                    backgroundColor: coresPie,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: corText, font: { size: 11 } } }
                }
            }
        });
    },

    gerarPaletaCoresEstatica(tamanho) {
        const base = ['#00E5FF', '#29B6F6', '#D500F9', '#FF1744', '#FFEA00', '#00E676', '#FF9100', '#3D5AFE'];
        let resultado = [];
        for(let i = 0; i < tamanho; i++) {
            resultado.push(base[i % base.length]);
        }
        return resultado;
    },

    gerarTabelaResumo(receita, despesas, saldo, ecoNecessaria, ecoAtual) {
        const tbody = document.querySelector("#relatorioTabela tbody");
        tbody.innerHTML = "";

        const dados = [
            { ind: "Receita Operacional Bruta", val: receita, status: "Entrada Principal" },
            { ind: "Despesas Consolidadas", val: despesas, status: `Compromete ${(despesas/receita*100).toFixed(1)}%` },
            { ind: "Fluxo Líquido Mensal (Saldo)", val: saldo, status: saldo >= 0 ? "Superavitário" : "Deficitário" },
            { ind: "Custo-Alvo Mensal da Meta", val: ecoNecessaria, status: "Retenção Obrigatória" },
            { ind: "Capacidade de Poupança Real", val: ecoAtual, status: ecoAtual >= ecoNecessaria ? "Alinhado" : "Insuficiente" }
        ];

        dados.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${item.ind}</strong></td>
                <td>R$ ${item.val.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td><span class="badge">${item.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    },

    /* ==========================================================================
       PERSISTÊNCIA EM LOCALSTORAGE, EXPORTAÇÃO E CARGA DE EXEMPLOS
       ========================================================================== */
    preencherExemplo() {
        this.inputReceita.value = "6200.00";
        this.inputMeta.value = "25000.00";
        this.inputPrazo.value = "12";
        
        this.state.despesas = [
            { id: 'desp_ex1', nome: "Moradia e Aluguel", valor: 1800 },
            { id: 'desp_ex2', nome: "Alimentação e Sacolão", valor: 850 },
            { id: 'desp_ex3', nome: "Mensalidade Faculdade", valor: 600 },
            { id: 'desp_ex4', nome: "Plano de Saúde e Academia", valor: 350 },
            { id: 'desp_ex5', nome: "Serviços Streaming e Lazer", valor: 220 }
        ];

        this.listaDespesasUI.innerHTML = "";
        this.state.despesas.forEach(d => this.renderizarItemDespesaUI(d));
        this.salvarLocalStorage();
        this.showToast("Massa de dados de exemplo carregada!");
    },

    limparDados() {
        this.state.receita = 0;
        this.state.meta = 0;
        this.state.prazo = 0;
        this.state.despesas = [];
        
        this.form.reset();
        this.listaDespesasUI.innerHTML = "";
        this.dashboardSection.classList.add("hidden");
        
        localStorage.removeItem("app_financeiro_state");
        this.showToast("Todos os dados foram excluídos com sucesso.");
    },

    salvarLocalStorage() {
        localStorage.setItem("app_financeiro_state", JSON.stringify(this.state));
    },

    carregarLocalStorage() {
        const dadosSalvos = localStorage.getItem("app_financeiro_state");
        if(dadosSalvos) {
            try {
                const parsed = JSON.parse(dadosSalvos);
                this.state.receita = parsed.receita || 0;
                this.state.meta = parsed.meta || 0;
                this.state.prazo = parsed.prazo || 0;
                this.state.despesas = parsed.despesas || [];

                if(this.state.receita > 0) this.inputReceita.value = this.state.receita;
                if(this.state.meta > 0) this.inputMeta.value = this.state.meta;
                if(this.state.prazo > 0) this.inputPrazo.value = this.state.prazo;

                this.state.despesas.forEach(d => this.renderizarItemDespesaUI(d));
            
if(this.state.receita > 0) {
    const despesasTotais = this.state.despesas.reduce((acc, curr) => acc + curr.valor, 0);
    const saldoMensal = this.state.receita - despesasTotais;
    
    this.dashboardSection.classList.remove("hidden");
    this.atualizarGraficos(this.state.receita, despesasTotais, saldoMensal);
    this.gerarTabelaResumo(this.state.receita, despesasTotais, saldoMensal, (this.state.meta / this.state.prazo), saldoMensal > 0 ? saldoMensal : 0);
}
            } catch (e) {
                console.error("Erro na restauração do LocalStorage corporativo", e);
            }
        }
    },

    /* ==========================================================================
       CONVERSÕES DE DADOS E RELATÓRIOS EXTERNOS (MOCKED CSV/COMPILATION)
       ========================================================================== */
    exportarPDF() {
        // Simulação elegante baseada no escopo nativo sem dependências de libs terceiras pesadas além de impressão limpa encapsulada
        alert("Preparando documento executável PDF. O sistema disparará a interface do subsistema de impressão nativo do sistema operacional optimizado via CSS.");
        window.print();
    },

    exportarExcel() {
        // Geração nativa de arquivo .CSV estruturado interpretável universalmente por Microsoft Excel e Planilhas Google
        let csvContent = "\uFEFF"; // BOM para correção de caracteres latinos e acentuações no Excel
        csvContent += "Indicador Operacional;Valor Referência;Status\n";
        
        const despesasTotais = this.state.despesas.reduce((acc, curr) => acc + curr.valor, 0);
        const saldoMensal = this.state.receita - despesasTotais;

        csvContent += `Receita Mensal Bruta;R$ ${this.state.receita.toFixed(2)};Entrada Mapeada\n`;
        csvContent += `Custos de Despesas;R$ ${despesasTotais.toFixed(2)};Fluxo de Saída\n`;
        csvContent += `Resultado Líquido (Saldo);R$ ${saldoMensal.toFixed(2)};Disponibilidade Real\n`;
        csvContent += `Meta Financeira Total;R$ ${this.state.meta.toFixed(2)};Alvo Estratégico\n`;
        csvContent += `Prazo Estipulado;${this.state.prazo} meses;Horizonte Temporal\n`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Relatorio_Financeiro_Executivo_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast("Planilha gerada e baixada com sucesso!");
    }
};
