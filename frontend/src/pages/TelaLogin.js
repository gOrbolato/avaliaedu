import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import CampoEntrada from '../components/CampoEntrada';
import Botao from '../components/Botao';
import PopupNotificacao from '../components/PopupNotificacao';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './TelaLogin.module.css';

const TelaLogin = ({ navigateTo }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erros, setErros] = useState({});
    const [notificacao, setNotificacao] = useState({ visivel: false, mensagem: '', tipo: '' });
    const [carregando, setCarregando] = useState(false);
    const { login } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    useEffect(() => {
        // Ativa a animação de entrada
        setIsVisible(true);
    }, []);

    const mostrarNotificacao = (mensagem, tipo = 'info', duracao = 4000) => {
        setNotificacao({ visivel: true, mensagem, tipo });
        setTimeout(() => setNotificacao({ visivel: false, mensagem: '', tipo: '' }), duracao);
    };

    const validar = () => {
        const novosErros = {};
        if (!email) novosErros.email = "E-mail é obrigatório.";
        else if (!/\S+@\S+\.\S+/.test(email)) novosErros.email = "E-mail inválido.";
        if (!senha) novosErros.senha = "Senha é obrigatória.";
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;
        setCarregando(true);
        const resultado = await login(email, senha);
        setCarregando(false);
        if (!resultado.success) {
            mostrarNotificacao(resultado.message, 'erro');
            if (resultado.needsEmailConfirmation) {
                setTimeout(() => navigateTo('aguardando-confirmacao', { email: resultado.emailParaConfirmacao }), 2000);
            }
        }
    };

    return (
        <div className={styles.loginBg + " min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"}>
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />
            <div className={`sm:mx-auto sm:w-full sm:max-w-md transition-all duration-700 ease-out ${isVisible ? styles.fadeIn : styles.fadeOut}`}>
                <div className="text-center mb-8">
                    <img className="mx-auto h-16 w-16 rounded-full shadow-lg border-4 border-blue-500 bg-white animate-bounce" src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Avatar Moderno" />
                    <h2 className={styles.tituloDestaque + " mt-4 text-4xl font-extrabold text-blue-600 drop-shadow-lg"}>
                        Avalia<span className="text-orange-500">Edu</span>
                    </h2>
                    <p className="mt-2 text-base text-gray-700 font-medium animate-fadeIn">
                        Bem-vindo de volta! Acesse sua conta para continuar.
                    </p>
                </div>
                <div className={styles.loginCard + " bg-white py-10 px-8 shadow-2xl rounded-2xl sm:px-10 border-t-8 border-blue-500 animate-fadeInUp"}>
                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        <CampoEntrada
                            id="email"
                            label="Endereço de e-mail"
                            tipo="email"
                            valor={email}
                            aoMudar={(e) => setEmail(e.target.value)}
                            placeholder="seu.email@exemplo.com"
                            erro={erros.email}
                            autoComplete="email"
                        />
                        <div className="relative">
                            <CampoEntrada
                                id="senha"
                                label="Senha"
                                tipo={mostrarSenha ? "text" : "password"}
                                valor={senha}
                                aoMudar={(e) => setSenha(e.target.value)}
                                placeholder="Sua senha"
                                erro={erros.senha}
                                autoComplete="current-password"
                            />
                            <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                                className="absolute right-3 top-9 text-gray-400 hover:text-blue-600 transition-colors" tabIndex={-1} aria-label="Mostrar/ocultar senha">
                                {mostrarSenha ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                        <Botao tipo="submit" variante="primario" classeAdicional={styles.pulseBtn + " w-full py-3 text-base"} carregando={carregando}>
                            Entrar
                        </Botao>
                    </form>
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-500">
                                    Ou
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Não tem uma conta?{' '}
                                <Botao aoClicar={() => navigateTo('cadastro')} variante="link" classeAdicional="font-medium text-blue-600 hover:underline">
                                    Cadastre-se agora
                                </Botao>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelaLogin;