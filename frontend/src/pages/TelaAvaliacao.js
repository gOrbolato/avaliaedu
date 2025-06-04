import React from 'react';
import styles from '../styles/TelaAvaliacao.module.css';
import PopupNotificacao from '../components/PopupNotificacao';
import CampoEntrada from '../components/CampoEntrada';
import Botao from '../components/Botao';

const TelaAvaliacao = ({ navigateTo }) => {
    // Exemplo de estado e lógica para avaliação
    const [nota, setNota] = React.useState(5);
    const [comentario, setComentario] = React.useState('');
    const [notificacao, setNotificacao] = React.useState({ visivel: false, mensagem: '', tipo: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        setNotificacao({ visivel: true, mensagem: 'Avaliação enviada com sucesso!', tipo: 'sucesso' });
        setNota(5);
        setComentario('');
    };

    return (
        <div className={styles.avaliacaoContainer + ' min-h-screen flex flex-col items-center justify-center bg-gray-50'}>
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Avalie a Instituição</h2>
                <CampoEntrada
                    id="nota"
                    label="Nota (1 a 10)"
                    tipo="number"
                    valor={nota}
                    aoMudar={e => setNota(e.target.value)}
                    placeholder="Dê uma nota de 1 a 10"
                />
                <CampoEntrada
                    id="comentario"
                    label="Comentário"
                    tipo="text"
                    valor={comentario}
                    aoMudar={e => setComentario(e.target.value)}
                    placeholder="Deixe seu comentário"
                />
                <Botao tipo="submit" variante="primario" classeAdicional="w-full mt-4">Enviar Avaliação</Botao>
            </form>
        </div>
    );
};

// Exemplo de uso do estilo:
// <div className={styles.avaliacaoContainer}> ... </div>

export default TelaAvaliacao;
