/* =========================================================
   CONTROLE DE MANUTENÇÃO CCB
   PAINEL CENTRAL + CONGREGAÇÕES + ORDENS DE SERVIÇO
   ATA INDIVIDUAL + BACKUP E RESTAURAÇÃO

   - Painel central sem ATA e sem botão de impressão.
   - ATA configurada e impressa somente em igreja.html.
   - Cadastro de congregações.
   - Ordens de serviço por congregação.
   - Visualização, edição e exclusão de OS.
   - Pesquisa, filtros e exportação CSV.
   - Backup e restauração.
   - Preservação dos dados existentes.
========================================================= */

/* =========================================================
   1. CONFIGURAÇÕES
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

const IGREJAS_INICIAIS = [
    { id: "070002", codigo: "BR 07-0002", nome: "ALEXÂNIA - CENTRO", descricao: "Central" },
    { id: "070318", codigo: "BR 07-0318", nome: "DISTRITO OLHOS D'ÁGUA", descricao: "Olhos d'Água" },
    { id: "070329", codigo: "BR 07-0329", nome: "FAZENDA LAJE RIO DO OURO", descricao: "Fazenda Laje Rio do Ouro" },
    { id: "070401", codigo: "BR 07-0401", nome: "FAZENDA FUNIL", descricao: "Fazenda Funil" },
    { id: "070125", codigo: "BR 07-0125", nome: "FAZENDA SANTO ANDRÉ", descricao: "Fazenda Santo André" },
    { id: "070681", codigo: "BR 07-0681", nome: "MORADA DO SOL", descricao: "Morada do Sol" },
    { id: "070702", codigo: "BR 07-0702", nome: "CONGREGAÇÃO 07", descricao: "Nova congregação 07" },
    { id: "070703", codigo: "BR 07-0703", nome: "CONGREGAÇÃO 08", descricao: "Nova congregação 08" },
    { id: "070704", codigo: "BR 07-0704", nome: "CONGREGAÇÃO 09", descricao: "Nova congregação 09" },
    { id: "070705", codigo: "BR 07-0705", nome: "CONGREGAÇÃO 10", descricao: "Nova congregação 10" },
    { id: "070706", codigo: "BR 07-0706", nome: "CONGREGAÇÃO 11", descricao: "Nova congregação 11" }
];

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
   2. FUNÇÕES GERAIS
========================================================= */

function $(id) {
    return document.getElementById(id);
}

function lerJSON(chave, padrao = null) {
    try {
        const valor = localStorage.getItem(chave);
        return valor === null ? padrao : JSON.parse(valor);
    } catch (erro) {
        console.error("Erro ao ler:", chave, erro);
        return padrao;
    }
}

function salvarJSON(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
        return true;
    } catch (erro) {
        console.error("Erro ao salvar:", chave, erro);
        alert("Não foi possível salvar os dados. Verifique o armazenamento do navegador.");
        return false;
    }
}

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}

function dataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
    if (!data) return "-";
    const partes = String(data).split("-");
    if (partes.length !== 3) return data;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function normalizarStatus(status) {
    const valor = String(status || "ABERTA").trim().toUpperCase();
    const equivalencias = {
        "CONCLUIDO": "CONCLUÍDA",
        "CONCLUIDA": "CONCLUÍDA",
        "CONCLUÍDO": "CONCLUÍDA",
        "NOK": "N/OK",
        "NÃO OK": "N/OK"
    };
    return equivalencias[valor] || valor;
}

function normalizarOrdem(os, indice = 0) {
    const ordem = os && typeof os === "object" ? os : {};
    const statusOriginal = normalizarStatus(ordem.status);

    const concluida = String(ordem.concluida || "NÃO").toUpperCase() === "SIM" || statusOriginal === "CONCLUÍDA";

    return {
        id: String(ordem.id || `os-${Date.now()}-${indice}`),
        numero: Number(ordem.numero || ordem.num || indice + 1),
        dataAbertura: ordem.dataAbertura || ordem.data || dataHoje(),
        descricao: ordem.descricao || ordem.local || ordem.atividade || "",
        observacoes: ordem.observacoes || ordem.observacao || "",
        responsavel: ordem.responsavel || "",
        status: concluida ? "CONCLUÍDA" : statusOriginal,
        concluida: concluida ? "SIM" : "NÃO",
        dataConclusao: ordem.dataConclusao || ""
    };
}

function obterListaOrdens(dados) {
    if (Array.isArray(dados)) return dados;
    if (dados && Array.isArray(dados.ordens)) return dados.ordens;
    if (dados && Array.isArray(dados.os)) return dados.os;
    return [];
}

/* =========================================================
   5. CONGREGAÇÕES E ARMAZENAMENTO
========================================================= */

