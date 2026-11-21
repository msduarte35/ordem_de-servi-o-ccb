/* =========================================================
   CONTROLE DE MANUTENÇÃO CCB - script.js CORRIGIDO
   Painel + Igrejas + OS + Backup
========================================================= */

const PREFIXO = "ccb_manutencao_";
const CHAVE_ANTIGA = "mvp_ordens_servico_v1";
const CHAVE_IGREJAS = "controleManutencao_igrejas";
const ID_CENTRAL = "070002";
const VERSAO_BACKUP = "1.0";
const SISTEMA_BACKUP = "Controle de Manutenção CCB";
const LIMITE_BACKUP_MB = 20;

const RESPONSAVEIS = ["Ademilson","Ailson","Antonio","Claudiomar","Daniel","Egmar","Elson","Luciano","Marcos","Matias","Moacir","Uilson","Vilmar"];

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

function $(id){ return document.getElementById(id); }
function lerJSON(chave, padrao=null){
  try{ const v=localStorage.getItem(chave); if(v===null) return padrao; return JSON.parse(v); }
  catch(e){ console.error("Erro ao ler:",chave,e); return padrao; }
}
function salvarJSON(chave,dados){
  try{ localStorage.setItem(chave,JSON.stringify(dados)); return true; }
  catch(e){ console.error("Erro ao salvar:",chave,e); alert("Não foi possível salvar os dados."); return false; }
}
function escaparHTML(v){ return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }
function dataHoje(){ const h=new Date(); return `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,"0")}-${String(h.getDate()).padStart(2,"0")}`; }
function formatarData(d){ if(!d) return "-"; const p=String(d).split("-"); if(p.length!==3) return d; return `${p[2]}/${p[1]}/${p[0]}`; }
function normalizarStatus(s){
  const v=String(s||"ABERTA").trim().toUpperCase();
  const eq={"CONCLUIDO":"CONCLUÍDA","CONCLUIDA":"CONCLUÍDA","CONCLUÍDO":"CONCLUÍDA","NOK":"N/OK","NÃO OK":"N/OK"};
  return eq[v]||v;
}
function normalizarOrdem(os,indice=0){
  const o=os&&typeof os==="object"?os:{};
  const st=normalizarStatus(o.status);
  const conc=String(o.concluida||"NÃO").toUpperCase()==="SIM"||st==="CONCLUÍDA";
  return { id:String(o.id||`os-${Date.now()}-${indice}`), numero:Number(o.numero||o.num||indice+1), dataAbertura:o.dataAbertura||o.data||dataHoje(), descricao:o.descricao||o.local||o.atividade||"", observacoes:o.observacoes||o.observacao||"", responsavel:o.responsavel||"", status:conc?"CONCLUÍDA":st, concluida:conc?"SIM":"NÃO", dataConclusao:o.dataConclusao||"" };
}
function obterListaOrdens(d){ if(Array.isArray(d)) return d; if(d&&Array.isArray(d.ordens)) return d.ordens; if(d&&Array.isArray(d.os)) return d.os; return []; }

function carregarIgrejas(){
  const salvas=lerJSON(CHAVE_IGREJAS,[]);
  const listaSalva=Array.isArray(salvas)?salvas:[];
  const res=IGREJAS_INICIAIS.map(i=>({...i}));
  listaSalva.forEach(ig=>{ if(!ig||!ig.id) return; const idx=res.findIndex(x=>String(x.id)===String(ig.id)); if(idx>=0) res[idx]={...res[idx],...ig}; else res.push(ig); });
  salvarJSON(CHAVE_IGREJAS,res); return res;
}
function salvarIgrejas(){ return salvarJSON(CHAVE_IGREJAS,igrejas); }
function obterChaveIgreja(id){ return PREFIXO+String(id); }
function carregarOrdens(idIgreja){
  if(!idIgreja) return [];
  const dados=lerJSON(obterChaveIgreja(idIgreja),[]);
  if(Array.isArray(dados)) return dados.map((o,i)=>normalizarOrdem(o,i));
  return obterListaOrdens(dados).map((o,i)=>normalizarOrdem(o,i));
}
function salvarOrdens(id,lista){ return salvarJSON(obterChaveIgreja(id),lista); }

