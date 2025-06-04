// frontend/src/pages/TelaCadastro.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import CampoEntrada from '../components/CampoEntrada';
import Botao from '../components/Botao';
import PopupNotificacao from '../components/PopupNotificacao';
import styles from './TelaCadastro.module.css'; // Importa o CSS module

const TelaCadastro = ({ navigateTo }) => {
    const [formData, setFormData] = useState({
        nome: '', idade: '', rg: '', telefone: '', email: '',
        instituicao: '', curso: '', cidade: '', estado: '',
        periodo: 'matutino', senha: '', confirmarSenha: '', termos: false,
    });
    const [erros, setErros] = useState({});
    // const [mostrarSenha, setMostrarSenha] = useState(false); // Removido, CampoEntrada gerencia isso
    const [notificacao, setNotificacao] = useState({ visivel: false, mensagem: '', tipo: '' });
    const [carregando, setCarregando] = useState(false);
    const { cadastro } = useAuth();

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const mostrarNotificacao = (mensagem, tipo = 'info', duracao = 5000) => {
        setNotificacao({ visivel: true, mensagem, tipo });
        setTimeout(() => setNotificacao({ visivel: false, mensagem: '', tipo: '' }), duracao);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (erros[name]) setErros(prev => ({ ...prev, [name]: null }));
    };

    const validarCampos = () => {
        const novosErros = {};
        if (!formData.nome.trim()) novosErros.nome = 'Nome é obrigatório.';
        if (!formData.email.trim()) novosErros.email = 'E-mail é obrigatório.';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) novosErros.email = 'E-mail inválido.';
        if (!formData.senha) novosErros.senha = 'Senha é obrigatória.';
        else if (formData.senha.length < 8) novosErros.senha = 'Senha deve ter no mínimo 8 caracteres.';
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{8,}$/.test(formData.senha)) {
            novosErros.senha = 'Senha fraca. Use letras maiúsculas, minúsculas, números e símbolos.';
        }
        if (formData.senha !== formData.confirmarSenha) novosErros.confirmarSenha = 'As senhas não conferem.';
        if (!formData.instituicao.trim()) novosErros.instituicao = 'Instituição é obrigatória.';
        if (!formData.curso.trim()) novosErros.curso = 'Curso é obrigatório.';
        if (!formData.termos) novosErros.termos = 'Você deve aceitar os termos e condições.';
        if (!formData.idade) novosErros.idade = "Idade é obrigatória.";
        else if (isNaN(formData.idade) || Number(formData.idade) <= 10 || Number(formData.idade) > 120) novosErros.idade = "Idade inválida (entre 11 e 120).";

        // Validação de RG (opcional, mas se preenchido, um formato simples)
        if (formData.rg && !/^\d{5,15}$/.test(formData.rg.replace(/\D/g, ''))) { // Exemplo: 5 a 15 dígitos
            novosErros.rg = 'RG inválido (apenas números, se preenchido).';
        }
        // Validação de Telefone (opcional, mas se preenchido, um formato simples)
        if (formData.telefone && !/^\d{10,11}$/.test(formData.telefone.replace(/\D/g, ''))) { // Exemplo: 10 ou 11 dígitos
            novosErros.telefone = 'Telefone inválido (apenas números, se preenchido).';
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarCampos()) {
            const primeiroErro = Object.keys(erros).find(key => erros[key]);
            if (primeiroErro) {
                const el = document.getElementById(primeiroErro);
                el?.focus();
            }
            mostrarNotificacao('Por favor, corrija os erros no formulário.', 'erro');
            return;
        }
        setCarregando(true);
        const { confirmarSenha, ...dadosParaEnviar } = formData; // Não enviar confirmarSenha
        const resultado = await cadastro(dadosParaEnviar);
        setCarregando(false);
        if (resultado.success) {
            mostrarNotificacao(resultado.message, 'sucesso');
            setTimeout(() => navigateTo('aguardando-confirmacao', { email: resultado.emailParaConfirmacao }), 3000);
        } else {
            mostrarNotificacao(resultado.message || 'Erro ao realizar cadastro. Tente novamente.', 'erro');
        }
    };

    return (
        <div className={styles.cadastroBg + " min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"}>
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />

            <div className={styles.cadastroDestaque + " sm:mx-auto sm:w-full sm:max-w-2xl transition-all duration-700 ease-out " + (isVisible ? styles.fadeIn : styles.fadeOut)}>
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <h2 className={styles.tituloDestaque} style={{ marginTop: '0.5rem', fontSize: '2.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                        Crie sua Conta
                    </h2>
                    <p style={{ marginTop: '0.5rem', fontSize: '1rem', color: '#475569' }}>
                        É rápido e fácil. Comece a transformar a educação!
                    </p>
                </div>
                <div className={styles.cadastroCard}>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSubmit} noValidate>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 1.5rem' }}>
                            <CampoEntrada id="nome" name="nome" label="Nome Completo" valor={formData.nome} aoMudar={handleChange} erro={erros.nome} autoComplete="name" />
                            <CampoEntrada id="idade" name="idade" label="Idade" tipo="number" valor={formData.idade} aoMudar={handleChange} erro={erros.idade} autoComplete="off" />
                            <CampoEntrada id="rg" name="rg" label="RG (Opcional)" valor={formData.rg} aoMudar={handleChange} erro={erros.rg} autoComplete="off" />
                            <CampoEntrada id="telefone" name="telefone" label="Telefone (Opcional)" tipo="tel" valor={formData.telefone} aoMudar={handleChange} erro={erros.telefone} autoComplete="tel" />
                        </div>
                        <CampoEntrada id="email" name="email" label="E-mail" tipo="email" valor={formData.email} aoMudar={handleChange} erro={erros.email} autoComplete="email" />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 1.5rem' }}>
                            <CampoEntrada id="instituicao" name="instituicao" label="Instituição de Ensino" valor={formData.instituicao} aoMudar={handleChange} erro={erros.instituicao} />
                            <CampoEntrada id="curso" name="curso" label="Curso" valor={formData.curso} aoMudar={handleChange} erro={erros.curso} />
                            <CampoEntrada id="cidade" name="cidade" label="Cidade da Instituição" valor={formData.cidade} aoMudar={handleChange} erro={erros.cidade} />
                            <CampoEntrada id="estado" name="estado" label="Estado (UF)" valor={formData.estado} aoMudar={handleChange} erro={erros.estado} />
                        </div>
                        <div>
                            <label htmlFor="periodo" style={{ display: 'block', fontSize: '1rem', fontWeight: 500, color: '#334155', marginBottom: '0.4rem' }}>Período</label>
                            <select
                                id="periodo"
                                name="periodo"
                                value={formData.periodo}
                                onChange={handleChange}
                                style={{ marginTop: '0.25rem', width: '100%', padding: '0.7rem 1rem', fontSize: '1rem', borderRadius: '0.5rem', border: erros.periodo ? '1px solid #dc2626' : '1px solid #d1d5db', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.04)' }}
                            >
                                <option value="matutino">Matutino</option>
                                <option value="vespertino">Vespertino</option>
                                <option value="noturno">Noturno</option>
                                <option value="integral">Integral</option>
                            </select>
                            {erros.periodo && <p style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#dc2626' }}>{erros.periodo}</p>}
                        </div>
                        <CampoEntrada id="senha" name="senha" label="Senha" tipo="password" valor={formData.senha} aoMudar={handleChange} erro={erros.senha} autoComplete="new-password" />
                        <CampoEntrada id="confirmarSenha" name="confirmarSenha" label="Confirmar Senha" tipo="password" valor={formData.confirmarSenha} aoMudar={handleChange} erro={erros.confirmarSenha} autoComplete="new-password" />

                        {/* Removido o checkbox de mostrar senha pois está integrado no CampoEntrada */}

                        <div style={{ display: 'flex', alignItems: 'start', marginTop: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', height: '1.25rem' }}>
                                <input id="termos" name="termos" type="checkbox" checked={formData.termos} onChange={handleChange} style={{ height: '1rem', width: '1rem', accentColor: '#2563eb', borderRadius: '0.25rem', border: erros.termos ? '1px solid #dc2626' : '1px solid #d1d5db' }} />
                            </div>
                            <div style={{ marginLeft: '0.75rem', fontSize: '1rem' }}>
                                <label htmlFor="termos" style={{ fontWeight: 500, color: '#334155' }}>
                                    Eu li e aceito os <button type="button" onClick={() => alert("Termos e Condições (Simulado - Implementar visualização real)")} style={{ color: '#2563eb', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Termos e Condições</button>.
                                </label>
                                {erros.termos && <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#dc2626' }}>{erros.termos}</p>}
                            </div>
                        </div>
                        <Botao tipo="submit" variante="primario" classeAdicional={styles.pulseBtn + " w-full py-3 text-base"} carregando={carregando}>
                            Cadastrar
                        </Botao>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TelaCadastro;