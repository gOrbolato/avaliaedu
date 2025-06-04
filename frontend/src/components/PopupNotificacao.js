// frontend/src/components/PopupNotificacao.js
import React from 'react';
import styles from './PopupNotificacao.module.css';

// Ícones SVG de exemplo. Recomenda-se usar uma biblioteca de ícones.
const IconCheckCircle = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const IconExclamationCircle = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const IconInformationCircle = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const PopupNotificacao = ({ mensagem, tipo = 'info', aoFechar, visivel }) => {
    if (!visivel || !mensagem) return null;

    let tipoClass, Icon;
    switch (tipo) {
        case 'sucesso':
            tipoClass = styles.sucesso;
            Icon = <IconCheckCircle className={styles.icone} />;
            break;
        case 'erro':
            tipoClass = styles.erro;
            Icon = <IconExclamationCircle className={styles.icone} />;
            break;
        default:
            tipoClass = styles.info;
            Icon = <IconInformationCircle className={styles.icone} />;
    }

    return (
        <div className={[styles.popup, tipoClass].join(' ')} role="alert">
            <div className={styles.icone}>{Icon}</div>
            <div className={styles.mensagem}>{mensagem}</div>
            {aoFechar && (
                <button
                    type="button"
                    onClick={aoFechar}
                    className={styles.btnFechar}
                    aria-label="Fechar notificação"
                >
                    <span className="sr-only">Fechar</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default PopupNotificacao;