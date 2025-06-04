// frontend/src/App.js
import React, { Suspense } from 'react'; // Adicionado Suspense se for usar React.lazy
import { AuthProvider } from './AuthContext';
import Cabecalho from './components/Cabecalho';
import Rodape from './components/Rodape';
// Importações de página
import TelaHome from './pages/TelaHome';
import TelaLogin from './pages/TelaLogin';
import TelaCadastro from './pages/TelaCadastro';
import TelaConfirmacaoPendente from './pages/TelaConfirmacaoPendente';
import TelaVerificacaoEmail from './pages/TelaVerificacaoEmail';
import TelaPainelUsuario from './pages/TelaPainelUsuario';
import TelaAdminDashboard from './pages/TelaAdminDashboard';
import TelaAvaliacao from './pages/TelaAvaliacao'; // Se você mantiver esta tela

import './App.css'; // Garanta que App.css ou index.css seja importado para as animações

const App = () => {
  const [currentPage, setCurrentPage] = React.useState(window.location.hash.substring(1).split('/')[0] || 'home');
  const [pageData, setPageData] = React.useState(null);
  const [animationKey, setAnimationKey] = React.useState(0); // Chave para forçar re-render e animação

  const navigateTo = React.useCallback((page, data = null) => {
    let hash = page;
    if (page === 'verificar-email' && data?.token) {
      hash = `${page}/${data.token}`;
    }
    window.location.hash = hash;
    // setCurrentPage(page); // Será atualizado pelo handleHashChange
    // setPageData(data);
    // window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) || 'home';
      const [pageName, param] = hash.split('/');
      
      setCurrentPage(pageName);
      setAnimationKey(prevKey => prevKey + 1); // Muda a chave para re-animar

      let newData = null;
      if (pageName === 'verificar-email' && param) {
        newData = { token: param };
      } else if (pageName === 'aguardando-confirmacao' && pageData?.email) { 
        // Mantém pageData.email se já existia para aguardando-confirmacao
        newData = { email: pageData.email };
      }
      
      if (param && pageName === 'verificar-email') {
        setPageData({ token: param });
      } else if (pageName === 'aguardando-confirmacao') {
        // Se já temos um email em pageData (vindo do cadastro), preserva-o
        // Se não, e se há um e-mail na navegação (embora não típico para esta rota), usa-o
        // Esta parte pode precisar de ajuste dependendo de como `pageData` é passado para `aguardando-confirmacao`
        if (pageData?.email) {
            setPageData(currentData => ({ ...currentData, email: currentData.email }));
        } else if (typeof param === 'string' && param.includes('@')) { // Exemplo se o email viesse no hash
            setPageData({ email: param });
        }
      }
      else {
        // Para outras páginas, ou se 'aguardando-confirmacao' não tiver dados passados, limpa pageData
        setPageData(newData);
      }
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Chamada inicial
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [navigateTo, pageData]); // Adicionado pageData para gerenciar estado em aguardando-confirmacao

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <TelaLogin navigateTo={navigateTo} />;
      case 'cadastro':
        return <TelaCadastro navigateTo={navigateTo} />;
      case 'aguardando-confirmacao':
        return <TelaConfirmacaoPendente navigateTo={navigateTo} pageData={pageData} />;
      case 'verificar-email':
        return <TelaVerificacaoEmail navigateTo={navigateTo} pageData={pageData} />;
      case 'painel-usuario':
        return <TelaPainelUsuario navigateTo={navigateTo} />;
      case 'admin-dashboard':
        return <TelaAdminDashboard navigateTo={navigateTo} />;
      case 'avaliacao': // Se você mantiver esta tela
        return <TelaAvaliacao navigateTo={navigateTo} />;
      case 'home':
      default:
        return <TelaHome navigateTo={navigateTo} />;
    }
  };

  return (
    <AuthProvider navigateTo={navigateTo}>
      <div className="flex flex-col min-h-screen font-sans bg-gray-50"> {/* Adicionado bg-gray-50 aqui */}
        <Cabecalho navigateTo={navigateTo} />
        {/* Adiciona uma div com key para a animação de transição de página */}
        <main key={animationKey} className="flex-grow animate-fadeIn"> 
          {renderPage()}
        </main>
        <Rodape />
      </div>
    </AuthProvider>
  );
};

export default App;