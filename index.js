
/* =========================================================
   CONTROLE DE MANUTENÇÃO CCB
   ARQUIVO: index.js - PAINEL CENTRAL
   Painel + Congregações + Indicadores + Backup
========================================================= */

const PREFIXO = "ccb_manutencao_";
const CHAVE_ANTIGA = "mvp_ordens_servico_v1";
const CHAVE_IGREJAS = "controleManutencao_igrejas";
const ID_CENTRAL = "070002";
const VERSAO_BACKUP = "1.0";
const SISTEMA_BACKUP = "Controle de Manutenção CCB";
const LIMITE_BACKUP_MB = 20;

const RESPONSAVEIS = [
    "Ademilson", "Ailson", "Antonio", "Claudiomar",
    "Daniel", "Egmar", "Elson", "Luciano",
    "Marcos", "Matias", "Moacir", "Uilson", "Vilmar"
];

let igrejas = [];
let igrejaSelecionada = null;
let ordens = [];
let backupEmAndamento = false;
let modoVisualizacao = false;

/* =========================================================
   1. DADOS INICIAIS DAS CONGREGAÇÕES
========================================================= */

const IGREJAS_INICIAIS = [
    {
        id: "070002",
        codigo: "BR 07-0002",
        nome: "ALEXÂNIA - CENTRO",
        descricao: "Central"
    },
    {
        id: "070318",
        codigo: "BR 07-0318",
        nome: "DISTRITO OLHOS D'ÁGUA",
        descricao: "Olhos d'Água"
    },
    {
        id: "070329",
        codigo: "BR 07-0329",
        nome: "FAZENDA LAJE RIO DO OURO",
        descricao: "Fazenda Laje Rio do Ouro"
    },
    {
        id: "070401",
        codigo: "BR 07-0401",
        nome: "FAZENDA FUNIL",
        descricao: "Fazenda Funil"
    },
    {
        id: "070125",
        codigo: "BR 07-0125",
        nome: "FAZENDA SANTO ANDRÉ",
        descricao: "Fazenda Santo André"
    },
    {
        id: "070681",
        codigo: "BR 07-0681",
        nome: "MORADA DO SOL",
        descricao: "Morada do Sol"
    },
    {
        id: "070702",
        codigo: "BR 07-0702",
        nome: "CONGREGAÇÃO 07",
        descricao: "Nova congregação 07"
    },
    {
        id: "070703",
        codigo: "BR 07-0703",
        nome: "CONGREGAÇÃO 08",
        descricao: "Nova congregação 08"
    },
    {
        id: "070704",
        codigo: "BR 07-0704",
        nome: "CONGREGAÇÃO 09",
        descricao: "Nova congregação 09"
    },
    {
        id: "070705",
        codigo: "BR 07-0705",
        nome: "CONGREGAÇÃO 10",
        descricao: "Nova congregação 10"
    },
    {
        id: "070706",
        codigo: "BR 07-0706",
        nome: "CONGREGAÇÃO 11",
        descricao: "Nova congregação 11"
    }
];

/* =========================================================
   2. DADOS INICIAIS DA CENTRAL
========================================================= */

