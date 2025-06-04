// frontend/src/components/Botao.js
import React from 'react';
import styles from './Botao.module.css';

const Botao = ({ children, aoClicar, tipo = "button", variante = "primario", desabilitado = false, carregando = false, classeAdicional = "" }) => {
    let varianteClass = styles[variante] || styles.primario;
    let loadingClass = (desabilitado || carregando) ? styles.carregando : styles.ativo;
    return (
        <button
            type={tipo}
            onClick={aoClicar}
            disabled={desabilitado || carregando}
            className={[
                styles.botaoBase,
                varianteClass,
                loadingClass,
                classeAdicional
            ].join(' ')}
        >
            {carregando ? (
                <>
                    <svg style={{ animation: 'spin 1s linear infinite', marginLeft: '-0.25rem', marginRight: '0.75rem', height: '1.25rem', width: '1.25rem', color: '#fff', verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zM20 12c0-4.418-3.582-8-8-8v4c2.206 0 4 1.794 4 4h4z"></path>
                    </svg>
                    Carregando...
                </>
            ) : children}
        </button>
    );
};

export default Botao;