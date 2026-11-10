let cli = recuperarRegistros("clientes");
if (!cli) {
  cli = [
    {
      id: 1, nome: "Rodrigo", telefone: "123456798",
      servicos: [
        { servicoId: 1, bicicleta: "16 houston rosa" },
        { servicoId: 2, bicicleta: "16 houston rosa" },
        { servicoId: 3, bicicleta: "20 uruguaia rosa" },
      ],
    },
    {
      id: 2, nome: "Bruna", telefone: "123456799",
      servicos: [{ servicoId: 1, bicicleta: "29 oggi rosa" }],
    },
    {
      id: 3, nome: "Heloisa", telefone: "123456797",
      servicos: [
        { servicoId: 2, bicicleta: "20 uruguaia rosa" },
        { servicoId: 3, bicicleta: "20 uruguaia rosa" },
      ],
    },
  ];
  persistir("clientes", cli);
}

let idEditando = null;


/* ---------- lista ---------- */

function listarClientes() {
  if (cli.length === 0) {
    return `<tr><td colspan="4" class="text-center text-secondary py-5">Nenhum cliente cadastrado</td></tr>`;
  }
  let retorno = "";
  cli.forEach((c) => {
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

function atualizarTabela() {
  document.getElementById("tabela").innerHTML = listarClientes();
  document.getElementById("contador").textContent = cli.length;
  document.getElementById("rodape").textContent = `${cli.length} clientes`;
}

/* ---------- CRUD ---------- */

function buscarCliente(id) {
  return cli.find((c) => c.id === id) || null;
}

function adicionarCliente(nome, telefone) {
  const novoid = cli.length ? Math.max(...cli.map((c) => c.id)) + 1 : 1;
  cli.push({ id: novoid, nome, telefone, servicos: [] });
  persistir("clientes", cli);
}

function excluirCliente(id) {
  if (!confirm("Excluir este cliente?")) return;
  const indice = cli.findIndex((c) => c.id === id);
  if (indice === -1) return;
  cli.splice(indice, 1);
  persistir("clientes", cli);
  atualizarTabela();
}

function limparForm() {
  document.getElementById("formCliente").reset();
  idEditando = null;
  document.getElementById("btnSalvar").textContent = "Adicionar";
  document.getElementById("tituloForm").textContent = "Adicionar cliente";
}

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

function salvarCliente(event) {
  event.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();

  if (!nome || !telefone) {
    alert("Preencha o nome e o telefone");
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

function mostrarServicos(id) {
  const cliente = buscarCliente(id);
  if (!cliente) return;

  // nomes e valores vêm da lista de serviços cadastrada na outra página
  const catalogo = recuperarRegistros("servicos") || [];
  const feitos = cliente.servicos || [];

  document.getElementById("tituloServicos").textContent = `Serviços de ${cliente.nome}`;

  let html = "";
  if (feitos.length === 0) {
    html = `<tr><td colspan="3" class="text-center text-secondary py-4">Nenhum serviço realizado</td></tr>`;
  } else {
    feitos.forEach((item) => {
      const s = catalogo.find((x) => x.id === item.servicoId);
      html += `<tr>
        <td>${s ? s.nome : "Serviço removido"}</td>
        <td>${item.bicicleta}</td>
        <td class="text-end">${s ? formatarValor(s.valor) : "-"}</td>
      </tr>`;
    });
  }
  document.getElementById("tabelaServicos").innerHTML = html;

  bootstrap.Modal.getOrCreateInstance(document.getElementById("modalServicos")).show();
}

atualizarTabela();