const DADOS_INICIAIS_CENTRAL = [
    { id: 1, numero: 1, dataAbertura: "2026-08-01", descricao: "SALÃO (CORRIMÃO SOLTO)", responsavel: "ADEMILSON", concluida: "SIM", status: "CONCLUÍDA", dataConclusao: "2026-09-09" },
    { id: 2, numero: 2, dataAbertura: "2026-08-01", descricao: "BANH. MASC. (LUZES QUEIMADAS)", responsavel: "ANTONIO", concluida: "SIM", status: "CONCLUÍDA", dataConclusao: "2026-08-03" },
    { id: 3, numero: 3, dataAbertura: "2026-08-01", descricao: "BANH. FEM. - PCD (TORNEIRA ESTRAGADA)", responsavel: "MARCOS", concluida: "SIM", status: "CONCLUÍDA", dataConclusao: "2026-08-04" },
    { id: 4, numero: 4, dataAbertura: "2026-08-01", descricao: "BANH. MASC. VESTIÁRIO (TOMADA DANDO CURTO)", responsavel: "MATIAS", concluida: "SIM", status: "CONCLUÍDA", dataConclusao: "2026-08-05" },
    { id: 5, numero: 5, dataAbertura: "2026-08-01", descricao: "SUPORTE DO ÁLCOOL DANIFICADO - ÁTRIO CENTRAL LADO IRMÃOS", responsavel: "LUCIANO", concluida: "SIM", status: "CONCLUÍDA", dataConclusao: "2026-10-05" },
    { id: 6, numero: 6, dataAbertura: "2026-08-01", descricao: "CANTINA (BANCOS DAS MESAS COM DEFEITO)", responsavel: "MOACIR", concluida: "SIM", status: "CONCLUÍDA", dataConclusao: "2026-10-05" },
    { id: 7, numero: 7, dataAbertura: "2026-08-01", descricao: "SALÃO (VERIFICAR DISJUNTOR DO PRIMEIRO PIÃO)", responsavel: "MARCOS", concluida: "SIM", status: "CONCLUÍDA", dataConclusao: "2026-09-26" },
    { id: 8, numero: 8, dataAbertura: "2026-08-01", descricao: "RECOLORIR LETRAS DE FRENTE À IGREJA", responsavel: "ADEMILSON", concluida: "SIM", status: "CONCLUÍDA", dataConclusao: "2026-08-09" },
    { id: 9, numero: 9, dataAbertura: "2026-08-01", descricao: "PORTA DOS ARMÁRIOS - FUNDO BÍBLICO TRAVANDO", responsavel: "MARCOS", concluida: "NÃO", status: "ATRASADA", dataConclusao: "" },
    { id: 10, numero: 10, dataAbertura: "2026-08-01", descricao: "FECHADURA DA PORTA DE VIDRO DO ANEXO DANIFICADA", responsavel: "MARCOS", concluida: "SIM", status: "CONCLUÍDA", dataConclusao: "2026-08-11" },
    { id: 11, numero: 11, dataAbertura: "2026-08-01", descricao: "SUPORTE DE PAPEL DO FRALDÁRIO DANIFICADO", responsavel: "LUCIANO", concluida: "SIM", status: "CONCLUÍDA", dataConclusao: "2026-10-05" },
    { id: 12, numero: 12, dataAbertura: "2026-08-01", descricao: "SALÃO (VIDRO DA JANELA QUEBRADO - LADO DAS IRMÃS)", responsavel: "MARCOS", concluida: "SIM", status: "CONCLUÍDA", dataConclusao: "2026-08-13" },
    { id: 13, numero: 13, dataAbertura: "2026-08-29", descricao: "TAPETES DA IGREJA ESTÃO DANIFICADOS", responsavel: "ELSON", concluida: "NÃO", status: "ATRASADA", dataConclusao: "" },
    { id: 14, numero: 14, dataAbertura: "2026-08-28", descricao: "CÂMERA DO ESTACIONAMENTO IRMÃOS DANIFICADA", responsavel: "MARCOS", concluida: "SIM", status: "CONCLUÍDA", dataConclusao: "2026-10-05" },
    { id: 15, numero: 15, dataAbertura: "2026-09-26", descricao: "PORTA DO BANHEIRO FEMININO - MAÇANETA DANIFICADA", responsavel: "ADEMILSON", concluida: "NÃO", status: "ATRASADA", dataConclusao: "" },
    { id: 16, numero: 16, dataAbertura: "2026-09-26", descricao: "SUPORTE DE APOIO DE BÍBLIA DO BANCO LADO DAS IRMÃS ESTÁ SOLTO", responsavel: "MOACIR", concluida: "NÃO", status: "ATRASADA", dataConclusao: "" }
];

/* =========================================================
   3. FUNÇÕES GERAIS
========================================================= */

function $(id) {
    return document.getElementById(id);
}

function lerJSON(chave, padrao = null) {
    try {
        const v = localStorage.getItem(chave);

        if (v === null) return padrao;

        return JSON.parse(v);

    } catch (e) {
        console.error("Erro ao ler:", chave, e);
        return padrao;
    }
}

function salvarJSON(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
        return true;

    } catch (e) {
        console.error("Erro ao salvar:", chave, e);
        alert("Não foi possível salvar os dados.");
        return false;
    }
}

