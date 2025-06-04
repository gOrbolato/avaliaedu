// frontend/src/components/CampoEntrada.js
import React, { useState } from 'react';
import styles from './CampoEntrada.module.css';

// Ícones SVG de Exemplo (para Heroicons v2 ou similar)
// Em um projeto real, considere usar uma biblioteca de ícones como react-icons ou importar SVGs como componentes
const EyeIcon = ({ className = "w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EyeSlashIcon = ({ className = "w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.574M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);

const CampoEntrada = ({ id, label, tipo = 'text', valor, aoMudar, placeholder, erro, icone, desabilitado = false, nome, autoComplete, classeAdicionalInput = "" }) => {
    const [mostrarSenhaInterno, setMostrarSenhaInterno] = useState(false);
    const isPassword = tipo === 'password';
    const tipoFinal = isPassword && mostrarSenhaInterno ? 'text' : tipo;

    return (
        <div className={styles.campoContainer}>
            {label && (
                <label htmlFor={id} className={styles.label}>{label}</label>
            )}
            <div className={styles.inputGroup + ' group'}>
                {icone && !isPassword && (
                    <div className={styles.icone}>
                        {React.isValidElement(icone) ? React.cloneElement(icone, { className: styles.icone }) : icone}
                    </div>
                )}
                <input
                    type={tipoFinal}
                    id={id}
                    name={nome || id}
                    value={valor}
                    onChange={aoMudar}
                    placeholder={placeholder}
                    disabled={desabilitado}
                    autoComplete={autoComplete || (isPassword ? (nome === 'novaSenha' || nome === 'confirmarSenha' ? 'new-password' : 'current-password') : 'off')}
                    className={[
                        styles.input,
                        erro ? styles.inputErro : '',
                        desabilitado ? 'bg-gray-100 cursor-not-allowed' : '',
                        icone && !isPassword ? 'pl-10' : '',
                        isPassword ? 'pr-12' : '',
                        classeAdicionalInput
                    ].join(' ')}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setMostrarSenhaInterno(!mostrarSenhaInterno)}
                        className={styles.toggleSenha}
                        aria-label={mostrarSenhaInterno ? "Esconder senha" : "Mostrar senha"}
                    >
                        {mostrarSenhaInterno ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                )}
            </div>
            {erro && <p className={styles.erroMsg}>{erro}</p>}
        </div>
    );
};

export default CampoEntrada;