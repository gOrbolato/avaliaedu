// frontend/src/pages/TelaVerificacaoEmail.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import Botao from '../components/Botao';
import styles from './TelaVerificacaoEmail.module.css';

const TelaVerificacaoEmail = ({ navigateTo, pageData }) => {
    const token = pageData?.token;
    const { verificarTokenEmail } = useAuth();
    const [mensagem, setMensagem] = useState('Verificando seu e-mail...');
    const [status, setStatus] = useState('processando'); // 'processando', 'sucesso', 'erro'

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true); // Ativa animação de entrada
        const executarVerificacao = async () => {
            if (!token) {
                setMensagem('Token de verificação inválido ou ausente.');
                setStatus('erro');
                return;
            }
            const resultado = await verificarTokenEmail(token); // Use o token real aqui
            setMensagem(resultado.message);
            setStatus(resultado.success ? 'sucesso' : 'erro');
            if (resultado.success) {
                setTimeout(() => navigateTo('login'), 4000);
            }
        };
        executarVerificacao();
    }, [token, verificarTokenEmail, navigateTo]);

    let statusIconColor = "text-blue-500";
    let StatusIconComponent;

    if (status === 'sucesso') {
        statusIconColor = "text-green-500";
        StatusIconComponent = () => (
            <svg className={`mx-auto h-16 w-16 ${statusIconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    } else if (status === 'erro') {
        statusIconColor = "text-red-500";
        StatusIconComponent = () => (
            <svg className={`mx-auto h-16 w-16 ${statusIconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
        );
    } else { // processando
        StatusIconComponent = () => (
            <svg className={`mx-auto h-16 w-16 animate-subtlePulse ${statusIconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zM20 12c0-4.418-3.582-8-8-8v4c2.206 0 4 1.794 4 4h4z"></path>
            </svg>
        );
    }

    return (
        <div className={styles.verificacaoBg + " min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8"}>
            <div className={styles.verificacaoCard + ` max-w-md w-full space-y-8 text-center p-10 shadow-2xl transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                <div>
                    <StatusIconComponent />
                    <h2 className={`mt-6 text-3xl font-bold ${status === 'sucesso' ? 'text-green-600' : status === 'erro' ? 'text-red-600' : 'text-gray-900'}`}>
                        {status === 'processando' ? 'Verificando E-mail...' : status === 'sucesso' ? 'Verificação Concluída!' : 'Falha na Verificação'}
                    </h2>
                    <p className="mt-3 text-md text-gray-600">{mensagem}</p>
                </div>
                {(status === 'sucesso' || status === 'erro') && (
                    <div className="mt-10">
                        <Botao aoClicar={() => navigateTo('login')} variante="primario" classeAdicional="w-full py-3 text-base">
                            Ir para Login
                        </Botao>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TelaVerificacaoEmail;