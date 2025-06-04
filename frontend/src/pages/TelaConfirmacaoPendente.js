// frontend/src/pages/TelaConfirmacaoPendente.js
import React, { useEffect, useState } from 'react';
import styles from './TelaConfirmacaoPendente.module.css';

const TelaConfirmacaoPendente = ({ pageData }) => {
    const email = pageData?.email;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className={styles.confirmacaoBg + " min-h-screen flex flex-col items-center justify-center py-12 px-4 text-white"}>
            <div className={styles.confirmacaoCard + ` max-w-lg w-full text-center p-10 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                <svg className={"mx-auto h-20 w-20 text-white mb-6 " + styles.iconePulse} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
                </svg>
                <h1 className="text-4xl font-bold mb-4">Confirmação Pendente</h1>
                <p className="text-lg mb-2">
                    Um e-mail de confirmação foi enviado para:
                </p>
                <p className="text-xl font-semibold mb-6 bg-white bg-opacity-20 px-3 py-1.5 rounded-md inline-block">
                    {email || "seu endereço de e-mail"}
                </p>
                <p className="text-md">
                    Por favor, verifique sua caixa de entrada (e spam) e clique no link enviado para ativar sua conta.
                </p>
                <p className="mt-8 text-sm opacity-80">
                    Se não recebeu, aguarde alguns minutos ou tente se cadastrar novamente.
                </p>
            </div>
        </div>
    );
};

export default TelaConfirmacaoPendente;