import React from 'react';

const colaboradores = [
    { id: 1, nome: 'Ana Silva', experiencia: 'Desenvolvedora Front-end React', fotoUrl: 'https://placehold.co/100x100/E0E0E0/757575?text=AS' },
    { id: 2, nome: 'Carlos Pereira', experiencia: 'Especialista em UI/UX Design', fotoUrl: 'https://placehold.co/100x100/D1C4E9/7E57C2?text=CP' },
    { id: 3, nome: 'Juliana Costa', experiencia: 'Gerente de Projetos Ágeis', fotoUrl: 'https://placehold.co/100x100/C8E6C9/66BB6A?text=JC' },
];

const Rodape = () => (
    <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
                <h4 className="text-xl font-semibold">Colaboradores do Projeto</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
                {colaboradores.map(colab => (
                    <div key={colab.id} className="bg-gray-700 p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                        <img
                            src={colab.fotoUrl}
                            alt={`Foto de ${colab.nome}`}
                            className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-blue-400 object-cover"
                            onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/CCCCCC/FFFFFF?text=Erro"; }}
                        />
                        <h5 className="text-lg font-semibold text-blue-300">{colab.nome}</h5>
                        <p className="text-sm text-gray-400">{colab.experiencia}</p>
                    </div>
                ))}
            </div>
            <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-700">
                <p>&copy; {new Date().getFullYear()} AvaliaEdu. Todos os direitos reservados.</p>
                <p>Plataforma de Avaliação Educacional Colaborativa.</p>
            </div>
        </div>
    </footer>
);

export default Rodape;
