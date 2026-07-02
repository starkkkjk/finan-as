/**
 * SISTEMA DE PLANEJAMENTO FINANCEIRO PESSOAL
 * Arquivo de Regras de Negócio e Controle de Interface de Usuário (UI)
 */

document.addEventListener("DOMContentLoaded", () => {
    AppCore.init();
});

const AppCore = {
    state: {
        receita: 0,
        meta: 0,
        prazo: 0,
        despesas: [] 
    },
    charts: {
        bar: null,
        pie: null
    },

    init() {
        this.cacheElements();
        this.bindEvents();
        this.carregarLocalStorage();
        this.processarLoader();
    },

    cacheElements() {
        this.loader = document.getElementById("loader");
        this.toast = document.getElementById("toastContainer");
        this.menuToggle = document.getElementById("hamburger");
        this.navMenu = document.getElementById("navMenu");
        this.themeToggle = document.getElementById("themeToggle");
        this.backToTop = document.getElementById("btnTop");
        
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
        });

        // Alternador de Temas (Dark/Light)
        this.themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");
            const isLight = document.body.classList.contains("light-mode");
            this.themeToggle.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
            this.showToast("Preferência de tema atualizada.");
        });

        // Fechamento automático de menu ao clicar em links
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
                link.classList.add("active");
                this.navMenu.classList.remove("open");
                this.menuToggle.setAttribute("aria-expanded", "false");
            });
        });

        this.btnAddDespesa.addEventListener("click", () => this.adicionarDespesa());
        
        this.inputValorDespesa.addEventListener("keypress", (e) => {
            if(e.key === 'Enter') { e.preventDefault(); this.adicionarDespesa(); }
        });

        this.btnCalcular.addEventListener("click", () => this.executarCalculosFinanceiros());
        this.btnExemplo.addEventListener("click", () => this.preencherExemplo());
        this.btnLimpar.addEventListener("click", () => this.limparDados());

        // Relatórios básicos nativos
        const btnPrint = document.getElementById("btnPrint");
        if (btnPrint) btnPrint.addEventListener("click", () => window.print());

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
        });
        this.backToTop.addEventListener("click", () => window.scrollTo({top:0, behavior:'smooth'}));

        // Ripple Effect com correção de contexto do escopo local
        document.querySelectorAll(".ripple").forEach(button => {
            button.addEventListener("click", (e) => {
                let rect = button.getBoundingClientRect();
                let x = e.clientX - rect.left;
                let y = e.clientY - rect.top;
                let ripples = document.createElement("span");
                ripples.classList.add("ripple-effect");
                ripples.style.left = x + "px";
                ripples.style.top = y + "px";
                button.appendChild(ripples);
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
                <button type="button" class="btn-remove-item" style="color:red; background:none; border:none; cursor:pointer;">
                    <i class="fa-solid fa-trash-can"></i> Remover
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

        const despesasTotais = this.state.despesas.reduce((acc, curr) => acc + curr.valor, 0);
        const saldoMensal = receita - despesasTotais;
        const economiaNecessariaPorMes = meta / prazo;
        const economiaPossivel = saldoMensal > 0 ? saldoMensal : 0;
        const percentualGasto = (despesasTotais / receita) * 100;

        // IDs corrigidos e sincronizados mapeando as saídas reais do HTML
        this.animarContadorMonetario("lblIncome", receita);
        this.animarContadorMonetario("lblExpenses", despesasTotais);
        this.animarContadorMonetario("lblBalance", saldoMensal);
        this.animarContadorMonetario("lblGoal", meta);
        this.animarContadorMonetario("lblRequiredEconomy", economiaNecessariaPorMes);
        this.animarContadorMonetario("lblActualEconomy", economiaPossivel);
        
        document.getElementById("lblDeadline").textContent = `${prazo} Meses`;
        document.getElementById("lblPercentage").textContent = `${percentualGasto.toFixed(1)}%`;

        const saldoIcon = document.querySelector(".id-saldo-icon");
        if(saldoIcon) {
            saldoIcon.className = saldoMensal >= 0 ? "metric-icon bg-success id-saldo-icon" : "metric-icon bg-danger id-saldo-icon";
        }

        this.atualizarGraficos(receita, despesasTotais, saldoMensal);
        this.gerarTabelaResumo(prazo, saldoMensal, economiaNecessariaPorMes);
        
        this.showToast("Cálculos consolidados e painel atualizado!");
    },

    animarContadorMonetario(idElemento, valorFinal) {
        const el = document.getElementById(idElemento);
        if (el) {
            el.textContent = `R$ ${valorFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        }
    },

    atualizarGraficos(receita, despesas, saldo) {
        const ctxBar = document.getElementById('barChart');
        const ctxPie = document.getElementById('pieChart');
        if (!ctxBar || !ctxPie) return;

        if (this.charts.bar) this.charts.bar.destroy();
        if (this.charts.pie) this.charts.pie.destroy();

        this.charts.bar = new Chart(ctxBar.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Receita', 'Despesas Total', 'Saldo Líquido'],
                datasets: [{
                    label: 'Volume em R$',
                    data: [receita, despesas, static=saldo],
                    backgroundColor: ['#2ecc71', '#e74c3c', '#3498db']
                }]
            },
            options: { responsive: true }
        });

        const labelsDespesas = this.state.despesas.map(d => d.nome);
        const valoresDespesas = this.state.despesas.map(d => d.valor);

        this.charts.pie = new Chart(ctxPie.getContext('2d'), {
            type: 'pie',
            data: {
                labels: labelsDespesas.length ? labelsDespesas : ['Sem despesas'],
                datasets: [{
                    data: valoresDespesas.length ? valoresDespesas : [1],
                    backgroundColor: ['#e74c3c', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c']
                }]
            },
            options: { responsive: true }
        });
    },

    gerarTabelaResumo(prazo, saldoMensal, economiaNecessaria) {
        const tbody = document.getElementById("tableResultsBody");
        if (!tbody) return;
        tbody.innerHTML = "";
        let acumulado = 0;

        for (let i = 1; i <= prazo; i++) {
            acumulado += (saldoMensal > 0 ? saldoMensal : 0);
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>Mês ${i}</td>
                <td>R$ ${saldoMensal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td>R$ ${acumulado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td><span style="color: ${acumulado >= (economiaNecessaria * i) ? '#2ecc71' : '#e74c3c'}">${acumulado >= (economiaNecessaria * i) ? 'Meta em Dia' : 'Abaixo do Ideal'}</span></td>
            `;
            tbody.appendChild(tr);
        }
    },

    preencherExemplo() {
        this.inputReceita.value = "5000.00";
        this.inputMeta.value = "20000.00";
        this.inputPrazo.value = "12";
        this.showToast("Dados fictícios carregados para simulação.");
    },

    limparDados() {
        this.form.reset();
        this.state.despesas = [];
        this.listaDespesasUI.innerHTML = "";
        localStorage.removeItem("finanx_data");
        this.showToast("Todos os dados foram limpos.");
    },

    salvarLocalStorage() {
        localStorage.setItem("finanx_data", JSON.stringify(this.state));
    },

    carregarLocalStorage() {
        const backup = localStorage.getItem("finanx_data");
        if(backup) {
            try {
                this.state = JSON.parse(backup);
                this.state.despesas.forEach(d => this.renderizarItemDespesaUI(d));
            } catch(e) {
                localStorage.removeItem("finanx_data");
            }
        }
    }
};