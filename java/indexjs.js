
/* ---------- selects ---------- */

function carregarSelects() {
  const clientes = recuperarRegistros("clientes") || [];
  const catalogo = recuperarRegistros("servicos") || [];

  document.getElementById("cliente").innerHTML =
    `<option value="">Selecione o cliente...</option>` +
    clientes.map((c) => `<option value="${c.id}">${c.nome}</option>`).join("");

  document.getElementById("servico").innerHTML =
    `<option value="">Selecione um serviço</option>` +
    catalogo
      .map((s) => `<option value="${s.id}">${s.nome} (${formatarValor(s.valor)})</option>`)
      .join("");
}

/* ---------- serviços da OS em montagem ---------- */

function adicionarServico() {
  const select = document.getElementById("servico");
  const id = Number(select.value);
  if (!id) return;

  servicosOS.push(id);
  select.value = ""; // volta para "Selecione um serviço" para poder escolher outro
  renderizarServicos();
}

function removerServico(indice) {
  servicosOS.splice(indice, 1);
  renderizarServicos();
}

function somarServicos(ids) {
  const catalogo = recuperarRegistros("servicos") || [];
  return ids.reduce((soma, id) => {
    const s = catalogo.find((x) => x.id === id);
    return soma + (s ? s.valor : 0);
  }, 0);
}

function renderizarServicos() {
  const catalogo = recuperarRegistros("servicos") || [];
  let html = "";

  servicosOS.forEach((id, i) => {
    const s = catalogo.find((x) => x.id === id);
    html += `<div class="d-flex justify-content-between align-items-center border rounded px-2 py-1 mb-1">
      <span>${s ? s.nome : "Serviço removido"}</span>
      <span>
        ${s ? formatarValor(s.valor) : "-"}
        <button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="removerServico(${i})">×</button>
      </span>
    </div>`;
  });

  document.getElementById("listaServicos").innerHTML = html;
  // o total é a soma dos valores dos serviços adicionados
  document.getElementById("total").textContent = formatarValor(somarServicos(servicosOS));
}

/* ---------- salvar / limpar ---------- */

function limparForm() {
  document.getElementById("formOS").reset();
  servicosOS = [];
  renderizarServicos();
}

function salvarOS(event) {
  event.preventDefault();

  const clienteId = Number(document.getElementById("cliente").value);
  const bicicleta = document.getElementById("bicicleta").value.trim();

  if (!clienteId || !bicicleta) {
    alert("Escolha o cliente e informe a bicicleta");
    return;
  }
  if (servicosOS.length === 0) {
    alert("Adicione pelo menos um serviço");
    return;
  }

  const numero = ordens.length ? Math.max(...ordens.map((o) => o.numero)) + 1 : 1;
  ordens.push({
    numero,
    clienteId,
    bicicleta,
    data: new Date().toLocaleDateString("pt-BR"),
    servicos: [...servicosOS],
  });
  persistir("ordens", ordens);

  limparForm();
  atualizarTabela();
  alert(`OS #${numero} criada!`);
}

/* ---------- lista de ordens ---------- */

function excluirOrdem(numero) {
  if (!confirm("Excluir esta ordem de serviço?")) return;
  ordens = ordens.filter((o) => o.numero !== numero);
  persistir("ordens", ordens);
  atualizarTabela();
}

function atualizarTabela() {
  const clientes = recuperarRegistros("clientes") || [];
  const catalogo = recuperarRegistros("servicos") || [];
  let html = "";

  if (ordens.length === 0) {
    html = `<tr><td colspan="5" class="text-center text-secondary py-5">Nenhuma ordem de serviço</td></tr>`;
  } else {
    ordens.forEach((o) => {
      const cliente = clientes.find((c) => c.id === o.clienteId);
      const nomes = o.servicos
        .map((id) => {
          const s = catalogo.find((x) => x.id === id);
          return s ? s.nome : "Serviço removido";
        })
        .join(", ");

      html += `<tr>
        <td class="ps-4">${cliente ? cliente.nome : "Cliente removido"}</td>
        <td>${o.bicicleta}</td>
        <td>${nomes}</td>
        <td class="text-end">${formatarValor(somarServicos(o.servicos))}</td>
        <td class="text-end pe-4">
          <button class="btn btn-sm btn-outline-danger" onclick="excluirOrdem(${o.numero})">Excluir</button>
        </td>
      </tr>`;
    });
  }

  document.getElementById("tabela").innerHTML = html;
  document.getElementById("contador").textContent = ordens.length;
  document.getElementById("rodape").textContent = `${ordens.length} ordens de serviço`;
}

carregarSelects();
renderizarServicos();
atualizarTabela();