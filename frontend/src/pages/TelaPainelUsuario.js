// frontend/src/pages/TelaPainelUsuario.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import CampoEntrada from '../components/CampoEntrada';
import Botao from '../components/Botao';
import PopupNotificacao from '../components/PopupNotificacao';
import styles from './TelaPainelUsuario.module.css';

const API_BASE_URL = 'http://localhost:3001/api';

const TelaPainelUsuario = ({ navigateTo }) => {
    const { usuario, autenticado, token, logout } = useAuth(); // Adicionado logout para exemplo
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(true);
    const [editando, setEditando] = useState(false);
    const [form, setForm] = useState({ nome: '', telefone: '' });
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [notificacao, setNotificacao] = useState({ visivel: false, mensagem: '', tipo: '' });
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);
    const [reavaliandoId, setReavaliandoId] = useState(null); // ID da instituição sendo reavaliada
    const [novaReavaliacao, setNovaReavaliacao] = useState({ texto: '', nota: 5 });
    const [intervaloReavaliacao, setIntervaloReavaliacao] = useState(6);
    const isAdmin = usuario?.admin;

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        if (!autenticado) {
            navigateTo('login');
            return;
        }
        if (usuario) {
            setForm({ nome: usuario.nome || '', telefone: usuario.telefone || '' });
        }

        const fetchAvaliacoes = async () => {
            if (!usuario?.pk_Ra) return;
            setCarregandoAvaliacoes(true);
            try {
                const response = await fetch(`${API_BASE_URL}/avaliacoes/usuario/${usuario.pk_Ra}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) setAvaliacoes(data.avaliacoes);
                else mostrarNotificacao(data.message || 'Erro ao buscar avaliações.', 'erro');
            } catch (e) {
                mostrarNotificacao('Erro de conexão ao buscar avaliações.', 'erro');
            }
            setCarregandoAvaliacoes(false);
        };

        const fetchConfig = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/relatorios/config/reavaliacao`); // Rota do backend
                const data = await response.json();
                if (data.success && data.meses) setIntervaloReavaliacao(data.meses);
            } catch {
                console.warn("Não foi possível buscar configuração de reavaliação.");
            }
        };

        fetchAvaliacoes();
        fetchConfig();
    }, [autenticado, usuario, token, navigateTo]);

    const mostrarNotificacao = (mensagem, tipo = 'info', duracao = 4000) => {
        setNotificacao({ visivel: true, mensagem, tipo });
        setTimeout(() => setNotificacao({ visivel: false, mensagem: '', tipo: '' }), duracao);
    };

    const handleEdit = () => setEditando(true);
    const handleCancel = () => {
        setEditando(false);
        setForm({ nome: usuario?.nome || '', telefone: usuario?.telefone || '' });
        setSenhaAtual('');
        setNovaSenha('');
    };

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
                mostrarNotificacao(data.message, 'sucesso');
                setEditando(false);
                // Idealmente, o AuthContext seria atualizado aqui ou o backend retornaria o usuário atualizado
            } else {
                mostrarNotificacao(data.message, 'erro');
            }
        } catch {
            mostrarNotificacao('Erro ao atualizar perfil.', 'erro');
        }
        setCarregandoEdicao(false);
    };

    const exportarCSV = async () => {
        // ... (código existente)
    };

    const podeReavaliar = (instituicaoAvalidada) => {
        const ultimaAvaliacaoParaInstituicao = avaliacoes
            .filter(a => (a.instituicao || a.fk_instituicao) === instituicaoAvalidada.instituicaoNome) // Use o nome da instituição ou ID conforme seu modelo
            .sort((a, b) => new Date(b.data_avaliacao) - new Date(a.data_avaliacao))[0];

        if (!ultimaAvaliacaoParaInstituicao) return true; // Nenhuma avaliação anterior para esta instituição

        const dataUltima = new Date(ultimaAvaliacaoParaInstituicao.data_avaliacao);
        const agora = new Date();
        const diffMeses = (agora.getFullYear() - dataUltima.getFullYear()) * 12 + (agora.getMonth() - dataUltima.getMonth());

        return diffMeses >= intervaloReavaliacao;
    };

    const handleReavaliarClick = (instituicaoId) => {
        setReavaliandoId(instituicaoId); // Armazena o ID da instituição que está sendo reavaliada
        setNovaReavaliacao({ texto: '', nota: 5 }); // Reseta o formulário de reavaliação
    };

    const enviarReavaliacao = async (instituicaoIdParaReavaliar) => {
        setCarregandoEdicao(true);
        try {
            const response = await fetch(`${API_BASE_URL}/avaliacoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    fk_instituicao: instituicaoIdParaReavaliar,
                    texto: novaReavaliacao.texto,
                    avaliacao: novaReavaliacao.nota
                })
            });
            const data = await response.json();
            if (data.success) {
                mostrarNotificacao('Reavaliação enviada com sucesso!', 'sucesso');
                setReavaliandoId(null);
                setNovaReavaliacao({ texto: '', nota: 5 });
                // Re-buscar avaliações
                const response2 = await fetch(`${API_BASE_URL}/avaliacoes/usuario/${usuario?.pk_Ra}`, { headers: { 'Authorization': `Bearer ${token}` } });
                const data2 = await response2.json();
                if (data2.success) setAvaliacoes(data2.avaliacoes);
            } else {
                mostrarNotificacao(data.message || 'Erro ao reavaliar.', 'erro');
            }
        } catch {
            mostrarNotificacao('Erro de conexão ao reavaliar.', 'erro');
        }
        setCarregandoEdicao(false);
    };

    if (!autenticado || !usuario) return null; // ou um loader de página inteira

    return (
        <div className={styles.painelUsuarioBg + ` max-w-3xl mx-auto p-6 sm:p-8 mt-8 mb-12 transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />

            <div className={styles.painelUsuarioCard + " bg-white p-8 rounded-xl shadow-2xl mb-8"}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 className={styles.tituloDestaque} style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
                        Painel do Usuário
                    </h2>
                    {isAdmin && (
                        <Botao tipo="button" variante="sucesso" aoClicar={exportarCSV} classeAdicional="w-full sm:w-auto">
                            Exportar Dados (CSV)
                        </Botao>
                    )}
                </div>

                {editando ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.7s' }}>
                        <CampoEntrada id="nome" name="nome" label="Nome" valor={form.nome} aoMudar={handleChange} />
                        <CampoEntrada id="telefone" name="telefone" label="Telefone" valor={form.telefone} aoMudar={handleChange} />
                        <hr style={{ margin: '1.5rem 0' }} />
                        <p style={{ fontSize: '1rem', color: '#475569' }}>Deixe os campos de senha em branco se não deseja alterá-la.</p>
                        <CampoEntrada id="senhaAtual" name="senhaAtual" label="Senha Atual" tipo="password" valor={senhaAtual} aoMudar={e => setSenhaAtual(e.target.value)} />
                        <CampoEntrada id="novaSenha" name="novaSenha" label="Nova Senha" tipo="password" valor={novaSenha} aoMudar={e => setNovaSenha(e.target.value)} />
                        <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
                            <Botao tipo="submit" variante="primario" classeAdicional={styles.pulseBtn + " flex-1 sm:flex-none"} carregando={carregandoEdicao}>
                                Salvar Alterações
                            </Botao>
                            <Botao tipo="button" variante="secundario" aoClicar={handleCancel} classeAdicional="flex-1 sm:flex-none">Cancelar</Botao>
                        </div>
                    </form>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.7s' }}>
                        <p><strong>Nome:</strong> {usuario.nome}</p>
                        <p><strong>Email:</strong> {usuario.email}</p>
                        <p><strong>Telefone:</strong> {usuario.telefone || <span style={{ fontStyle: 'italic', color: '#64748b' }}>Não informado</span>}</p>
                        <p><strong>Instituição:</strong> {usuario.fk_instituicao || <span style={{ fontStyle: 'italic', color: '#64748b' }}>Não informada</span>}</p>
                        <p><strong>Curso:</strong> {usuario.fk_curso || <span style={{ fontStyle: 'italic', color: '#64748b' }}>Não informado</span>}</p>
                        <div style={{ paddingTop: '1rem' }}>
                            <Botao tipo="button" variante="primario" aoClicar={handleEdit}>Editar Perfil</Botao>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.painelUsuarioCard + " bg-white p-8 rounded-xl shadow-2xl"}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>Suas Avaliações</h3>
                {carregandoAvaliacoes ? (
                    <div className="text-center" style={{ padding: '2rem 0' }}>
                        <svg style={{ animation: 'spin 1s linear infinite', height: '2rem', width: '2rem', color: '#2563eb', display: 'block', margin: '0 auto' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p style={{ marginTop: '0.5rem', color: '#475569' }}>Carregando suas avaliações...</p>
                    </div>
                ) : (
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {avaliacoes.length === 0 ? (
                            <li className="text-center text-gray-500 py-6 italic">Nenhuma avaliação encontrada.</li>
                        ) :
                            avaliacoes.map((aval, index) => (
                                <li key={aval.pk_id_avaliacao} className={`p-5 bg-gray-50 rounded-lg shadow-md border border-gray-200 opacity-0 animate-fadeInUp`} style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-lg font-semibold text-blue-700">{aval.instituicao || aval.fk_instituicao}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${aval.avaliacao >= 4 ? 'bg-green-100 text-green-700' : aval.avaliacao === 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                            Nota: {aval.avaliacao}/5
                                        </span>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed mb-2">{aval.texto}</p>
                                    <p className="text-xs text-gray-500">Avaliado em: {new Date(aval.data_avaliacao).toLocaleDateString()}</p>

                                    {podeReavaliar(aval) && ( // Ajuste `aval` para o objeto correto que `podeReavaliar` espera
                                        <Botao tipo="button" variante="sucesso" aoClicar={() => handleReavaliarClick(aval.instituicao || aval.fk_instituicao)} classeAdicional="mt-3 text-xs py-1 px-3">
                                            Reavaliar esta Instituição
                                        </Botao>
                                    )}

                                    {reavaliandoId === (aval.instituicao || aval.fk_instituicao) && (
                                        <form onSubmit={e => { e.preventDefault(); enviarReavaliacao(aval.instituicao || aval.fk_instituicao); }} className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200 animate-fadeInDown space-y-3" style={{ animationDuration: '0.3s' }}>
                                            <h5 className="text-md font-semibold text-gray-700">Nova Avaliação para {aval.instituicao || aval.fk_instituicao}:</h5>
                                            <CampoEntrada
                                                id={`novaReavaliacaoTexto-${aval.pk_id_avaliacao}`}
                                                tipo="textarea"
                                                label="Comentário da Reavaliação"
                                                valor={novaReavaliacao.texto}
                                                aoMudar={e => setNovaReavaliacao(f => ({ ...f, texto: e.target.value }))}
                                                classeAdicionalInput="min-h-[50px]"
                                            />
                                            <div className="flex items-center">
                                                <label htmlFor={`novaReavaliacaoNota-${aval.pk_id_avaliacao}`} className="mr-2 text-sm font-medium text-gray-700">Nova Nota:</label>
                                                <select
                                                    id={`novaReavaliacaoNota-${aval.pk_id_avaliacao}`}
                                                    className="border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                                    value={novaReavaliacao.nota}
                                                    onChange={e => setNovaReavaliacao(f => ({ ...f, nota: Number(e.target.value) }))}
                                                >
                                                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} {n > 1 ? "Estrelas" : "Estrela"}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Botao tipo="submit" variante="primario" carregando={carregandoEdicao} classeAdicional="text-sm">Enviar Reavaliação</Botao>
                                                <Botao tipo="button" variante="secundario" aoClicar={() => setReavaliandoId(null)} classeAdicional="text-sm">Cancelar</Botao>
                                            </div>
                                        </form>
                                    )}
                                </li>
                            ))
                        }
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TelaPainelUsuario;