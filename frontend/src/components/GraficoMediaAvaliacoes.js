// frontend-react/src/components/GraficoMediaAvaliacoes.js
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:3001/api';

const GraficoMediaAvaliacoes = () => {
    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/relatorios/media-avaliacoes-instituicao`);
                const result = await response.json();
                if (result.success) {
                    // Formatar dados para o gráfico, se necessário
                    const formattedData = result.data.map(item => ({
                        name: item.nome_instituicao, // Usar o nome da instituição para o eixo X
                        "Média Geral": parseFloat(item.media_geral_avaliacao).toFixed(2),
                        "Total de Avaliações": item.total_avaliacoes
                    }));
                    setDadosGrafico(formattedData);
                } else {
                    setError(result.message || "Erro ao buscar dados do relatório.");
                }
            } catch (err) {
                setError("Falha ao conectar com a API de relatórios.");
                console.error(err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <p className="text-center p-4">Carregando dados do gráfico...</p>;
    if (error) return <p className="text-center p-4 text-red-500">Erro ao carregar gráfico: {error}</p>;
    if (dadosGrafico.length === 0) return <p className="text-center p-4">Sem dados suficientes para exibir o gráfico.</p>;

    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Média de Avaliações por Instituição</h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={dadosGrafico}
                    margin={{ top: 5, right: 30, left: 20, bottom: 70 }} // Aumentar margem inferior para labels
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        angle={-35} // Rotacionar labels
                        textAnchor="end" // Alinhar labels rotacionados
                        interval={0} // Mostrar todos os labels
                        height={80} // Aumentar altura para acomodar labels
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Média Avaliação', angle: -90, position: 'insideLeft' }} domain={[0, 5]} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Nº Avaliações', angle: -90, position: 'insideRight' }} allowDecimals={false} />
                    <Tooltip formatter={(value, name) => (name === "Média Geral" ? parseFloat(value).toFixed(2) : value)} />
                    <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }}/>
                    <Bar yAxisId="left" dataKey="Média Geral" fill="#8884d8" name="Média Geral da Avaliação" />
                    <Bar yAxisId="right" dataKey="Total de Avaliações" fill="#82ca9d" name="Número de Avaliações" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GraficoMediaAvaliacoes;