function escaparHTML(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[c]));
}

function dataHoje() {
    const h = new Date();

    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
}

function formatarData(d) {
    if (!d) return "-";

    const p = String(d).split("-");

    if (p.length !== 3) return d;

    return `${p[2]}/${p[1]}/${p[0]}`;
}

function normalizarStatus(s) {
    const v = String(s || "ABERTA").trim().toUpperCase();

    const eq = {
        "CONCLUIDO": "CONCLUÍDA",
        "CONCLUIDA": "CONCLUÍDA",
        "CONCLUÍDO": "CONCLUÍDA",
        "NOK": "N/OK",
        "NÃO OK": "N/OK"
    };

    return eq[v] || v;
}

function normalizarOrdem(os, indice = 0) {
    const o = os && typeof os === "object" ? os : {};

    const st = normalizarStatus(o.status);

    const conc =
        String(o.concluida || "NÃO").toUpperCase() === "SIM" ||
        st === "CONCLUÍDA";

    return {
        id: String(o.id || `os-${Date.now()}-${indice}`),
        numero: Number(o.numero || o.num || indice + 1),
        dataAbertura: o.dataAbertura || o.data || dataHoje(),
        descricao: o.descricao || o.local || o.atividade || "",
        observacoes: o.observacoes || o.observacao || "",
        responsavel: o.responsavel || "",
        status: conc ? "CONCLUÍDA" : st,
        concluida: conc ? "SIM" : "NÃO",
        dataConclusao: o.dataConclusao || ""
    };
}

function obterListaOrdens(d) {
    if (Array.isArray(d)) return d;

    if (d && Array.isArray(d.ordens)) return d.ordens;

    if (d && Array.isArray(d.os)) return d.os;

    return [];
}

/* =========================================================
   4. CARREGAMENTO E ARMAZENAMENTO DAS CONGREGAÇÕES
========================================================= */

function carregarIgrejas() {
    const salvas = lerJSON(CHAVE_IGREJAS, []);

    const listaSalva = Array.isArray(salvas) ? salvas : [];

    const res = IGREJAS_INICIAIS.map(i => ({ ...i }));

    listaSalva.forEach(ig => {
        if (!ig || !ig.id) return;

        const idx = res.findIndex(
            x => String(x.id) === String(ig.id)
        );

        if (idx >= 0) {
            res[idx] = { ...res[idx], ...ig };
        } else {
            res.push(ig);
        }
    });

    salvarJSON(CHAVE_IGREJAS, res);

    return res;
}

function salvarIgrejas() {
    return salvarJSON(CHAVE_IGREJAS, igrejas);
}

function obterChaveIgreja(id) {
    return PREFIXO + String(id);
}

function carregarOrdens(idIgreja) {
    if (!idIgreja) return [];

    const dados = lerJSON(obterChaveIgreja(idIgreja), []);

    if (Array.isArray(dados)) {
        return dados.map((o, i) => normalizarOrdem(o, i));
    }

    return obterListaOrdens(dados).map(
        (o, i) => normalizarOrdem(o, i)
    );
}

function salvarOrdens(id, lista) {
    return salvarJSON(obterChaveIgreja(id), lista);
}

/* =========================================================
   5. MIGRAÇÃO DOS DADOS ANTIGOS
========================================================= */

function migrarDadosAntigos() {
    const chaveCentral = obterChaveIgreja(ID_CENTRAL);

    if (localStorage.getItem(chaveCentral) !== null) return;

    const antigos = lerJSON(CHAVE_ANTIGA, []);

    const listaAntiga = obterListaOrdens(antigos);

    if (listaAntiga.length > 0) {
        const m = listaAntiga.map(
            (o, i) => normalizarOrdem(o, i)
        );

        salvarOrdens(ID_CENTRAL, m);

        return;
    }

    const iniciais = DADOS_INICIAIS_CENTRAL.map(
        (o, i) => normalizarOrdem(o, i)
    );

    salvarOrdens(ID_CENTRAL, iniciais);
}

/* =========================================================
   6. IDENTIFICAÇÃO DA PÁGINA
========================================================= */

function obterPagina() {
    return document.body.dataset.page || "";
}

