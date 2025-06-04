import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import GraficoMediaAvaliacoes from '../components/GraficoMediaAvaliacoes';
import PopupNotificacao from '../components/PopupNotificacao';
import CampoEntrada from '../components/CampoEntrada';
import Botao from '../components/Botao';
import { FaUniversity, FaSearch, FaStar, FaRegStar } from 'react-icons/fa';
import styles from './TelaHome.module.css';

// Substitua o SearchIcon pelo FaSearch para manter o padrão visual
const SearchIcon = () => <FaSearch className="w-5 h-5 text-gray-400" />;

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

            } else {
                setAvaliacaoErro(data.message || 'Erro ao enviar avaliação.');
            }
        } catch (error) {
            setAvaliacaoErro('Erro de conexão ao enviar avaliação.');
        }
        setEnviandoAvaliacao(false);
    };

    useEffect(() => {
        const formSection = document.getElementById('search-form-section');
        if (formSection) {
            formSection.classList.remove('opacity-0', 'translate-y-5');
            formSection.classList.add('opacity-100', 'translate-y-0');
        }
    }, []);


    return (
        <div className={`flex flex-col min-h-screen bg-gray-50 ${styles.homeContainer}`}> {/* Adicionado bg-gray-50 aqui também */}
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />

            <section
                id="search-form-section"
                className={`py-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white -mt-12 sm:-mt-16 rounded-b-3xl shadow-2xl relative z-10 opacity-0 translate-y-5 transform transition-all duration-700 ease-out ${styles.heroSection}`}
            >
                <div className={`absolute inset-0 bg-black opacity-20 rounded-b-3xl ${styles.heroOverlay}`}></div>
                <div className={`container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ${styles.heroContent}`}>
                    <div className={`max-w-3xl mx-auto text-center mb-10 ${styles.heroTitleBox}`}>
                        <h1 className={`text-4xl sm:text-5xl font-bold mb-4 leading-tight animate-fadeInDown ${styles.heroTitle}`} style={{ animationDelay: '0.1s' }}>
                            Descubra, Avalie, Transforme.
                        </h1>
                        <p className={`text-lg sm:text-xl text-indigo-100 animate-fadeInDown ${styles.heroSubtitle}`} style={{ animationDelay: '0.3s' }}>
                            Sua voz moldando o futuro da educação. Encontre e compartilhe experiências sobre instituições de ensino.
                        </p>
                    </div>
                    <form onSubmit={handlePesquisar} className={`max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl animate-fadeInUp ${styles.searchForm}`} style={{ animationDelay: '0.5s' }}>
                        <h2 className={`text-2xl font-semibold text-gray-800 mb-6 text-center ${styles.searchTitle}`}>Encontre sua Instituição</h2>
                        <CampoEntrada
                            id="pesquisaInstituicao"
                            label="Nome da Instituição, Curso ou Localização"
                            valor={termoPesquisa}
                            aoMudar={(e) => setTermoPesquisa(e.target.value)}
                            placeholder="Ex: USP, Engenharia Civil, São Paulo..."
                            icone={<SearchIcon />}
                        />
                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 ${styles.filtersRow}`}>
                            <CampoEntrada id="filtroLocal" label="Filtrar por Local" valor={filtroLocal} aoMudar={(e) => setFiltroLocal(e.target.value)} placeholder="Ex: Rio de Janeiro, RJ" />
                            <CampoEntrada id="filtroCurso" label="Filtrar por Curso" valor={filtroCurso} aoMudar={(e) => setFiltroCurso(e.target.value)} placeholder="Ex: Medicina" />
                        </div>
                        <div className={`flex flex-col sm:flex-row gap-3 ${styles.buttonRow}`}>
                            <Botao tipo="submit" variante="primario" classeAdicional="w-full sm:w-auto flex-grow py-2.5" carregando={carregandoInstituicoes}>
                                Pesquisar Instituições
                            </Botao>
                        </div>
                    </form>
                </div>
            </section>

            <section className="py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {carregandoInstituicoes && (
                        <div className="text-center p-10">
                            <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-600">Buscando instituições...</p>
                        </div>
                    )}

                    {!carregandoInstituicoes && instituicoes.length > 0 && (
                        <div className="max-w-3xl mx-auto bg-transparent p-0 sm:p-0 rounded-xl mt-8">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Instituições Encontradas:</h3>
                            <ul className="space-y-6">
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
                                            <Botao aoClicar={() => toggleAvaliacoes(inst.pk_instituicao)} variante="secundario" classeAdicional="text-xs py-1.5 px-4 w-full sm:w-auto">
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
                                                        <Botao tipo="submit" variante="primario" classeAdicional="w-full sm:w-auto text-sm py-2 px-4" carregando={enviandoAvaliacao}>
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

                    {showInitialGraph && !carregandoInstituicoes && instituicoes.length === 0 && (
                        <div className="max-w-3xl mx-auto my-12 p-4 sm:p-6 bg-white shadow-xl rounded-xl animate-fadeInUp">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Visão Geral das Avaliações</h2>
                            <GraficoMediaAvaliacoes />
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