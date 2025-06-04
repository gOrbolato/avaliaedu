// frontend/src/pages/TelaAvaliacao.js
import React, { useState, useEffect } from 'react';
import PopupNotificacao from '../components/PopupNotificacao';
import CampoEntrada from '../components/CampoEntrada';
import Botao from '../components/Botao';
import styles from './TelaAvaliacao.module.css';
// import { useAuth } from '../AuthContext'; // Se precisar do token/usuário para enviar

// Componente auxiliar para renderizar estrelas de avaliação
const RatingStars = ({ label, nota, onNotaChange, error }) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onNotaChange(star)}
                        className={`p-2 rounded-full transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-60 transform hover:scale-110
                            ${nota >= star ? 'text-yellow-400 scale-110' : 'text-gray-300 hover:text-yellow-300'}`}
                        aria-label={`Dar ${star} estrela${star > 1 ? 's' : ''}`}
                    >
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                ))}
            </div>
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>
    );
};


const TelaAvaliacao = ({ navigateTo }) => {
    // const { token } = useAuth(); // Descomente se for enviar dados autenticados
    const initialState = {
        instituicaoNome: '',
        cursoNome: '',      // Opcional
        materiaNome: '',    // Opcional

        qualidadeGeral: { nota: 0, comentario: '' },
        infraestrutura: { nota: 0, comentario: '' },
        coordenacao: { nota: 0, comentario: '' }, // Pode ser de curso ou geral
        secretaria: { nota: 0, comentario: '' },
        suporteEstagio: { nota: 0, comentario: '' },
        // ... outros critérios específicos podem ser adicionados aqui
        comentarioFinal: '',
    };

    const [formState, setFormState] = useState(initialState);
    const [erros, setErros] = useState({});
    const [notificacao, setNotificacao] = useState({ visivel: false, mensagem: '', tipo: '' });
    const [carregando, setCarregando] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
        if (erros[name]) setErros(prev => ({ ...prev, [name]: null }));
    };

    const handleCriterioChange = (criterio, campo, valor) => {
        setFormState(prev => ({
            ...prev,
            [criterio]: {
                ...prev[criterio],
                [campo]: valor
            }
        }));
        if (erros[criterio] && campo === 'nota') { // Limpa erro da nota do critério
            setErros(prev => ({ ...prev, [criterio]: null }));
        }
    };

    const validarFormulario = () => {
        const novosErros = {};
        if (!formState.instituicaoNome.trim()) novosErros.instituicaoNome = "Nome da instituição é obrigatório.";

        // Validar notas dos critérios principais
        if (formState.qualidadeGeral.nota === 0) novosErros.qualidadeGeral = "Nota para Qualidade Geral é obrigatória.";
        if (formState.infraestrutura.nota === 0) novosErros.infraestrutura = "Nota para Infraestrutura é obrigatória.";

        // Validação de outros critérios se necessário (ex: se curso preenchido, coordenação é obrigatória)
        if (formState.cursoNome.trim() && formState.coordenacao.nota === 0) {
            novosErros.coordenacao = "Nota para Coordenação do Curso é obrigatória se o curso for especificado.";
        }


        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) {
            setNotificacao({ visivel: true, mensagem: 'Por favor, preencha todos os campos obrigatórios e notas.', tipo: 'erro' });
            // Focar no primeiro campo com erro
            const primeiroErro = Object.keys(erros).find(key => erros[key]);
            if (primeiroErro) {
                const el = document.getElementById(primeiroErro) || document.getElementsByName(primeiroErro)[0];
                el?.focus();
            }
            return;
        }

        setCarregando(true);
        console.log("Dados a serem enviados:", formState);
        // TODO: Lógica de envio para o backend
        // Exemplo:
        // try {
        //     const response = await fetch('/api/avaliacoes/detalhada', { 
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        //         body: JSON.stringify(formState)
        //     });
        //     const data = await response.json();
        //     if (data.success) {
        //        setNotificacao({ visivel: true, mensagem: 'Avaliação enviada com sucesso!', tipo: 'sucesso' });
        //        setFormState(initialState); // Resetar formulário
        //     } else {
        //        setNotificacao({ visivel: true, mensagem: data.message || 'Erro ao enviar avaliação.', tipo: 'erro' });
        //     }
        // } catch (error) {
        //     setNotificacao({ visivel: true, mensagem: 'Erro de conexão.', tipo: 'erro' });
        // }


        // Simulação de envio
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCarregando(false);
        setNotificacao({ visivel: true, mensagem: 'Avaliação detalhada enviada com sucesso! (Simulado)', tipo: 'sucesso' });
        setFormState(initialState);
        // setTimeout(() => navigateTo('home'), 3000);
    };

    const criterios = [
        { id: 'qualidadeGeral', label: 'Qualidade Geral (Curso/Matéria/Instituição)', obrigatorio: true },
        { id: 'infraestrutura', label: 'Infraestrutura', obrigatorio: true },
        { id: 'coordenacao', label: 'Coordenação (Curso/Geral)', obrigatorio: !!formState.cursoNome }, // Obrigatório se curso informado
        { id: 'secretaria', label: 'Secretaria', obrigatorio: false },
        { id: 'suporteEstagio', label: 'Suporte a Estágios', obrigatorio: false },
    ];

    return (
        <div className={styles.avaliacaoBg + " min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8"}>
            <PopupNotificacao visivel={notificacao.visivel} mensagem={notificacao.mensagem} tipo={notificacao.tipo} aoFechar={() => setNotificacao({ visivel: false })} />
            <div className={styles.avaliacaoCard + ` w-full max-w-2xl bg-white p-8 sm:p-10 rounded-2xl shadow-2xl transition-all duration-700 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-blue-600">Avaliação Detalhada</h2>
                    <p className="mt-2 text-gray-600">Compartilhe sua experiência completa.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Seção de Identificação */}
                    <fieldset className="space-y-6 border border-gray-200 p-6 rounded-lg">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Identificação</legend>
                        <CampoEntrada
                            id="instituicaoNome"
                            name="instituicaoNome"
                            label="Nome da Instituição*"
                            valor={formState.instituicaoNome}
                            aoMudar={handleInputChange}
                            placeholder="Ex: Universidade Federal de Minas Gerais"
                            erro={erros.instituicaoNome}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CampoEntrada
                                id="cursoNome"
                                name="cursoNome"
                                label="Curso (Opcional)"
                                valor={formState.cursoNome}
                                aoMudar={handleInputChange}
                                placeholder="Ex: Ciência da Computação"
                            />
                            <CampoEntrada
                                id="materiaNome"
                                name="materiaNome"
                                label="Matéria (Opcional)"
                                valor={formState.materiaNome}
                                aoMudar={handleInputChange}
                                placeholder="Ex: Cálculo I"
                            />
                        </div>
                    </fieldset>

                    {/* Seção de Critérios */}
                    <fieldset className="space-y-6 border border-gray-200 p-6 rounded-lg">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Critérios de Avaliação</legend>
                        {criterios.map(c => (
                            <div key={c.id} className="p-4 bg-gray-50 rounded-md border border-gray-100">
                                <RatingStars
                                    label={`${c.label}${c.obrigatorio ? '*' : ''}`}
                                    nota={formState[c.id]?.nota || 0}
                                    onNotaChange={(nota) => handleCriterioChange(c.id, 'nota', nota)}
                                    error={erros[c.id]}
                                />
                                <CampoEntrada
                                    id={`${c.id}Comentario`}
                                    name="comentario" // Nome genérico pois está dentro do critério
                                    label="Comentário (Opcional)"
                                    tipo="textarea"
                                    valor={formState[c.id]?.comentario || ''}
                                    aoMudar={(e) => handleCriterioChange(c.id, 'comentario', e.target.value)}
                                    placeholder={`Seu comentário sobre ${c.label.toLowerCase()}...`}
                                    classeAdicionalInput="min-h-[60px] text-sm"
                                />
                            </div>
                        ))}
                    </fieldset>

                    {/* Comentário Final */}
                    <fieldset className="space-y-6 border border-gray-200 p-6 rounded-lg">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Comentário Final</legend>
                        <CampoEntrada
                            id="comentarioFinal"
                            name="comentarioFinal"
                            label="Considerações Finais (Opcional)"
                            tipo="textarea"
                            valor={formState.comentarioFinal}
                            aoMudar={handleInputChange}
                            placeholder="Algum outro ponto que gostaria de destacar?"
                            classeAdicionalInput="min-h-[100px]"
                        />
                    </fieldset>

                    <Botao tipo="submit" variante="primario" classeAdicional="w-full py-3 text-base mt-10" carregando={carregando}>
                        {carregando ? 'Enviando Avaliação...' : 'Enviar Avaliação Detalhada'}
                    </Botao>
                </form>
            </div>
        </div>
    );
};

export default TelaAvaliacao;