function migrarDadosAntigos(){
  const chaveCentral=obterChaveIgreja(ID_CENTRAL);
  if(localStorage.getItem(chaveCentral)!==null) return;
  const antigos=lerJSON(CHAVE_ANTIGA,[]);
  const listaAntiga=obterListaOrdens(antigos);
  if(listaAntiga.length>0){ const m=listaAntiga.map((o,i)=>normalizarOrdem(o,i)); salvarOrdens(ID_CENTRAL,m); return; }
  const iniciais=DADOS_INICIAIS_CENTRAL.map((o,i)=>normalizarOrdem(o,i));
  salvarOrdens(ID_CENTRAL,iniciais);
}

function obterPagina(){ return document.body.dataset.page||""; }
function obterIgrejaAtual(){
  const p=new URLSearchParams(window.location.search);
  const id=p.get("igreja")||p.get("id");
  if(id){ const e=igrejas.find(i=>String(i.id)===String(id)); if(e) return e; }
  return igrejas.find(i=>String(i.id)===ID_CENTRAL)||null;
}

document.addEventListener("DOMContentLoaded",iniciarSistema);
function iniciarSistema(){
  igrejas=carregarIgrejas();
  migrarDadosAntigos();
  const pagina=obterPagina();
  if(pagina==="painel") iniciarPainel();
  if(pagina==="igreja") iniciarPaginaIgreja();
}