function carregarIgrejas() {
    const salvas = lerJSON(CHAVE_IGREJAS, []);
    const listaSalva = Array.isArray(salvas) ? salvas : [];
    const resultado = IGREJAS_INICIAIS.map(igreja => ({ ...igreja }));

    listaSalva.forEach(igreja => {
        if (!igreja || !igreja.id) return;

        const indice = resultado.findIndex(item => String(item.id) === String(igreja.id));

        if (indice >= 0) {
            resultado[indice] = { ...resultado[indice], ...igreja };
        } else {
            resultado.push(igreja);
        }
    });

    salvarJSON(CHAVE_IGREJAS, resultado);
    return resultado;
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
    const lista = obterListaOrdens(dados);

    return lista.map((ordem, indice) => normalizarOrdem(ordem, indice));
}

function salvarOrdens(id, lista) {
    return salvarJSON(obterChaveIgreja(id), lista);
}

/* =========================================================
   6. MIGRAÇÃO DOS DADOS ANTIGOS
========================================================= */

function migrarDadosAntigos() {
    const chaveCentral = obterChaveIgreja(ID_CENTRAL);

    // Nunca sobrescreve os dados da Central já existentes.
    if (localStorage.getItem(chaveCentral) !== null) {
        console.info("Dados da Central já existentes. Preservados.");
        return;
    }

    const dadosAntigos = lerJSON(CHAVE_ANTIGA, []);
    const listaAntiga = obterListaOrdens(dadosAntigos);

    if (listaAntiga.length > 0) {
        const migradas = listaAntiga.map((os, indice) =>
            normalizarOrdem(os, indice)
        );

        if (salvarOrdens(ID_CENTRAL, migradas)) {
            console.info("Ordens antigas migradas:", migradas.length);
        }
        return;
    }

    const iniciais = DADOS_INICIAIS_CENTRAL.map((os, indice) =>
        normalizarOrdem(os, indice)
    );

    if (salvarOrdens(ID_CENTRAL, iniciais)) {
        console.info("Ordens iniciais da Central cadastradas:", iniciais.length);
    }
}

/* =========================================================
   7. IDENTIFICAÇÃO DA PÁGINA E CONGREGAÇÃO
========================================================= */

function obterPagina() {
    return document.body.dataset.page || "";
}

function obterIgrejaAtual() {
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("igreja") || parametros.get("id");

    if (id) {
        const encontrada = igrejas.find(igreja =>
            String(igreja.id) === String(id)
        );
        if (encontrada) return encontrada;
    }

    return igrejas.find(igreja =>
        String(igreja.id) === ID_CENTRAL
    ) || null;
}

/* =========================================================
   8. INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", iniciarSistema);

function iniciarSistema() {
    igrejas = carregarIgrejas();
    migrarDadosAntigos();

    const pagina = obterPagina();

    if (pagina === "painel") iniciarPainel();
    if (pagina === "igreja") iniciarPaginaIgreja();

    console.info("Controle de Manutenção CCB inicializado.");
}

/* =========================================================
   9. PAINEL CENTRAL — SEM ATA E SEM IMPRESSÃO
========================================================= */

function iniciarPainel() {
    configurarModalIgreja();
    configurarPesquisaIgreja();
    configurarBackup();

    atualizarResumoGeral();
    renderizarListaIgrejas();
    renderizarEstadoInicial();
}

function atualizarResumoGeral() {
    let totalOS = 0;
    let concluidas = 0;
    let pendentes = 0;

    igrejas.forEach(igreja => {
        const lista = carregarOrdens(igreja.id);
        totalOS += lista.length;

        lista.forEach(os => {
            if (os.concluida === "SIM") concluidas++;
            else pendentes++;
        });
    });

    if ($("totalIgrejas")) $("totalIgrejas").textContent = igrejas.length;
    if ($("totalOSGeral")) $("totalOSGeral").textContent = totalOS;
    if ($("concluidasGeral")) $("concluidasGeral").textContent = concluidas;
    if ($("pendentesGeral")) $("pendentesGeral").textContent = pendentes;
    if ($("totalIgrejasMenu")) $("totalIgrejasMenu").textContent = igrejas.length;
}

/* =========================================================
   10. MENU LATERAL
========================================================= */

function renderizarListaIgrejas() {
    const lista = $("listaIgrejas");
    if (!lista) return;

    const busca = $("buscaIgreja")?.value.toLowerCase().trim() || "";

    const filtradas = igrejas.filter(igreja => {
        const texto = [
            igreja.nome, igreja.codigo, igreja.descricao, igreja.id
        ].join(" ").toLowerCase();

        return texto.includes(busca);
    });

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

    filtradas.forEach(igreja => {
        const registros = carregarOrdens(igreja.id);
        const item = document.createElement("button");

        item.type = "button";
        item.className = "church-nav-item";

        if (
            igrejaSelecionada &&
            String(igrejaSelecionada.id) === String(igreja.id)
        ) {
            item.classList.add("ativo");
        }

        item.innerHTML = `
            <span class="church-nav-icon">⌂</span>
            <span class="church-nav-text">
                <strong>${escaparHTML(igreja.nome)}</strong>
                <small>${escaparHTML(igreja.codigo || igreja.id)}</small>
            </span>
            <span class="church-nav-count">${registros.length}</span>
            <span class="church-nav-arrow">›</span>
        `;

        item.addEventListener("click", () => selecionarIgreja(igreja.id));
        lista.appendChild(item);
    });
}