function obterIgrejaAtual() {
    const p = new URLSearchParams(window.location.search);

    const id = p.get("igreja") || p.get("id");

    if (id) {
        const e = igrejas.find(
            i => String(i.id) === String(id)
        );

        if (e) return e;
    }

    return igrejas.find(
        i => String(i.id) === ID_CENTRAL
    ) || null;
}

/* =========================================================
   7. INICIALIZAÇÃO DO PAINEL
========================================================= */

document.addEventListener("DOMContentLoaded", iniciarSistema);

function iniciarSistema() {
    igrejas = carregarIgrejas();

    migrarDadosAntigos();

    if (obterPagina() === "painel") {
        iniciarPainel();
    }
}

function iniciarPainel() {
    configurarModalIgreja();
    configurarPesquisaIgreja();
    configurarBackup();

    atualizarResumoGeral();
    renderizarListaIgrejas();
    renderizarEstadoInicial();
}

/* =========================================================
   8. INDICADORES GERAIS
========================================================= */

function atualizarResumoGeral() {
    let totalOS = 0;
    let conc = 0;
    let pend = 0;

    igrejas.forEach(ig => {
        const l = carregarOrdens(ig.id);

        totalOS += l.length;

        l.forEach(o => {
            if (o.concluida === "SIM") {
                conc++;
            } else {
                pend++;
            }
        });
    });

    if ($("totalIgrejas")) {
        $("totalIgrejas").textContent = igrejas.length;
    }

    if ($("totalOSGeral")) {
        $("totalOSGeral").textContent = totalOS;
    }

    if ($("concluidasGeral")) {
        $("concluidasGeral").textContent = conc;
    }

    if ($("pendentesGeral")) {
        $("pendentesGeral").textContent = pend;
    }

    if ($("totalIgrejasMenu")) {
        $("totalIgrejasMenu").textContent = igrejas.length;
    }
}

/* =========================================================
   9. LISTA DE CONGREGAÇÕES
========================================================= */

function renderizarListaIgrejas() {
    const lista = $("listaIgrejas");

    if (!lista) return;

    const busca = $("buscaIgreja")
        ? $("buscaIgreja").value.toLowerCase().trim()
        : "";

    const filtradas = igrejas.filter(ig =>
        [ig.nome, ig.codigo, ig.descricao, ig.id]
            .join(" ")
            .toLowerCase()
            .includes(busca)
    );

    lista.innerHTML = "";

    if ($("totalIgrejasMenu")) {
        $("totalIgrejasMenu").textContent = igrejas.length;
    }

    if (!filtradas.length) {
        lista.innerHTML = `
            <div class="sidebar-empty">
                <strong>Nenhuma congregação encontrada</strong>
                <span>Tente pesquisar por outro nome ou código.</span>
            </div>
        `;

        return;
    }

    filtradas.forEach(ig => {
        const regs = carregarOrdens(ig.id);

        const item = document.createElement("button");

        item.type = "button";
        item.className = "church-nav-item";

        if (
            igrejaSelecionada &&
            String(igrejaSelecionada.id) === String(ig.id)
        ) {
            item.classList.add("ativo");
        }

        item.innerHTML = `
            <span class="church-nav-icon">⌂</span>

            <span class="church-nav-text">
                <strong>${escaparHTML(ig.nome)}</strong>
                <small>${escaparHTML(ig.codigo || ig.id)}</small>
            </span>

            <span class="church-nav-count">${regs.length}</span>

            <span class="church-nav-arrow">›</span>
        `;

        item.addEventListener("click", () => {
            selecionarIgreja(ig.id);
        });

        lista.appendChild(item);
    });
}

function selecionarIgreja(id) {
    igrejaSelecionada = igrejas.find(
        i => String(i.id) === String(id)
    );

    if (!igrejaSelecionada) return;

    renderizarListaIgrejas();
    renderizarDetalhesIgreja();
}

/* =========================================================
   10. DETALHES DA CONGREGAÇÃO
========================================================= */

