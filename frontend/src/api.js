// Arquivo central para chamadas à API do backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function loginAPI(email, senha) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    return response.json();
}

export async function cadastroAPI(dadosCadastro) {
    const response = await fetch(`${API_URL}/api/auth/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosCadastro)
    });
    return response.json();
}

// Exemplo de endpoint para verificação de e-mail (ajuste conforme backend)
export async function verificarTokenEmailAPI(token) {
    const response = await fetch(`${API_URL}/api/auth/verificar-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    return response.json();
}