function selecionarIgreja(id) {
    igrejaSelecionada = igrejas.find(igreja =>
        String(igreja.id) === String(id)
    );

    if (!igrejaSelecionada) return;

    renderizarListaIgrejas();
    renderizarDetalhesIgreja();
}

/* =========================================================
   11. DETALHES DA CONGREGAÇÃO
========================================================= */

function renderizarDetalhesIgreja() {
    const detalhes = $("detalhesIgreja");
    if (!detalhes) return;

    if (!igrejaSelecionada) {
        renderizarEstadoInicial();
        return;
    }

    const registros = carregarOrdens(igrejaSelecionada.id);
    const total = registros.length;
    const concluidas = registros.filter(os => os.concluida === "SIM").length;
    const pendentes = total - concluidas;
    const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    detalhes.innerHTML = `
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
                    <strong>${concluidas}</strong>
                </div>
            </div>

            <div class="detail-stat">
                <span class="detail-stat-symbol amber">◷</span>
                <div>
                    <small>Pendentes</small>
                    <strong>${pendentes}</strong>
                </div>
            </div>
        </div>

        <div class="completion-card">
            <div class="completion-head">
                <div>
                    <strong>Progresso das manutenções</strong>
                    <small>Percentual de ordens concluídas</small>
                </div>
                <span class="completion-percent">${percentual}%</span>
            </div>
            <div class="progress-track">
                <span style="width: ${percentual}%"></span>
            </div>
        </div>

        <div class="detail-footer">
            <span><span class="online-dot"></span> Dados armazenados neste navegador</span>
            <span>${total} ${total === 1 ? "ordem cadastrada" : "ordens cadastradas"}</span>
        </div>
    `;
}

