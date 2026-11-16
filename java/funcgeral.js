function recuperarRegistros(chave) {
  const regs = localStorage.getItem(chave);
  if (regs) {
    return JSON.parse(regs);
  } else {
    return null;
  }
}

function persistir(chave, valorJson) {
  localStorage.setItem(chave, JSON.stringify(valorJson));
}

function formatarValor(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const STATUS = {
  pendente: { texto: "Pendente", classe: "text-bg-warning" },
  andamento: { texto: "Em andamento", classe: "text-bg-primary" },
  finalizada: { texto: "Finalizada", classe: "text-bg-success" },
};

// OS antigas, sem o campo status, contam como pendentes
function statusDe(o) {
  return o.status || "pendente";
}

function badgeStatus(o) {
  const s = STATUS[statusDe(o)];
  return `<span class="badge ${s.classe}">${s.texto}</span>`;
}

function hoje() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function paraISO(data) {
  if (!data) return "";
  if (data.includes("/")) {
    const [d, m, a] = data.split("/");
    return `${a}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return data;
}

function formatarData(data) {
  const iso = paraISO(data);
  if (!iso) return "-";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}
