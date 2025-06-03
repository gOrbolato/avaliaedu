// frontend-react/src/AuthContext.js
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

const AuthContext = createContext(null);
const API_BASE_URL = 'http://localhost:3001/api'; // URL base do seu backend Node.js

export const AuthProvider = ({ children, navigateTo }) => {
    const [usuario, setUsuario] = useState(null);
    const [token, setTokenState] = useState(localStorage.getItem('appTCCAuthToken'));
    const [carregandoAuth, setCarregandoAuth] = useState(true);

    const setToken = (newToken) => {
        setTokenState(newToken);
        if (newToken) {
            localStorage.setItem('appTCCAuthToken', newToken);
        } else {
            localStorage.removeItem('appTCCAuthToken');
        }
    };

    useEffect(() => {
        const usuarioArmazenado = localStorage.getItem('appTCCUsuario');
        if (token && usuarioArmazenado) {
            setUsuario(JSON.parse(usuarioArmazenado));
            // Poderia adicionar uma chamada para validar o token com o backend aqui
        }
        setCarregandoAuth(false);
    }, [token]);

    const login = async (email, senha) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });
            const data = await response.json();

            if (response.ok && data.success) {
                setUsuario(data.user);
                setToken(data.token); // Assumindo que o backend Node.js envia um JWT
                localStorage.setItem('appTCCUsuario', JSON.stringify(data.user));
                navigateTo('home');
                return { success: true };
            } else {
                 // Simulação para manter a lógica de confirmação de email do frontend
                if (email === "novo@cadastro.com" && data.message && data.message.toLowerCase().includes("confirme seu e-mail")) {
                     return { success: false, message: data.message || "Erro no login.", needsEmailConfirmation: true, emailParaConfirmacao: email };
                }
                return { success: false, message: data.message || "E-mail ou senha inválidos." };
            }
        } catch (error) {
            console.error("Erro no login:", error);
            return { success: false, message: "Erro de conexão ao tentar fazer login." };
        }
    };

    const cadastro = async (dadosCadastro) => {
        try {
            // Mapeie os campos do formData para o que o backend Node.js espera
            const payload = {
                nome: dadosCadastro.nome,
                idade: parseInt(dadosCadastro.idade), // Converter para número se necessário
                rg: dadosCadastro.rg,
                telefone: dadosCadastro.telefone,
                email: dadosCadastro.email,
                instituicaoNome: dadosCadastro.instituicao, // O backend pode precisar criar/buscar a instituição
                cursoNome: dadosCadastro.curso,             // O backend pode precisar criar/buscar o curso
                cidadeInstituicao: dadosCadastro.cidade,
                estadoInstituicao: dadosCadastro.estado,
                periodoCurso: dadosCadastro.periodo,
                senha: dadosCadastro.senha,
                // RA pode ser gerado no backend ou se for um campo do formulário
                // pk_Ra: dadosCadastro.ra, // Exemplo se RA vier do form
            };

            const response = await fetch(`${API_BASE_URL}/auth/cadastro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, message: data.message, emailParaConfirmacao: dadosCadastro.email };
            } else {
                return { success: false, message: data.message || "Erro ao realizar cadastro." };
            }
        } catch (error) {
            console.error("Erro no cadastro:", error);
            return { success: false, message: "Erro de conexão ao tentar cadastrar." };
        }
    };

    const logout = () => {
        setUsuario(null);
        setToken(null);
        localStorage.removeItem('appTCCUsuario');
        // Opcional: Chamar um endpoint /api/auth/logout no backend se precisar invalidar o token no servidor
        navigateTo('login');
    };

    const verificarTokenEmail = async (verificationToken) => {
        try {
            // No seu exemplo original, isso era simulado.
            // Com um backend Node.js, você faria uma chamada real:
            // const response = await fetch(`${API_BASE_URL}/auth/verificar-email/${verificationToken}`);
            // const data = await response.json();
            // return data; // Ex: { success: true, message: "E-mail verificado!" }

            // Mantendo a simulação por enquanto, já que o backend não tem essa rota no exemplo
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (verificationToken === "token_valido_simulado") {
                 return { success: true, message: "E-mail verificado com sucesso! Você já pode fazer login." };
            }
            return { success: false, message: "Link de verificação inválido ou expirado (simulado)." };

        } catch (error) {
            console.error("Erro ao verificar token de e-mail:", error);
            return { success: false, message: "Erro de conexão ao verificar e-mail." };
        }
    };

    return (
        <AuthContext.Provider value={{ usuario, autenticado: !!usuario, token, login, logout, cadastro, verificarTokenEmail, carregandoAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);