function renderizarEstadoInicial() {
    const detalhes = $("detalhesIgreja");
    if (!detalhes) return;

    detalhes.innerHTML = `
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
    $("buscaIgreja")?.addEventListener("input", renderizarListaIgrejas);
}

/* =========================================================
   12. CADASTRO DE CONGREGAÇÕES
========================================================= */

function configurarModalIgreja() {
    [$("btnNovaIgrejaTopo"), $("btnNovaIgreja")]
        .filter(Boolean)
        .forEach(botao => botao.addEventListener("click", abrirModalIgreja));

    $("fecharModalIgreja")?.addEventListener("click", fecharModalIgreja);
    $("cancelarCadastroIgreja")?.addEventListener("click", fecharModalIgreja);
    $("formIgreja")?.addEventListener("submit", cadastrarIgreja);

    $("modalIgreja")?.addEventListener("click", evento => {
        if (evento.target === $("modalIgreja")) fecharModalIgreja();
    });
}

function abrirModalIgreja() {
    const modal = $("modalIgreja");
    if (!modal) return;

    $("formIgreja")?.reset();

    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
}

function fecharModalIgreja() {
    const modal = $("modalIgreja");
    if (!modal) return;

    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
}

function cadastrarIgreja(evento) {
    evento.preventDefault();

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

    if (igrejas.some(igreja => String(igreja.id) === id)) {
        alert("Já existe uma congregação cadastrada com esse código.");
        return;
    }

    const novaIgreja = {
        id,
        nome: nome.toUpperCase(),
        codigo,
        descricao: descricao || nome
    };

    igrejas.push(novaIgreja);

    if (!salvarIgrejas()) {
        igrejas.pop();
        return;
    }

    fecharModalIgreja();
    atualizarResumoGeral();
    renderizarListaIgrejas();
    selecionarIgreja(novaIgreja.id);

    alert("Congregação cadastrada com sucesso!");
}

/* =========================================================
   13. PÁGINA INDIVIDUAL DA CONGREGAÇÃO
========================================================= */

function iniciarPaginaIgreja() {
    igrejaSelecionada = obterIgrejaAtual();

    if (!igrejaSelecionada) {
        alert("Congregação não encontrada.");
        window.location.href = "index.html";
        return;
    }

    ordens = carregarOrdens(igrejaSelecionada.id);

    atualizarIdentificacaoIgreja();
    configurarFormularioOS();
    configurarFiltrosOS();
    configurarBotoesOS();

    // A ATA só é inicializada nesta página.
    configurarAtaIgreja();

    atualizarTelaOS();
}

function atualizarIdentificacaoIgreja() {
    if ($("nomeIgreja")) {
        $("nomeIgreja").textContent = igrejaSelecionada.nome;
    }

    if ($("codigoIgreja")) {
        $("codigoIgreja").textContent =
            `${igrejaSelecionada.codigo || igrejaSelecionada.id} • ${igrejaSelecionada.descricao || ""}`;
    }
}

/* =========================================================
   14. FORMULÁRIO DE ORDEM DE SERVIÇO
========================================================= */

function configurarFormularioOS() {
    const formulario = $("formOS");
    if (!formulario) {
        console.error("Formulário formOS não encontrado.");
        return;
    }

    formulario.addEventListener("submit", salvarOrdemFormulario);
    preencherResponsaveis();

    $("btnNovaOS")?.addEventListener("click", abrirNovaOS);
    $("fecharModal")?.addEventListener("click", fecharModalOS);
    $("cancelar")?.addEventListener("click", fecharModalOS);

    $("modalOS")?.addEventListener("click", evento => {
        if (evento.target === $("modalOS")) fecharModalOS();
    });

    $("concluida")?.addEventListener("change", atualizarConclusao);
    $("status")?.addEventListener("change", atualizarStatusConclusao);
}

function preencherResponsaveis() {
    const campo = $("responsavel");
    if (!campo) return;

    const valorAtual = campo.value;

    campo.innerHTML = `
        <option value="">Selecione o responsável</option>
        ${RESPONSAVEIS.map(nome => `
            <option value="${escaparHTML(nome)}">${escaparHTML(nome)}</option>
        `).join("")}
    `;

    if (valorAtual) campo.value = valorAtual;
}

function abrirModalOS() {
    const modal = $("modalOS");
    if (!modal) return;

    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
}

function fecharModalOS() {
    const modal = $("modalOS");
    if (!modal) return;

    modoVisualizacao = false;
    habilitarFormularioOS(true);

    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
}

function habilitarFormularioOS(habilitado) {
    const formulario = $("formOS");
    if (!formulario) return;

    formulario.querySelectorAll("input, select, textarea").forEach(campo => {
        if (campo.type !== "hidden") campo.disabled = !habilitado;
    });

    const botaoSalvar = formulario.querySelector('[type="submit"]');
    if (botaoSalvar) botaoSalvar.hidden = !habilitado;

    if ($("cancelar")) {
        $("cancelar").textContent = habilitado ? "Cancelar" : "Fechar";
    }
}

function preencherFormularioOS(os) {
    if ($("osId")) $("osId").value = os.id;
    if ($("numero")) $("numero").value = os.numero;
    if ($("dataAbertura")) $("dataAbertura").value = os.dataAbertura;
    if ($("descricao")) $("descricao").value = os.descricao;
    if ($("observacoes")) $("observacoes").value = os.observacoes;
    if ($("responsavel")) $("responsavel").value = os.responsavel;
    if ($("status")) $("status").value = os.status;
    if ($("concluida")) $("concluida").value = os.concluida;
    if ($("dataConclusao")) $("dataConclusao").value = os.dataConclusao || "";
}

function abrirNovaOS() {
    const formulario = $("formOS");
    if (!formulario) return;

    modoVisualizacao = false;
    habilitarFormularioOS(true);
    formulario.reset();

    if ($("osId")) $("osId").value = "";
    if ($("tituloModal")) $("tituloModal").textContent = "Nova ordem de serviço";
    if ($("dataAbertura")) $("dataAbertura").value = dataHoje();
    if ($("status")) $("status").value = "ABERTA";
    if ($("concluida")) $("concluida").value = "NÃO";
    if ($("dataConclusao")) $("dataConclusao").value = "";

    const numeros = ordens.map(os => Number(os.numero) || 0);
    if ($("numero")) $("numero").value = Math.max(0, ...numeros) + 1;

    abrirModalOS();
}

/* =========================================================
   15. VISUALIZAR ORDEM DE SERVIÇO
========================================================= */

function visualizarOS(id) {
    const os = ordens.find(item => String(item.id) === String(id));

    if (!os) {
        alert("Ordem de serviço não encontrada.");
        return;
    }

    modoVisualizacao = true;
    preencherFormularioOS(os);

    if ($("tituloModal")) {
        $("tituloModal").textContent = `Visualizar OS nº ${os.numero}`;
    }

    habilitarFormularioOS(false);
    abrirModalOS();
}

/* =========================================================
   16. EDITAR ORDEM DE SERVIÇO
========================================================= */

function editarOS(id) {
    const os = ordens.find(item => String(item.id) === String(id));

    if (!os) {
        alert("Ordem de serviço não encontrada.");
        return;
    }

    modoVisualizacao = false;
    habilitarFormularioOS(true);
    preencherFormularioOS(os);

    if ($("tituloModal")) {
        $("tituloModal").textContent = "Editar ordem de serviço";
    }

    abrirModalOS();
}

/* =========================================================
   17. SALVAR ORDEM DE SERVIÇO
========================================================= */

function salvarOrdemFormulario(evento) {
    evento.preventDefault();
    if (modoVisualizacao) return;

    const idExistente = $("osId")?.value || "";
    const numero = Number($("numero")?.value);
    const dataAbertura = $("dataAbertura")?.value;
    const descricao = $("descricao")?.value.trim() || "";
    const observacoes = $("observacoes")?.value.trim() || "";
    const responsavel = $("responsavel")?.value || "";

    let status = normalizarStatus($("status")?.value);
    let concluida = $("concluida")?.value || "NÃO";
    let dataConclusao = $("dataConclusao")?.value || "";

    if (!numero || numero < 1) {
        alert("Informe um número válido para a OS.");
        return;
    }

    if (!dataAbertura) {
        alert("Informe a data de abertura.");
        return;
    }

    if (!descricao) {
        alert("Informe o local ou a descrição da atividade.");
        return;
    }

    if (!responsavel) {
        alert("Selecione o responsável.");
        return;
    }

    const numeroDuplicado = ordens.some(os =>
        Number(os.numero) === numero &&
        String(os.id) !== String(idExistente)
    );

    if (numeroDuplicado) {
        alert("Já existe uma OS com esse número nesta congregação.");
        return;
    }

    if (concluida === "SIM" || status === "CONCLUÍDA") {
        concluida = "SIM";
        status = "CONCLUÍDA";
        if (!dataConclusao) dataConclusao = dataHoje();
    } else {
        concluida = "NÃO";
        dataConclusao = "";
    }

    const ordem = {
        id: idExistente || `os-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        numero,
        dataAbertura,
        descricao,
        observacoes,
        responsavel,
        status,
        concluida,
        dataConclusao
    };

    const indice = ordens.findIndex(os =>
        String(os.id) === String(idExistente)
    );

    const listaAnterior = [...ordens];

    if (indice >= 0) ordens[indice] = ordem;
    else ordens.push(ordem);

    if (!salvarOrdens(igrejaSelecionada.id, ordens)) {
        ordens = listaAnterior;
        return;
    }

    fecharModalOS();
    atualizarTelaOS();

    alert(indice >= 0
        ? "Ordem de serviço atualizada!"
        : "Ordem de serviço cadastrada!"
    );
}

