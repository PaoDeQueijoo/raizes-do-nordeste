const CAMPOS_SENSIVEIS = ['cpf', 'senha', 'email', 'token', 'cartao', 'password', 'authorization']

export function sanitizeForLog(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLog(item))
  }

  const sanitizado: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (CAMPOS_SENSIVEIS.includes(key.toLowerCase())) {
      sanitizado[key] = '***'
    } else if (typeof value === 'object' && value !== null) {
      sanitizado[key] = sanitizeForLog(value)
    } else {
      sanitizado[key] = value
    }
  }
  return sanitizado
}

export function mascararCPF(cpf: string): string {
  if (!cpf || cpf.length !== 11) return '***'
  return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`
}

export function mascararEmail(email: string): string {
  if (!email || !email.includes('@')) return '***'
  const [usuario, dominio] = email.split('@')
  if (usuario.length <= 1) return `*@${dominio}`
  return `${usuario[0]}***@${dominio}`
}

export function sanitizarBody(body: any): any {
  return sanitizeForLog(body)
}