import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import CampoEntrada from '../components/CampoEntrada';
import Botao from '../components/Botao';
import PopupNotificacao from '../components/PopupNotificacao';

const TelaCadastro = ({ navigateTo }) => {
    const [formData, setFormData] = useState({
        nome: '', idade: '', rg: '', telefone: '', email: '',
        instituicao: '', curso: '', cidade: '', estado: '',
        periodo: 'matutino', senha: '', confirmarSenha: '', termos: false,
    });
    const [erros, setErros] = useState({});
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [notificacao, setNotificacao] = useState({ visivel: false, mensagem: '', tipo: '' });
    const [carregando, setCarregando] = useState(false);
    const { cadastro } = useAuth();

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
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(formData.senha)) {
            novosErros.senha = 'Senha fraca. Use maiúsculas, minúsculas, números e símbolos.';
        }
        if (formData.senha !== formData.confirmarSenha) novosErros.confirmarSenha = 'As senhas não conferem.';
        if (!formData.instituicao.trim()) novosErros.instituicao = 'Instituição é obrigatória.';
        if (!formData.curso.trim()) novosErros.curso = 'Curso é obrigatório.';
        if (!formData.termos) novosErros.termos = 'Você deve aceitar os termos e condições.';
        if (!formData.idade) novosErros.idade = "Idade é obrigatória.";
        else if (isNaN(formData.idade) || Number(formData.idade) <= 10) novosErros.idade = "Idade inválida.";
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarCampos()) {
            mostrarNotificacao('Por favor, corrija os erros no formulário.', 'erro');
            return;
        }
        setCarregando(true);
        const { confirmarSenha, termos, ...dadosParaEnviar } = formData;
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
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Crie sua conta
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    É rápido e fácil. Comece a transformar a educação!
                </p>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        {/* ...campos do formulário, igual ao exemplo anterior... */}
                        <CampoEntrada id="nome" name="nome" label="Nome Completo" valor={formData.nome} aoMudar={handleChange} erro={erros.nome} />
                        <CampoEntrada id="idade" name="idade" label="Idade" tipo="number" valor={formData.idade} aoMudar={handleChange} erro={erros.idade} />
                        <CampoEntrada id="rg" name="rg" label="RG (Opcional)" valor={formData.rg} aoMudar={handleChange} erro={erros.rg} />
                        <CampoEntrada id="telefone" name="telefone" label="Telefone (Opcional)" tipo="tel" valor={formData.telefone} aoMudar={handleChange} erro={erros.telefone} />
                        <CampoEntrada id="email" name="email" label="E-mail" tipo="email" valor={formData.email} aoMudar={handleChange} erro={erros.email} />
                        <CampoEntrada id="instituicao" name="instituicao" label="Instituição de Ensino" valor={formData.instituicao} aoMudar={handleChange} erro={erros.instituicao} />
                        <CampoEntrada id="curso" name="curso" label="Curso" valor={formData.curso} aoMudar={handleChange} erro={erros.curso} />
                        <CampoEntrada id="cidade" name="cidade" label="Cidade" valor={formData.cidade} aoMudar={handleChange} erro={erros.cidade} />
                        <CampoEntrada id="estado" name="estado" label="Estado (UF)" valor={formData.estado} aoMudar={handleChange} erro={erros.estado} />
                        <div>
                            <label htmlFor="periodo" className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                            <select
                                id="periodo"
                                name="periodo"
                                value={formData.periodo}
                                onChange={handleChange}
                                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${erros.periodo ? 'border-red-500' : ''}`}
                            >
                                <option value="matutino">Matutino</option>
                                <option value="vespertino">Vespertino</option>
                                <option value="noturno">Noturno</option>
                                <option value="integral">Integral</option>
                            </select>
                            {erros.periodo && <p className="mt-1 text-xs text-red-600">{erros.periodo}</p>}
                        </div>
                        <CampoEntrada id="senha" name="senha" label="Senha" tipo={mostrarSenha ? 'text' : 'password'} valor={formData.senha} aoMudar={handleChange} erro={erros.senha} />
                        <CampoEntrada id="confirmarSenha" name="confirmarSenha" label="Confirmar Senha" tipo={mostrarSenha ? 'text' : 'password'} valor={formData.confirmarSenha} aoMudar={handleChange} erro={erros.confirmarSenha} />
                        <div className="flex items-center">
                            <input id="mostrarSenhaCheck" name="mostrarSenhaCheck" type="checkbox" checked={mostrarSenha} onChange={() => setMostrarSenha(!mostrarSenha)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <label htmlFor="mostrarSenhaCheck" className="ml-2 block text-sm text-gray-900">Mostrar senhas</label>
                        </div>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input id="termos" name="termos" type="checkbox" checked={formData.termos} onChange={handleChange} className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${erros.termos ? 'border-red-500' : ''}`} />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="termos" className="font-medium text-gray-700">
                                    Eu li e aceito os <button type="button" onClick={() => alert("Termos e Condições (Não implementado)")} className="text-blue-600 hover:text-blue-500">Termos e Condições</button>.
                                </label>
                                {erros.termos && <p className="text-xs text-red-600">{erros.termos}</p>}
                            </div>
                        </div>
                        <Botao tipo="submit" variante="primario" carregando={carregando} desabilitado={carregando} classeAdicional="w-full">
                            Cadastrar
                        </Botao>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TelaCadastro;
