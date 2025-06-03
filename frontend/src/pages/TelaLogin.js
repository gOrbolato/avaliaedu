import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import CampoEntrada from '../components/CampoEntrada';
import Botao from '../components/Botao';
import PopupNotificacao from '../components/PopupNotificacao';

const TelaLogin = ({ navigateTo }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erros, setErros] = useState({});
    const [notificacao, setNotificacao] = useState({ visivel: false, mensagem: '', tipo: '' });
    const [carregando, setCarregando] = useState(false);
    const { login } = useAuth();

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
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Acesse sua conta
                </h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        <CampoEntrada
                            id="email"
                            label="Endereço de e-mail"
                            tipo="email"
                            valor={email}
                            aoMudar={(e) => setEmail(e.target.value)}
                            placeholder="voce@exemplo.com"
                            erro={erros.email}
                        />
                        <CampoEntrada
                            id="senha"
                            label="Senha"
                            tipo="password"
                            valor={senha}
                            aoMudar={(e) => setSenha(e.target.value)}
                            placeholder="Sua senha"
                            erro={erros.senha}
                        />
                        <Botao tipo="submit" variante="primario" carregando={carregando} desabilitado={carregando} classeAdicional="w-full">
                            Entrar
                        </Botao>
                    </form>
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Ou</span>
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Não tem uma conta?{' '}
                                <button onClick={() => navigateTo('cadastro')} className="font-medium text-blue-600 hover:text-blue-500">
                                    Cadastre-se
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelaLogin;