/* =========================================================
   18. ATUALIZAÇÃO DE CONCLUSÃO
========================================================= */

function atualizarConclusao() {
    const concluida = $("concluida");
    const status = $("status");
    const data = $("dataConclusao");

    if (!concluida || !status || !data) return;

    if (concluida.value === "SIM") {
        status.value = "CONCLUÍDA";
        if (!data.value) data.value = dataHoje();
    } else {
        if (status.value === "CONCLUÍDA") status.value = "ABERTA";
        data.value = "";
    }
}

function atualizarStatusConclusao() {
    const status = $("status");
    const concluida = $("concluida");
    const data = $("dataConclusao");

    if (!status || !concluida || !data) return;

    if (status.value === "CONCLUÍDA") {
        concluida.value = "SIM";
        if (!data.value) data.value = dataHoje();
    } else {
        concluida.value = "NÃO";
        data.value = "";
    }
}

/* =========================================================
   19. EXCLUIR ORDEM DE SERVIÇO
========================================================= */

function excluirOS(id) {
    const os = ordens.find(item => String(item.id) === String(id));
    if (!os) return;

    const confirmar = confirm(
        `Deseja realmente excluir a OS nº ${os.numero}?\n\nEssa ação não poderá ser desfeita.`
    );

    if (!confirmar) return;

    const listaAnterior = [...ordens];

    ordens = ordens.filter(item => String(item.id) !== String(id));

    if (!salvarOrdens(igrejaSelecionada.id, ordens)) {
        ordens = listaAnterior;
        return;
    }

    atualizarTelaOS();
}

/* =========================================================
   20. FILTROS E PESQUISA
========================================================= */

function configurarFiltrosOS() {
    ["busca", "filtroStatus", "filtroResponsavel", "filtroConclusao"]
        .forEach(id => {
            const campo = $(id);
            if (!campo) return;

            campo.addEventListener("input", atualizarTabelaOS);
            campo.addEventListener("change", atualizarTabelaOS);
        });
}

function atualizarFiltroResponsaveis() {
    const campo = $("filtroResponsavel");
    if (!campo) return;

    const valorAtual = campo.value;

    const responsaveis = [
        ...new Set(ordens.map(os => os.responsavel).filter(Boolean))
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));

    campo.innerHTML = `
        <option value="">Todos os responsáveis</option>
        ${responsaveis.map(nome => `
            <option value="${escaparHTML(nome)}">${escaparHTML(nome)}</option>
        `).join("")}
    `;

    campo.value = responsaveis.includes(valorAtual) ? valorAtual : "";
}