function iniciarPainel(){
  configurarModalIgreja(); configurarPesquisaIgreja(); configurarBackup();
  atualizarResumoGeral(); renderizarListaIgrejas(); renderizarEstadoInicial();
}
function atualizarResumoGeral(){
  let totalOS=0,conc=0,pend=0;
  igrejas.forEach(ig=>{ const l=carregarOrdens(ig.id); totalOS+=l.length; l.forEach(o=>{ if(o.concluida==="SIM") conc++; else pend++; }); });
  if($("totalIgrejas")) $("totalIgrejas").textContent=igrejas.length;
  if($("totalOSGeral")) $("totalOSGeral").textContent=totalOS;
  if($("concluidasGeral")) $("concluidasGeral").textContent=conc;
  if($("pendentesGeral")) $("pendentesGeral").textContent=pend;
  if($("totalIgrejasMenu")) $("totalIgrejasMenu").textContent=igrejas.length;
}
function renderizarListaIgrejas(){
  const lista=$("listaIgrejas"); if(!lista) return;
  const busca=$("buscaIgreja")?$("buscaIgreja").value.toLowerCase().trim():"";
  const filtradas=igrejas.filter(ig=>[ig.nome,ig.codigo,ig.descricao,ig.id].join(" ").toLowerCase().includes(busca));
  lista.innerHTML="";
  if($("totalIgrejasMenu")) $("totalIgrejasMenu").textContent=igrejas.length;
  if(!filtradas.length){ lista.innerHTML=`<div class="sidebar-empty"><strong>Nenhuma congregação encontrada</strong><span>Tente pesquisar por outro nome ou código.</span></div>`; return; }
  filtradas.forEach(ig=>{
    const regs=carregarOrdens(ig.id);
    const item=document.createElement("button"); item.type="button"; item.className="church-nav-item";
    if(igrejaSelecionada&&String(igrejaSelecionada.id)===String(ig.id)) item.classList.add("ativo");
    item.innerHTML=`<span class="church-nav-icon">⌂</span><span class="church-nav-text"><strong>${escaparHTML(ig.nome)}</strong><small>${escaparHTML(ig.codigo||ig.id)}</small></span><span class="church-nav-count">${regs.length}</span><span class="church-nav-arrow">›</span>`;
    item.addEventListener("click",()=>selecionarIgreja(ig.id));
    lista.appendChild(item);
  });
}
function selecionarIgreja(id){
  igrejaSelecionada=igrejas.find(i=>String(i.id)===String(id));
  if(!igrejaSelecionada) return;
  renderizarListaIgrejas(); renderizarDetalhesIgreja();
}
function renderizarDetalhesIgreja(){
  const d=$("detalhesIgreja"); if(!d) return;
  if(!igrejaSelecionada){ renderizarEstadoInicial(); return; }
  const regs=carregarOrdens(igrejaSelecionada.id);
  const total=regs.length, conc=regs.filter(o=>o.concluida==="SIM").length, pend=total-conc;
  const perc=total>0?Math.round((conc/total)*100):0;
  d.innerHTML=`
    <div class="detail-heading">
      <div class="detail-title-group"><div class="detail-icon">⌂</div><div><p class="eyebrow">CONGREGAÇÃO SELECIONADA</p><h3>${escaparHTML(igrejaSelecionada.nome)}</h3><p class="muted small">${escaparHTML(igrejaSelecionada.codigo||igrejaSelecionada.id)}</p></div></div>
      <a class="btn btn-primary" href="igreja.html?igreja=${encodeURIComponent(igrejaSelecionada.id)}">Abrir ordens de serviço →</a>
    </div>
    <div class="detail-info-grid">
      <div class="detail-info-card"><span class="detail-info-icon">⌂</span><div><small>Congregação</small><strong>${escaparHTML(igrejaSelecionada.nome)}</strong></div></div>
      <div class="detail-info-card"><span class="detail-info-icon">#</span><div><small>Código</small><strong>${escaparHTML(igrejaSelecionada.codigo||igrejaSelecionada.id)}</strong></div></div>
      <div class="detail-info-card"><span class="detail-info-icon">i</span><div><small>Descrição</small><strong>${escaparHTML(igrejaSelecionada.descricao||"-")}</strong></div></div>
    </div>
    <div class="detail-section-title"><div><h4>Resumo das manutenções</h4><p class="muted small">Indicadores das ordens de serviço desta congregação.</p></div><span class="detail-period">Dados atuais</span></div>
    <div class="detail-stats">
      <div class="detail-stat"><span class="detail-stat-symbol blue">▤</span><div><small>Total de ordens</small><strong>${total}</strong></div></div>
      <div class="detail-stat"><span class="detail-stat-symbol green">✓</span><div><small>Concluídas</small><strong>${conc}</strong></div></div>
      <div class="detail-stat"><span class="detail-stat-symbol amber">◷</span><div><small>Pendentes</small><strong>${pend}</strong></div></div>
    </div>
    <div class="completion-card"><div class="completion-head"><div><strong>Progresso das manutenções</strong><small>Percentual de ordens concluídas</small></div><span class="completion-percent">${perc}%</span></div><div class="progress-track"><span style="width:${perc}%"></span></div></div>
    <div class="detail-footer"><span><span class="online-dot"></span> Dados armazenados neste navegador</span><span>${total} ${total===1?"ordem cadastrada":"ordens cadastradas"}</span></div>`;
}
function renderizarEstadoInicial(){
  const d=$("detalhesIgreja"); if(!d) return;
  d.innerHTML=`<div class="empty-state empty-state-main"><i>⌂</i><h3>Bem-vindo ao Controle de Manutenção</h3><p>Selecione uma congregação no menu lateral para visualizar os indicadores e acessar suas ordens de serviço.</p></div>`;
}
function configurarPesquisaIgreja(){ const b=$("buscaIgreja"); if(b) b.addEventListener("input",renderizarListaIgrejas); }

