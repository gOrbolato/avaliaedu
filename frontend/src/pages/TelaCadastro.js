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

            <div className={`sm:mx-auto sm:w-full sm:max-w-2xl transition-all duration-700 ease-out ${isVisible ? styles.fadeIn : styles.fadeOut}`}>
                <div className="text-center mb-8">
                    <h2 className="mt-2 text-4xl font-bold text-blue-600">
                        Crie sua Conta
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        É rápido e fácil. Comece a transformar a educação!
                    </p>
                </div>
                <div className={styles.cadastroCard + " bg-white py-8 px-6 shadow-2xl rounded-xl sm:px-10"}>
                    <form className="space-y-4" onSubmit={handleSubmit} noValidate> {/* Reduzido space-y */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <CampoEntrada id="nome" name="nome" label="Nome Completo" valor={formData.nome} aoMudar={handleChange} erro={erros.nome} autoComplete="name" />
                            <CampoEntrada id="idade" name="idade" label="Idade" tipo="number" valor={formData.idade} aoMudar={handleChange} erro={erros.idade} autoComplete="off" />
                            <CampoEntrada id="rg" name="rg" label="RG (Opcional)" valor={formData.rg} aoMudar={handleChange} erro={erros.rg} autoComplete="off" />
                            <CampoEntrada id="telefone" name="telefone" label="Telefone (Opcional)" tipo="tel" valor={formData.telefone} aoMudar={handleChange} erro={erros.telefone} autoComplete="tel" />
                        </div>
                        <CampoEntrada id="email" name="email" label="E-mail" tipo="email" valor={formData.email} aoMudar={handleChange} erro={erros.email} autoComplete="email" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <CampoEntrada id="instituicao" name="instituicao" label="Instituição de Ensino" valor={formData.instituicao} aoMudar={handleChange} erro={erros.instituicao} />
                            <CampoEntrada id="curso" name="curso" label="Curso" valor={formData.curso} aoMudar={handleChange} erro={erros.curso} />
                            <CampoEntrada id="cidade" name="cidade" label="Cidade da Instituição" valor={formData.cidade} aoMudar={handleChange} erro={erros.cidade} />
                            <CampoEntrada id="estado" name="estado" label="Estado (UF)" valor={formData.estado} aoMudar={handleChange} erro={erros.estado} />
                        </div>
                        <div>
                            <label htmlFor="periodo" className="block text-sm font-medium text-gray-700 mb-1.5">Período</label>
                            <select
                                id="periodo"
                                name="periodo"
                                value={formData.periodo}
                                onChange={handleChange}
                                className={`mt-1 block w-full pl-3 pr-10 py-2.5 text-base border rounded-md shadow-sm
                                            focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                                            ${erros.periodo ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="matutino">Matutino</option>
                                <option value="vespertino">Vespertino</option>
                                <option value="noturno">Noturno</option>
                                <option value="integral">Integral</option>
                            </select>
                            {erros.periodo && <p className="mt-1.5 text-xs text-red-600">{erros.periodo}</p>}
                        </div>
                        <CampoEntrada id="senha" name="senha" label="Senha" tipo="password" valor={formData.senha} aoMudar={handleChange} erro={erros.senha} autoComplete="new-password" />
                        <CampoEntrada id="confirmarSenha" name="confirmarSenha" label="Confirmar Senha" tipo="password" valor={formData.confirmarSenha} aoMudar={handleChange} erro={erros.confirmarSenha} autoComplete="new-password" />

                        {/* Removido o checkbox de mostrar senha pois está integrado no CampoEntrada */}

                        <div className="flex items-start mt-6"> {/* Aumentado margin top */}
                            <div className="flex items-center h-5">
                                <input id="termos" name="termos" type="checkbox" checked={formData.termos} onChange={handleChange} className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${erros.termos ? 'border-red-500' : ''}`} />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="termos" className="font-medium text-gray-700">
                                    Eu li e aceito os <button type="button" onClick={() => alert("Termos e Condições (Simulado - Implementar visualização real)")} className="text-blue-600 hover:text-blue-700 hover:underline">Termos e Condições</button>.
                                </label>
                                {erros.termos && <p className="mt-1 text-xs text-red-600">{erros.termos}</p>}
                            </div>
                        </div>
                        <Botao tipo="submit" variante="primario" carregando={carregando} desabilitado={carregando} classeAdicional="w-full mt-6 py-3 text-base"> {/* Aumentado margin top e botão */}
                            Cadastrar
                        </Botao>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TelaCadastro;