function obterOrdensFiltradas() {
    const busca = $("busca")?.value.toLowerCase().trim() || "";
    const status = $("filtroStatus")?.value || "";
    const responsavel = $("filtroResponsavel")?.value || "";
    const conclusao = $("filtroConclusao")?.value || "";

    return ordens.filter(os => {
        const texto = [
            os.numero, os.dataAbertura, os.descricao,
            os.observacoes, os.responsavel, os.status
        ].join(" ").toLowerCase();

        return (
            texto.includes(busca) &&
            (!status || os.status === normalizarStatus(status)) &&
            (!responsavel || os.responsavel === responsavel) &&
            (!conclusao || os.concluida === conclusao)
        );
    });
}

/* =========================================================
   21. ATUALIZAÇÃO DA TELA DE ORDENS
========================================================= */

function atualizarTelaOS() {
    atualizarIndicadoresOS();
    atualizarFiltroResponsaveis();
    atualizarTabelaOS();

    // A prévia só existe na página individual.
    if (obterPagina() === "igreja" && $("painelAta")) {
        atualizarPreviaAtaIgreja();
    }
}

function atualizarIndicadoresOS() {
    const total = ordens.length;
    const concluidas = ordens.filter(os => os.concluida === "SIM").length;
    const andamento = ordens.filter(os => os.status === "EM ANDAMENTO").length;
    const pendentes = ordens.filter(os =>
        os.concluida !== "SIM" && os.status !== "EM ANDAMENTO"
    ).length;

    if ($("totalOS")) $("totalOS").textContent = total;
    if ($("concluidas")) $("concluidas").textContent = concluidas;
    if ($("andamento")) $("andamento").textContent = andamento;
    if ($("pendentes")) $("pendentes").textContent = pendentes;
}

function atualizarTabelaOS() {
    const tabela = $("tabelaOS");
    const vazio = $("vazio");

    if (!tabela) {
        console.error("Elemento tabelaOS não encontrado no HTML.");
        return;
    }

    const filtradas = obterOrdensFiltradas()
        .sort((a, b) => Number(a.numero) - Number(b.numero));

    tabela.innerHTML = "";

    filtradas.forEach(os => {
        const linha = document.createElement("tr");
        const classeStatus = os.status
            .toLowerCase()
            .replaceAll(" ", "-")
            .replaceAll("/", "-");

        linha.innerHTML = `
            <td><strong>${escaparHTML(os.numero)}</strong></td>
            <td>${formatarData(os.dataAbertura)}</td>
            <td>
                <strong>${escaparHTML(os.descricao)}</strong>
                ${os.observacoes ? `<p class="muted small">${escaparHTML(os.observacoes)}</p>` : ""}
            </td>
            <td>${escaparHTML(os.responsavel)}</td>
            <td>
                <span class="status ${os.concluida === "SIM" ? "CONCLUÍDA" : "pendente"}">
                    ${escaparHTML(os.concluida)}
                </span>
            </td>
            <td>
                <span class="status ${escaparHTML(classeStatus)}">
                    ${escaparHTML(os.status)}
                </span>
            </td>
            <td>${formatarData(os.dataConclusao)}</td>
            <td class="actions-col">
                <div class="os-menu-container">
                    <button
                        type="button"
                        class="btn-opcoes-os"
                        data-menu-id="${escaparHTML(os.id)}"
                        aria-label="Opções da ordem de serviço ${escaparHTML(os.numero)}"
                        aria-expanded="false"
                        title="Mais opções">
                        <span>⋮</span>
                    </button>

                    <div class="os-dropdown"
                         data-dropdown-id="${escaparHTML(os.id)}"
                         hidden>
                        <button type="button" class="os-dropdown-item"
                                data-acao="visualizar" data-id="${escaparHTML(os.id)}">
                            <span>◉</span> Visualizar
                        </button>
                        <button type="button" class="os-dropdown-item"
                                data-acao="editar" data-id="${escaparHTML(os.id)}">
                            <span>✎</span> Editar
                        </button>
                        <button type="button" class="os-dropdown-item excluir"
                                data-acao="excluir" data-id="${escaparHTML(os.id)}">
                            <span>⌫</span> Excluir
                        </button>
                    </div>
                </div>
            </td>
        `;

        tabela.appendChild(linha);
    });

    tabela.querySelectorAll(".btn-opcoes-os").forEach(botao => {
        botao.addEventListener("click", evento => {
            evento.stopPropagation();

            const id = botao.dataset.menuId;
            const menu = tabela.querySelector(`[data-dropdown-id="${CSS.escape(id)}"]`);
            const estavaAberto = menu && !menu.hidden;

            tabela.querySelectorAll(".os-dropdown").forEach(item => {
                item.hidden = true;
            });

            tabela.querySelectorAll(".btn-opcoes-os").forEach(item => {
                item.setAttribute("aria-expanded", "false");
            });

            if (menu && !estavaAberto) {
                menu.hidden = false;
                botao.setAttribute("aria-expanded", "true");
            }
        });
    });

    tabela.querySelectorAll(".os-dropdown-item").forEach(botao => {
        botao.addEventListener("click", evento => {
            evento.stopPropagation();

            const id = botao.dataset.id;
            const acao = botao.dataset.acao;

            tabela.querySelectorAll(".os-dropdown").forEach(item => {
                item.hidden = true;
            });

            tabela.querySelectorAll(".btn-opcoes-os").forEach(item => {
                item.setAttribute("aria-expanded", "false");
            });

            if (acao === "visualizar") visualizarOS(id);
            if (acao === "editar") editarOS(id);
            if (acao === "excluir") excluirOS(id);
        });
    });

    // Registra o fechamento global apenas uma vez.
    if (!document.body.dataset.menuOSConfigurado) {
        document.addEventListener("click", () => {
            document.querySelectorAll(".os-dropdown").forEach(menu => {
                menu.hidden = true;
            });

            document.querySelectorAll(".btn-opcoes-os").forEach(botao => {
                botao.setAttribute("aria-expanded", "false");
            });
        });

        document.body.dataset.menuOSConfigurado = "true";
    }

    if ($("contadorLista")) {
        $("contadorLista").textContent =
            `${filtradas.length} ${filtradas.length === 1 ? "registro" : "registros"}`;
    }

    if (vazio) vazio.hidden = filtradas.length > 0;
}

