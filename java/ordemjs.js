
function buscarCliente(id) {
  return cli.find((c) => c.id === id) || null;
}

function buscarServ(id) {
  return serv.find((s) => s.id === id) || null;
}


function preencherClientes() {
  let html = `<option value="">Selecione...</option>`;
  cli.forEach((c) => {
    html += `<option value="${c.id}">${c.nome}</option>`;
  });
  document.getElementById("cliente").innerHTML = html;
}

function preencherServicos() {
  if (serv.length === 0) {
    document.getElementById("listaServicos").innerHTML =
      `<div class="text-secondary small">Cadastre serviços primeiro</div>`;
    return;
  }
  let html = "";
  serv.forEach((s) => {
    html += `<div class="form-check d-flex justify-content-between">
      <div>
        <input class="form-check-input" type="checkbox" value="${s.id}"
               id="serv${s.id}" onchange="calcularTotal()">
        <label class="form-check-label" for="serv${s.id}">${s.nome}</label>
      </div>
      <span class="text-secondary">${formatarValor(s.valor)}</span>
    </div>`;
  });
  document.getElementById("listaServicos").innerHTML = html;
}

function idsSelecionados() {
  const marcados = document.querySelectorAll("#listaServicos input:checked");
  return [...marcados].map((input) => Number(input.value));
}

function calcularTotal() {
  const total = idsSelecionados().reduce(
    (soma, id) => soma + Number(buscarServ(id).valor),
    0,
  );
  document.getElementById("total").textContent = formatarValor(total);
}

function limparForm() {
  document.getElementById("formOS").reset();
  calcularTotal();
}


function listarOS() {
  let retorno = "";
  let quantidade = 0;
  let soma = 0;

  cli.forEach((c) => {
    (c.servicos || []).forEach((item, indice) => {
      const s = buscarServ(item.servicoId);
      quantidade++;
      if (s) soma += Number(s.valor);

      retorno += `<tr>
        <td class="ps-4">${c.nome}</td>
        <td>${item.bicicleta}</td>
        <td>${s ? s.nome : "Serviço removido"}</td>
        <td class="text-end">${s ? formatarValor(s.valor) : "-"}</td>
        <td class="text-end pe-4">
          <button class="btn btn-sm btn-outline-danger"
                  onclick="excluirOS(${c.id}, ${indice})">Excluir</button>
        </td>
      </tr>`;
    });
  });

  if (quantidade === 0) {
    retorno = `<tr><td colspan="5" class="text-center text-secondary py-5">Nenhuma ordem de serviço</td></tr>`;
  }
  return { html: retorno, quantidade, soma };
}

function atualizarTabela() {
  const os = listarOS();
  document.getElementById("tabela").innerHTML = os.html;
  document.getElementById("contador").textContent = os.quantidade;
  document.getElementById("rodape").textContent =
    `${os.quantidade} serviços — total ${formatarValor(os.soma)}`;
}


function adicionarOS(clienteId, bicicleta, idsServicos) {
  const cliente = buscarCliente(clienteId);
  if (!cliente.servicos) cliente.servicos = [];

  idsServicos.forEach((id) => {
    cliente.servicos.push({ servicoId: id, bicicleta: bicicleta });
  });
  persistir("clientes", cli);
}

function excluirOS(clienteId, indice) {
  if (!confirm("Excluir este serviço da ordem?")) return;
  const cliente = buscarCliente(clienteId);
  cliente.servicos.splice(indice, 1);
  persistir("clientes", cli);
  atualizarTabela();
}

function salvarOS(event) {
  event.preventDefault();
  const clienteId = Number(document.getElementById("cliente").value);
  const bicicleta = document.getElementById("bicicleta").value.trim();
  const ids = idsSelecionados();

  if (!clienteId || !bicicleta || ids.length === 0) {
    alert("Escolha o cliente, informe a bicicleta e marque ao menos um serviço");
    return;
  }

  adicionarOS(clienteId, bicicleta, ids);
  alert("Ordem de serviço salva!");
  limparForm();
  atualizarTabela();
}

preencherClientes();
preencherServicos();
atualizarTabela();