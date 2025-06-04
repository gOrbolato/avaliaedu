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
        <header className="bg-white shadow-lg sticky top-0 z-50"> {/* Sombra mais pronunciada */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                <div
                    onClick={() => navigateTo('home')}
                    className="text-3xl font-bold text-blue-600 cursor-pointer hover:opacity-80 transition-opacity" // Tamanho e efeito no logo
                    aria-label="Ir para a página inicial"
                >
                    Avalia<span className="text-orange-500">Edu</span>
                </div>
                <nav className="flex items-center space-x-2 sm:space-x-4">
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
                            <button onClick={() => navigateTo('cadastro')} className={buttonPrimaryClasses}>
                                Cadastro
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Cabecalho;