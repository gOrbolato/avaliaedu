// frontend/src/components/Cabecalho.js
import React from 'react';
import { useAuth } from '../AuthContext';

const Cabecalho = ({ navigateTo }) => {
    const { autenticado, logout, usuario } = useAuth();
    const isAdmin = usuario?.admin;

    const navLinkClasses = "text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";
    const buttonPrimaryClasses = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 active:scale-95";
    const buttonDangerClasses = "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 active:scale-95";
    const buttonAdminClasses = "text-green-600 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";


    return (
        <header className="header-bg shadow-lg sticky top-0" style={{ zIndex: 50 }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '5rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
                <div
                    onClick={() => navigateTo('home')}
                    className="logo-title cursor-pointer"
                    style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', transition: 'opacity 0.2s', flex: '0 0 auto' }}
                    aria-label="Ir para a página inicial"
                >
                    Avalia<span style={{ color: '#f59e42', paddingLeft: 0 }}>{'Edu'}</span>
                </div>
                <div style={{ flex: 1 }} />
                <nav className="flex items-center" style={{ gap: '1rem', flex: '0 0 auto' }}>
                    {autenticado ? (
                        <>
                            {isAdmin && (
                                <button onClick={() => navigateTo('admin-dashboard')} className={buttonAdminClasses}>
                                    Admin
                                </button>
                            )}
                            <button onClick={() => navigateTo('painel-usuario')} className={navLinkClasses}>
                                Meu Painel
                            </button>
                            <button onClick={logout} className={buttonDangerClasses}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigateTo('login')} className={navLinkClasses}>
                                Login
                            </button>
                            <span style={{ display: 'inline-block', width: '0.75rem' }} />
                            <button onClick={() => navigateTo('cadastro')} className={buttonPrimaryClasses}>
                                Cadastro
                            </button>
                        </>
                    )}
                </nav>
            </div>
            {/* Linha de separação dinâmica */}
            <div style={{
                height: '5px',
                width: '100%',
                background: 'linear-gradient(90deg, #2563eb 0%, #f59e42 100%)',
                boxShadow: '0 2px 8px 0 rgba(37,99,235,0.10)',
                animation: 'gradientMove 2s linear infinite alternate'
            }} />
            <style>{`
                @keyframes gradientMove {
                    0% { filter: brightness(1); }
                    100% { filter: brightness(1.15); }
                }
            `}</style>
        </header>
    );
};

export default Cabecalho;