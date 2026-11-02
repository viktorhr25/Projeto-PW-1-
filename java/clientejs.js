
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

let cli = recuperarRegistros("clientes")
if(!cli){

    cli = [
        {"id": 1, "nome": "Rodrigo", "telefone":" 123456798", "bicicleta": "16 houston rosa", "servicos":[1,2,3]},
        {"id": 2, "nome": "Bruna", "telefone":" 123456799", "bicicleta": " 29 oggi rosa", "servico":[1]},
        {"id": 3, "nome": "heloisa", "telefone":" 123456797", "bicileta": "20 uruguaia rosa", "servico":[2,3]}
    ];
    persistir("clientes", cli)
}
const nome = document.getElementById("nome");
const telefone = document.getElementById("telefone");
const bicicleta = document.getElementById("bicicleta");

function listarCliente(){
    let retorno=" ";
    cli.forEach(c=>{
        retorno +=  `<tr>
                <th>${c.nome}</th>
                <th>${c.telefone}</th>
                <th>${c.bicicleta}</th>

                <td><button class="btn bg-danger text-white" onclick="excluirserv(${c.id})">Excluir Cliente</button></td>
                <td><button class="btn bg-danger text-white" onclick="buscarServForm(${c.id})">Alterar Cadastro</button></td>

            </tr>`
    }) 
    return retorno;
}

function adicionarCliente(nome, telefone, bicicleta){
    //pega o ultimo id disponível e adiciona um para o novo cliente
    let novoid = cli[cli.length-1].id+1
    const novo = {id:novoid, nome:nome, telefone:telefone, bicicleta:bicicleta}
    cli.push(novo)
    persistir("clientes", cli)
    console.log("Adicionado com exito")

}

function buscarCliente(id){
    const cliente = cli.find(c=>c.id===id)
    if(cliente)
        { return cliente }
    else
        { return null }
}

function excluirCliente(id){
    const indice = cli.findIndex(c=>c.id===id)
    if(indice!==-1){ cli.splice(indice,1)
        document.getElementById("tabela").innerHTML = listarCliente()
        persistir("clientes", cli)
        return true 
    }
    else{ return false } 
}


function buscarCliente(id){
    const cliente = buscarCliente(id)
    if(!cliente){
        alert("Cliente não encontrado")
        return
    }
    document.getElementById("nome").value = cliente.nome
    document.getElementById("telefone").value = cliente.telefone
    document.getElementById("bicicleta").value = cliente.bicicleta
    document.getElementById("valor").value = servico.valor
    idEditando = null
    document.getElementById("btnSalvar").textContent = "Salvar alteração"
}

function salvarCliente(){
    const nome = document.getElementById("nome").value
    const telefone = document.getElementById("telefone").value
    const bicicleta = document.getElementById("bicicleta").value

    if(idEditando === null){
        adicionarCliente(nome, telefone, bicicleta)
        alert("Cliente adicionado!")
    } else {
        const cliente = buscarCliente(idEditando)
        cliente.nome = nome
        cliente.telefone = telefone
        cliente.bicicleta = bicicleta
        persistir("clientes", cli)
        idEditando = null
        document.getElementById("btnSalvar").textContent = "Adicionar"
        alert("Cliente alterado!")
    }
    document.getElementById("tabela").innerHTML = listarCliente()
    document.querySelector("form").reset()
}