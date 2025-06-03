import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import Botao from '../components/Botao';

const TelaVerificacaoEmail = ({ navigateTo, pageData }) => {
    const token = pageData?.token;
    const { verificarTokenEmail } = useAuth();
    const [mensagem, setMensagem] = useState('Verificando seu e-mail...');
    const [status, setStatus] = useState('processando');

    useEffect(() => {
        const executarVerificacao = async () => {
            if (!token) {
                setMensagem('Token de verificação inválido ou ausente.');
                setStatus('erro');
                return;
            }
            const resultado = await verificarTokenEmail(token);
            setMensagem(resultado.message);
            setStatus(resultado.success ? 'sucesso' : 'erro');
            if (resultado.success) {
                setTimeout(() => navigateTo('login'), 4000);
            }
        };
        executarVerificacao();
    }, [token, verificarTokenEmail, navigateTo]);

    let statusIconColor = "text-blue-500";
    if (status === 'sucesso') statusIconColor = "text-green-500";
    if (status === 'erro') statusIconColor = "text-red-500";

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl text-center">
                <div>
                    {status === 'processando' && (
                        <svg className={`mx-auto h-12 w-auto animate-spin ${statusIconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {status === 'sucesso' && (
                        <svg className={`mx-auto h-12 w-auto ${statusIconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    {status === 'erro' && (
                        <svg className={`mx-auto h-12 w-auto ${statusIconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        {status === 'processando' ? 'Verificando...' : status === 'sucesso' ? 'Verificação Concluída!' : 'Falha na Verificação'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">{mensagem}</p>
                </div>
                {(status === 'sucesso' || status === 'erro') && (
                    <div className="mt-8">
                        <Botao aoClicar={() => navigateTo('login')} variante="primario" classeAdicional="w-full">
                            Ir para Login
                        </Botao>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TelaVerificacaoEmail;