function renderizarDetalhesIgreja() {
    const d = $("detalhesIgreja");

    if (!d) return;

    if (!igrejaSelecionada) {
        renderizarEstadoInicial();
        return;
    }

    const regs = carregarOrdens(igrejaSelecionada.id);

    const total = regs.length;

    const conc = regs.filter(
        o => o.concluida === "SIM"
    ).length;

    const pend = total - conc;

    const perc = total > 0
        ? Math.round((conc / total) * 100)
        : 0;

    d.innerHTML = `
        <div class="detail-heading">

            <div class="detail-title-group">

                <div class="detail-icon">⌂</div>

                <div>
                    <p class="eyebrow">CONGREGAÇÃO SELECIONADA</p>

                    <h3>${escaparHTML(igrejaSelecionada.nome)}</h3>

                    <p class="muted small">
                        ${escaparHTML(igrejaSelecionada.codigo || igrejaSelecionada.id)}
                    </p>
                </div>

            </div>

            <a class="btn btn-primary"
               href="igreja.html?igreja=${encodeURIComponent(igrejaSelecionada.id)}">
                Abrir ordens de serviço →
            </a>

        </div>

        <div class="detail-info-grid">

            <div class="detail-info-card">
                <span class="detail-info-icon">⌂</span>
                <div>
                    <small>Congregação</small>
                    <strong>${escaparHTML(igrejaSelecionada.nome)}</strong>
                </div>
            </div>

            <div class="detail-info-card">
                <span class="detail-info-icon">#</span>
                <div>
                    <small>Código</small>
                    <strong>${escaparHTML(igrejaSelecionada.codigo || igrejaSelecionada.id)}</strong>
                </div>
            </div>

            <div class="detail-info-card">
                <span class="detail-info-icon">i</span>
                <div>
                    <small>Descrição</small>
                    <strong>${escaparHTML(igrejaSelecionada.descricao || "-")}</strong>
                </div>
            </div>

        </div>

        <div class="detail-section-title">

            <div>
                <h4>Resumo das manutenções</h4>
                <p class="muted small">
                    Indicadores das ordens de serviço desta congregação.
                </p>
            </div>

            <span class="detail-period">Dados atuais</span>

        </div>

        <div class="detail-stats">

            <div class="detail-stat">
                <span class="detail-stat-symbol blue">▤</span>
                <div>
                    <small>Total de ordens</small>
                    <strong>${total}</strong>
                </div>
            </div>

            <div class="detail-stat">
                <span class="detail-stat-symbol green">✓</span>
                <div>
                    <small>Concluídas</small>
                    <strong>${conc}</strong>
                </div>
            </div>

            <div class="detail-stat">
                <span class="detail-stat-symbol amber">◷</span>
                <div>
                    <small>Pendentes</small>
                    <strong>${pend}</strong>
                </div>
            </div>

        </div>

        <div class="completion-card">

            <div class="completion-head">

                <div>
                    <strong>Progresso das manutenções</strong>
                    <small>Percentual de ordens concluídas</small>
                </div>

                <span class="completion-percent">${perc}%</span>

            </div>

            <div class="progress-track">
                <span style="width:${perc}%"></span>
            </div>

        </div>

        <div class="detail-footer">

            <span>
                <span class="online-dot"></span>
                Dados armazenados neste navegador
            </span>

            <span>
                ${total} ${total === 1 ? "ordem cadastrada" : "ordens cadastradas"}
            </span>

        </div>
    `;
}

function renderizarEstadoInicial() {
    const d = $("detalhesIgreja");

    if (!d) return;

    d.innerHTML = `
        <div class="empty-state empty-state-main">

            <i>⌂</i>

            <h3>Bem-vindo ao Controle de Manutenção</h3>

            <p>
                Selecione uma congregação no menu lateral
                para visualizar os indicadores e acessar
                suas ordens de serviço.
            </p>

        </div>
    `;
}

function configurarPesquisaIgreja() {
    const b = $("buscaIgreja");

    if (b) {
        b.addEventListener("input", renderizarListaIgrejas);
    }
}

/* =========================================================
   11. CADASTRO DE CONGREGAÇÕES
========================================================= */