/* =========================================================
   22. BOTÕES DA PÁGINA INDIVIDUAL
========================================================= */

function configurarBotoesOS() {
    $("btnExportar")?.addEventListener("click", exportarCSV);

    // Não existe botão de impressão no index.html.
    // Este botão pertence somente ao igreja.html e imprime a ATA.
    $("btnImprimir")?.addEventListener("click", imprimirAta);
}

/* =========================================================
   23. EXPORTAÇÃO CSV
========================================================= */

function exportarCSV() {
    if (!igrejaSelecionada) return;

    if (!ordens.length) {
        alert("Não existem ordens de serviço para exportar.");
        return;
    }

    const cabecalho = [
        "Número", "Data de abertura", "Descrição", "Observações",
        "Responsável", "Concluída", "Status", "Data de conclusão"
    ];

    const linhas = ordens.map(os => [
        os.numero, os.dataAbertura, os.descricao, os.observacoes,
        os.responsavel, os.concluida, os.status, os.dataConclusao
    ]);

    const csv = [cabecalho, ...linhas]
        .map(linha => linha.map(valor =>
            `"${String(valor ?? "").replace(/"/g, '""')}"`
        ).join(";"))
        .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `OS_${igrejaSelecionada.id}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* =========================================================
   24. ATA — SOMENTE NA PÁGINA INDIVIDUAL
========================================================= */

function configurarAtaIgreja() {
    if (obterPagina() !== "igreja") return;
    if (!$("painelAta") || !igrejaSelecionada) return;

    if ($("ataData") && !$("ataData").value) {
        $("ataData").value = dataHoje();
    }

    if ($("ataMes") && !$("ataMes").value) {
        const meses = [
            "Janeiro", "Fevereiro", "Março", "Abril",
            "Maio", "Junho", "Julho", "Agosto",
            "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        $("ataMes").value = meses[new Date().getMonth()];
    }

    if ($("ataAno") && !$("ataAno").value) {
        $("ataAno").value = new Date().getFullYear();
    }

    ["ataData", "ataHorario", "ataMes", "ataAno", "ataParticipantes"]
        .forEach(id => {
            const campo = $(id);
            if (!campo) return;

            campo.addEventListener("input", atualizarPreviaAtaIgreja);
            campo.addEventListener("change", atualizarPreviaAtaIgreja);
        });

    atualizarPreviaAtaIgreja();
}

function atualizarPreviaAtaIgreja() {
    if (obterPagina() !== "igreja") return;
    if (!$("painelAta") || !igrejaSelecionada) return;

    const data = $("ataData")?.value || "";
    const horario = $("ataHorario")?.value || "";
    const mes = $("ataMes")?.value || "";
    const ano = $("ataAno")?.value || "";
    const participantes = $("ataParticipantes")?.value || "";

    if ($("ataNomeIgreja")) {
        $("ataNomeIgreja").textContent = igrejaSelecionada.nome;
    }

    if ($("ataDataTexto")) {
        $("ataDataTexto").textContent = data ? formatarData(data) : "Não informada";
    }

    if ($("ataHorarioTexto")) {
        $("ataHorarioTexto").textContent = horario || "Não informado";
    }

    if ($("ataMesTexto")) $("ataMesTexto").textContent = mes || "____________";
    if ($("ataAnoTexto")) $("ataAnoTexto").textContent = ano || "________";

    if ($("ataParticipantesTexto")) {
        $("ataParticipantesTexto").textContent =
            participantes.trim() || "Não informados.";
    }

    atualizarOrdensAtaIgreja(data);
}

function atualizarOrdensAtaIgreja(data) {
    if (obterPagina() !== "igreja") return;

    const tabela = $("ataTabelaOS");
    if (!tabela) return;

    tabela.innerHTML = "";

    if (!data) {
        adicionarLinhaTabelaAta(
            tabela,
            "Informe a data da reunião para carregar as ordens de serviço."
        );
        atualizarTotalAta(0);
        return;
    }

    const ordensDoDia = ordens
        .filter(os => os.dataAbertura === data)
        .sort((a, b) => Number(a.numero) - Number(b.numero));

    if (!ordensDoDia.length) {
        adicionarLinhaTabelaAta(
            tabela,
            "Nenhuma ordem de serviço encontrada para esta congregação na data selecionada."
        );
        atualizarTotalAta(0);
        return;
    }

    ordensDoDia.forEach(os => {
        const linha = document.createElement("tr");

        [os.numero, os.descricao, os.responsavel || "-", os.status || "-"]
            .forEach(valor => {
                const celula = document.createElement("td");
                celula.textContent = String(valor ?? "-");
                linha.appendChild(celula);
            });

        tabela.appendChild(linha);
    });

    atualizarTotalAta(ordensDoDia.length);
}

function adicionarLinhaTabelaAta(tabela, mensagem) {
    const linha = document.createElement("tr");
    const celula = document.createElement("td");

    celula.colSpan = 4;
    celula.textContent = mensagem;

    linha.appendChild(celula);
    tabela.appendChild(linha);
}

function atualizarTotalAta(total) {
    if ($("ataTotalOS")) $("ataTotalOS").textContent = total;
}



/* =========================================================
   IMPRESSÃO DA ATA — CORRIGIDA
   Imprime somente a ATA da congregação selecionada
========================================================= */

function imprimirAta() {

    if (obterPagina() !== "igreja") {
        alert("A impressão da ATA está disponível somente na página da congregação.");
        return;
    }

    const painelAta = $("painelAta");
    const documentoAta = $("ataDocumento");

    if (!painelAta || !documentoAta) {
        console.error("Elementos da ATA não encontrados.");
        alert("Não foi possível localizar o documento da ATA.");
        return;
    }

    if (!igrejaSelecionada) {
        alert("Não foi possível identificar a congregação.");
        return;
    }

    const data = $("ataData")?.value || "";
    const horario = $("ataHorario")?.value || "";
    const mes = $("ataMes")?.value || "";
    const ano = $("ataAno")?.value || "";

    if (!data) {
        alert("Informe a data da reunião.");
        $("ataData")?.focus();
        return;
    }

    if (!horario) {
        alert("Informe o horário da reunião.");
        $("ataHorario")?.focus();
        return;
    }

    if (!mes) {
        alert("Selecione o mês de competência.");
        $("ataMes")?.focus();
        return;
    }

    if (!ano || Number(ano) < 2020 || Number(ano) > 2100) {
        alert("Informe um ano válido para a competência.");
        $("ataAno")?.focus();
        return;
    }

    if (document.body.classList.contains("imprimindo-ata")) {
        return;
    }

    // Atualiza os dados da ATA antes da impressão.
    atualizarPreviaAtaIgreja();

    // Confere a estrutura real existente no HTML.
    const cabecalho = documentoAta.querySelector(".ata-cabecalho");
    const conteudo = documentoAta.querySelector(".ata-conteudo");

    if (!cabecalho || !conteudo) {
        console.error("Cabeçalho ou conteúdo da ATA não encontrado.");
        alert("A estrutura da ATA está incompleta.");
        return;
    }

    // Adiciona a classe esperada pelas regras de impressão do CSS.
    documentoAta.classList.add("ata-documento");

    // Ativa o modo exclusivo de impressão.
    document.body.classList.add("imprimindo-ata");

    let impressaoFinalizada = false;

    function limparImpressao() {
        if (impressaoFinalizada) return;

        impressaoFinalizada = true;

        document.body.classList.remove("imprimindo-ata");
        documentoAta.classList.remove("ata-documento");

        window.removeEventListener("afterprint", limparImpressao);
    }

    window.addEventListener("afterprint", limparImpressao);

    // Aguarda o navegador atualizar o CSS antes de imprimir.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {

            try {
                window.focus();
                window.print();

            } catch (erro) {
                console.error("Erro ao imprimir a ATA:", erro);

                limparImpressao();

                alert("Não foi possível abrir a impressão. Tente novamente.");
            }

        });
    });
}
