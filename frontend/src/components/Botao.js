import React from 'react';

const Botao = ({ children, aoClicar, tipo = "button", variante = "primario", desabilitado = false, carregando = false, classeAdicional = "" }) => {
    const baseClasses = "flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
    let varianteClasses = "";

    switch (variante) {
        case "secundario":
            varianteClasses = "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500";
            break;
        case "perigo":
            varianteClasses = "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500";
            break;
        case "sucesso":
            varianteClasses = "bg-green-500 hover:bg-green-600 text-white focus:ring-green-400";
            break;
        default:
            varianteClasses = "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500";
    }

    return (
        <button
            type={tipo}
            onClick={aoClicar}
            disabled={desabilitado || carregando}
            className={`${baseClasses} ${varianteClasses} ${(desabilitado || carregando) ? 'opacity-50 cursor-not-allowed' : ''} ${classeAdicional}`}
        >
            {carregando ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : children}
        </button>
    );
};

export default Botao;
