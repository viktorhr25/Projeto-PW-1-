let ordens = recuperarRegistros("ordens") || [];
let filtro = "abertas"; // abertas = pendentes + em andamento
let osAberta = null;

const FILTROS = {
  abertas: { texto: "Abertas", regra: (o) => statusDe(o) !== "finalizada" },
  pendente: { texto: "Pendentes", regra: (o) => statusDe(o) === "pendente" },
  andamento: {
    texto: "Em andamento",
    regra: (o) => statusDe(o) === "andamento",
  },
  finalizada: {
    texto: "Finalizadas",
    regra: (o) => statusDe(o) === "finalizada",
  },
  todas: { texto: "Todas", regra: () => true },
};

function nomeCliente(id) {
  const clientes = recuperarRegistros("clientes") || [];
  const c = clientes.find((x) => x.id === id);
  return c ? c.nome : "Cliente removido";
}

function somarServicos(ids) {
  const catalogo = recuperarRegistros("servicos") || [];
  return ids.reduce((soma, id) => {
    const s = catalogo.find((x) => x.id === id);
    return soma + (s ? Number(s.valor) : 0);
  }, 0);
}

function buscarOS(numero) {
  return ordens.find((o) => o.numero === numero) || null;
}

/* ---------- abas e tabela ---------- */

function desenharAbas() {
  document.getElementById("abas").innerHTML = Object.entries(FILTROS)
    .map(([chave, f]) => {
      const qtd = ordens.filter(f.regra).length;
      return `<li class="nav-item">
        <button class="nav-link py-1 ${chave === filtro ? "active" : ""}" onclick="trocarFiltro('${chave}')">
          ${f.texto} <span class="badge text-bg-light text-dark">${qtd}</span>
        </button>
      </li>`;
    })
    .join("");
}

function trocarFiltro(chave) {
  filtro = chave;
  atualizarTabela();
}

function atualizarTabela() {
  const lista = ordens.filter(FILTROS[filtro].regra);

  const antigasPrimeiro = ["abertas", "pendente", "andamento"].includes(filtro);
  lista.sort((a, b) => {
    const cmp =
      paraISO(a.data).localeCompare(paraISO(b.data)) || a.numero - b.numero;
    return antigasPrimeiro ? cmp : -cmp;
  });

  let html = "";
  if (lista.length === 0) {
    html = `<tr><td colspan="6" class="text-center text-secondary py-5">Nenhuma ordem de serviço</td></tr>`;
  } else {
    lista.forEach((o) => {
      html += `<tr class="${o.numero === osAberta ? "table-active" : ""}" style="cursor:pointer"
                   onclick="verOS(${o.numero})">
        <td class="ps-4">#${o.numero}</td>
        <td>${formatarData(o.data)}</td>
        <td>${nomeCliente(o.clienteId)}</td>
        <td>${o.bicicleta}</td>
        <td>${badgeStatus(o)}</td>
        <td class="text-end pe-4">${formatarValor(somarServicos(o.servicos))}</td>
      </tr>`;
    });
  }

  document.getElementById("tabela").innerHTML = html;
  document.getElementById("rodape").textContent =
    `${lista.length} ordens listadas`;
  desenharAbas();
}

/* ---------- fluxo de status ---------- */

// clicar na OS: se estava pendente, passa para em andamento
function verOS(numero) {
  const o = buscarOS(numero);
  if (!o) return;

  if (statusDe(o) === "pendente") {
    o.status = "andamento";
    o.iniciadaEm = hoje();
    persistir("ordens", ordens);
  }

  osAberta = numero;
  atualizarTabela();
  desenharDetalhes();
}

function finalizarOS(numero) {
  const o = buscarOS(numero);
  if (!o || !confirm("Marcar esta ordem como finalizada?")) return;
  o.status = "finalizada";
  o.finalizadaEm = hoje();
  persistir("ordens", ordens);
  atualizarTabela();
  desenharDetalhes();
}

function reabrirOS(numero) {
  const o = buscarOS(numero);
  if (!o) return;
  o.status = "andamento";
  delete o.finalizadaEm;
  persistir("ordens", ordens);
  atualizarTabela();
  desenharDetalhes();
}

/* ---------- painel de detalhes ---------- */

function desenharDetalhes() {
  const o = buscarOS(osAberta);
  const painel = document.getElementById("detalhes");
  if (!o) {
    document.getElementById("tituloDetalhes").textContent = "Detalhes da OS";
    painel.className = "text-secondary small";
    painel.textContent = "Clique em uma ordem para iniciar o atendimento.";
    return;
  }

  const catalogo = recuperarRegistros("servicos") || [];
  const itens = o.servicos
    .map((id) => {
      const s = catalogo.find((x) => x.id === id);
      return `<li class="list-group-item d-flex justify-content-between">
        <span>${s ? s.nome : "Serviço removido"}</span>
        <span>${s ? formatarValor(s.valor) : "-"}</span>
      </li>`;
    })
    .join("");

  let acao = "";
  if (statusDe(o) === "andamento") {
    acao = `<button class="btn btn-verde w-100 py-2" onclick="finalizarOS(${o.numero})">Finalizar serviço</button>`;
  } else if (statusDe(o) === "finalizada") {
    acao = `<button class="btn btn-outline-secondary w-100" onclick="reabrirOS(${o.numero})">Reabrir</button>`;
  }

  document.getElementById("tituloDetalhes").textContent = `OS #${o.numero}`;
  painel.className = "";
  painel.innerHTML = `
    <p class="mb-1">${badgeStatus(o)}</p>
    <p class="mb-1"><strong>Cliente:</strong> ${nomeCliente(o.clienteId)}</p>
    <p class="mb-1"><strong>Bicicleta:</strong> ${o.bicicleta}</p>
    <p class="mb-1"><strong>Data:</strong> ${formatarData(o.data)}</p>
    ${o.iniciadaEm ? `<p class="mb-1"><strong>Iniciada em:</strong> ${formatarData(o.iniciadaEm)}</p>` : ""}
    ${o.finalizadaEm ? `<p class="mb-1"><strong>Finalizada em:</strong> ${formatarData(o.finalizadaEm)}</p>` : ""}
    <ul class="list-group my-3">${itens}</ul>
    <div class="d-flex justify-content-between fw-bold mb-3">
      <span>Total</span><span>${formatarValor(somarServicos(o.servicos))}</span>
    </div>
    ${acao}`;
}

atualizarTabela();

// vindo da Home (ordem.html?os=3)
const osUrl = Number(new URLSearchParams(location.search).get("os"));
if (osUrl) verOS(osUrl);
