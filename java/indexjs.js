
let servicosOS = [];
let ordens = recuperarRegistros("ordens") || [];
let numeroEditando = null;

function carregarSelects() {
  const catalogo = recuperarRegistros("servicos") || [];

  document.getElementById("servico").innerHTML =
    `<option value="">Selecione um serviço</option>` +
    catalogo
      .map(
        (s) =>
          `<option value="${s.id}">${s.nome} (${formatarValor(s.valor)})</option>`,
      )
      .join("");
}
function escolherCliente(id) {
  const clientes = recuperarRegistros("clientes") || [];
  const c = clientes.find((x) => x.id === id);
  if (!c) return;

  document.getElementById("cliente").value = c.id;
  document.getElementById("buscaCliente").value = c.nome;
  document.getElementById("clienteEscolhido").textContent =
    `Selecionado: ${c.nome} — ${c.telefone}`;
  document.getElementById("sugestoes").classList.add("d-none");
}

function mostrarSugestoes() {
  const termo = document
    .getElementById("buscaCliente")
    .value.trim()
    .toLowerCase();
  const caixa = document.getElementById("sugestoes");

  // digitou de novo: o cliente escolhido antes deixa de valer
  document.getElementById("cliente").value = "";
  document.getElementById("clienteEscolhido").textContent = "";

  if (!termo) {
    caixa.classList.add("d-none");
    return;
  }

  const clientes = recuperarRegistros("clientes") || [];
  const achados = clientes
    .filter(
      (c) => c.nome.toLowerCase().includes(termo) || c.telefone.includes(termo),
    )
    .slice(0, 8); // mostra no máximo 8, não importa quantos cadastros existam

  if (achados.length === 0) {
    caixa.innerHTML = `<div class="list-group-item text-secondary small">Nenhum cliente encontrado</div>`;
  } else {
    caixa.innerHTML = achados
      .map(
        (
          c,
        ) => `<button type="button" class="list-group-item list-group-item-action d-flex justify-content-between"
                        onclick="escolherCliente(${c.id})">
          <span>${c.nome}</span>
          <span class="text-secondary small">${c.telefone}</span>
        </button>`,
      )
      .join("");
  }
  caixa.classList.remove("d-none");
}

document
  .getElementById("buscaCliente")
  .addEventListener("input", mostrarSugestoes);

// clicar fora fecha a lista
document.addEventListener("click", (e) => {
  if (!e.target.closest("#buscaCliente") && !e.target.closest("#sugestoes")) {
    document.getElementById("sugestoes").classList.add("d-none");
  }
});

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
  document.getElementById("total").textContent = formatarValor(
    somarServicos(servicosOS),
  );
}

function limparForm() {
  document.getElementById("formOS").reset();
  servicosOS = [];

  numeroEditando = null;
  document.getElementById("cliente").value = "";
  document.getElementById("clienteEscolhido").textContent = "";
  document.getElementById("sugestoes").classList.add("d-none");

  document.getElementById("btnSalvar").textContent = "Salvar ordem";
  document.getElementById("tituloForm").textContent = "Nova ordem de serviço";
  renderizarServicos();
}

function salvarOS(event) {
  event.preventDefault();

  const clienteId = Number(document.getElementById("cliente").value);
  const bicicleta = document.getElementById("bicicleta").value.trim();

  if (!clienteId) {
    alert("Escolha um cliente da lista de sugestões");
    return;
  }
  if (!bicicleta) {
    alert("Informe a bicicleta");
    return;
  }
  if (servicosOS.length === 0) {
    alert("Adicione pelo menos um serviço");
    return;
  }

  const numero = ordens.length
    ? Math.max(...ordens.map((o) => o.numero)) + 1
    : 1;
  ordens.push({
    numero,
    clienteId,
    bicicleta,
    data: hoje(),
    status: "pendente",
    servicos: [...servicosOS],
  });
  persistir("ordens", ordens);

  limparForm();
  atualizarTabela();
  alert(`OS #${numero} criada!`);
}

function excluirOrdem(numero) {
  const o = ordens.find((x) => x.numero === numero);
  if (!o) return;

  if (statusDe(o) === "finalizada") {
    alert("Esta ordem já foi finalizada e não pode ser excluída");
    return;
  }

  if (!confirm("Excluir esta ordem de serviço?")) return;

  ordens = ordens.filter((x) => x.numero !== numero);
  persistir("ordens", ordens);
  if (numeroEditando === numero) limparForm();
  atualizarTabela();
}

function atualizarTabela() {
  const clientes = recuperarRegistros("clientes") || [];
  const catalogo = recuperarRegistros("servicos") || [];
  let html = "";

  if (ordens.length === 0) {
    html = `<tr><td colspan="7" class="text-center text-secondary py-5">Nenhuma ordem de serviço</td></tr>`;
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
  <td>${formatarData(o.data)}</td>
  <td>${nomes}</td>
  <td>${badgeStatus(o)}</td>
  <td class="text-end">${formatarValor(somarServicos(o.servicos))}</td>
  <td class="text-end pe-4">
    <button class="btn btn-sm btn-outline-secondary" onclick="alterarOrdem(${o.numero})">Alterar</button>
    <button class="btn btn-sm btn-outline-danger" onclick="excluirOrdem(${o.numero})">Excluir</button>
  </td>
</tr>`;
    });
  }

  document.getElementById("tabela").innerHTML = html;
  document.getElementById("contador").textContent = ordens.length;
  document.getElementById("rodape").textContent =
    `${ordens.length} ordens de serviço`;
}
function alterarOrdem(numero) {
  const o = ordens.find((x) => x.numero === numero);
  if (!o) {
    alert("Ordem não encontrada");
    return;
  }

  if (statusDe(o) === "finalizada") {
    alert("Esta ordem já foi finalizada e não pode ser alterada");
    return;
  }

  document.getElementById("cliente").value = o.clienteId;
  document.getElementById("bicicleta").value = o.bicicleta;
  servicosOS = [...o.servicos];
  renderizarServicos();

  numeroEditando = numero;
  document.getElementById("btnSalvar").textContent = "Salvar alteração";
  document.getElementById("tituloForm").textContent = `Editar OS #${numero}`;
  document.getElementById("formOS").scrollIntoView({ behavior: "smooth" });
}
function limparForm() {
  document.getElementById("formOS").reset();
  servicosOS = [];
  numeroEditando = null;
  document.getElementById("btnSalvar").textContent = "Salvar ordem";
  document.getElementById("tituloForm").textContent = "Nova ordem de serviço";
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

  if (numeroEditando === null) {
    const numero = ordens.length
      ? Math.max(...ordens.map((o) => o.numero)) + 1
      : 1;
    ordens.push({
      numero,
      clienteId,
      bicicleta,
      data: hoje(),
      status: "pendente",
      servicos: [...servicosOS],
    });
    alert(`OS #${numero} criada!`);
  } else {
    const o = ordens.find((x) => x.numero === numeroEditando);
    o.clienteId = clienteId;
    o.bicicleta = bicicleta;
    o.servicos = [...servicosOS];
    alert(`OS #${numeroEditando} alterada!`);
  }

  persistir("ordens", ordens);
  limparForm();
  atualizarTabela();
}

carregarSelects();
renderizarServicos();
atualizarTabela();
