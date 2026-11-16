//persistência de dados no localStorage
let cli = recuperarRegistros("clientes");
if (!cli) {
  cli = [
    {
      id: 1,
      nome: "Rodrigo",
      telefone: "123456798",
      servicos: [
        { servicoId: 1, bicicleta: "16 houston rosa" },
        { servicoId: 2, bicicleta: "16 houston rosa" },
        { servicoId: 3, bicicleta: "20 uruguaia rosa" },
      ],
    },
    {
      id: 2,
      nome: "Bruna",
      telefone: "123456799",
      servicos: [{ servicoId: 1, bicicleta: "29 oggi rosa" }],
    },
    {
      id: 3,
      nome: "Heloisa",
      telefone: "123456797",
      servicos: [
        { servicoId: 2, bicicleta: "20 uruguaia rosa" },
        { servicoId: 3, bicicleta: "20 uruguaia rosa" },
      ],
    },
  ];
  persistir("clientes", cli);
}

/* ---------- lista ---------- */

//termo de busca atual (para filtrar a lista)
let termoBusca = "";

//função para filtrar os clientes pelo nome, usando o termo de busca
function filtrarClientes(valor) {
  termoBusca = valor;
  atualizarTabela();
}

//retorna a lista de clientes filtrada pelo termo de busca
function clientesFiltrados() {
  const termo = termoBusca.trim().toLowerCase();
  if (!termo) return cli;
  return cli.filter((c) => c.nome.toLowerCase().includes(termo));
}

//desenha a tabela de clientes na tela
function listarClientes() {
  const lista = clientesFiltrados();

  if (cli.length === 0) { 
    return `<tr><td colspan="4" class="text-center text-secondary py-5">Nenhum cliente cadastrado</td></tr>`;
  } // nenhum cliente cadastrado
  let retorno = "";
  lista.forEach((c) => {
    retorno += `<tr>
      <td class="ps-4">${c.id}</td>
      <td>${c.nome}</td>
      <td>${c.telefone}</td>
      <td class="text-end pe-4">
        <button class="btn btn-sm btn-outline-primary" onclick="mostrarServicos(${c.id})">Serviços</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="buscarClienteForm(${c.id})">Alterar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="excluirCliente(${c.id})">Excluir</button>
      </td>
    </tr>`;
  });
  return retorno;
}

//atualiza a tabela de clientes na tela
function atualizarTabela() {
  const lista = clientesFiltrados();

  document.getElementById("tabela").innerHTML = listarClientes();
  document.getElementById("contador").textContent = cli.length;
  document.getElementById("rodape").textContent = termoBusca.trim()
    ? `${lista.length} de ${cli.length} clientes`
    : `${cli.length} clientes`;
}

/* ---------- CRUD ---------- */
//saber qual cliente está sendo editado (null = nenhum)
let idEditando = null;

//busca um cliente pelo id
function buscarCliente(id) {
  return cli.find((c) => c.id === id) || null;
}

//adiciona um novo cliente na lista e persiste no localStorage
function adicionarCliente(nome, telefone) {
  const novoid = cli.length ? Math.max(...cli.map((c) => c.id)) + 1 : 1;
  cli.push({ id: novoid, nome, telefone, servicos: [] });
  persistir("clientes", cli);
}

//exclui um cliente da lista e persiste no localStorage
function excluirCliente(id) {
  if (!confirm("Excluir este cliente?")) return;
  const indice = cli.findIndex((c) => c.id === id);
  if (indice === -1) return;
  cli.splice(indice, 1);
  persistir("clientes", cli);
  atualizarTabela();
}

//limpa o formulário de cadastro/edição de cliente
function limparForm() {
  document.getElementById("formCliente").reset();
  idEditando = null;
  document.getElementById("btnSalvar").textContent = "Adicionar";
  document.getElementById("tituloForm").textContent = "Adicionar cliente";
}

