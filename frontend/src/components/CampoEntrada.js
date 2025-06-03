import React from 'react';

const CampoEntrada = ({ id, label, tipo = 'text', valor, aoMudar, placeholder, erro, icone, desabilitado = false, nome }) => {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative rounded-md shadow-sm">
                {icone && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icone}</div>}
                <input
                    type={tipo}
                    id={id}
                    name={nome || id}
                    value={valor}
                    onChange={aoMudar}
                    placeholder={placeholder}
                    disabled={desabilitado}
                    className={`
            block w-full px-3 py-2 border rounded-md 
            focus:outline-none sm:text-sm
            ${icone ? 'pl-10' : ''}
            ${erro ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'}
            ${desabilitado ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
                />
            </div>
            {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
        </div>
    );
};

export default CampoEntrada;