function configurarModalIgreja(){
  [$("btnNovaIgrejaTopo"),$("btnNovaIgreja")].filter(Boolean).forEach(btn=>btn.addEventListener("click",abrirModalIgreja));
  $("fecharModalIgreja")?.addEventListener("click",fecharModalIgreja);
  $("cancelarCadastroIgreja")?.addEventListener("click",fecharModalIgreja);
  $("formIgreja")?.addEventListener("submit",cadastrarIgreja);
  $("modalIgreja")?.addEventListener("click",e=>{ if(e.target===$("modalIgreja")) fecharModalIgreja(); });
}
function abrirModalIgreja(){ const m=$("modalIgreja"); if(!m) return; $("formIgreja")?.reset(); if(typeof m.showModal==="function") m.showModal(); else m.setAttribute("open",""); }
function fecharModalIgreja(){ const m=$("modalIgreja"); if(!m) return; if(typeof m.close==="function") m.close(); else m.removeAttribute("open"); }
function cadastrarIgreja(e){
  e.preventDefault();
  const nome=$("nomeNovaIgreja")?.value.trim(), codigo=$("codigoNovaIgreja")?.value.trim(), descricao=$("descricaoNovaIgreja")?.value.trim();
  if(!nome||!codigo){ alert("Informe o nome e o código da congregação."); return; }
  const id=codigo.replace(/\D/g,"").padStart(6,"0");
  if(!id||id==="000000"){ alert("Informe um código válido."); return; }
  if(igrejas.some(i=>String(i.id)===id)){ alert("Já existe uma congregação cadastrada com esse código."); return; }
  const nova={id,nome:nome.toUpperCase(),codigo,descricao:descricao||nome};
  igrejas.push(nova);
  if(!salvarIgrejas()){ igrejas.pop(); return; }
  fecharModalIgreja(); atualizarResumoGeral(); renderizarListaIgrejas(); selecionarIgreja(nova.id);
  alert("Congregação cadastrada com sucesso!");
}

