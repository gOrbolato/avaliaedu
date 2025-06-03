import React from 'react';
import { AuthProvider } from './AuthContext';
import Cabecalho from './components/Cabecalho';
import Rodape from './components/Rodape';
import TelaHome from './pages/TelaHome';
import TelaLogin from './pages/TelaLogin';
import TelaCadastro from './pages/TelaCadastro';
import TelaConfirmacaoPendente from './pages/TelaConfirmacaoPendente';
import TelaVerificacaoEmail from './pages/TelaVerificacaoEmail';
import TelaPainelUsuario from './pages/TelaPainelUsuario';
import TelaAdminDashboard from './pages/TelaAdminDashboard';
import './App.css';

const App = () => {
  const [currentPage, setCurrentPage] = React.useState(window.location.hash.substring(1) || 'home');
  const [pageData, setPageData] = React.useState(null);

  const navigateTo = React.useCallback((page, data = null) => {
    let hash = page;
    if (page === 'verificar-email' && data?.token) {
      hash = `${page}/${data.token}`;
    }
    window.location.hash = hash;
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) || 'home';
      const [pageName, param] = hash.split('/');
      setCurrentPage(pageName);
      let newData = null;
      if (pageName === 'verificar-email' && param) {
        newData = { token: param };
      }
      setPageData(prevData => (pageName === 'verificar-email' && param) ? newData : (pageName === 'aguardando-confirmacao' ? prevData : null));
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
      case 'home':
      default:
        return <TelaHome navigateTo={navigateTo} />;
    }
  };

  return (
    <AuthProvider navigateTo={navigateTo}>
      <div className="flex flex-col min-h-screen font-sans">
        <Cabecalho navigateTo={navigateTo} />
        <main className="flex-grow bg-gray-50">
          {renderPage()}
        </main>
        <Rodape />
      </div>
    </AuthProvider>
  );
};

export default App;
