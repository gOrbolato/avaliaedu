// frontend/src/components/Rodape.js
import React from 'react';

const colaboradores = [
    { id: 1, nome: 'Ana Silva', experiencia: 'Desenvolvedora Front-end React', fotoUrl: 'https://placehold.co/100x100/E0E0E0/757575?text=AS' },
    { id: 2, nome: 'Carlos Pereira', experiencia: 'Especialista em UI/UX Design', fotoUrl: 'https://placehold.co/100x100/D1C4E9/7E57C2?text=CP' },
    { id: 3, nome: 'Juliana Costa', experiencia: 'Gerente de Projetos Ágeis', fotoUrl: 'https://placehold.co/100x100/C8E6C9/66BB6A?text=JC' },
];

const Rodape = () => (
    <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <h4 className="text-2xl font-semibold text-gray-100">Colaboradores do Projeto</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">
                {colaboradores.map(colab => (
                    <div key={colab.id} className="bg-gray-700 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-all duration-300 ease-out group"> {/* Adicionado group e rounded-xl */}
                        <img
                            src={colab.fotoUrl}
                            alt={`Foto de ${colab.nome}`}
                            className="w-28 h-28 rounded-full mx-auto mb-5 border-4 border-blue-500 object-cover group-hover:border-orange-400 transition-colors duration-300" // Efeito no hover
                            onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/CCCCCC/FFFFFF?text=Erro"; }}
                        />
                        <h5 className="text-xl font-semibold text-blue-300 group-hover:text-orange-300 transition-colors duration-300">{colab.nome}</h5>
                        <p className="text-sm text-gray-400 mt-1">{colab.experiencia}</p>
                    </div>
                ))}
            </div>
            <div className="text-center text-gray-400 text-sm pt-8 border-t border-gray-700">
                <p>&copy; {new Date().getFullYear()} AvaliaEdu. Todos os direitos reservados.</p>
                <p className="mt-1">Plataforma de Avaliação Educacional Colaborativa.</p>
            </div>
        </div>
    </footer>
);

export default Rodape;