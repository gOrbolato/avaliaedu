// frontend/src/components/GraficoMediaAvaliacoes.js
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
                    const formattedData = result.data.map(item => ({
                        name: item.nome_instituicao,
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

    if (loading) return (
        <div className="text-center p-10 text-gray-500">
            <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Carregando dados do gráfico...
        </div>
    );
    if (error) return <p className="text-center p-10 text-red-600 bg-red-50 rounded-md">Erro ao carregar gráfico: {error}</p>;
    if (dadosGrafico.length === 0) return <p className="text-center p-10 text-gray-500">Sem dados suficientes para exibir o gráfico.</p>;

    return (
        <div className="p-4 bg-white shadow-xl rounded-xl"> {/* Melhorado o shadow e rounded */}
            <h3 className="text-xl font-semibold mb-6 text-gray-700 text-center">Média de Avaliações por Instituição</h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={dadosGrafico}
                    margin={{ top: 5, right: 30, left: 20, bottom: 90 }} // Aumentar margem inferior para labels rotacionados
                    barGap={8} // Espaço entre barras do mesmo grupo (se houver)
                    barCategoryGap="20%" // Espaço entre grupos de barras
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                    <XAxis
                        dataKey="name"
                        angle={-40} 
                        textAnchor="end"
                        interval={0} 
                        height={100} // Ajustar altura conforme necessário
                        tick={{ fontSize: 11, fill: '#4A5568' }} // Estilo dos ticks
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Média Avaliação', angle: -90, position: 'insideLeft', fill: '#4A5568' }} domain={[0, 5]} allowDecimals={false} tick={{ fontSize: 11, fill: '#4A5568' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Nº Avaliações', angle: -90, position: 'insideRight', fill: '#4A5568' }} allowDecimals={false} tick={{ fontSize: 11, fill: '#4A5568' }} />
                    <Tooltip 
                        formatter={(value, name) => (name === "Média Geral" ? parseFloat(value).toFixed(2) : value)} 
                        cursor={{fill: 'rgba(200, 200, 200, 0.2)'}}
                        contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', borderColor: '#ccc' }}
                        labelStyle={{ color: '#333', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px', color: '#4A5568' }}/>
                    <Bar yAxisId="left" dataKey="Média Geral" fill="#3B82F6" name="Média Geral da Avaliação" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="Total de Avaliações" fill="#10B981" name="Número de Avaliações" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GraficoMediaAvaliacoes;