function configurarModalIgreja() {
    [
        $("btnNovaIgrejaTopo"),
        $("btnNovaIgreja")
    ]
        .filter(Boolean)
        .forEach(btn => {
            btn.addEventListener("click", abrirModalIgreja);
        });

    $("fecharModalIgreja")?.addEventListener(
        "click",
        fecharModalIgreja
    );

    $("cancelarCadastroIgreja")?.addEventListener(
        "click",
        fecharModalIgreja
    );

    $("formIgreja")?.addEventListener(
        "submit",
        cadastrarIgreja
    );

    $("modalIgreja")?.addEventListener("click", e => {
        if (e.target === $("modalIgreja")) {
            fecharModalIgreja();
        }
    });
}

function abrirModalIgreja() {
    const m = $("modalIgreja");

    if (!m) return;

    $("formIgreja")?.reset();

    if (typeof m.showModal === "function") {
        m.showModal();
    } else {
        m.setAttribute("open", "");
    }
}

function fecharModalIgreja() {
    const m = $("modalIgreja");

    if (!m) return;

    if (typeof m.close === "function") {
        m.close();
    } else {
        m.removeAttribute("open");
    }
}

function cadastrarIgreja(e) {
    e.preventDefault();

    const nome = $("nomeNovaIgreja")?.value.trim();

    const codigo = $("codigoNovaIgreja")?.value.trim();

    const descricao = $("descricaoNovaIgreja")?.value.trim();

    if (!nome || !codigo) {
        alert("Informe o nome e o código da congregação.");
        return;
    }

    const id = codigo.replace(/\D/g, "").padStart(6, "0");

    if (!id || id === "000000") {
        alert("Informe um código válido.");
        return;
    }

    if (igrejas.some(i => String(i.id) === id)) {
        alert("Já existe uma congregação cadastrada com esse código.");
        return;
    }

    const nova = {
        id,
        nome: nome.toUpperCase(),
        codigo,
        descricao: descricao || nome
    };

    igrejas.push(nova);

    if (!salvarIgrejas()) {
        igrejas.pop();
        return;
    }

    fecharModalIgreja();

    atualizarResumoGeral();

    renderizarListaIgrejas();

    selecionarIgreja(nova.id);

    alert("Congregação cadastrada com sucesso!");
}

/* =========================================================
   12. BACKUP E RESTAURAÇÃO
========================================================= */

function pertenceAoSistema(ch) {
    return typeof ch === "string" && (
        ch.startsWith(PREFIXO) ||
        ch === CHAVE_ANTIGA ||
        ch === CHAVE_IGREJAS
    );
}

function obterDadosSistema() {
    const d = {};

    for (let i = 0; i < localStorage.length; i++) {
        const ch = localStorage.key(i);

        if (ch && pertenceAoSistema(ch)) {
            d[ch] = localStorage.getItem(ch);
        }
    }

    return d;
}

function verificarArmazenamento() {
    try {
        const d = obterDadosSistema();

        const t = new Blob([
            JSON.stringify(d)
        ]).size;

        const mb = t / (1024 * 1024);

        return {
            tamanho: t,
            mb,
            valido: mb <= LIMITE_BACKUP_MB
        };

    } catch (e) {
        return {
            tamanho: 0,
            mb: 0,
            valido: false
        };
    }
}

function atualizarStatusBackup() {
    const el = $("backupStatus");

    if (!el) return;

    const a = verificarArmazenamento();

    el.textContent = a.valido
        ? `Dados prontos para backup • ${a.mb.toFixed(2)} MB`
        : "Verifique o armazenamento";
}

function configurarBackup() {
    $("btnGerarBackup")?.addEventListener(
        "click",
        gerarBackup
    );

    $("btnRestaurarBackup")?.addEventListener(
        "click",
        () => {
            $("arquivoBackup")?.click();
        }
    );

    $("arquivoBackup")?.addEventListener(
        "change",
        lerArquivoBackup
    );

    atualizarStatusBackup();
}

