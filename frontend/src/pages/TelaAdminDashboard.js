import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import GraficoMediaAvaliacoes from '../components/GraficoMediaAvaliacoes';
import PopupNotificacao from '../components/PopupNotificacao';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:3001/api';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0'];

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

    useEffect(() => {
        if (!autenticado || !usuario?.admin) {
            setNotificacao({ visivel: true, mensagem: 'Acesso restrito ao administrador.', tipo: 'erro' });
            setTimeout(() => navigateTo('home'), 2000);
        } else {
            fetchAvaliacoes();
            fetchInstituicoes();
            fetchCursos();
            fetchConfig();
        }
        // eslint-disable-next-line
    }, [autenticado, usuario]);

    const fetchAvaliacoes = async () => {
        setCarregando(true);
        try {
            let url = `${API_BASE_URL}/avaliacoes`;
            const params = [];
            if (filtroInstituicao) params.push(`instituicao=${filtroInstituicao}`);
            if (filtroData) params.push(`data=${filtroData}`);
            if (filtroCurso) params.push(`curso=${filtroCurso}`);
            if (filtroCidade) params.push(`cidade=${filtroCidade}`);
            if (params.length) url += '?' + params.join('&');
            const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) setAvaliacoes(data.avaliacoes);
        } catch { }
        setCarregando(false);
    };

    const fetchInstituicoes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/instituicoes`);
            const data = await response.json();
            if (data.success) setInstituicoes(data.instituicoes);
        } catch { }
    };

    const fetchCursos = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/cursos`);
            const data = await response.json();
            if (data.success) setCursos(data.cursos);
        } catch { }
    };

    const fetchConfig = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/config/reavaliacao`);
            const data = await response.json();
            if (data.success && data.meses) setIntervaloReavaliacao(data.meses);
        } catch { }
    };

    const salvarConfig = async (meses) => {
        setCarregandoConfig(true);
        try {
            const response = await fetch(`${API_BASE_URL}/config/reavaliacao`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ meses })
            });
            const data = await response.json();
            if (data.success) {
                setIntervaloReavaliacao(data.meses);
                setNotificacao({ visivel: true, mensagem: 'Configuração salva!', tipo: 'sucesso' });
            } else {
                setNotificacao({ visivel: true, mensagem: data.message, tipo: 'erro' });
            }
        } catch {
            setNotificacao({ visivel: true, mensagem: 'Erro ao salvar configuração.', tipo: 'erro' });
        }
        setCarregandoConfig(false);
    };

    const exportarCSV = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/relatorios/avaliacoes/download-csv`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                setRelatorioUrl(url);
                setTimeout(() => window.URL.revokeObjectURL(url), 10000);
            } else {
                setNotificacao({ visivel: true, mensagem: 'Erro ao exportar dados.', tipo: 'erro' });
            }
        } catch {
            setNotificacao({ visivel: true, mensagem: 'Erro ao exportar dados.', tipo: 'erro' });
        }
    };

    // Gráfico de distribuição de notas
    const notasCount = [1, 2, 3, 4, 5].map(nota => ({
        name: `${nota} estrelas`,
        value: avaliacoes.filter(a => a.avaliacao === nota).length
    }));
    const totalAvaliacoes = avaliacoes.length;

    // Porcentagem de avaliações por instituição
    const instituicaoCount = {};
    avaliacoes.forEach(a => {
        instituicaoCount[a.instituicao || a.fk_instituicao] = (instituicaoCount[a.instituicao || a.fk_instituicao] || 0) + 1;
    });
    const instituicaoData = Object.entries(instituicaoCount).map(([name, value]) => ({ name, value, percent: ((value / totalAvaliacoes) * 100).toFixed(1) }));

    if (!autenticado || !usuario?.admin) return null;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-8">
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />
            <h2 className="text-2xl font-bold mb-4">Painel Administrativo</h2>
            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <button onClick={exportarCSV} className="bg-green-600 text-white px-4 py-2 rounded">Exportar Relatório CSV</button>
                {relatorioUrl && (
                    <a href={relatorioUrl} download="relatorio_avaliacoes_completo.csv" className="text-blue-600 underline">Clique aqui para baixar o CSV</a>
                )}
                <select value={filtroInstituicao} onChange={e => { setFiltroInstituicao(e.target.value); fetchAvaliacoes(); }} className="border rounded p-2">
                    <option value="">Todas Instituições</option>
                    {instituicoes.map(inst => <option key={inst.pk_instituicao} value={inst.pk_instituicao}>{inst.pk_instituicao}</option>)}
                </select>
                <select value={filtroCurso} onChange={e => { setFiltroCurso(e.target.value); fetchAvaliacoes(); }} className="border rounded p-2">
                    <option value="">Todos Cursos</option>
                    {cursos.map(curso => <option key={curso.pk_curso} value={curso.pk_curso}>{curso.pk_curso}</option>)}
                </select>
                <input type="text" placeholder="Cidade" value={filtroCidade} onChange={e => { setFiltroCidade(e.target.value); fetchAvaliacoes(); }} className="border rounded p-2" />
                <input type="date" value={filtroData} onChange={e => { setFiltroData(e.target.value); fetchAvaliacoes(); }} className="border rounded p-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-2">Distribuição de Notas</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={notasCount} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" name="Quantidade" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-2 text-sm text-gray-600">Total de avaliações: {totalAvaliacoes}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-2">Porcentagem por Instituição</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={instituicaoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={entry => `${entry.name}: ${entry.percent}%`}>
                                {instituicaoData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value, name, props) => [`${value} avaliações`, name]} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="mb-8">
                <GraficoMediaAvaliacoes />
            </div>
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Configuração do Intervalo de Reavaliação</h3>
                <div className="flex gap-2 items-center">
                    <select value={intervaloReavaliacao} onChange={e => salvarConfig(Number(e.target.value))} className="border rounded p-2">
                        <option value={2}>Bimestral (2 meses)</option>
                        <option value={3}>Trimestral (3 meses)</option>
                        <option value={6}>Semestral (6 meses)</option>
                        <option value={12}>Anual (12 meses)</option>
                        <option value={intervaloReavaliacao}>Outro ({intervaloReavaliacao} meses)</option>
                    </select>
                    <input type="number" min={1} value={intervaloReavaliacao} onChange={e => salvarConfig(Number(e.target.value))} className="border rounded p-2 w-24" />
                    {carregandoConfig && <span className="text-xs text-gray-500">Salvando...</span>}
                </div>
                <p className="text-xs text-gray-600 mt-1">O intervalo define de quanto em quanto tempo o usuário pode reavaliar uma instituição.</p>
            </div>
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Relatório Dinâmico</h3>
                {carregando ? <p>Carregando...</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border text-xs">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-2 py-1">Instituição</th>
                                    <th className="border px-2 py-1">Curso</th>
                                    <th className="border px-2 py-1">Cidade</th>
                                    <th className="border px-2 py-1">Usuário</th>
                                    <th className="border px-2 py-1">Nota</th>
                                    <th className="border px-2 py-1">Comentário</th>
                                    <th className="border px-2 py-1">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {avaliacoes.map((a, idx) => (
                                    <tr key={idx}>
                                        <td className="border px-2 py-1">{a.instituicao || a.fk_instituicao}</td>
                                        <td className="border px-2 py-1">{a.curso || '-'}</td>
                                        <td className="border px-2 py-1">{a.cidade || '-'}</td>
                                        <td className="border px-2 py-1">{a.nome_usuario || 'Anônimo'}</td>
                                        <td className="border px-2 py-1">{a.avaliacao}</td>
                                        <td className="border px-2 py-1">{a.texto}</td>
                                        <td className="border px-2 py-1">{new Date(a.data_avaliacao).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TelaAdminDashboard;
