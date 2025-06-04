// frontend/src/components/Rodape.js
import React from 'react';

const colaboradores = [
    { id: 1, nome: 'Felipe Nakano', experiencia: 'Desenvolvedor Full-Stack', fotoUrl: 'https://placehold.co/100x100/E0E0E0/757575?text=AS' },
    { id: 2, nome: 'Guilherme Orbolato', experiencia: 'Desenvolvedor Full-Stack', fotoUrl: 'https://avatars.githubusercontent.com/u/10469850?v=4' },
    // Adicione mais colaboradores aqui se desejar
];

// --- Carrossel de colaboradores (opcional, para uso futuro) ---
/*
import React, { useState, useEffect } from 'react';
const Rodape = () => {
    const [indice, setIndice] = useState(0);
    useEffect(() => {
        if (colaboradores.length <= 1) return;
        const timer = setInterval(() => {
            setIndice(i => (i + 1) % colaboradores.length);
        }, 15000);
        return () => clearInterval(timer);
    }, []);
    const proximo = () => setIndice(i => (i + 1) % colaboradores.length);
    const anterior = () => setIndice(i => (i - 1 + colaboradores.length) % colaboradores.length);
    return (
        <footer className="footer-bg text-white" style={{ padding: '1.2rem 0', marginTop: 'auto', background: '#1e293b' }}>
            <div className="container">
                <div className="text-center" style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e0e7ef' }}>Colaboradores do Projeto</h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem', gap: '1.5rem' }}>
                    <button onClick={anterior} aria-label="Anterior" style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '1.5rem', cursor: 'pointer', opacity: colaboradores.length > 1 ? 1 : 0.3 }} disabled={colaboradores.length <= 1}>&lt;</button>
                    <div style={{ background: '#334155', padding: '0.6rem', borderRadius: '0.6rem', boxShadow: '0 2px 8px 0 rgba(31,38,135,0.10)', textAlign: 'center', minWidth: 120, transition: 'transform 0.3s' }}>
                        <img
                            src={colaboradores[indice].fotoUrl}
                            alt={`Foto de ${colaboradores[indice].nome}`}
                            style={{ width: '2.8rem', height: '2.8rem', borderRadius: '50%', margin: '0 auto 0.35rem', border: '1.5px solid #3b82f6', objectFit: 'cover' }}
                            onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/CCCCCC/FFFFFF?text=Erro"; }}
                        />
                        <h5 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', marginBottom: '0.1rem' }}>{colaboradores[indice].nome}</h5>
                        <p style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: '0.1rem' }}>{colaboradores[indice].experiencia}</p>
                    </div>
                    <button onClick={proximo} aria-label="Próximo" style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '1.5rem', cursor: 'pointer', opacity: colaboradores.length > 1 ? 1 : 0.3 }} disabled={colaboradores.length <= 1}>&gt;</button>
                </div>
                <div className="text-center" style={{ color: '#cbd5e1', fontSize: '0.75rem', paddingTop: '0.8rem', borderTop: '1px solid #334155' }}>
                    <p>&copy; {new Date().getFullYear()} AvaliaEdu. Todos os direitos reservados.</p>
                    <p style={{ marginTop: '0.18rem' }}>Plataforma de Avaliação Educacional Colaborativa.</p>
                </div>
            </div>
        </footer>
    );
};
*/
// --- Fim do carrossel opcional ---

const Rodape = () => (
    <footer className="footer-bg text-white" style={{ padding: '1.2rem 0', marginTop: 'auto', background: '#1e293b' }}>
        <div className="container">
            <div className="text-center" style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e0e7ef' }}>Colaboradores do Projeto</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
                {colaboradores.map(colab => (
                    <div key={colab.id} style={{ background: '#334155', padding: '0.6rem', borderRadius: '0.6rem', boxShadow: '0 2px 8px 0 rgba(31,38,135,0.10)', textAlign: 'center', transition: 'transform 0.3s' }}>
                        <img
                            src={colab.fotoUrl}
                            alt={`Foto de ${colab.nome}`}
                            style={{ width: '2.8rem', height: '2.8rem', borderRadius: '50%', margin: '0 auto 0.35rem', border: '1.5px solid #3b82f6', objectFit: 'cover' }}
                            onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/CCCCCC/FFFFFF?text=Erro"; }}
                        />
                        <h5 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', marginBottom: '0.1rem' }}>{colab.nome}</h5>
                        <p style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: '0.1rem' }}>{colab.experiencia}</p>
                    </div>
                ))}
            </div>
            <div className="text-center" style={{ color: '#cbd5e1', fontSize: '0.75rem', paddingTop: '0.8rem', borderTop: '1px solid #334155' }}>
                <p>&copy; {new Date().getFullYear()} AvaliaEdu. Todos os direitos reservados.</p>
                <p style={{ marginTop: '0.18rem' }}>Plataforma de Avaliação Educacional Colaborativa.</p>
            </div>
        </div>
    </footer>
);

export default Rodape;