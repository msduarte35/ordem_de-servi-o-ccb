
/* =========================================================
   CONTROLE DE MANUTENÇÃO CCB
   ARQUIVO: igreja.js - ORDENS DE SERVIÇO

   Funcionalidades:
   - Identificação da congregação
   - Cadastro de ordens de serviço
   - Visualização e edição de OS
   - Exclusão de OS
   - Filtros e pesquisa
   - Indicadores
   - Exportação CSV
   - Backup e restauração
   - Redirecionamento para página de impressão

   Dados e chaves originais preservados.
========================================================= */

"use strict";

/* =========================================================
   1. CONFIGURAÇÕES E DADOS
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
   2. FUNÇÕES AUXILIARES
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
        alert("Não foi possível salvar os dados. Verifique o espaço disponível no navegador.");
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

    return [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, "0"),
        String(hoje.getDate()).padStart(2, "0")
    ].join("-");
}

function formatarData(data) {
    if (!data) return "-";

    const partes = String(data).split("-");

    if (partes.length !== 3) return escaparHTML(data);

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterListaOrdens(dados) {
    if (Array.isArray(dados)) return dados;
    if (dados && Array.isArray(dados.ordens)) return dados.ordens;
    if (dados && Array.isArray(dados.os)) return dados.os;
    return [];
}

/* =========================================================
   3. NORMALIZAÇÃO DAS ORDENS
========================================================= */

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

    const concluida =
        String(ordem.concluida || "NÃO").trim().toUpperCase() === "SIM" ||
        statusOriginal === "CONCLUÍDA";

    const id = ordem.id !== undefined && ordem.id !== null && ordem.id !== ""
        ? String(ordem.id)
        : `os-${Date.now()}-${indice}`;

    return {
        id,
        numero: Number(ordem.numero ?? ordem.num ?? indice + 1),
        dataAbertura: ordem.dataAbertura || ordem.data || dataHoje(),
        descricao: ordem.descricao || ordem.local || ordem.atividade || "",
        observacoes: ordem.observacoes || ordem.observacao || "",
        responsavel: ordem.responsavel || "",
        status: concluida ? "CONCLUÍDA" : statusOriginal,
        concluida: concluida ? "SIM" : "NÃO",
        dataConclusao: concluida ? (ordem.dataConclusao || "") : ""
    };
}

/* =========================================================
   4. ARMAZENAMENTO DAS CONGREGAÇÕES
========================================================= */

