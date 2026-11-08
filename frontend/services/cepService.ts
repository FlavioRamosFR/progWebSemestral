export async function cepService(cep:string) {

    const cepFormat = cep.replace(/\D/g, "")
    
    if(cepFormat.length != 8){ throw new Error("CEP incompleto") }
    const res = await fetch(`viacep.com.br/ws/${cep}/json/`)
    
    if(!res.ok){ throw new Error("Erro ao Buscar CEP") }
    const data = await res.json()
    
    if(data.erro){ throw new Error("CEP não encontrado") }
    
    return data
}