//preenche o formulário de edição de cliente com os dados do cliente selecionado
function buscarClienteForm(id) {
  const cliente = buscarCliente(id);
  if (!cliente) {
    alert("Cliente não encontrado");
    return;
  }
  document.getElementById("nome").value = cliente.nome;
  document.getElementById("telefone").value = cliente.telefone;
  idEditando = id;
  document.getElementById("btnSalvar").textContent = "Salvar alteração";
  document.getElementById("tituloForm").textContent = "Editar cliente";
}
//salva um novo cliente ou altera um cliente existente, dependendo do estado do idEditando
function salvarCliente(event) {
  event.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();

  if (!nome || !telefone || isNaN(Number(telefone))) {
    alert("Preencha o nome e o telefone corretamente");
    return;
  }

  if (idEditando === null) {
    adicionarCliente(nome, telefone);
    alert("Cliente adicionado!");
  } else {
    const cliente = buscarCliente(idEditando);
    cliente.nome = nome;
    cliente.telefone = telefone;
    persistir("clientes", cli);
    alert("Cliente alterado!");
  }
  limparForm();
  atualizarTabela();
}

/* ---------- modal de serviços ---------- */

// variáveis para controlar o modal de serviços
let clienteModal = null;
let gruposModal = [];

// junta os serviços antigos (cliente.servicos) com as OS novas ("ordens")
function historicoDoCliente(id) {
  const cliente = buscarCliente(id);
  const ordens = recuperarRegistros("ordens") || [];
  const itens = [];

  (cliente.servicos || []).forEach((i) =>
    itens.push({
      servicoId: i.servicoId,
      bicicleta: i.bicicleta,
      os: null,
      data: null,
    }),
  );

  ordens
    .filter((o) => o.clienteId === id)
    .forEach((o) =>
      o.servicos.forEach((servicoId) =>
        itens.push({
          servicoId,
          bicicleta: o.bicicleta,
          os: o.numero,
          data: o.data,
        }),
      ),
    );

  return itens;
}

// agrupa por bicicleta 
function agruparPorBicicleta(itens) {
  const mapa = new Map();
  itens.forEach((i) => {
    const chave = i.bicicleta.trim().toLowerCase();
    if (!mapa.has(chave))
      mapa.set(chave, { nome: i.bicicleta.trim(), itens: [] });
    mapa.get(chave).itens.push(i);
  });
  return [...mapa.values()];
}

// mostra o modal de serviços do cliente selecionado
function mostrarServicos(id) {
  const cliente = buscarCliente(id);
  if (!cliente) return;

  clienteModal = cliente;
  gruposModal = agruparPorBicicleta(historicoDoCliente(id));
  mostrarBicicletas();

  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("modalServicos"),
  ).show();
}

// lista de bicicletas
function mostrarBicicletas() {
  document.getElementById("tituloServicos").textContent =
    `Bicicletas de ${clienteModal.nome}`;

  let html = "";
  if (gruposModal.length === 0) {
    html = `<div class="text-center text-secondary py-4">Nenhuma bicicleta com serviço</div>`;
  } else {
    html = `<div class="list-group">`;
    gruposModal.forEach((g, i) => {
      html += `<button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                       onclick="mostrarDetalhesBicicleta(${i})">
        <span>${g.nome}</span>
        <span class="badge text-bg-secondary">${g.itens.length} serviço(s)</span>
      </button>`;
    });
    html += `</div>`;
  }
  document.getElementById("conteudoModal").innerHTML = html;
}

// mostra o que foi feito na bicicleta escolhida
function mostrarDetalhesBicicleta(indice) {
  const g = gruposModal[indice];
  const catalogo = recuperarRegistros("servicos") || [];
  let total = 0;

  document.getElementById("tituloServicos").textContent = g.nome;

  let linhas = "";
  g.itens.forEach((item) => {
    const s = catalogo.find((x) => x.id === item.servicoId);
    if (s) total += Number(s.valor);
    linhas += `<tr>
      <td>${s ? s.nome : "Serviço removido"}</td>
      <td>${item.os ? `OS #${item.os} — ${item.data}` : "-"}</td>
      <td class="text-end">${s ? formatarValor(s.valor) : "-"}</td>
    </tr>`;
  });

  document.getElementById("conteudoModal").innerHTML = `
    <button type="button" class="btn btn-sm btn-outline-secondary mb-3" onclick="mostrarBicicletas()">← Voltar</button>
    <table class="table mb-0">
      <thead>
        <tr><th>Serviço</th><th>Origem</th><th class="text-end">Valor</th></tr>
      </thead>
      <tbody>${linhas}</tbody>
      <tfoot>
        <tr class="fw-bold"><td colspan="2" class="text-end">Total</td><td class="text-end">${formatarValor(total)}</td></tr>
      </tfoot>
    </table>`;
}
atualizarTabela();
