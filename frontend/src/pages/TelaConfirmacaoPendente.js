import React from 'react';
import styles from '../styles/TelaConfirmacaoPendente.module.css';

const TelaConfirmacaoPendente = () => {
    return (
        <div className={styles.confirmacaoPendenteContainer}>
            {/* Exemplo de uso do estilo: */}
            {/* <div className={styles.confirmacaoPendenteContainer}> ... </div> */}
            <h1>Confirmação Pendente</h1>
            <p>Sua confirmação está pendente. Por favor, aguarde.</p>
        </div>
    );
};

export default TelaConfirmacaoPendente;