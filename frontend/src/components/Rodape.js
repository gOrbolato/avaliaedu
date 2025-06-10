import React from 'react';
const Rodape = () => (
    <footer className="footer-bg text-white" style={{ padding: '1.2rem 0', marginTop: 'auto', background: '#1e293b' }}>
        <div className="container">
            <div className="text-center" style={{ color: '#cbd5e1', fontSize: '0.85rem', paddingTop: '0.8rem', borderTop: '1px solid #334155', textAlign: 'center' }}>
                <p>&copy; {new Date().getFullYear()} AvaliaEdu. Todos os direitos reservados.</p>
                <p style={{ marginTop: '0.18rem' }}>Plataforma de Avaliação Educacional Colaborativa.</p>
            </div>
        </div>
    </footer>
);

export default Rodape;