function gerarBackup() {
    if (backupEmAndamento) return;

    backupEmAndamento = true;

    try {
        const backup = {
            sistema: SISTEMA_BACKUP,
            versao: VERSAO_BACKUP,
            dataGeracao: new Date().toISOString(),
            dados: obterDadosSistema()
        };

        const conteudo = JSON.stringify(backup, null, 2);

        if (
            new Blob([conteudo]).size / (1024 * 1024) >
            LIMITE_BACKUP_MB
        ) {
            alert("O arquivo de backup ultrapassou o limite permitido.");
            return;
        }

        const blob = new Blob(
            [conteudo],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = `backup_manutencao_ccb_${dataHoje()}.json`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        atualizarStatusBackup();

        alert("Backup gerado com sucesso!");

    } catch (e) {
        console.error(e);

        alert("Não foi possível gerar o backup.");

    } finally {
        backupEmAndamento = false;
    }
}

function validarBackup(b) {
    if (!b || typeof b !== "object") {
        throw new Error("Arquivo inválido.");
    }

    if (b.sistema !== SISTEMA_BACKUP) {
        throw new Error(
            "Este arquivo não pertence ao Controle de Manutenção CCB."
        );
    }

    if (!b.dados || typeof b.dados !== "object") {
        throw new Error("O arquivo não contém dados válidos.");
    }

    const chaves = Object.keys(b.dados);

    if (!chaves.length) {
        throw new Error("O arquivo de backup está vazio.");
    }

    chaves.forEach(ch => {
        if (!pertenceAoSistema(ch)) {
            throw new Error(`Chave não permitida no backup: ${ch}`);
        }

        if (typeof b.dados[ch] !== "string") {
            throw new Error(`Conteúdo inválido na chave: ${ch}`);
        }

        JSON.parse(b.dados[ch]);
    });

    return true;
}

function lerArquivoBackup(e) {
    const arq = e.target.files[0];

    if (!arq) return;

    if (arq.size > LIMITE_BACKUP_MB * 1024 * 1024) {
        alert("O arquivo ultrapassa o limite de 20 MB.");

        e.target.value = "";

        return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
        try {
            const b = JSON.parse(leitor.result);

            validarBackup(b);

            restaurarBackup(b);

        } catch (err) {
            alert(
                err.message ||
                "Não foi possível ler o arquivo de backup."
            );

        } finally {
            e.target.value = "";
        }
    };

    leitor.onerror = () => {
        alert("Erro ao abrir o arquivo selecionado.");

        e.target.value = "";
    };

    leitor.readAsText(arq);
}

function restaurarBackup(backup) {
    if (backupEmAndamento) return;

    if (!confirm(
        "ATENÇÃO!\n\n" +
        "A restauração substituirá os dados atuais.\n\n" +
        "Deseja continuar?"
    )) {
        return;
    }

    backupEmAndamento = true;

    const anteriores = {};

    try {
        Object.keys(backup.dados).forEach(ch => {
            anteriores[ch] = localStorage.getItem(ch);
        });

        Object.entries(backup.dados).forEach(([ch, v]) => {
            localStorage.setItem(ch, v);
        });

        igrejas = carregarIgrejas();

        if (obterPagina() === "painel") {
            atualizarResumoGeral();

            renderizarListaIgrejas();

            atualizarStatusBackup();

            if (igrejaSelecionada) {
                igrejaSelecionada = igrejas.find(
                    x => String(x.id) === String(igrejaSelecionada.id)
                ) || null;

                renderizarDetalhesIgreja();
            }
        }

        if (obterPagina() === "igreja") {
            igrejaSelecionada = obterIgrejaAtual();

            if (igrejaSelecionada) {
                ordens = carregarOrdens(igrejaSelecionada.id);

                atualizarTelaOS();
            }
        }

        alert("Backup restaurado com sucesso!");

    } catch (e) {
        console.error(e);

        Object.entries(anteriores).forEach(([ch, v]) => {
            try {
                if (v === null) {
                    localStorage.removeItem(ch);
                } else {
                    localStorage.setItem(ch, v);
                }
            } catch (_) {}
        });

        igrejas = carregarIgrejas();

        alert(
            "A restauração falhou. " +
            "O sistema tentou preservar os dados anteriores."
        );

    } finally {
        backupEmAndamento = false;
    }
}

/* =========================================================
   13. FINALIZAÇÃO
========================================================= */

console.info(
    "Controle de Manutenção CCB - painel carregado."
);
atualizarResumoGeral();
renderizarListaIgrejas();
atualizarStatusBackup();
if (igrejaSelecionada) renderizarDetalhesIgreja();
