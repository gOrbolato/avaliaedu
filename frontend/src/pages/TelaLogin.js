import React, { useState } from 'react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import styles from './TelaLogin.module.css'; // Importando estilos específicos para a tela de login

// Componente de Notificação
const PopupNotificacao = ({ visivel, mensagem, tipo, aoFechar }) => {
    if (!visivel) return null;
    const typeClasses = {
        sucesso: "bg-green-500",
        erro: "bg-red-500",
        aviso: "bg-yellow-500",
    };
    return (
        <div className={`popupNotificacao fixed top-5 right-5 p-4 rounded-lg shadow-2xl text-white text-sm font-semibold z-50 ${typeClasses[tipo] || 'bg-gray-800'}`}>
            <span>{mensagem}</span>
            <button onClick={aoFechar} className="ml-4 opacity-80 hover:opacity-100 font-bold">✕</button>
        </div>
    );
};

// Componente de Botão
const Botao = ({ tipo = "button", aoClicar, variante, classeAdicional, carregando, children }) => {
    const baseStyle = "font-bold rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed";
    const variants = {
        primario: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform",
        link: "bg-transparent text-blue-600 hover:text-blue-800 hover:underline",
    };
    return (
        <button
            type={tipo}
            onClick={aoClicar}
            disabled={carregando}
            className={`${baseStyle} ${variants[variante]} ${classeAdicional}`}
        >
            {carregando ? <LoaderCircle className="animate-spin" size={24} /> : children}
        </button>
    );
};

// Componente Principal da Tela de Login
function LoginScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erros, setErros] = useState({});
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [notificacao, setNotificacao] = useState({ visivel: false, mensagem: '', tipo: '' });

    const navigateTo = (path) => {
        setNotificacao({ visivel: true, mensagem: `A navegar para a página de ${path}...`, tipo: 'aviso' });
        setTimeout(() => setNotificacao({ visivel: false }), 2000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let newErrors = {};
        if (!email.trim()) newErrors.email = "O e-mail é obrigatório.";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Endereço de e-mail inválido.";
        if (!senha) newErrors.senha = "A senha é obrigatória.";
        setErros(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setCarregando(true);
            setTimeout(() => {
                setCarregando(false);
                setNotificacao({ visivel: true, mensagem: 'Login bem-sucedido!', tipo: 'sucesso' });
                setTimeout(() => setNotificacao({ visivel: false }), 3000);
            }, 2000);
        } else {
            setNotificacao({ visivel: true, mensagem: 'Por favor, corrija os erros.', tipo: 'erro' });
            setTimeout(() => setNotificacao({ visivel: false }), 3000);
        }
    };

    return (
        <div className={styles.loginBg + " min-h-screen flex flex-col items-center justify-center p-4 selection:bg-blue-200 font-sans"}>
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />

            <div className={styles.loginCard + " w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8 m-4"}>
                <div className="text-center mb-8">
                    <h2 className={styles.tituloDestaque + " text-3xl font-bold text-gray-800 transition-colors duration-300"}>
                        Bem-vindo de volta!
                    </h2>
                    <p className="text-gray-500 mt-2 text-base">
                        Acesse a sua conta para continuar.
                    </p>
                </div>
                <form className="w-full" onSubmit={handleSubmit} noValidate>
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                            Endereço de e-mail
                        </label>
                        <input
                            id="email" name="email" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu.email@exemplo.com" autoComplete="email"
                            className={
                                `w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm ${erros.email ? 'border-red-400 text-red-700 focus:ring-red-500/50' : ''}`
                            }
                        />
                        {erros.email && <p className="mt-1.5 text-xs text-red-600">{erros.email}</p>}
                    </div>
                    <div className="mb-6 relative">
                        <label htmlFor="senha" className="block text-sm font-semibold text-gray-700 mb-1">
                            Senha
                        </label>
                        <div className="relative flex items-center">
                            <input
                                id="senha" name="senha" type={mostrarSenha ? "text" : "password"} value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="••••••••" autoComplete="current-password"
                                className={
                                    `w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm ${erros.senha ? 'border-red-400 text-red-700 focus:ring-red-500/50' : ''}`
                                }
                            />
                            <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className={styles.senhaToggleBtn} tabIndex={-1} aria-label="Mostrar/ocultar senha">
                                {mostrarSenha ? <EyeOff size={22} /> : <Eye size={22} />}
                            </button>
                        </div>
                        {erros.senha && <p className="mt-1.5 text-xs text-red-600">{erros.senha}</p>}
                    </div>
                    <Botao tipo="submit" variante="primario" classeAdicional="w-full py-3 text-base mt-2 pulseBtn rounded-xl" carregando={carregando}>
                        Entrar
                    </Botao>
                </form>
            </div>
        </div>
    );
}

export default LoginScreen;