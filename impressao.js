


/* =========================================================
   CONTROLE DE MANUTENÇÃO CCB
   IMPRESSÃO DE DOCUMENTOS E RELATÓRIOS

   - ATA de manutenção preventiva.
   - Relatório diário de ordens de serviço.
   - Cadastro dinâmico de participantes.
   - Participantes adicionais: até 10.
   - Ministério: até 3.
   - Encarregado de manutenção: até 1.
   - Salvamento por congregação.
   - Nomes alinhados acima das linhas de assinatura.
   - Impressão em formato A4.
   - Preserva os dados existentes das ordens de serviço.
========================================================= */

const PREFIXO = "ccb_manutencao_";
const CHAVE_IGREJAS = "controleManutencao_igrejas";
const CHAVE_PARTICIPANTES = "ccb_manutencao_participantes_";

const LIMITES_PARTICIPANTES = {
    participante: 10,
    ministerio: 3,
    encarregado: 1
};

const CATEGORIAS = {
    participante: "Participante adicional",
    ministerio: "Ministério",
    encarregado: "Encarregado de manutenção"
};

const $ = id => document.getElementById(id);

/* =========================================================
   1. FUNÇÕES AUXILIARES
========================================================= */

function lerJSON(chave, padrao = null) {
    try {
        const valor = localStorage.getItem(chave);

        if (valor === null) {
            return padrao;
        }

        return JSON.parse(valor);

    } catch (erro) {
        console.error("Erro ao ler dados:", chave, erro);
        return padrao;
    }
}

