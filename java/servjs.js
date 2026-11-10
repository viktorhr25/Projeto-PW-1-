let serv = recuperarRegistros("servicos");
if (!serv) {
  serv = [
    { id: 1, nome: "Regulagem de freio", valor: 25.0 },
    { id: 2, nome: "Regulagem de cambio", valor: 25.0 },
    { id: 3, nome: "Desempenar roda", valor: 30.0 },
  ];
  persistir("servicos", serv);
}

let idEditando = null;

function servicosFiltrados() {
  const termo = termoBusca.trim().toLowerCase(); // trim tira espaços do fim e diminui para minuscula
  if (!termo) return serv;
  return serv.filter(
    (s) =>
      s.nome.toLowerCase().includes(termo) ||
      codigoServico(s.id).toLowerCase().includes(termo),
  );
}

function listarServicos() {
  const lista = serv;

  if (lista.length === 0) {
    return `<tr><td colspan="3" class="text-center text-secondary py-5">Nenhum serviço encontrado</td></tr>`;
  }

  let retorno = "";
  lista.forEach((s) => {
    retorno += `<tr>
            <td class="ps-4">
                <div>${s.nome}</div>
                <div class="codigo">${s.id}</div>
            </td>
            <td class="valor">${formatarValor(s.valor)}</td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-secondary" onclick="buscarServForm(${s.id})">Alterar</button>
                <button class="btn btn-sm btn-outline-danger" onclick="excluirserv(${s.id})">Excluir</button>
            </td>
        </tr>`;
  });
  return retorno;
}
function atualizarTabela() {
  document.getElementById("tabela").innerHTML = listarServicos();
  document.getElementById("contador").textContent = serv.length;
  document.getElementById("rodape").textContent =
    `Mostrando ${serv.length} serviços`;
}

//botão limpar formulario
function limparForm() {
  document.getElementById("formServico").reset();
  idEditando = null;
  document.getElementById("btnSalvar").textContent = "Adicionar";
  document.getElementById("tituloForm").textContent = "Adicionar serviço";
}

function adicionarServ(nome, valor) {
  const novoid = serv.length ? Math.max(...serv.map((s) => s.id)) + 1 : 1;
  serv.push({ id: novoid, nome: nome, valor: valor });
  persistir("servicos", serv);
  console.log("Adicionado com exito");
}

function buscarServ(id) {
  const servico = serv.find((s) => s.id === id) || null;
  if (servico) {
    return servico;
  }
}

function excluirserv(id) {
  const indice = serv.findIndex((s) => s.id === id);
  if (indice !== -1) {
    serv.splice(indice, 1);
    atualizarTabela();
    persistir("servicos", serv);
    return true;
  } else {
    return false;
  }
}

function buscarServForm(id) {
  const servico = buscarServ(id);
  if (!servico) {
    alert("Serviço não encontrado");
    return;
  }
  document.getElementById("nome").value = servico.nome;
  document.getElementById("valor").value = servico.valor;
  idEditando = id;
  document.getElementById("btnSalvar").textContent = "Salvar alteração";
  document.getElementById("tituloForm").textContent = "Editar serviço";
}

function salvarServ(event) {
  event.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const valor = Number(document.getElementById("valor").value);

  if (!nome || isNaN(valor) || valor < 0) {
    alert("Preencha o nome e um valor válido");
    return;
  }
  if (idEditando === null) {
    adicionarServ(nome, valor);
    alert("Serviço adicionado!");
  } else {
    const servico = buscarServ(idEditando);
    servico.nome = nome;
    servico.valor = valor;
    persistir("servicos", serv);
    alert("Serviço alterado!");
  }
  limparForm();
  atualizarTabela();
}

atualizarTabela();
