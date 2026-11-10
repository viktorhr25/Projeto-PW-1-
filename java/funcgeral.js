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

