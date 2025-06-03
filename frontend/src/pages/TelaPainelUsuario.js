import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import CampoEntrada from '../components/CampoEntrada';
import Botao from '../components/Botao';
import PopupNotificacao from '../components/PopupNotificacao';

const API_BASE_URL = 'http://localhost:3001/api';

const TelaPainelUsuario = ({ navigateTo }) => {
    const { usuario, autenticado, token } = useAuth();
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [editando, setEditando] = useState(false);
    const [form, setForm] = useState({ nome: usuario?.nome || '', telefone: usuario?.telefone || '' });
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [notificacao, setNotificacao] = useState({ visivel: false, mensagem: '', tipo: '' });
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);
    const [reavaliandoId, setReavaliandoId] = useState(null);
    const [novaReavaliacao, setNovaReavaliacao] = useState({ texto: '', nota: 5 });
    const [intervaloReavaliacao, setIntervaloReavaliacao] = useState(6); // meses, padrão 6
    const isAdmin = usuario?.admin;

    useEffect(() => {
        if (!autenticado) {
            navigateTo('login');
            return;
        }
        // Buscar avaliações do usuário
        const fetchAvaliacoes = async () => {
            setCarregando(true);
            try {
                // Exemplo: supondo que backend tenha rota /api/avaliacoes/usuario/:ra
                const response = await fetch(`${API_BASE_URL}/avaliacoes/usuario/${usuario?.pk_Ra}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) setAvaliacoes(data.avaliacoes);
            } catch (e) { }
            setCarregando(false);
        };
        fetchAvaliacoes();
        // Buscar configuração do intervalo de reavaliação
        const fetchConfig = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/config/reavaliacao`);
                const data = await response.json();
                if (data.success && data.meses) setIntervaloReavaliacao(data.meses);
            } catch { }
        };
        fetchConfig();
    }, [autenticado, usuario, token, navigateTo]);

    const handleEdit = () => setEditando(true);
    const handleCancel = () => { setEditando(false); setForm({ nome: usuario?.nome || '', telefone: usuario?.telefone || '' }); setSenhaAtual(''); setNovaSenha(''); };

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setCarregandoEdicao(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/editar-perfil`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nome: form.nome, telefone: form.telefone, senhaAtual, novaSenha })
            });
            const data = await response.json();
            if (data.success) {
                setNotificacao({ visivel: true, mensagem: data.message, tipo: 'sucesso' });
                setEditando(false);
            } else {
                setNotificacao({ visivel: true, mensagem: data.message, tipo: 'erro' });
            }
        } catch {
            setNotificacao({ visivel: true, mensagem: 'Erro ao atualizar perfil.', tipo: 'erro' });
        }
        setCarregandoEdicao(false);
    };

    const exportarCSV = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/relatorios/avaliacoes/download-csv', {
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
            } else {
                setNotificacao({ visivel: true, mensagem: 'Apenas administradores podem exportar dados.', tipo: 'erro' });
            }
        } catch {
            setNotificacao({ visivel: true, mensagem: 'Erro ao exportar dados.', tipo: 'erro' });
        }
    };

    const podeReavaliar = (dataAval, instId) => {
        // Permite reavaliar se já passou o intervalo configurado desde a última avaliação para a instituição
        const ultima = avaliacoes.filter(a => (a.instituicao || a.fk_instituicao) === instId)
            .sort((a, b) => new Date(b.data_avaliacao) - new Date(a.data_avaliacao))[0];
        if (!ultima) return true;
        const dataUltima = new Date(ultima.data_avaliacao);
        const agora = new Date();
        const diffMeses = (agora.getFullYear() - dataUltima.getFullYear()) * 12 + (agora.getMonth() - dataUltima.getMonth());
        return diffMeses >= intervaloReavaliacao;
    };

    const handleReavaliar = (instId) => {
        setReavaliandoId(instId);
        setNovaReavaliacao({ texto: '', nota: 5 });
    };

    const enviarReavaliacao = async (instId) => {
        setCarregandoEdicao(true);
        try {
            const response = await fetch(`${API_BASE_URL}/avaliacoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ fk_instituicao: instId, texto: novaReavaliacao.texto, avaliacao: novaReavaliacao.nota })
            });
            const data = await response.json();
            if (data.success) {
                setNotificacao({ visivel: true, mensagem: 'Reavaliação enviada com sucesso!', tipo: 'sucesso' });
                setReavaliandoId(null);
                setNovaReavaliacao({ texto: '', nota: 5 });
                // Atualiza avaliações
                const response2 = await fetch(`${API_BASE_URL}/avaliacoes/usuario/${usuario?.pk_Ra}`, { headers: { 'Authorization': `Bearer ${token}` } });
                const data2 = await response2.json();
                if (data2.success) setAvaliacoes(data2.avaliacoes);
            } else {
                setNotificacao({ visivel: true, mensagem: data.message || 'Erro ao reavaliar.', tipo: 'erro' });
            }
        } catch {
            setNotificacao({ visivel: true, mensagem: 'Erro ao reavaliar.', tipo: 'erro' });
        }
        setCarregandoEdicao(false);
    };

    if (!autenticado) return null;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />
            <h2 className="text-2xl font-bold mb-4">Painel do Usuário</h2>
            {isAdmin && (
                <Botao tipo="button" variante="sucesso" aoClicar={exportarCSV} classeAdicional="mb-4">Exportar Dados (CSV)</Botao>
            )}
            <div className="mb-6">
                {editando ? (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <CampoEntrada id="nome" name="nome" label="Nome" valor={form.nome} aoMudar={handleChange} />
                        <CampoEntrada id="telefone" name="telefone" label="Telefone" valor={form.telefone} aoMudar={handleChange} />
                        <CampoEntrada id="senhaAtual" name="senhaAtual" label="Senha Atual (para trocar senha)" tipo="password" valor={senhaAtual} aoMudar={e => setSenhaAtual(e.target.value)} />
                        <CampoEntrada id="novaSenha" name="novaSenha" label="Nova Senha" tipo="password" valor={novaSenha} aoMudar={e => setNovaSenha(e.target.value)} />
                        <div className="flex gap-2">
                            <Botao tipo="submit" variante="primario" carregando={carregandoEdicao}>Salvar</Botao>
                            <Botao tipo="button" variante="secundario" aoClicar={handleCancel}>Cancelar</Botao>
                        </div>
                    </form>
                ) : (
                    <>
                        <p><strong>Nome:</strong> {usuario?.nome}</p>
                        <p><strong>Email:</strong> {usuario?.email}</p>
                        <p><strong>Telefone:</strong> {usuario?.telefone || '-'}</p>
                        <p><strong>Instituição:</strong> {usuario?.fk_instituicao}</p>
                        <p><strong>Curso:</strong> {usuario?.fk_curso}</p>
                        <Botao tipo="button" variante="primario" aoClicar={handleEdit} classeAdicional="mt-2">Editar Perfil</Botao>
                    </>
                )}
            </div>
            <h3 className="text-xl font-semibold mb-2">Suas Avaliações</h3>
            {carregando ? <p>Carregando...</p> : (
                <ul className="divide-y divide-gray-200">
                    {avaliacoes.length === 0 ? <li>Nenhuma avaliação encontrada.</li> :
                        avaliacoes.map(aval => (
                            <li key={aval.pk_id_avaliacao} className="py-2">
                                <p><strong>Instituição:</strong> {aval.instituicao || aval.fk_instituicao}</p>
                                <p><strong>Nota:</strong> {aval.avaliacao}/5</p>
                                <p>{aval.texto}</p>
                                <p className="text-xs text-gray-500">{new Date(aval.data_avaliacao).toLocaleDateString()}</p>
                                {podeReavaliar(aval.data_avaliacao, aval.instituicao || aval.fk_instituicao) && (
                                    <Botao tipo="button" variante="sucesso" aoClicar={() => handleReavaliar(aval.instituicao || aval.fk_instituicao)} classeAdicional="mt-2">Reavaliar</Botao>
                                )}
                                {reavaliandoId === (aval.instituicao || aval.fk_instituicao) && (
                                    <form onSubmit={e => { e.preventDefault(); enviarReavaliacao(aval.instituicao || aval.fk_instituicao); }} className="mt-2 p-2 bg-gray-50 rounded">
                                        <CampoEntrada id="novaReavaliacaoTexto" label="Nova avaliação" valor={novaReavaliacao.texto} aoMudar={e => setNovaReavaliacao(f => ({ ...f, texto: e.target.value }))} />
                                        <div className="flex items-center mb-2">
                                            <span className="mr-2">Nota:</span>
                                            <select className="border rounded p-1" value={novaReavaliacao.nota} onChange={e => setNovaReavaliacao(f => ({ ...f, nota: Number(e.target.value) }))}>
                                                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <Botao tipo="submit" variante="primario" carregando={carregandoEdicao}>Enviar Reavaliação</Botao>
                                            <Botao tipo="button" variante="secundario" aoClicar={() => setReavaliandoId(null)}>Cancelar</Botao>
                                        </div>
                                    </form>
                                )}
                            </li>
                        ))
                    }
                </ul>
            )}
        </div>
    );
};

export default TelaPainelUsuario;
