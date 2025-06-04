// frontend/src/pages/TelaAdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import GraficoMediaAvaliacoes from '../components/GraficoMediaAvaliacoes';
import PopupNotificacao from '../components/PopupNotificacao';
import Botao from '../components/Botao'; // Importar Botao
import CampoEntrada from '../components/CampoEntrada'; // Importar CampoEntrada
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import styles from './TelaAdminDashboard.module.css'; // Importando o CSS module local

const API_BASE_URL = 'http://localhost:3001/api';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0', '#FF5733', '#C70039']; // Mais cores

const TelaAdminDashboard = ({ navigateTo }) => {
    const { usuario, autenticado, token } = useAuth();
    const [notificacao, setNotificacao] = useState({ visivel: false, mensagem: '', tipo: '' });
    const [relatorioUrl, setRelatorioUrl] = useState(null);
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [instituicoes, setInstituicoes] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [filtroInstituicao, setFiltroInstituicao] = useState('');
    const [filtroCurso, setFiltroCurso] = useState('');
    const [filtroCidade, setFiltroCidade] = useState('');
    const [filtroData, setFiltroData] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [intervaloReavaliacao, setIntervaloReavaliacao] = useState(6);
    const [carregandoConfig, setCarregandoConfig] = useState(false);
    const [novoIntervaloInput, setNovoIntervaloInput] = useState(String(intervaloReavaliacao));

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        setNovoIntervaloInput(String(intervaloReavaliacao));
    }, [intervaloReavaliacao]);


    useEffect(() => {
        if (!autenticado || !usuario?.admin) {
            setNotificacao({ visivel: true, mensagem: 'Acesso restrito ao administrador.', tipo: 'erro' });
            setTimeout(() => navigateTo('home'), 2000);
            return; // Adicionado return para evitar execuções desnecessárias
        }
        // else é desnecessário aqui por causa do return
        fetchAvaliacoes(); // Chamada inicial
        fetchInstituicoes();
        fetchCursos();
        fetchConfig();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autenticado, usuario, navigateTo]); // Removido token se não usado diretamente no useEffect mas sim nas chamadas

    const mostrarNotificacao = (mensagem, tipo = 'info', duracao = 4000) => {
        setNotificacao({ visivel: true, mensagem, tipo });
        setTimeout(() => setNotificacao({ visivel: false, mensagem: '', tipo: '' }), duracao);
    };

    const fetchAvaliacoes = async () => {
        setCarregando(true);
        try {
            let url = `${API_BASE_URL}/avaliacoes`;
            const params = new URLSearchParams(); // Usar URLSearchParams para construir query string
            if (filtroInstituicao) params.append('instituicao', filtroInstituicao);
            if (filtroData) params.append('data', filtroData);
            if (filtroCurso) params.append('curso', filtroCurso);
            if (filtroCidade) params.append('cidade', filtroCidade);

            const queryString = params.toString();
            if (queryString) url += '?' + queryString;

            const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) {
                setAvaliacoes(data.avaliacoes);
            } else {
                mostrarNotificacao(data.message || 'Erro ao buscar avaliações', 'erro');
            }
        } catch (e) {
            mostrarNotificacao('Erro de conexão ao buscar avaliações.', 'erro');
        }
        setCarregando(false);
    };

    // Chamar fetchAvaliacoes quando filtros mudarem
    useEffect(() => {
        if (autenticado && usuario?.admin) { // Evitar chamar na montagem inicial antes da verificação de admin
            fetchAvaliacoes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtroInstituicao, filtroData, filtroCurso, filtroCidade]);


    const fetchInstituicoes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/instituicoes`);
            const data = await response.json();
            if (data.success) setInstituicoes(data.instituicoes);
        } catch { /* Silencioso ou log */ }
    };

    const fetchCursos = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/instituicoes/cursos`); // Ajustado para a rota correta (assumindo que é /api/instituicoes/cursos)
            const data = await response.json();
            if (data.success) setCursos(data.cursos);
        } catch { /* Silencioso ou log */ }
    };

    const fetchConfig = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/relatorios/config/reavaliacao`);
            const data = await response.json();
            if (data.success && data.meses) {
                setIntervaloReavaliacao(data.meses);
                setNovoIntervaloInput(String(data.meses));
            }
        } catch { /* Silencioso ou log */ }
    };

    const salvarConfig = async () => {
        const mesesNum = Number(novoIntervaloInput);
        if (isNaN(mesesNum) || mesesNum < 1) {
            mostrarNotificacao('Intervalo inválido. Insira um número de meses maior ou igual a 1.', 'erro');
            return;
        }
        setCarregandoConfig(true);
        try {
            const response = await fetch(`${API_BASE_URL}/relatorios/config/reavaliacao`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ meses: mesesNum })
            });
            const data = await response.json();
            if (data.success) {
                setIntervaloReavaliacao(data.meses);
                mostrarNotificacao('Configuração salva com sucesso!', 'sucesso');
            } else {
                mostrarNotificacao(data.message || 'Erro ao salvar configuração.', 'erro');
            }
        } catch {
            mostrarNotificacao('Erro de conexão ao salvar configuração.', 'erro');
        }
        setCarregandoConfig(false);
    };

    const exportarCSV = async () => {
        setCarregando(true);
        try {
            const response = await fetch(`${API_BASE_URL}/relatorios/avaliacoes/download-csv`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'relatorio_avaliacoes_completo.csv';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                setRelatorioUrl(null); // Limpa se já existia
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Erro ao exportar dados.' }));
                mostrarNotificacao(errorData.message || 'Erro ao exportar dados.', 'erro');
            }
        } catch (err) {
            mostrarNotificacao('Falha na conexão ao tentar exportar dados.', 'erro');
        }
        setCarregando(false);
    };

    const notasCount = [1, 2, 3, 4, 5].map(nota => ({
        name: `${nota} estrela${nota > 1 ? 's' : ''}`,
        value: avaliacoes.filter(a => a.avaliacao === nota).length
    }));
    const totalAvaliacoes = avaliacoes.length;

    const instituicaoCount = {};
    avaliacoes.forEach(a => {
        const nomeInst = a.instituicao || a.fk_instituicao || 'Desconhecida';
        instituicaoCount[nomeInst] = (instituicaoCount[nomeInst] || 0) + 1;
    });
    const instituicaoData = Object.entries(instituicaoCount)
        .map(([name, value]) => ({ name, value, percent: totalAvaliacoes > 0 ? ((value / totalAvaliacoes) * 100).toFixed(1) : 0 }))
        .sort((a, b) => b.value - a.value) // Ordena para melhor visualização no gráfico de pizza
        .slice(0, 7); // Limita a 7 fatias para não poluir o gráfico, por exemplo


    if (!autenticado || !usuario?.admin) return null;

    return (
        <div className={`max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 mt-8 mb-12 transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />

            <div className={`bg-white p-6 sm:p-8 rounded-xl shadow-2xl ${styles.dashboardBg}`}>
                <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-200">Painel Administrativo</h2>

                <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Filtros de Relatório</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <CampoEntrada
                            id="filtroInstituicao"
                            label="Instituição"
                            valor={filtroInstituicao}
                            aoMudar={e => setFiltroInstituicao(e.target.value)}
                        >
                            <select value={filtroInstituicao} onChange={e => setFiltroInstituicao(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                <option value="">Todas</option>
                                {instituicoes.map(inst => <option key={inst.pk_instituicao} value={inst.pk_instituicao}>{inst.pk_instituicao}</option>)}
                            </select>
                        </CampoEntrada>
                        <CampoEntrada
                            id="filtroCurso"
                            label="Curso"
                            valor={filtroCurso}
                            aoMudar={e => setFiltroCurso(e.target.value)}
                        >
                            <select value={filtroCurso} onChange={e => setFiltroCurso(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                <option value="">Todos</option>
                                {cursos.map(curso => <option key={curso.pk_curso} value={curso.pk_curso}>{curso.pk_curso}</option>)}
                            </select>
                        </CampoEntrada>
                        <CampoEntrada id="filtroCidade" label="Cidade" valor={filtroCidade} aoMudar={e => setFiltroCidade(e.target.value)} placeholder="Filtrar por cidade" />
                        <CampoEntrada id="filtroData" label="Data da Avaliação" tipo="date" valor={filtroData} aoMudar={e => setFiltroData(e.target.value)} />
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-gray-50 p-6 rounded-xl shadow-lg animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Distribuição de Notas</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={notasCount} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#4A5568' }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#4A5568' }} />
                                <Tooltip wrapperStyle={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '0.5rem', border: '1px solid #ddd' }} />
                                <Bar dataKey="value" fill="#3B82F6" name="Quantidade" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-3 text-sm text-gray-600 text-center">Total de avaliações: {totalAvaliacoes}</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl shadow-lg animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Avaliações por Instituição (Top 7)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={instituicaoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={entry => `${entry.name}: ${entry.percent}%`} labelLine={false}
                                    isAnimationActive={true}
                                >
                                    {instituicaoData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percent}%)`, name]} wrapperStyle={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '0.5rem', border: '1px solid #ddd' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mb-10 p-6 bg-gray-50 rounded-xl shadow-lg animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                    <GraficoMediaAvaliacoes />
                </div>

                <div className="mb-10 p-6 bg-gray-50 rounded-xl shadow-lg animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Configuração do Intervalo de Reavaliação</h3>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <CampoEntrada
                            id="intervaloReavaliacao"
                            label="Intervalo (meses):"
                            tipo="number"
                            valor={novoIntervaloInput}
                            aoMudar={e => setNovoIntervaloInput(e.target.value)}
                            classeAdicionalInput="w-full sm:w-28"
                        />
                        <Botao aoClicar={salvarConfig} variante="primario" carregando={carregandoConfig} classeAdicional="w-full sm:w-auto mt-2 sm:mt-0">
                            Salvar Intervalo
                        </Botao>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Define de quanto em quanto tempo o usuário pode reavaliar uma instituição.</p>
                </div>

                <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-700">Relatório Dinâmico de Avaliações</h3>
                        <Botao aoClicar={exportarCSV} variante="sucesso" carregando={carregando && relatorioUrl === null} classeAdicional="text-sm py-2 px-3">
                            Exportar CSV Completo
                        </Botao>
                    </div>
                    {carregando && avaliacoes.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-2 text-gray-600">Carregando avaliações...</p>
                        </div>
                    ) : avaliacoes.length > 0 ? (
                        <div className="overflow-x-auto bg-white rounded-lg shadow">
                            <table className="min-w-full border-collapse text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {['Instituição', 'Curso', 'Cidade', 'Usuário', 'Nota', 'Comentário', 'Data'].map(header => (
                                            <th key={header} className="border-b border-gray-200 px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {avaliacoes.map((a, idx) => (
                                        <tr key={a.pk_id_avaliacao || idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="border-b border-gray-200 px-4 py-3 whitespace-nowrap">{a.instituicao || a.fk_instituicao}</td>
                                            <td className="border-b border-gray-200 px-4 py-3 whitespace-nowrap">{a.curso || '-'}</td>
                                            <td className="border-b border-gray-200 px-4 py-3 whitespace-nowrap">{a.cidade || '-'}</td>
                                            <td className="border-b border-gray-200 px-4 py-3 whitespace-nowrap">{a.nome_usuario || 'Anônimo'}</td>
                                            <td className="border-b border-gray-200 px-4 py-3 text-center">{a.avaliacao}</td>
                                            <td className="border-b border-gray-200 px-4 py-3 min-w-[200px] max-w-xs truncate" title={a.texto}>{a.texto}</td>
                                            <td className="border-b border-gray-200 px-4 py-3 whitespace-nowrap">{new Date(a.data_avaliacao).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-6 italic">Nenhuma avaliação encontrada para os filtros selecionados.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TelaAdminDashboard;