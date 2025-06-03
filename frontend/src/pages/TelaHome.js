// frontend-react/src/pages/TelaHome.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import GraficoMediaAvaliacoes from '../components/GraficoMediaAvaliacoes';
// ... seus outros imports (Botao, CampoEntrada, PopupNotificacao) ...
// import { useAuth } from '../AuthContext'; // Se precisar de dados do usuário ou token

const API_BASE_URL = 'http://localhost:3001/api'; // Mova para um arquivo de config se preferir

const TelaHome = ({ navigateTo }) => {
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [filtroLocal, setFiltroLocal] = useState('');
    const [filtroCurso, setFiltroCurso] = useState('');
    const [notificacao, setNotificacao] = useState({ visivel: false, mensagem: '', tipo: '' });
    const [carregandoInstituicoes, setCarregandoInstituicoes] = useState(false);
    const [instituicoes, setInstituicoes] = useState([]);
    const [avaliacoesVisiveis, setAvaliacoesVisiveis] = useState({}); // { instituicaoId: [avaliacoes] }

    const { autenticado, token } = useAuth();
    const [avaliacaoForm, setAvaliacaoForm] = useState({ texto: '', nota: 5 });
    const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
    const [avaliacaoErro, setAvaliacaoErro] = useState('');

    const mostrarNotificacao = (mensagem, tipo = 'info', duracao = 3000) => {
        setNotificacao({ visivel: true, mensagem, tipo });
        setTimeout(() => setNotificacao({ visivel: false, mensagem: '', tipo: '' }), duracao);
    };

    const fetchInstituicoes = useCallback(async () => {
        setCarregandoInstituicoes(true);
        try {
            const params = new URLSearchParams();
            if (termoPesquisa) params.append('termo', termoPesquisa);
            if (filtroLocal) params.append('local', filtroLocal);
            if (filtroCurso) params.append('curso', filtroCurso);

            const response = await fetch(`${API_BASE_URL}/instituicoes?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setInstituicoes(data.instituicoes);
                if (data.instituicoes.length === 0 && (termoPesquisa || filtroLocal || filtroCurso)) {
                    mostrarNotificacao('Nenhuma instituição encontrada com os filtros aplicados.', 'info');
                }
            } else {
                mostrarNotificacao(data.message || 'Erro ao buscar instituições.', 'erro');
                setInstituicoes([]);
            }
        } catch (error) {
            console.error("Erro ao buscar instituições:", error);
            mostrarNotificacao('Erro de conexão ao buscar instituições.', 'erro');
            setInstituicoes([]);
        }
        setCarregandoInstituicoes(false);
    }, [termoPesquisa, filtroLocal, filtroCurso]);

    const handlePesquisar = (e) => {
        e.preventDefault();
        fetchInstituicoes();
    };

    const toggleAvaliacoes = async (instituicaoId) => {
        if (avaliacoesVisiveis[instituicaoId]) {
            setAvaliacoesVisiveis(prev => ({ ...prev, [instituicaoId]: null }));
        } else {
            try {
                const response = await fetch(`${API_BASE_URL}/avaliacoes/instituicao/${instituicaoId}`);
                const data = await response.json();
                if (data.success) {
                    setAvaliacoesVisiveis(prev => ({ ...prev, [instituicaoId]: data.avaliacoes }));
                    if (data.avaliacoes.length === 0) {
                        mostrarNotificacao("Nenhuma avaliação encontrada para esta instituição.", "info");
                    }
                } else {
                    mostrarNotificacao(data.message || 'Erro ao buscar avaliações.', 'erro');
                }
            } catch (error) {
                console.error("Erro ao buscar avaliações:", error);
                mostrarNotificacao('Erro de conexão ao buscar avaliações.', 'erro');
            }
        }
    };

    const enviarAvaliacao = async (instituicaoId) => {
        setEnviandoAvaliacao(true);
        setAvaliacaoErro('');
        try {
            const response = await fetch(`${API_BASE_URL}/avaliacoes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fk_instituicao: instituicaoId,
                    texto: avaliacaoForm.texto,
                    avaliacao: avaliacaoForm.nota
                })
            });
            const data = await response.json();
            if (data.success) {
                mostrarNotificacao('Avaliação enviada com sucesso!', 'sucesso');
                setAvaliacaoForm({ texto: '', nota: 5 });
                toggleAvaliacoes(instituicaoId);
            } else {
                setAvaliacaoErro(data.message || 'Erro ao enviar avaliação.');
            }
        } catch (error) {
            setAvaliacaoErro('Erro de conexão ao enviar avaliação.');
        }
        setEnviandoAvaliacao(false);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />
            <section className="py-12 bg-gray-50 -mt-12 sm:-mt-16 rounded-t-2xl shadow-xl relative z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <form onSubmit={handlePesquisar} className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Encontre sua Instituição</h2>
                        <CampoEntrada id="pesquisaInstituicao" label="Nome da Instituição, Curso ou Localização" valor={termoPesquisa} aoMudar={(e) => setTermoPesquisa(e.target.value)} placeholder="Ex: USP, Engenharia Civil, São Paulo..." />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <CampoEntrada id="filtroLocal" label="Filtrar por Local (opcional)" valor={filtroLocal} aoMudar={(e) => setFiltroLocal(e.target.value)} placeholder="Ex: Rio de Janeiro, RJ" />
                            <CampoEntrada id="filtroCurso" label="Filtrar por Curso (opcional)" valor={filtroCurso} aoMudar={(e) => setFiltroCurso(e.target.value)} placeholder="Ex: Medicina" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Botao tipo="submit" variante="primario" classeAdicional="w-full sm:w-auto flex-grow" carregando={carregandoInstituicoes}>
                                {carregandoInstituicoes ? 'Pesquisando...' : 'Pesquisar Instituições'}
                            </Botao>
                        </div>
                    </form>
                    {!carregandoInstituicoes && instituicoes.length > 0 && (
                        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg mt-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Instituições Encontradas:</h3>
                            <ul className="divide-y divide-gray-200">
                                {instituicoes.map(inst => (
                                    <li key={inst.pk_instituicao} className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-lg font-semibold text-blue-600">{inst.pk_instituicao}</h4>
                                                <p className="text-sm text-gray-500">{inst.cidade} - {inst.estado}</p>
                                            </div>
                                            <Botao aoClicar={() => toggleAvaliacoes(inst.pk_instituicao)} variante="secundario" classeAdicional="text-xs py-1 px-2">
                                                {avaliacoesVisiveis[inst.pk_instituicao] ? 'Esconder Avaliações' : 'Ver Avaliações'}
                                            </Botao>
                                        </div>
                                        {avaliacoesVisiveis[inst.pk_instituicao] && (
                                            <div className="mt-3 pl-4 border-l-2 border-gray-200">
                                                {avaliacoesVisiveis[inst.pk_instituicao].length > 0 ? (
                                                    avaliacoesVisiveis[inst.pk_instituicao].map(aval => (
                                                        <div key={aval.pk_id_avaliacao} className="mb-2 p-2 bg-gray-50 rounded">
                                                            <p className="text-xs text-gray-500">Usuário: {aval.nome_usuario || 'Anônimo'} em {new Date(aval.data_avaliacao).toLocaleDateString()}</p>
                                                            <p className="text-sm"><strong>Nota: {aval.avaliacao}/5</strong></p>
                                                            <p className="text-sm text-gray-700">{aval.texto}</p>
                                                            {aval.curso && <p className="text-xs text-gray-500">Curso: {aval.curso}</p>}
                                                            {aval.materia && <p className="text-xs text-gray-500">Matéria: {aval.materia}</p>}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500">Nenhuma avaliação para esta instituição ainda.</p>
                                                )}
                                                {autenticado && (
                                                    <form className="mt-4 p-2 bg-gray-100 rounded" onSubmit={e => { e.preventDefault(); enviarAvaliacao(inst.pk_instituicao); }}>
                                                        <label className="block text-sm font-medium mb-1">Deixe sua avaliação:</label>
                                                        <textarea
                                                            className="w-full border rounded p-2 mb-2"
                                                            rows={2}
                                                            value={avaliacaoForm.texto}
                                                            onChange={e => setAvaliacaoForm(f => ({ ...f, texto: e.target.value }))}
                                                            placeholder="Compartilhe sua experiência..."
                                                            required
                                                        />
                                                        <div className="flex items-center mb-2">
                                                            <span className="mr-2">Nota:</span>
                                                            <select
                                                                className="border rounded p-1"
                                                                value={avaliacaoForm.nota}
                                                                onChange={e => setAvaliacaoForm(f => ({ ...f, nota: Number(e.target.value) }))}
                                                            >
                                                                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
                                                            </select>
                                                        </div>
                                                        {avaliacaoErro && <p className="text-xs text-red-600 mb-2">{avaliacaoErro}</p>}
                                                        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={enviandoAvaliacao}>
                                                            {enviandoAvaliacao ? 'Enviando...' : 'Enviar Avaliação'}
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {instituicoes.length === 0 && (
                        <div className="max-w-3xl mx-auto my-8">
                            <GraficoMediaAvaliacoes />
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default TelaHome;