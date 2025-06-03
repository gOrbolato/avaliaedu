import React from 'react';
import { useAuth } from '../AuthContext';

const Cabecalho = ({ navigateTo }) => {
    const { autenticado, logout, usuario } = useAuth();
    const isAdmin = usuario?.admin;

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                <div
                    onClick={() => navigateTo('home')}
                    className="text-2xl font-bold text-blue-600 cursor-pointer"
                    aria-label="Ir para a página inicial"
                >
                    Avalia<span className="text-orange-500">Edu</span>
                </div>
                <nav className="flex items-center space-x-4">
                    {autenticado ? (
                        <>
                            {isAdmin && (
                                <button onClick={() => navigateTo('admin-dashboard')} className="text-green-700 hover:text-green-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Admin
                                </button>
                            )}
                            <button onClick={() => navigateTo('painel-usuario')} className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                Meu Painel
                            </button>
                            <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigateTo('login')} className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                Login
                            </button>
                            <button onClick={() => navigateTo('cadastro')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
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