function carregarIgrejas() {
    const salvas = lerJSON(CHAVE_IGREJAS, []);
    const listaSalva = Array.isArray(salvas) ? salvas : [];

    const resultado = IGREJAS_INICIAIS.map(igreja => ({ ...igreja }));

    listaSalva.forEach(igreja => {
        if (!igreja || !igreja.id) return;

        const indice = resultado.findIndex(
            item => String(item.id) === String(igreja.id)
        );

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

/* =========================================================
   5. ARMAZENAMENTO DAS ORDENS DE SERVIÇO
========================================================= */

function carregarOrdens(idIgreja) {
    if (!idIgreja) return [];

    const dados = lerJSON(obterChaveIgreja(idIgreja), []);

    return obterListaOrdens(dados).map(
        (ordem, indice) => normalizarOrdem(ordem, indice)
    );
}

function salvarOrdens(idIgreja, lista) {
    return salvarJSON(obterChaveIgreja(idIgreja), lista);
}

/* =========================================================
   6. MIGRAÇÃO DOS DADOS ANTIGOS
========================================================= */

function migrarDadosAntigos() {
    const chaveCentral = obterChaveIgreja(ID_CENTRAL);

    if (localStorage.getItem(chaveCentral) !== null) {
        return;
    }

    const antigos = lerJSON(CHAVE_ANTIGA, []);
    const listaAntiga = obterListaOrdens(antigos);

    if (listaAntiga.length > 0) {
        const migrados = listaAntiga.map(
            (ordem, indice) => normalizarOrdem(ordem, indice)
        );

        salvarOrdens(ID_CENTRAL, migrados);
        return;
    }

    const iniciais = DADOS_INICIAIS_CENTRAL.map(
        (ordem, indice) => normalizarOrdem(ordem, indice)
    );

    salvarOrdens(ID_CENTRAL, iniciais);
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
        const encontrada = igrejas.find(
            igreja => String(igreja.id) === String(id)
        );

        if (encontrada) return encontrada;
    }

    return igrejas.find(
        igreja => String(igreja.id) === ID_CENTRAL
    ) || null;
}

/* =========================================================
   8. INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", iniciarSistema);

function iniciarSistema() {
    igrejas = carregarIgrejas();

    migrarDadosAntigos();

    if (obterPagina() === "igreja") {
        iniciarPaginaIgreja();
    }
}

function iniciarPaginaIgreja() {
    igrejaSelecionada = obterIgrejaAtual();

    if (!igrejaSelecionada) {
        alert("Congregação não encontrada.");
        window.location.href = "./index.html";
        return;
    }

    ordens = carregarOrdens(igrejaSelecionada.id);

    atualizarIdentificacaoIgreja();
    configurarFormularioOS();
    configurarFiltrosOS();
    configurarBotoesOS();
    configurarBackup();
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
   9. FORMULÁRIO DE ORDEM DE SERVIÇO
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
        if (evento.target === $("modalOS")) {
            fecharModalOS();
        }
    });

    $("concluida")?.addEventListener("change", atualizarConclusao);
    $("status")?.addEventListener("change", atualizarStatusConclusao);
}

function preencherResponsaveis() {
    const campo = $("responsavel");
    if (!campo) return;

    const atual = campo.value;

    campo.innerHTML = `
        <option value="">Selecione o responsável</option>
        ${RESPONSAVEIS.map(nome => `
            <option value="${escaparHTML(nome)}">${escaparHTML(nome)}</option>
        `).join("")}
    `;

    campo.value = atual;
}

function abrirModalOS() {
    const modal = $("modalOS");
    if (!modal) return;

    if (typeof modal.showModal === "function") {
        if (!modal.open) modal.showModal();
    } else {
        modal.setAttribute("open", "");
    }
}

function fecharModalOS() {
    const modal = $("modalOS");
    if (!modal) return;

    modoVisualizacao = false;
    habilitarFormularioOS(true);

    if (typeof modal.close === "function" && modal.open) {
        modal.close();
    } else {
        modal.removeAttribute("open");
    }
}

function habilitarFormularioOS(habilitado) {
    const formulario = $("formOS");
    if (!formulario) return;

    formulario.querySelectorAll("input, select, textarea").forEach(campo => {
        if (campo.type === "hidden") return;
        campo.disabled = !habilitado;
    });

    const botaoSalvar = formulario.querySelector('[type="submit"]');

    if (botaoSalvar) {
        botaoSalvar.hidden = !habilitado;
    }

    if ($("cancelar")) {
        $("cancelar").textContent = habilitado ? "Cancelar" : "Fechar";
    }
}

function preencherFormularioOS(os) {
    if (!os) return;

    $("osId").value = os.id ?? "";
    $("numero").value = os.numero ?? "";
    $("dataAbertura").value = os.dataAbertura || "";
    $("descricao").value = os.descricao || "";
    $("observacoes").value = os.observacoes || "";
    $("responsavel").value = os.responsavel || "";
    $("status").value = os.status || "ABERTA";
    $("concluida").value = os.concluida || "NÃO";
    $("dataConclusao").value = os.dataConclusao || "";
}

function abrirNovaOS() {
    const formulario = $("formOS");
    if (!formulario) return;

    modoVisualizacao = false;
    habilitarFormularioOS(true);

    formulario.reset();

    $("osId").value = "";
    $("tituloModal").textContent = "Nova ordem de serviço";
    $("dataAbertura").value = dataHoje();
    $("status").value = "ABERTA";
    $("concluida").value = "NÃO";
    $("dataConclusao").value = "";

    const numeros = ordens.map(ordem => Number(ordem.numero) || 0);
    $("numero").value = Math.max(0, ...numeros) + 1;

    abrirModalOS();
}

function visualizarOS(id) {
    const os = ordens.find(
        ordem => String(ordem.id) === String(id)
    );

    if (!os) {
        alert("Ordem de serviço não encontrada.");
        return;
    }

    modoVisualizacao = true;
    preencherFormularioOS(os);

    $("tituloModal").textContent = `Visualizar OS nº ${os.numero}`;

    habilitarFormularioOS(false);
    abrirModalOS();
}

function editarOS(id) {
    const os = ordens.find(
        ordem => String(ordem.id) === String(id)
    );

    if (!os) {
        alert("Ordem de serviço não encontrada.");
        return;
    }

    modoVisualizacao = false;
    habilitarFormularioOS(true);
    preencherFormularioOS(os);

    $("tituloModal").textContent = "Editar ordem de serviço";

    abrirModalOS();
}

/* =========================================================
   10. SALVAR ORDEM DE SERVIÇO
========================================================= */

function salvarOrdemFormulario(evento) {
    evento.preventDefault();

    if (modoVisualizacao) return;

    const idExistente = $("osId").value;
    const numero = Number($("numero").value);
    const dataAbertura = $("dataAbertura").value;
    const descricao = $("descricao").value.trim();
    const observacoes = $("observacoes").value.trim();
    const responsavel = $("responsavel").value;

    let status = normalizarStatus($("status").value);
    let concluida = $("concluida").value;
    let dataConclusao = $("dataConclusao").value;

    if (!Number.isInteger(numero) || numero < 1) {
        alert("Informe um número válido para a OS.");
        $("numero").focus();
        return;
    }

    if (!dataAbertura) {
        alert("Informe a data de abertura.");
        $("dataAbertura").focus();
        return;
    }

    if (!descricao) {
        alert("Informe o local ou a descrição da atividade.");
        $("descricao").focus();
        return;
    }

    if (!responsavel) {
        alert("Selecione o responsável.");
        $("responsavel").focus();
        return;
    }

    const numeroDuplicado = ordens.some(ordem =>
        Number(ordem.numero) === numero &&
        String(ordem.id) !== String(idExistente)
    );

    if (numeroDuplicado) {
        alert("Já existe uma OS com esse número nesta congregação.");
        $("numero").focus();
        return;
    }

    if (concluida === "SIM" || status === "CONCLUÍDA") {
        concluida = "SIM";
        status = "CONCLUÍDA";
        dataConclusao = dataConclusao || dataHoje();
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

    const indice = ordens.findIndex(
        item => String(item.id) === String(idExistente)
    );

    const anterior = [...ordens];

    if (indice >= 0) {
        ordens[indice] = ordem;
    } else {
        ordens.push(ordem);
    }

    if (!salvarOrdens(igrejaSelecionada.id, ordens)) {
        ordens = anterior;
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
   11. ATUALIZAÇÃO DO STATUS E CONCLUSÃO
========================================================= */

function atualizarConclusao() {
    const campoConclusao = $("concluida");
    const campoStatus = $("status");
    const campoData = $("dataConclusao");

    if (!campoConclusao || !campoStatus || !campoData) return;

    if (campoConclusao.value === "SIM") {
        campoStatus.value = "CONCLUÍDA";
        campoData.value = campoData.value || dataHoje();
    } else {
        if (campoStatus.value === "CONCLUÍDA") {
            campoStatus.value = "ABERTA";
        }

        campoData.value = "";
    }
}

function atualizarStatusConclusao() {
    const campoStatus = $("status");
    const campoConclusao = $("concluida");
    const campoData = $("dataConclusao");

    if (!campoStatus || !campoConclusao || !campoData) return;

    if (campoStatus.value === "CONCLUÍDA") {
        campoConclusao.value = "SIM";
        campoData.value = campoData.value || dataHoje();
    } else {
        campoConclusao.value = "NÃO";
        campoData.value = "";
    }
}

/* =========================================================
   12. EXCLUIR ORDEM DE SERVIÇO
========================================================= */

function excluirOS(id) {
    const os = ordens.find(
        ordem => String(ordem.id) === String(id)
    );

    if (!os) return;

    const confirmar = confirm(
        `Deseja realmente excluir a OS nº ${os.numero}?\n\nEssa ação não poderá ser desfeita.`
    );

    if (!confirmar) return;

    const anterior = [...ordens];

    ordens = ordens.filter(
        ordem => String(ordem.id) !== String(id)
    );

    if (!salvarOrdens(igrejaSelecionada.id, ordens)) {
        ordens = anterior;
        return;
    }

    atualizarTelaOS();
}

/* =========================================================
   13. FILTROS DAS ORDENS DE SERVIÇO
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

    const atual = campo.value;

    const responsaveis = [
        ...new Set(
            ordens.map(ordem => ordem.responsavel).filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));

    campo.innerHTML = `
        <option value="">Todos os responsáveis</option>
        ${responsaveis.map(nome => `
            <option value="${escaparHTML(nome)}">${escaparHTML(nome)}</option>
        `).join("")}
    `;

    campo.value = responsaveis.includes(atual) ? atual : "";
}

function obterOrdensFiltradas() {
    const busca = $("busca")?.value.toLowerCase().trim() || "";
    const status = $("filtroStatus")?.value || "";
    const responsavel = $("filtroResponsavel")?.value || "";
    const conclusao = $("filtroConclusao")?.value || "";

    return ordens.filter(os => {
        const texto = [
            os.numero,
            os.dataAbertura,
            os.descricao,
            os.observacoes,
            os.responsavel,
            os.status
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
   14. ATUALIZAÇÃO DOS INDICADORES
========================================================= */

function atualizarTelaOS() {
    atualizarIndicadoresOS();
    atualizarFiltroResponsaveis();
    atualizarTabelaOS();
    atualizarStatusBackup();
}

function atualizarIndicadoresOS() {
    const total = ordens.length;

    const concluidas = ordens.filter(
        os => os.concluida === "SIM"
    ).length;

    const andamento = ordens.filter(
        os => os.status === "EM ANDAMENTO" && os.concluida !== "SIM"
    ).length;

    const pendentes = ordens.filter(
        os => os.concluida !== "SIM" && os.status !== "EM ANDAMENTO"
    ).length;

    if ($("totalOS")) $("totalOS").textContent = total;
    if ($("concluidas")) $("concluidas").textContent = concluidas;
    if ($("andamento")) $("andamento").textContent = andamento;
    if ($("pendentes")) $("pendentes").textContent = pendentes;
}

/* =========================================================
   15. TABELA DE ORDENS DE SERVIÇO
========================================================= */

function atualizarTabelaOS() {
    const tabela = $("tabelaOS");
    const vazio = $("vazio");

    if (!tabela) {
        console.error("Elemento tabelaOS não encontrado no HTML.");
        return;
    }

    const filtradas = obterOrdensFiltradas().sort(
        (a, b) => Number(a.numero) - Number(b.numero)
    );

    tabela.innerHTML = "";

    filtradas.forEach(os => {
        const linha = document.createElement("tr");

        const classeStatus = os.status
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replaceAll(" ", "-")
            .replaceAll("/", "-");

        const classeConclusao = os.concluida === "SIM"
            ? "concluida"
            : "pendente";

        linha.innerHTML = `
            <td>
                <strong>${escaparHTML(os.numero)}</strong>
            </td>

            <td>${formatarData(os.dataAbertura)}</td>

            <td>
                <strong>${escaparHTML(os.descricao)}</strong>
                ${os.observacoes
                    ? `<p class="muted small">${escaparHTML(os.observacoes)}</p>`
                    : ""}
            </td>

            <td>${escaparHTML(os.responsavel)}</td>

            <td>
                <span class="status ${classeConclusao}">
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
                        aria-expanded="false"
                        aria-label="Opções da OS ${escaparHTML(os.numero)}"
                        title="Mais opções"
                    >
                        <span>⋮</span>
                    </button>

                    <div
                        class="os-dropdown"
                        data-dropdown-id="${escaparHTML(os.id)}"
                        hidden
                    >
                        <button
                            type="button"
                            class="os-dropdown-item"
                            data-acao="visualizar"
                            data-id="${escaparHTML(os.id)}"
                        >
                            <span>◉</span> Visualizar
                        </button>

                        <button
                            type="button"
                            class="os-dropdown-item"
                            data-acao="editar"
                            data-id="${escaparHTML(os.id)}"
                        >
                            <span>✎</span> Editar
                        </button>

                        <button
                            type="button"
                            class="os-dropdown-item excluir"
                            data-acao="excluir"
                            data-id="${escaparHTML(os.id)}"
                        >
                            <span>⌫</span> Excluir
                        </button>
                    </div>
                </div>
            </td>
        `;

        tabela.appendChild(linha);
    });

    configurarMenusOS();

    if ($("contadorLista")) {
        $("contadorLista").textContent =
            `${filtradas.length} ${filtradas.length === 1 ? "registro" : "registros"}`;
    }

    if (vazio) {
        vazio.hidden = filtradas.length > 0;
    }
}

/* =========================================================
   16. MENUS DE OPÇÕES DA TABELA
========================================================= */

function configurarMenusOS() {
    const tabela = $("tabelaOS");
    if (!tabela) return;

    tabela.querySelectorAll(".btn-opcoes-os").forEach(botao => {
        botao.addEventListener("click", evento => {
            evento.stopPropagation();

            const id = botao.dataset.menuId;
            const menu = [...tabela.querySelectorAll(".os-dropdown")]
                .find(item => item.dataset.dropdownId === id);

            const estavaAberto = menu && !menu.hidden;

            fecharTodosMenusOS();

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

            fecharTodosMenusOS();

            if (acao === "visualizar") visualizarOS(id);
            if (acao === "editar") editarOS(id);
            if (acao === "excluir") excluirOS(id);
        });
    });

    if (!document.body.dataset.menuOSConfigurado) {
        document.addEventListener("click", fecharTodosMenusOS);
        document.addEventListener("keydown", evento => {
            if (evento.key === "Escape") fecharTodosMenusOS();
        });

        document.body.dataset.menuOSConfigurado = "true";
    }
}

function fecharTodosMenusOS() {
    document.querySelectorAll(".os-dropdown").forEach(menu => {
        menu.hidden = true;
    });

    document.querySelectorAll(".btn-opcoes-os").forEach(botao => {
        botao.setAttribute("aria-expanded", "false");
    });
}

/* =========================================================
   17. BOTÕES DA PÁGINA

   IMPORTANTE:
   - Exportar continua funcionando normalmente.
   - Imprimir agora é um LINK.
   - Não chamar window.print() nesta página.
   - O destino é impressao.html.
========================================================= */

function configurarBotoesOS() {
    $("btnExportar")?.addEventListener("click", exportarCSV);

    const btnImprimir = $("btnImprimir");

    if (btnImprimir && igrejaSelecionada) {
        btnImprimir.href =
            `./impressao.html?igreja=${encodeURIComponent(igrejaSelecionada.id)}`;

        // Garante que o link navegue na mesma aba.
        btnImprimir.removeAttribute("target");

        // Remove comportamento de botão, se houver.
        btnImprimir.removeAttribute("onclick");
    }
}

/* =========================================================
   18. EXPORTAÇÃO CSV
========================================================= */

function exportarCSV() {
    if (!igrejaSelecionada) return;

    if (!ordens.length) {
        alert("Não existem ordens de serviço para exportar.");
        return;
    }

    const cabecalho = [
        "Número",
        "Data de abertura",
        "Descrição",
        "Observações",
        "Responsável",
        "Concluída",
        "Status",
        "Data de conclusão"
    ];

    const linhas = ordens.map(os => [
        os.numero,
        os.dataAbertura,
        os.descricao,
        os.observacoes,
        os.responsavel,
        os.concluida,
        os.status,
        os.dataConclusao
    ]);

    const csv = [cabecalho, ...linhas]
        .map(linha =>
            linha.map(valor =>
                `"${String(valor ?? "").replace(/"/g, '""')}"`
            ).join(";")
        )
        .join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `OS_${igrejaSelecionada.id}_${dataHoje()}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* =========================================================
   19. BACKUP - IDENTIFICAÇÃO DAS CHAVES
========================================================= */

function pertenceAoSistema(chave) {
    return (
        typeof chave === "string" &&
        (
            chave.startsWith(PREFIXO) ||
            chave === CHAVE_ANTIGA ||
            chave === CHAVE_IGREJAS
        )
    );
}

function obterDadosSistema() {
    const dados = {};

    for (let indice = 0; indice < localStorage.length; indice++) {
        const chave = localStorage.key(indice);

        if (chave && pertenceAoSistema(chave)) {
            dados[chave] = localStorage.getItem(chave);
        }
    }

    return dados;
}

function verificarArmazenamento() {
    try {
        const dados = obterDadosSistema();
        const tamanho = new Blob([JSON.stringify(dados)]).size;
        const mb = tamanho / (1024 * 1024);

        return {
            tamanho,
            mb,
            valido: mb <= LIMITE_BACKUP_MB
        };
    } catch (erro) {
        console.error("Erro ao verificar armazenamento:", erro);

        return {
            tamanho: 0,
            mb: 0,
            valido: false
        };
    }
}

function atualizarStatusBackup() {
    const elemento = $("backupStatus");
    if (!elemento) return;

    const armazenamento = verificarArmazenamento();

    elemento.textContent = armazenamento.valido
        ? `Dados prontos para backup • ${armazenamento.mb.toFixed(2)} MB`
        : "Verifique o armazenamento";
}

function configurarBackup() {
    $("btnGerarBackup")?.addEventListener("click", gerarBackup);

    $("btnRestaurarBackup")?.addEventListener("click", () => {
        $("arquivoBackup")?.click();
    });

    $("arquivoBackup")?.addEventListener("change", lerArquivoBackup);

    atualizarStatusBackup();
}

/* =========================================================
   20. GERAR BACKUP
========================================================= */

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
        const tamanhoMB = new Blob([conteudo]).size / (1024 * 1024);

        if (tamanhoMB > LIMITE_BACKUP_MB) {
            alert("O arquivo de backup ultrapassou o limite permitido de 20 MB.");
            return;
        }

        const blob = new Blob(
            [conteudo],
            { type: "application/json;charset=utf-8" }
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

    } catch (erro) {
        console.error("Erro ao gerar backup:", erro);
        alert("Não foi possível gerar o backup.");
    } finally {
        backupEmAndamento = false;
    }
}

/* =========================================================
   21. VALIDAR BACKUP
========================================================= */

function validarBackup(backup) {
    if (!backup || typeof backup !== "object" || Array.isArray(backup)) {
        throw new Error("Arquivo inválido.");
    }

    if (backup.sistema !== SISTEMA_BACKUP) {
        throw new Error("Este arquivo não pertence ao Controle de Manutenção CCB.");
    }

    if (!backup.dados || typeof backup.dados !== "object" || Array.isArray(backup.dados)) {
        throw new Error("O arquivo não contém dados válidos.");
    }

    const chaves = Object.keys(backup.dados);

    if (!chaves.length) {
        throw new Error("O arquivo de backup está vazio.");
    }

    chaves.forEach(chave => {
        if (!pertenceAoSistema(chave)) {
            throw new Error(`Chave não permitida no backup: ${chave}`);
        }

        if (typeof backup.dados[chave] !== "string") {
            throw new Error(`Conteúdo inválido na chave: ${chave}`);
        }

        try {
            JSON.parse(backup.dados[chave]);
        } catch {
            throw new Error(`Os dados da chave ${chave} estão corrompidos.`);
        }
    });

    return true;
}

/* =========================================================
   22. LER ARQUIVO DE BACKUP
========================================================= */

function lerArquivoBackup(evento) {
    const arquivo = evento.target.files?.[0];

    if (!arquivo) return;

    if (arquivo.size > LIMITE_BACKUP_MB * 1024 * 1024) {
        alert("O arquivo ultrapassa o limite de 20 MB.");
        evento.target.value = "";
        return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
        try {
            const backup = JSON.parse(leitor.result);

            validarBackup(backup);
            restaurarBackup(backup);

        } catch (erro) {
            console.error("Erro ao ler backup:", erro);
            alert(erro.message || "Não foi possível ler o arquivo de backup.");
        } finally {
            evento.target.value = "";
        }
    };

    leitor.onerror = () => {
        alert("Erro ao abrir o arquivo selecionado.");
        evento.target.value = "";
    };

    leitor.readAsText(arquivo);
}

/* =========================================================
   23. RESTAURAR BACKUP COM PROTEÇÃO DOS DADOS
========================================================= */

function restaurarBackup(backup) {
    if (backupEmAndamento) return;

    try {
        validarBackup(backup);
    } catch (erro) {
        alert(erro.message);
        return;
    }

    const confirmar = confirm(
        "ATENÇÃO!\n\nA restauração substituirá os dados atuais do Controle de Manutenção CCB.\n\nRecomendamos gerar um backup antes de continuar.\n\nDeseja continuar?"
    );

    if (!confirmar) return;

    backupEmAndamento = true;

    const dadosAnteriores = obterDadosSistema();

    try {
        Object.keys(dadosAnteriores).forEach(chave => {
            localStorage.removeItem(chave);
        });

        Object.entries(backup.dados).forEach(([chave, valor]) => {
            if (!pertenceAoSistema(chave)) {
                throw new Error(`Chave não permitida: ${chave}`);
            }

            localStorage.setItem(chave, valor);
        });

        igrejas = carregarIgrejas();

        igrejaSelecionada = obterIgrejaAtual();

        if (!igrejaSelecionada) {
            throw new Error("Não foi possível localizar a congregação após a restauração.");
        }

        ordens = carregarOrdens(igrejaSelecionada.id);

        atualizarIdentificacaoIgreja();
        atualizarTelaOS();
        atualizarStatusBackup();

        alert("Backup restaurado com sucesso!");

    } catch (erro) {
        console.error("Erro ao restaurar backup:", erro);

        const chavesAtuais = [];

        for (let indice = 0; indice < localStorage.length; indice++) {
            const chave = localStorage.key(indice);

            if (chave && pertenceAoSistema(chave)) {
                chavesAtuais.push(chave);
            }
        }

        chavesAtuais.forEach(chave => localStorage.removeItem(chave));

        Object.entries(dadosAnteriores).forEach(([chave, valor]) => {
            try {
                localStorage.setItem(chave, valor);
            } catch (erroRollback) {
                console.error("Falha ao recuperar chave:", chave, erroRollback);
            }
        });

        igrejas = carregarIgrejas();
        igrejaSelecionada = obterIgrejaAtual();

        if (igrejaSelecionada) {
            ordens = carregarOrdens(igrejaSelecionada.id);
            atualizarIdentificacaoIgreja();
            atualizarTelaOS();
        }

        alert(
            "A restauração falhou. O sistema tentou recuperar os dados anteriores.\n\nVerifique o console do navegador para mais detalhes."
        );

    } finally {
        backupEmAndamento = false;
        atualizarStatusBackup();
    }
}

/* =========================================================
   24. FINALIZAÇÃO
========================================================= */

console.info(
    "Controle de Manutenção CCB - página da congregação carregada."
);