function salvarJSON(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
        return true;

    } catch (erro) {
        console.error("Erro ao salvar dados:", erro);
        alert("Não foi possível salvar os dados no navegador.");
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

    if (partes.length !== 3) {
        return escaparHTML(data);
    }

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

function obterListaOrdens(dados) {
    if (Array.isArray(dados)) {
        return dados;
    }

    if (dados && Array.isArray(dados.ordens)) {
        return dados.ordens;
    }

    if (dados && Array.isArray(dados.os)) {
        return dados.os;
    }

    return [];
}

function nomeMes(numero) {
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril",
        "Maio", "Junho", "Julho", "Agosto",
        "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    return meses[numero - 1] || "";
}

/* =========================================================
   2. CARREGAMENTO DAS CONGREGAÇÕES
========================================================= */

let igrejas = [];
let documentoGerado = false;

function carregarIgrejas() {

    const dados = lerJSON(CHAVE_IGREJAS, []);

    igrejas = Array.isArray(dados) ? dados : [];

    const select = $("congregacao");

    if (!select) return;

    select.innerHTML =
        '<option value="">Selecione uma congregação</option>';

    igrejas
        .slice()
        .sort((a, b) =>
            String(a.nome || "").localeCompare(
                String(b.nome || ""),
                "pt-BR"
            )
        )
        .forEach(igreja => {

            const option = document.createElement("option");

            option.value = String(igreja.id);

            option.textContent =
                `${igreja.nome} — ${igreja.codigo || igreja.id}`;

            select.appendChild(option);
        });

    selecionarIgrejaDaURL();
}

function selecionarIgrejaDaURL() {

    const parametros = new URLSearchParams(window.location.search);

    const id = parametros.get("igreja") || parametros.get("id");

    if (!id) return;

    const existe = igrejas.find(
        igreja => String(igreja.id) === String(id)
    );

    if (existe) {
        $("congregacao").value = String(existe.id);
    }
}

/* =========================================================
   3. CARREGAMENTO DAS ORDENS DE SERVIÇO
========================================================= */

function carregarOrdens(idIgreja) {

    if (!idIgreja) return [];

    const chave = PREFIXO + String(idIgreja);

    const dados = lerJSON(chave, []);

    return obterListaOrdens(dados).map((ordem, indice) => {

        const status = normalizarStatus(ordem.status);

        const concluida =
            String(ordem.concluida || "").toUpperCase() === "SIM" ||
            status === "CONCLUÍDA";

        return {
            id: ordem.id || indice + 1,
            numero: ordem.numero || ordem.num || indice + 1,
            dataAbertura: ordem.dataAbertura || ordem.data || "",
            descricao:
                ordem.descricao ||
                ordem.local ||
                ordem.atividade ||
                "",
            observacoes:
                ordem.observacoes ||
                ordem.observacao ||
                "",
            responsavel: ordem.responsavel || "",
            status: concluida ? "CONCLUÍDA" : status,
            concluida: concluida ? "SIM" : "NÃO",
            dataConclusao: ordem.dataConclusao || ""
        };
    });
}

/* =========================================================
   4. INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", iniciarImpressao);

function iniciarImpressao() {

    carregarIgrejas();

    configurarCampos();
    configurarBotoes();
    configurarParticipantes();

    $("dataDocumento").value = dataHoje();

    const hoje = new Date();

    $("mesAta").value = nomeMes(hoje.getMonth() + 1);
    $("anoAta").value = hoje.getFullYear();

    atualizarTipoDocumento();

    carregarParticipantesSalvos();
}

/* =========================================================
   5. CONFIGURAÇÃO DOS CAMPOS
========================================================= */

function configurarCampos() {

    $("tipoDocumento").addEventListener("change", () => {

        atualizarTipoDocumento();
        limparDocumento();
    });

    $("congregacao").addEventListener("change", () => {

        limparDocumento();
        carregarParticipantesSalvos();
    });

    $("dataDocumento").addEventListener("change", limparDocumento);

    [
        "horarioAta",
        "mesAta",
        "anoAta",
        "observacaoAta"
    ].forEach(id => {

        $(id)?.addEventListener("input", limparDocumento);
        $(id)?.addEventListener("change", limparDocumento);
    });
}

function configurarBotoes() {

    $("btnGerar").addEventListener("click", gerarDocumento);

    $("btnImprimir").addEventListener("click", imprimirDocumento);

    $("btnLimpar").addEventListener("click", limparFormulario);
}

function atualizarTipoDocumento() {

    const tipo = $("tipoDocumento").value;
    const isAta = tipo === "ata";

    $("grupoData").classList.remove("hidden");

    [
        "grupoHorario",
        "grupoMes",
        "grupoAno",
        "grupoParticipantes",
        "grupoObservacao"
    ].forEach(id => {

        $(id)?.classList.toggle("hidden", !isAta);
    });

    $("dataDocumento").previousElementSibling.textContent =
        isAta ? "Data da reunião" : "Data do relatório";
}

/* =========================================================
   6. CADASTRO DINÂMICO DE PARTICIPANTES
========================================================= */

function configurarParticipantes() {

    const lista = $("listaParticipantes");
    const botao = $("btnNovoParticipante");

    if (!lista || !botao) {
        console.warn("Elementos de participantes não encontrados.");
        return;
    }

    botao.addEventListener("click", () => adicionarParticipante());

    lista.addEventListener("input", evento => {

        if (evento.target.classList.contains("nome-participante")) {

            salvarParticipantes();
            limparDocumento();
        }
    });

    lista.addEventListener("change", evento => {

        if (!evento.target.classList.contains("categoria-participante")) {
            return;
        }

        const select = evento.target;

        const categoriaAnterior = select.dataset.categoriaAnterior;
        const categoriaNova = select.value;

        const quantidade = contarCategoria(
            categoriaNova,
            select
        );

        if (quantidade >= LIMITES_PARTICIPANTES[categoriaNova]) {

            alert(
                `Limite de ${LIMITES_PARTICIPANTES[categoriaNova]} ` +
                `cadastro(s) para ${CATEGORIAS[categoriaNova]}.`
            );

            select.value = categoriaAnterior;
            return;
        }

        select.dataset.categoriaAnterior = categoriaNova;

        atualizarControleParticipantes();

        salvarParticipantes();

        limparDocumento();
    });

    lista.addEventListener("click", evento => {

        const botaoRemover = evento.target.closest(
            ".btn-remover-participante"
        );

        if (!botaoRemover) return;

        const item = botaoRemover.closest(".participante-item");

        if (item) {

            item.remove();

            atualizarControleParticipantes();

            salvarParticipantes();

            limparDocumento();
        }
    });
}

/* =========================================================
   7. ADICIONAR PARTICIPANTE
========================================================= */

function adicionarParticipante(dados = null) {

    const lista = $("listaParticipantes");

    if (!lista) return;

    const categoria =
        dados?.categoria || obterCategoriaDisponivel();

    if (!categoria || !LIMITES_PARTICIPANTES[categoria]) {

        alert("Todos os limites de participantes foram atingidos.");
        return;
    }

    if (
        contarCategoria(categoria) >=
        LIMITES_PARTICIPANTES[categoria]
    ) {

        alert(
            `Você atingiu o limite de ${LIMITES_PARTICIPANTES[categoria]} ` +
            `cadastro(s) para ${CATEGORIAS[categoria]}.`
        );

        return;
    }

    const item = document.createElement("div");

    item.className = "participante-item";

    item.innerHTML = `
        <div class="participante-cabecalho">

            <strong class="participante-numero">
                Novo cadastro
            </strong>

            <button
                type="button"
                class="btn-remover-participante"
                title="Remover participante"
                aria-label="Remover participante"
            >
                ✕
            </button>

        </div>

        <div class="form-grid">

            <div class="form-group">

                <label>Nome completo</label>

                <input
                    type="text"
                    class="nome-participante"
                    placeholder="Digite o nome completo"
                    maxlength="120"
                    value="${escaparHTML(dados?.nome || "")}"
                >

            </div>

            <div class="form-group">

                <label>Categoria</label>

                <select class="categoria-participante">

                    <option value="participante">
                        Participante adicional
                    </option>

                    <option value="ministerio">
                        Ministério
                    </option>

                    <option value="encarregado">
                        Encarregado de manutenção
                    </option>

                </select>

            </div>

        </div>
    `;

    const select = item.querySelector(".categoria-participante");

    select.value = categoria;
    select.dataset.categoriaAnterior = categoria;

    lista.appendChild(item);

    atualizarControleParticipantes();

    salvarParticipantes();

    limparDocumento();

    item.querySelector(".nome-participante")?.focus();
}

/* =========================================================
   8. CONTROLE DOS LIMITES
========================================================= */

function obterCategoriaDisponivel() {

    const ordem = [
        "participante",
        "ministerio",
        "encarregado"
    ];

    return ordem.find(categoria =>
        contarCategoria(categoria) <
        LIMITES_PARTICIPANTES[categoria]
    ) || null;
}

function contarCategoria(categoria, ignorarSelect = null) {

    const selects = document.querySelectorAll(
        ".categoria-participante"
    );

    let quantidade = 0;

    selects.forEach(select => {

        if (select === ignorarSelect) return;

        if (select.value === categoria) {
            quantidade++;
        }
    });

    return quantidade;
}

function atualizarControleParticipantes() {

    const lista = $("listaParticipantes");
    const botao = $("btnNovoParticipante");

    if (!lista || !botao) return;

    const itens = lista.querySelectorAll(".participante-item");

    itens.forEach((item, indice) => {

        const numero = item.querySelector(".participante-numero");

        if (numero) {
            numero.textContent = `Cadastro ${indice + 1}`;
        }
    });

    const todosLimitesAtingidos = Object.keys(
        LIMITES_PARTICIPANTES
    ).every(categoria =>
        contarCategoria(categoria) >=
        LIMITES_PARTICIPANTES[categoria]
    );

    botao.disabled = todosLimitesAtingidos;

    botao.innerHTML = todosLimitesAtingidos
        ? "Limite de cadastros atingido"
        : "<span>＋</span> Novo participante";
}

function obterParticipantes() {

    const itens = document.querySelectorAll(".participante-item");

    const participantes = [];

    itens.forEach(item => {

        const nome = item.querySelector(
            ".nome-participante"
        )?.value.trim();

        const categoria = item.querySelector(
            ".categoria-participante"
        )?.value;

        if (!nome) return;

        participantes.push({
            nome,
            categoria
        });
    });

    return participantes;
}

function validarParticipantes() {

    const participantes = obterParticipantes();

    for (const categoria in LIMITES_PARTICIPANTES) {

        const quantidade = participantes.filter(
            item => item.categoria === categoria
        ).length;

        if (quantidade > LIMITES_PARTICIPANTES[categoria]) {

            alert(
                `O limite para ${CATEGORIAS[categoria]} é de ` +
                `${LIMITES_PARTICIPANTES[categoria]} nome(s).`
            );

            return false;
        }
    }

    return true;
}

/* =========================================================
   9. SALVAR E CARREGAR PARTICIPANTES
========================================================= */

function salvarParticipantes() {

    const idIgreja = $("congregacao")?.value;

    if (!idIgreja) return;

    const participantes = obterParticipantes();

    const chave = CHAVE_PARTICIPANTES + idIgreja;

    salvarJSON(chave, participantes);
}

function carregarParticipantesSalvos() {

    const lista = $("listaParticipantes");

    if (!lista) return;

    lista.innerHTML = "";

    const idIgreja = $("congregacao")?.value;

    if (!idIgreja) {

        atualizarControleParticipantes();
        return;
    }

    const chave = CHAVE_PARTICIPANTES + idIgreja;

    const dados = lerJSON(chave, []);

    if (Array.isArray(dados)) {

        dados.forEach(item => {

            if (
                item &&
                item.nome &&
                CATEGORIAS[item.categoria] &&
                contarCategoria(item.categoria) <
                    LIMITES_PARTICIPANTES[item.categoria]
            ) {

                adicionarParticipante(item);
            }
        });
    }

    atualizarControleParticipantes();
}

/* =========================================================
   10. LIMPEZA E PRÉ-VISUALIZAÇÃO
========================================================= */

function limparDocumento() {

    documentoGerado = false;

    $("areaImpressao").innerHTML = "";
    $("areaImpressao").hidden = true;

    $("mensagemInicial").hidden = false;

    $("btnImprimir").disabled = true;
}

function limparFormulario() {

    const idIgreja = $("congregacao").value;

    $("congregacao").value = "";
    $("tipoDocumento").value = "relatorio";

    $("dataDocumento").value = dataHoje();

    $("horarioAta").value = "";

    const hoje = new Date();

    $("mesAta").value = nomeMes(hoje.getMonth() + 1);
    $("anoAta").value = hoje.getFullYear();

    $("observacaoAta").value = "";

    if (idIgreja) {

        localStorage.removeItem(
            CHAVE_PARTICIPANTES + idIgreja
        );
    }

    $("listaParticipantes").innerHTML = "";

    atualizarTipoDocumento();

    atualizarControleParticipantes();

    limparDocumento();
}

/* =========================================================
   11. GERAÇÃO DO DOCUMENTO
========================================================= */

function gerarDocumento() {

    const idIgreja = $("congregacao").value;
    const data = $("dataDocumento").value;
    const tipo = $("tipoDocumento").value;

    if (!idIgreja) {

        alert("Selecione uma congregação.");
        return;
    }

    if (!data) {

        alert("Selecione a data do documento.");
        return;
    }

    const igreja = igrejas.find(
        item => String(item.id) === String(idIgreja)
    );

    if (!igreja) {

        alert("Congregação não encontrada.");
        return;
    }

    let conteudo = "";

    if (tipo === "ata") {

        if (!$("mesAta").value || !$("anoAta").value) {

            alert("Informe o mês e o ano da competência.");
            return;
        }

        if (!validarParticipantes()) {
            return;
        }

        salvarParticipantes();

        conteudo = gerarATA(igreja, data);

    } else {

        conteudo = gerarRelatorio(igreja, data);
    }

    $("areaImpressao").innerHTML = conteudo;

    $("areaImpressao").hidden = false;

    $("mensagemInicial").hidden = true;

    $("btnImprimir").disabled = false;

    documentoGerado = true;

    $("areaImpressao").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

/* =========================================================
   12. BLOCOS DE ASSINATURA
========================================================= */

function gerarBlocoCategoria(titulo, participantes, categoria) {

    const nomes = participantes.filter(
        item => item.categoria === categoria
    );

    if (!nomes.length) {
        return "";
    }

    const classe = categoria === "participante"
        ? "assinaturas-participantes"
        : "assinaturas-responsaveis";

    return `
        <section class="grupo-assinaturas ${classe}">

            <h3>${escaparHTML(titulo)}</h3>

            <div class="lista-assinaturas">

                ${nomes.map(item => `

                    <div class="assinatura-adicional">

                        <strong class="nome-assinante">
                            ${escaparHTML(item.nome)}
                        </strong>

                        <div class="assinatura-linha"></div>

                        <span class="identificacao-assinatura">
                            ${escaparHTML(titulo)}
                        </span>

                    </div>

                `).join("")}

            </div>

        </section>
    `;
}

/* =========================================================
   13. GERAÇÃO DA ATA PREVENTIVA
========================================================= */

function gerarATA(igreja, data) {

    const horario = $("horarioAta").value || "________";
    const mes = $("mesAta").value;
    const ano = $("anoAta").value;

    const observacao = $("observacaoAta").value.trim();

    const participantes = obterParticipantes();

    const blocoParticipantes = gerarBlocoCategoria(
        "Participantes adicionais",
        participantes,
        "participante"
    );

    const blocoMinisterio = gerarBlocoCategoria(
        "Ministério",
        participantes,
        "ministerio"
    );

    const blocoEncarregado = gerarBlocoCategoria(
        "Encarregado de manutenção",
        participantes,
        "encarregado"
    );

    return `
        <article class="documento">

            <header class="documento-cabecalho">

                <h1>Congregação Cristã no Brasil</h1>

                <p>Controle de Manutenção</p>

            </header>

            <div class="documento-identificacao">

                <strong>Congregação:</strong>
                ${escaparHTML(igreja.nome)}

                <br>

                <strong>Código:</strong>
                ${escaparHTML(igreja.codigo || igreja.id)}

            </div>

            <h2 class="documento-titulo">
                ATA – Reunião de Manutenção Preventiva
            </h2>

            <div class="documento-texto">

                <p>
                    Na data de ${formatarData(data)}, às
                    ${escaparHTML(horario)}, na casa de oração
                    ${escaparHTML(igreja.nome)}, foi realizada a reunião
                    mensal da manutenção preventiva, sendo observado
                    e dado ciência a todos os presentes quanto ao
                    cumprimento das inspeções conforme cronograma
                    disponibilizado no Sistema SIGA da Congregação
                    Cristã no Brasil, referente à competência do mês
                    de <strong>${escaparHTML(mes)}</strong>
                    do ano de <strong>${escaparHTML(ano)}</strong>.
                </p>

            </div>

            ${blocoMinisterio}

            ${blocoEncarregado}

            ${blocoParticipantes}

            <div class="documento-observacoes">

                <strong>Observações:</strong>

                <p>${escaparHTML(observacao || " ")}</p>

            </div>

            <footer class="documento-rodape">
                Controle de Manutenção CCB
            </footer>

        </article>
    `;
}

/* =========================================================
   14. GERAÇÃO DO RELATÓRIO DIÁRIO
========================================================= */

function gerarRelatorio(igreja, data) {

    const ordens = carregarOrdens(igreja.id);

    /*
       CRITÉRIO DO RELATÓRIO:
       Somente a data de abertura.
       Não filtrar pelo status ou conclusão.
    */

    const filtradas = ordens
        .filter(ordem => ordem.dataAbertura === data)
        .sort((a, b) => Number(a.numero) - Number(b.numero));

    const total = filtradas.length;

    const concluidas = filtradas.filter(
        ordem => ordem.concluida === "SIM"
    ).length;

    const andamento = filtradas.filter(
        ordem =>
            ordem.status === "EM ANDAMENTO" &&
            ordem.concluida !== "SIM"
    ).length;

    const pendentes = filtradas.filter(
        ordem =>
            ordem.concluida !== "SIM" &&
            ordem.status !== "EM ANDAMENTO"
    ).length;

    let linhas = "";

    if (filtradas.length) {

        linhas = filtradas.map(ordem => `

            <tr>

                <td>${escaparHTML(ordem.numero)}</td>

                <td>${formatarData(ordem.dataAbertura)}</td>

                <td>

                    <strong>${escaparHTML(ordem.descricao)}</strong>

                    ${ordem.observacoes
                        ? `<br><small>${escaparHTML(ordem.observacoes)}</small>`
                        : ""}

                </td>

                <td>${escaparHTML(ordem.responsavel || "-")}</td>

                <td>${escaparHTML(ordem.status)}</td>

                <td>${escaparHTML(ordem.concluida)}</td>

            </tr>

        `).join("");

    } else {

        linhas = `
            <tr>
                <td colspan="6" style="text-align:center;padding:25px;">
                    Nenhuma ordem de serviço foi aberta nesta data.
                </td>
            </tr>
        `;
    }

    return `
        <article class="documento">

            <header class="documento-cabecalho">

                <h1>Congregação Cristã no Brasil</h1>

                <p>Controle de Manutenção</p>

            </header>

            <div class="documento-identificacao">

                <strong>Congregação:</strong>
                ${escaparHTML(igreja.nome)}

                <br>

                <strong>Código:</strong>
                ${escaparHTML(igreja.codigo || igreja.id)}

                <br>

                <strong>Data do relatório:</strong>
                ${formatarData(data)}

            </div>

            <h2 class="documento-titulo">
                Relatório Diário de Ordens de Serviço
            </h2>

            <div class="documento-resumo">

                <div class="resumo-item">
                    <span>Total de OS</span>
                    <strong>${total}</strong>
                </div>

                <div class="resumo-item">
                    <span>Concluídas</span>
                    <strong>${concluidas}</strong>
                </div>

                <div class="resumo-item">
                    <span>Em andamento</span>
                    <strong>${andamento}</strong>
                </div>

                <div class="resumo-item">
                    <span>Pendentes</span>
                    <strong>${pendentes}</strong>
                </div>

            </div>

            <table class="documento-tabela">

                <thead>

                    <tr>
                        <th>Nº</th>
                        <th>Abertura</th>
                        <th>Descrição / Observações</th>
                        <th>Responsável</th>
                        <th>Status</th>
                        <th>Concluída</th>
                    </tr>

                </thead>

                <tbody>
                    ${linhas}
                </tbody>

            </table>

            <footer class="documento-rodape">

                Relatório gerado pelo Controle de Manutenção CCB

                <br>

                Data de referência: ${formatarData(data)}

            </footer>

        </article>
    `;
}

/* =========================================================
   15. IMPRESSÃO
========================================================= */

function imprimirDocumento() {

    if (!documentoGerado) {

        alert("Gere um documento antes de imprimir.");
        return;
    }

    window.print();
}

console.info("Módulo de impressão CCB carregado.");