function iniciarPaginaIgreja(){
  igrejaSelecionada=obterIgrejaAtual();
  if(!igrejaSelecionada){ alert("Congregação não encontrada."); window.location.href="index.html"; return; }
  ordens=carregarOrdens(igrejaSelecionada.id);
  atualizarIdentificacaoIgreja(); configurarFormularioOS(); configurarFiltrosOS(); configurarBotoesOS(); atualizarTelaOS();
}
function atualizarIdentificacaoIgreja(){
  if($("nomeIgreja")) $("nomeIgreja").textContent=igrejaSelecionada.nome;
  if($("codigoIgreja")) $("codigoIgreja").textContent=`${igrejaSelecionada.codigo||igrejaSelecionada.id} • ${igrejaSelecionada.descricao||""}`;
}
function configurarFormularioOS(){
  const f=$("formOS"); if(!f){ console.error("Formulário formOS não encontrado."); return; }
  f.addEventListener("submit",salvarOrdemFormulario);
  preencherResponsaveis();
  $("btnNovaOS")?.addEventListener("click",abrirNovaOS);
  $("fecharModal")?.addEventListener("click",fecharModalOS);
  $("cancelar")?.addEventListener("click",fecharModalOS);
  $("modalOS")?.addEventListener("click",e=>{ if(e.target===$("modalOS")) fecharModalOS(); });
  $("concluida")?.addEventListener("change",atualizarConclusao);
  $("status")?.addEventListener("change",atualizarStatusConclusao);
}
function preencherResponsaveis(){
  const c=$("responsavel"); if(!c) return;
  const atual=c.value;
  c.innerHTML=`<option value="">Selecione o responsável</option>${RESPONSAVEIS.map(n=>`<option value="${escaparHTML(n)}">${escaparHTML(n)}</option>`).join("")}`;
  if(atual) c.value=atual;
}
function abrirModalOS(){ const m=$("modalOS"); if(!m) return; if(typeof m.showModal==="function") m.showModal(); else m.setAttribute("open",""); }
function fecharModalOS(){ const m=$("modalOS"); if(!m) return; modoVisualizacao=false; habilitarFormularioOS(true); if(typeof m.close==="function") m.close(); else m.removeAttribute("open"); }
function habilitarFormularioOS(hab){
  const f=$("formOS"); if(!f) return;
  f.querySelectorAll("input, select, textarea").forEach(c=>{ if(c.type==="hidden") return; c.disabled=!hab; });
  const btn=f.querySelector('[type="submit"]'); if(btn) btn.hidden=!hab;
  if($("cancelar")) $("cancelar").textContent=hab?"Cancelar":"Fechar";
}
function preencherFormularioOS(os){
  $("osId").value=os.id; $("numero").value=os.numero; $("dataAbertura").value=os.dataAbertura;
  $("descricao").value=os.descricao; $("observacoes").value=os.observacoes; $("responsavel").value=os.responsavel;
  $("status").value=os.status; $("concluida").value=os.concluida; $("dataConclusao").value=os.dataConclusao||"";
}
function abrirNovaOS(){
  const f=$("formOS"); if(!f) return;
  modoVisualizacao=false; habilitarFormularioOS(true); f.reset();
  $("osId").value=""; $("tituloModal").textContent="Nova ordem de serviço";
  $("dataAbertura").value=dataHoje(); $("status").value="ABERTA"; $("concluida").value="NÃO"; $("dataConclusao").value="";
  const nums=ordens.map(o=>Number(o.numero)||0);
  $("numero").value=Math.max(0,...nums)+1;
  abrirModalOS();
}
function visualizarOS(id){
  const os=ordens.find(x=>String(x.id)===String(id)); if(!os){ alert("Ordem de serviço não encontrada."); return; }
  modoVisualizacao=true; preencherFormularioOS(os);
  $("tituloModal").textContent=`Visualizar OS nº ${os.numero}`; habilitarFormularioOS(false); abrirModalOS();
}
function editarOS(id){
  const os=ordens.find(x=>String(x.id)===String(id)); if(!os){ alert("Ordem de serviço não encontrada."); return; }
  modoVisualizacao=false; habilitarFormularioOS(true); preencherFormularioOS(os);
  $("tituloModal").textContent="Editar ordem de serviço"; abrirModalOS();
}
function salvarOrdemFormulario(e){
  e.preventDefault(); if(modoVisualizacao) return;
  const idExist=$("osId").value, numero=Number($("numero").value), dataAbertura=$("dataAbertura").value;
  const descricao=$("descricao").value.trim(), observacoes=$("observacoes").value.trim(), responsavel=$("responsavel").value;
  let status=normalizarStatus($("status").value), concluida=$("concluida").value, dataConclusao=$("dataConclusao").value;
  if(!numero||numero<1){ alert("Informe um número válido para a OS."); return; }
  if(!dataAbertura){ alert("Informe a data de abertura."); return; }
  if(!descricao){ alert("Informe o local ou a descrição da atividade."); return; }
  if(!responsavel){ alert("Selecione o responsável."); return; }
  if(ordens.some(o=>Number(o.numero)===numero&&String(o.id)!==String(idExist))){ alert("Já existe uma OS com esse número nesta congregação."); return; }
  if(concluida==="SIM"||status==="CONCLUÍDA"){ concluida="SIM"; status="CONCLUÍDA"; if(!dataConclusao) dataConclusao=dataHoje(); }
  else{ concluida="NÃO"; dataConclusao=""; }
  const ordem={id:idExist||`os-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,numero,dataAbertura,descricao,observacoes,responsavel,status,concluida,dataConclusao};
  const idx=ordens.findIndex(o=>String(o.id)===String(idExist));
  const anterior=[...ordens];
  if(idx>=0) ordens[idx]=ordem; else ordens.push(ordem);
  if(!salvarOrdens(igrejaSelecionada.id,ordens)){ ordens=anterior; return; }
  fecharModalOS(); atualizarTelaOS();
  alert(idx>=0?"Ordem de serviço atualizada!":"Ordem de serviço cadastrada!");
}
function atualizarConclusao(){
  const c=$("concluida"), s=$("status"), d=$("dataConclusao"); if(!c||!s||!d) return;
  if(c.value==="SIM"){ s.value="CONCLUÍDA"; if(!d.value) d.value=dataHoje(); }
  else{ if(s.value==="CONCLUÍDA") s.value="ABERTA"; d.value=""; }
}
function atualizarStatusConclusao(){
  const s=$("status"), c=$("concluida"), d=$("dataConclusao"); if(!s||!c||!d) return;
  if(s.value==="CONCLUÍDA"){ c.value="SIM"; if(!d.value) d.value=dataHoje(); }
  else{ c.value="NÃO"; d.value=""; }
}
function excluirOS(id){
  const os=ordens.find(x=>String(x.id)===String(id)); if(!os) return;
  if(!confirm(`Deseja realmente excluir a OS nº ${os.numero}?\n\nEssa ação não poderá ser desfeita.`)) return;
  const anterior=[...ordens];
  ordens=ordens.filter(x=>String(x.id)!==String(id));
  if(!salvarOrdens(igrejaSelecionada.id,ordens)){ ordens=anterior; return; }
  atualizarTelaOS();
}
function configurarFiltrosOS(){
  ["busca","filtroStatus","filtroResponsavel","filtroConclusao"].forEach(id=>{
    const c=$(id); if(c){ c.addEventListener("input",atualizarTabelaOS); c.addEventListener("change",atualizarTabelaOS); }
  });
}
function atualizarFiltroResponsaveis(){
  const c=$("filtroResponsavel"); if(!c) return;
  const atual=c.value;
  const resps=[...new Set(ordens.map(o=>o.responsavel).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"pt-BR"));
  c.innerHTML=`<option value="">Todos os responsáveis</option>${resps.map(n=>`<option value="${escaparHTML(n)}">${escaparHTML(n)}</option>`).join("")}`;
  c.value=resps.includes(atual)?atual:"";
}
function obterOrdensFiltradas(){
  const busca=$("busca")?.value.toLowerCase().trim()||"";
  const status=$("filtroStatus")?.value||"", resp=$("filtroResponsavel")?.value||"", conc=$("filtroConclusao")?.value||"";
  return ordens.filter(o=>{
    const texto=[o.numero,o.dataAbertura,o.descricao,o.observacoes,o.responsavel,o.status].join(" ").toLowerCase();
    return texto.includes(busca)&&(!status||o.status===normalizarStatus(status))&&(!resp||o.responsavel===resp)&&(!conc||o.concluida===conc);
  });
}

/* === CORREÇÃO PRINCIPAL: sem bloco duplicado fora da função === */
function atualizarTelaOS(){ atualizarIndicadoresOS(); atualizarFiltroResponsaveis(); atualizarTabelaOS(); }
function atualizarIndicadoresOS(){
  const total=ordens.length, conc=ordens.filter(o=>o.concluida==="SIM").length;
  const and=ordens.filter(o=>o.status==="EM ANDAMENTO").length;
  const pend=ordens.filter(o=>o.concluida!=="SIM"&&o.status!=="EM ANDAMENTO").length;
  if($("totalOS")) $("totalOS").textContent=total;
  if($("concluidas")) $("concluidas").textContent=conc;
  if($("andamento")) $("andamento").textContent=and;
  if($("pendentes")) $("pendentes").textContent=pend;
}
function atualizarTabelaOS(){
  const tabela=$("tabelaOS"), vazio=$("vazio");
  if(!tabela){ console.error("Elemento tabelaOS não encontrado no HTML."); return; }
  const filtradas=obterOrdensFiltradas();
  tabela.innerHTML="";
  filtradas.sort((a,b)=>Number(a.numero)-Number(b.numero));
  filtradas.forEach(os=>{
    const linha=document.createElement("tr");
    const classeStatus=os.status.toLowerCase().replaceAll(" ","-").replaceAll("/","-");
    linha.innerHTML=`
      <td><strong>${escaparHTML(os.numero)}</strong></td>
      <td>${formatarData(os.dataAbertura)}</td>
      <td><strong>${escaparHTML(os.descricao)}</strong>${os.observacoes?`<p class="muted small">${escaparHTML(os.observacoes)}</p>`:""}</td>
      <td>${escaparHTML(os.responsavel)}</td>
      <td><span class="status ${os.concluida==="SIM"?"CONCLUÍDA":"pendente"}">${escaparHTML(os.concluida)}</span></td>
      <td><span class="status ${escaparHTML(classeStatus)}">${escaparHTML(os.status)}</span></td>
      <td>${formatarData(os.dataConclusao)}</td>
      <td class="actions-col"><div class="os-menu-container">
        <button type="button" class="btn-opcoes-os" data-menu-id="${escaparHTML(os.id)}" aria-expanded="false" title="Mais opções"><span>⋮</span></button>
        <div class="os-dropdown" data-dropdown-id="${escaparHTML(os.id)}" hidden>
          <button type="button" class="os-dropdown-item" data-acao="visualizar" data-id="${escaparHTML(os.id)}"><span>◉</span> Visualizar</button>
          <button type="button" class="os-dropdown-item" data-acao="editar" data-id="${escaparHTML(os.id)}"><span>✎</span> Editar</button>
          <button type="button" class="os-dropdown-item excluir" data-acao="excluir" data-id="${escaparHTML(os.id)}"><span>⌫</span> Excluir</button>
        </div>
      </div></td>`;
    tabela.appendChild(linha);
  });
  tabela.querySelectorAll(".btn-opcoes-os").forEach(botao=>{
    botao.addEventListener("click",e=>{
      e.stopPropagation();
      const id=botao.dataset.menuId;
      const menu=tabela.querySelector(`[data-dropdown-id="${CSS.escape(id)}"]`);
      const aberto=menu&&!menu.hidden;
      tabela.querySelectorAll(".os-dropdown").forEach(x=>x.hidden=true);
      tabela.querySelectorAll(".btn-opcoes-os").forEach(x=>x.setAttribute("aria-expanded","false"));
      if(menu&&!aberto){ menu.hidden=false; botao.setAttribute("aria-expanded","true"); }
    });
  });
  tabela.querySelectorAll(".os-dropdown-item").forEach(botao=>{
    botao.addEventListener("click",e=>{
      e.stopPropagation();
      const id=botao.dataset.id, acao=botao.dataset.acao;
      tabela.querySelectorAll(".os-dropdown").forEach(x=>x.hidden=true);
      tabela.querySelectorAll(".btn-opcoes-os").forEach(x=>x.setAttribute("aria-expanded","false"));
      if(acao==="visualizar") visualizarOS(id);
      if(acao==="editar") editarOS(id);
      if(acao==="excluir") excluirOS(id);
    });
  });
  if(!document.body.dataset.menuOSConfigurado){
    document.addEventListener("click",()=>{
      document.querySelectorAll(".os-dropdown").forEach(m=>m.hidden=true);
      document.querySelectorAll(".btn-opcoes-os").forEach(b=>b.setAttribute("aria-expanded","false"));
    });
    document.body.dataset.menuOSConfigurado="true";
  }
  if($("contadorLista")) $("contadorLista").textContent=`${filtradas.length} ${filtradas.length===1?"registro":"registros"}`;
  if(vazio) vazio.hidden=filtradas.length>0;
}

function configurarBotoesOS(){
  $("btnExportar")?.addEventListener("click",exportarCSV);
  $("btnImprimir")?.addEventListener("click",()=>window.print());
}
function exportarCSV(){
  if(!igrejaSelecionada) return;
  if(!ordens.length){ alert("Não existem ordens de serviço para exportar."); return; }
  const cab=["Número","Data de abertura","Descrição","Observações","Responsável","Concluída","Status","Data de conclusão"];
  const linhas=ordens.map(o=>[o.numero,o.dataAbertura,o.descricao,o.observacoes,o.responsavel,o.concluida,o.status,o.dataConclusao]);
  const csv=[cab,...linhas].map(l=>l.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\r\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob); const link=document.createElement("a");
  link.href=url; link.download=`OS_${igrejaSelecionada.id}.csv`;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function pertenceAoSistema(ch){ return typeof ch==="string"&&(ch.startsWith(PREFIXO)||ch===CHAVE_ANTIGA||ch===CHAVE_IGREJAS); }
function obterDadosSistema(){
  const d={};
  for(let i=0;i<localStorage.length;i++){ const ch=localStorage.key(i); if(ch&&pertenceAoSistema(ch)) d[ch]=localStorage.getItem(ch); }
  return d;
}
function verificarArmazenamento(){
  try{ const d=obterDadosSistema(); const t=new Blob([JSON.stringify(d)]).size; const mb=t/(1024*1024); return {tamanho:t,mb,valido:mb<=LIMITE_BACKUP_MB}; }
  catch(e){ return {tamanho:0,mb:0,valido:false}; }
}
function atualizarStatusBackup(){
  const el=$("backupStatus"); if(!el) return;
  const a=verificarArmazenamento();
  el.textContent=a.valido?`Dados prontos para backup • ${a.mb.toFixed(2)} MB`:"Verifique o armazenamento";
}
function configurarBackup(){
  $("btnGerarBackup")?.addEventListener("click",gerarBackup);
  $("btnRestaurarBackup")?.addEventListener("click",()=>{ $("arquivoBackup")?.click(); });
  $("arquivoBackup")?.addEventListener("change",lerArquivoBackup);
  atualizarStatusBackup();
}
function gerarBackup(){
  if(backupEmAndamento) return; backupEmAndamento=true;
  try{
    const backup={sistema:SISTEMA_BACKUP,versao:VERSAO_BACKUP,dataGeracao:new Date().toISOString(),dados:obterDadosSistema()};
    const conteudo=JSON.stringify(backup,null,2);
    if(new Blob([conteudo]).size/(1024*1024)>LIMITE_BACKUP_MB){ alert("O arquivo de backup ultrapassou o limite permitido."); return; }
    const blob=new Blob([conteudo],{type:"application/json"});
    const url=URL.createObjectURL(blob); const link=document.createElement("a");
    link.href=url; link.download=`backup_manutencao_ccb_${dataHoje()}.json`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    atualizarStatusBackup(); alert("Backup gerado com sucesso!");
  }catch(e){ console.error(e); alert("Não foi possível gerar o backup."); }
  finally{ backupEmAndamento=false; }
}
function validarBackup(b){
  if(!b||typeof b!=="object") throw new Error("Arquivo inválido.");
  if(b.sistema!==SISTEMA_BACKUP) throw new Error("Este arquivo não pertence ao Controle de Manutenção CCB.");
  if(!b.dados||typeof b.dados!=="object") throw new Error("O arquivo não contém dados válidos.");
  const chaves=Object.keys(b.dados); if(!chaves.length) throw new Error("O arquivo de backup está vazio.");
  chaves.forEach(ch=>{ if(!pertenceAoSistema(ch)) throw new Error(`Chave não permitida no backup: ${ch}`); if(typeof b.dados[ch]!=="string") throw new Error(`Conteúdo inválido na chave: ${ch}`); JSON.parse(b.dados[ch]); });
  return true;
}
function lerArquivoBackup(e){
  const arq=e.target.files[0]; if(!arq) return;
  if(arq.size>LIMITE_BACKUP_MB*1024*1024){ alert("O arquivo ultrapassa o limite de 20 MB."); e.target.value=""; return; }
  const leitor=new FileReader();
  leitor.onload=()=>{
    try{ const b=JSON.parse(leitor.result); validarBackup(b); restaurarBackup(b); }
    catch(err){ alert(err.message||"Não foi possível ler o arquivo de backup."); }
    finally{ e.target.value=""; }
  };
  leitor.onerror=()=>{ alert("Erro ao abrir o arquivo selecionado."); e.target.value=""; };
  leitor.readAsText(arq);
}
function restaurarBackup(backup){
  if(backupEmAndamento) return;
  if(!confirm("ATENÇÃO!\n\nA restauração substituirá os dados atuais.\n\nDeseja continuar?")) return;
  backupEmAndamento=true;
  const anteriores={};
  try{
    Object.keys(backup.dados).forEach(ch=>{ anteriores[ch]=localStorage.getItem(ch); });
    Object.entries(backup.dados).forEach(([ch,v])=>{ localStorage.setItem(ch,v); });
    igrejas=carregarIgrejas();
    if(obterPagina()==="painel"){ atualizarResumoGeral(); renderizarListaIgrejas(); atualizarStatusBackup(); if(igrejaSelecionada){ igrejaSelecionada=igrejas.find(x=>String(x.id)===String(igrejaSelecionada.id))||null; renderizarDetalhesIgreja(); } }
    if(obterPagina()==="igreja"){ igrejaSelecionada=obterIgrejaAtual(); if(igrejaSelecionada){ ordens=carregarOrdens(igrejaSelecionada.id); atualizarTelaOS(); } }
    alert("Backup restaurado com sucesso!");
  }catch(e){
    console.error(e);
    Object.entries(anteriores).forEach(([ch,v])=>{ try{ if(v===null) localStorage.removeItem(ch); else localStorage.setItem(ch,v); }catch(_){} });
    igrejas=carregarIgrejas();
    alert("A restauração falhou. O sistema tentou preservar os dados anteriores.");
  }finally{ backupEmAndamento=false; }
}
console.info("Controle de Manutenção CCB carregado.");