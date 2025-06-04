import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import GraficoMediaAvaliacoes from '../components/GraficoMediaAvaliacoes';
import PopupNotificacao from '../components/PopupNotificacao';
import CampoEntrada from '../components/CampoEntrada';
import Botao from '../components/Botao';
import { FaUniversity, FaSearch, FaStar, FaRegStar } from 'react-icons/fa';
import styles from './TelaHome.module.css';

// Substitua o SearchIcon pelo FaSearch para manter o padrão visual
const SearchIcon = () => <FaSearch style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />;

const API_BASE_URL = 'http://localhost:3001/api';

const TelaHome = ({ navigateTo }) => {
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [filtroLocal, setFiltroLocal] = useState('');
    const [filtroCurso, setFiltroCurso] = useState('');
    const [notificacao, setNotificacao] = useState({ visivel: false, mensagem: '', tipo: '' });
    const [carregandoInstituicoes, setCarregandoInstituicoes] = useState(false);
    const [instituicoes, setInstituicoes] = useState([]);
    const [avaliacoesVisiveis, setAvaliacoesVisiveis] = useState({});

    const { autenticado, token } = useAuth();
    const [avaliacaoForm, setAvaliacaoForm] = useState({ texto: '', nota: 5 });
    const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
    const [avaliacaoErro, setAvaliacaoErro] = useState('');
    const [showInitialGraph, setShowInitialGraph] = useState(true);
    const [atualizarGrafico, setAtualizarGrafico] = useState(0); // Força atualização do gráfico


    const mostrarNotificacao = (mensagem, tipo = 'info', duracao = 4000) => {
        setNotificacao({ visivel: true, mensagem, tipo });
        setTimeout(() => setNotificacao({ visivel: false, mensagem: '', tipo: '' }), duracao);
    };

    const fetchInstituicoes = useCallback(async () => {
        setCarregandoInstituicoes(true);
        setShowInitialGraph(false); // Esconde o gráfico inicial ao pesquisar
        setInstituicoes([]);
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
        setAtualizarGrafico(v => v + 1); // Atualiza gráfico após busca
    }, [termoPesquisa, filtroLocal, filtroCurso]);

    const handlePesquisar = (e) => {
        e.preventDefault();
        if (!termoPesquisa && !filtroLocal && !filtroCurso) {
            mostrarNotificacao('Por favor, preencha ao menos um campo para pesquisar.', 'info');
            setShowInitialGraph(true); // Mostra o gráfico se a pesquisa for vazia
            setInstituicoes([]);
            return;
        }
        fetchInstituicoes();
    };

    const toggleAvaliacoes = async (instituicaoId) => {
        const isCurrentlyVisible = !!avaliacoesVisiveis[instituicaoId];

        // Cria um novo objeto para o estado para forçar o re-render e a animação
        const newAvaliacoesVisiveis = { ...avaliacoesVisiveis };

        if (isCurrentlyVisible) {
            newAvaliacoesVisiveis[instituicaoId] = null; // Esconde
            setAvaliacoesVisiveis(newAvaliacoesVisiveis);
        } else {
            newAvaliacoesVisiveis[instituicaoId] = { isLoading: true, data: [] }; // Mostra loading
            setAvaliacoesVisiveis(newAvaliacoesVisiveis);
            try {
                const response = await fetch(`${API_BASE_URL}/avaliacoes/instituicao/${instituicaoId}`);
                const data = await response.json();
                const updatedVisibility = { ...avaliacoesVisiveis }; // Pega o estado mais recente
                if (data.success) {
                    updatedVisibility[instituicaoId] = { isLoading: false, data: data.avaliacoes };
                    if (data.avaliacoes.length === 0) {
                        mostrarNotificacao("Nenhuma avaliação encontrada para esta instituição.", "info");
                    }
                } else {
                    mostrarNotificacao(data.message || 'Erro ao buscar avaliações.', 'erro');
                    updatedVisibility[instituicaoId] = null;
                }
                setAvaliacoesVisiveis(updatedVisibility);
            } catch (error) {
                console.error("Erro ao buscar avaliações:", error);
                mostrarNotificacao('Erro de conexão ao buscar avaliações.', 'erro');
                const updatedVisibilityOnError = { ...avaliacoesVisiveis };
                updatedVisibilityOnError[instituicaoId] = null;
                setAvaliacoesVisiveis(updatedVisibilityOnError);
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
                // Rebusca avaliações para atualizar a lista
                const updatedResponse = await fetch(`${API_BASE_URL}/avaliacoes/instituicao/${instituicaoId}`);
                const updatedData = await updatedResponse.json();
                // Atualiza o estado para refletir as novas avaliações
                setAvaliacoesVisiveis(prev => ({
                    ...prev,
                    [instituicaoId]: { isLoading: false, data: updatedData.success ? updatedData.avaliacoes : [] }
                }));
                setAtualizarGrafico(v => v + 1); // Atualiza gráfico após nova avaliação

            } else {
                setAvaliacaoErro(data.message || 'Erro ao enviar avaliação.');
            }
        } catch (error) {
            setAvaliacaoErro('Erro de conexão ao enviar avaliação.');
        }
        setEnviandoAvaliacao(false);
    };

    return (
        <div className={`flex flex-col min-h-screen bg-gray-50 ${styles.homeContainer}`}> {/* Adicionado bg-gray-50 aqui também */}
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />

            {/* Seção institucional + pesquisa lado a lado */}
            <section className={styles.institucionalSection}>
                <div className={styles.institucionalTexto}>
                    <h2 className={styles.institucionalTitulo}>
                        Sua experiência transforma o futuro!
                    </h2>
                    <p className={styles.institucionalDescricao}>
                        Já pensou em ajudar outros estudantes a escolher melhor onde estudar? Aqui você pode!
                    </p>
                    <ul className={styles.listaFade}>
                        <li><strong>✔️ Avalie sua instituição:</strong> Conte como é o ambiente, os professores, a estrutura e o que faz a diferença no seu dia a dia.</li>
                        <li><strong>✔️ Compartilhe sobre seu curso:</strong> Fale da grade, da coordenação, dos desafios e das oportunidades que encontrou.</li>
                        <li><strong>✔️ Dê sua opinião sobre matérias:</strong> Ajude futuros alunos a entender o que esperar de cada disciplina e professor.</li>
                    </ul>
                    <p className={styles.institucionalChamada}>
                        <strong>É simples, rápido e faz diferença!</strong> Sua avaliação fica disponível para todos, ajudando quem está começando a jornada acadêmica. Clique, avalie e transforme!
                    </p>
                </div>
                {/* Área de pesquisa simplificada e visualmente destacada */}
                <div className={styles.pesquisaBox}>
                    <form onSubmit={handlePesquisar} className={styles.pesquisaForm}>
                        <h2 className={styles.pesquisaTitulo}>Encontre sua Instituição</h2>
                        <CampoEntrada
                            id="termoPesquisa"
                            label="Buscar por nome ou cidade"
                            valor={termoPesquisa}
                            aoMudar={e => setTermoPesquisa(e.target.value)}
                            placeholder="Ex: USP, São Paulo, UnB..."
                        />
                        <Botao tipo="submit" variante="primario" classeAdicional={styles.pulseBtn + " w-full py-2.5 mt-2"} carregando={carregandoInstituicoes}>
                            Pesquisar Instituições
                        </Botao>
                    </form>
                </div>
            </section>

            {/* Visão geral das avaliações (gráfico) sempre atualizado - mantém apenas a versão moderna */}
            {showInitialGraph && !carregandoInstituicoes && instituicoes.length === 0 && (
                <div className={styles.graficoBox}>
                    <h2 className={styles.graficoTitulo}>Visão Geral das Avaliações</h2>
                    <GraficoMediaAvaliacoes key={atualizarGrafico} />
                </div>
            )}

            <section style={{ padding: '3rem 0' }}>
                <div className="container">
                    {carregandoInstituicoes && (
                        <div className="text-center" style={{ padding: '2.5rem' }}>
                            <svg style={{ animation: 'spin 1s linear infinite', height: '2.5rem', width: '2.5rem', color: '#2563eb', display: 'block', margin: '0 auto 0.75rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p style={{ color: '#475569' }}>Buscando instituições...</p>
                        </div>
                    )}

                    {!carregandoInstituicoes && instituicoes.length > 0 && (
                        <div className="max-w-3xl" style={{ margin: '2rem auto 0', background: 'transparent', borderRadius: '1rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>Instituições Encontradas:</h3>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {instituicoes.map((inst, index) => (
                                    <li
                                        key={inst.pk_instituicao}
                                        className={`${styles.cardInstituicao} p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ease-out opacity-0 animate-fadeInUp`}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                                            <div className="mb-3 sm:mb-0">
                                                <h4 className="text-xl font-semibold text-blue-700">{inst.pk_instituicao}</h4>
                                                <p className="text-sm text-gray-500">{inst.cidade} - {inst.estado}</p>
                                            </div>
                                            <Botao aoClicar={() => toggleAvaliacoes(inst.pk_instituicao)} variante="secundario" classeAdicional="text-xs py-1.5 px-4 w-full sm:w-auto pulseBtn">
                                                {avaliacoesVisiveis[inst.pk_instituicao] && !avaliacoesVisiveis[inst.pk_instituicao]?.isLoading ? 'Esconder Avaliações' : 'Ver Avaliações'}
                                            </Botao>
                                        </div>
                                        {avaliacoesVisiveis[inst.pk_instituicao] && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 animate-fadeInDown" style={{ animationDuration: '0.3s' }}>
                                                {avaliacoesVisiveis[inst.pk_instituicao].isLoading ? (
                                                    <p className="text-sm text-gray-500 italic">Carregando avaliações...</p>
                                                ) : avaliacoesVisiveis[inst.pk_instituicao].data.length > 0 ? (
                                                    avaliacoesVisiveis[inst.pk_instituicao].data.map(aval => (
                                                        <div key={aval.pk_id_avaliacao} className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <p className="text-sm font-semibold text-gray-800">Usuário: {aval.nome_usuario || 'Anônimo'}</p>
                                                                <p className="text-xs text-gray-500">{new Date(aval.data_avaliacao).toLocaleDateString()}</p>
                                                            </div>
                                                            <p className="text-sm font-semibold">Nota: <span className="text-blue-600">{Array(aval.avaliacao).fill('★').join('')}{Array(5 - aval.avaliacao).fill('☆').join('')} ({aval.avaliacao}/5)</span></p>
                                                            <p className="text-sm text-gray-700 mt-1 leading-relaxed">{aval.texto}</p>
                                                            {aval.curso && <p className="text-xs text-gray-500 mt-2">Curso: {aval.curso}</p>}
                                                            {aval.materia && <p className="text-xs text-gray-500 mt-1">Matéria: {aval.materia}</p>}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">Nenhuma avaliação para esta instituição ainda.</p>
                                                )}

                                                {autenticado && !avaliacoesVisiveis[inst.pk_instituicao].isLoading && (
                                                    <form className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200" onSubmit={e => { e.preventDefault(); enviarAvaliacao(inst.pk_instituicao); }}>
                                                        <h5 className="text-md font-semibold text-gray-700 mb-2">Deixe sua avaliação:</h5>
                                                        <CampoEntrada
                                                            id={`avaliacao-texto-${inst.pk_instituicao}`}
                                                            tipo="textarea" // Se CampoEntrada suportar, ou use <textarea> diretamente
                                                            valor={avaliacaoForm.texto}
                                                            aoMudar={e => setAvaliacaoForm(f => ({ ...f, texto: e.target.value }))}
                                                            placeholder="Compartilhe sua experiência..."
                                                            classeAdicionalInput="min-h-[60px]"
                                                        />
                                                        <div className="flex items-center mb-3">
                                                            <span className="mr-2 text-sm font-medium text-gray-700">Nota:</span>
                                                            <select
                                                                className="border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                                                value={avaliacaoForm.nota}
                                                                onChange={e => setAvaliacaoForm(f => ({ ...f, nota: Number(e.target.value) }))}
                                                            >
                                                                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} {n > 1 ? 'Estrelas' : 'Estrela'}</option>)}
                                                            </select>
                                                        </div>
                                                        {avaliacaoErro && <p className="text-xs text-red-600 mb-2">{avaliacaoErro}</p>}
                                                        <Botao tipo="submit" variante="primario" classeAdicional="w-full sm:w-auto text-sm py-2 px-4 pulseBtn" carregando={enviandoAvaliacao}>
                                                            {enviandoAvaliacao ? 'Enviando...' : 'Enviar Avaliação'}
                                                        </Botao>
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!carregandoInstituicoes && instituicoes.length === 0 && !showInitialGraph && (
                        <div className="max-w-lg mx-auto my-12 p-8 text-center bg-white rounded-xl shadow-lg animate-fadeInUp">
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 9h-6" /> {/* Ícone mais elaborado */}
                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10.5h.01M6.478 10.5h.01M9.956 10.5h.01" />
                            </svg>
                            <h3 className="mt-4 text-lg font-semibold text-gray-800">Nenhuma instituição encontrada</h3>
                            <p className="mt-2 text-sm text-gray-600">Tente ajustar seus termos de pesquisa ou filtros para encontrar o que procura.</p>
                        </div>
                    )}

                </div>
            </section>
        </div>
    );
};

export default TelaHome;