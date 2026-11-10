export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, "")
}

/* CPF: 000.000.000-00 CNPJ: 00.000.000/0000-00 */
export function maskCpfCnpj(value: string): string {
  const numbers = onlyNumbers(value).slice(0, 14)

  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  return numbers
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}



/* Telefone: (00) 0000-0000 e (00) 00000-0000 */
export function maskPhone(value: string): string {
  const numbers = onlyNumbers(value).slice(0, 11)

  if (numbers.length <= 2) {
    return numbers.replace(/^(\d{0,2})/, "($1")
  }

  if (numbers.length <= 10) {
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
  }

  return numbers
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
}

/* CEP: 00000-000 */
export function maskCep(value: string): string {
  return onlyNumbers(value)
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, "$1-$2")
}


/* Valor monetário: R$ 1.234,56 */
export function maskCurrency(value: string): string {
  const numbers = onlyNumbers(value)
  if (!numbers) return ""

  const cents = Number(numbers) / 100
  return cents.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

/**
 * SKU: letras maiúsculas e números.
 * Exemplo: CAMISA001
 */
export function maskSku(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 30)
}