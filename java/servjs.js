
function recuperarRegistros(chave){
const regs = localStorage.getItem(chave)
    if(regs){
        return JSON.parse(regs)
    }
    else{
        return null
    }
    }
function persistir(chave, valorJson){
localStorage.setItem(chave, JSON.stringify(valorJson));

}

let serv = recuperarRegistros("servicos")
if(!serv){

    serv = [
        {"id": 1 , "nomeServico": "Regulagem de freio", "valor": 25.00 },
        {"id": 2 , "nomeServico": "Regulagem de cambio", "valor": 25.00},
        {"id": 3 , "nomeServico": "Desempenar roda", "valor": 30.00}
    ];
    persistir("servicos", serv)
}
const nomeServico = document.getElementById("nomeServico");
const valor = document.getElementById("valor");

function listarServicos(){
    let retorno=" ";
    serv.forEach(s=>{
        retorno +=  `<tr>
                <th>${s.nomeServico}</th>
                <th>${s.valor}</th>

                <td><button class="btn bg-danger text-white" onclick="excluirserv(${s.id})">Excluir Serviço</button></td>
                <td><button class="btn bg-danger text-white" onclick="buscarServForm(${s.id})">Alterar Serviço</button></td>

            </tr>`
    }) 
    return retorno;
}

function adicionarServ(nome, valor){
    //pega o ultimo id disponível e adiciona um para o novo serviço
    let novoid = serv[serv.length-1].id+1
    const novo = {id:novoid, nomeServico:nome, valor:valor}
    serv.push(novo)
    persistir("servicos", serv)
    console.log("Adicionado com exito")

}

function buscarServ(id){
    const servico = serv.find(s=>s.id===id)
    if(servico){  return servico }
    else{ return null }
}

function excluirserv(id){
    const indice = serv.findIndex(s=>s.id===id)
    if(indice!==-1){ serv.splice(indice,1)
        document.getElementById("tabela").innerHTML = listarServicos()
        persistir("servicos", serv)
        return true 
    }
    else{ return false } 
}


function buscarServForm(id){
    const servico = buscarServ(id)
    if(!servico){
        alert("Serviço não encontrado")
        return
    }
    document.getElementById("nomeServico").value = servico.nomeServico
    document.getElementById("valor").value = servico.valor
    idEditando = null
    document.getElementById("btnSalvar").textContent = "Salvar alteração"
}

function salvarServ(){
    const nome = document.getElementById("nomeServico").value
    const valor = Number(document.getElementById("valor").value)

    if(idEditando === null){
        adicionarServ(nome, valor)
        alert("Serviço adicionado!")
    } else {
        const servico = buscarServ(idEditando)
        servico.nomeServico = nome
        servico.valor = valor
        persistir("servicos", serv)
        idEditando = null
        document.getElementById("btnSalvar").textContent = "Adicionar"
        alert("Serviço alterado!")
    }
    document.getElementById("tabela").innerHTML = listarServicos()
    document.querySelector("form").reset()
}