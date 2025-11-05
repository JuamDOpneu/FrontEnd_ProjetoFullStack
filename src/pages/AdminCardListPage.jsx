import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Importamos a nova função getThemes
import { getCards, deleteCard, getDistinctThemes } from '../services/cardService.js';
import Button from '../components/Button'; 
import LoadingSpinner from '../components/LoadingSpinner'; 

function AdminCardListPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Novos estados para o filtro de temas
  const [themes, setThemes] = useState([]); // Armazena a lista de temas do banco
  const [selectedTheme, setSelectedTheme] = useState(''); // Armazena o tema selecionado

  // Função para buscar os dados (cartas E temas)
  const fetchApiData = async (themeQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      // Cria um objeto de query só se um tema for selecionado
      const query = themeQuery ? { theme: themeQuery } : {};
      
      // 1. Busca as cartas (filtradas ou não)
      const cardsResponse = await getCards(query);
      setCards(cardsResponse.data);
      
      // 2. Busca a lista de temas únicos (só na primeira vez)
      if (themes.length === 0) {
        const themesResponse = await getThemes();
        setThemes(themesResponse.data);
      }
      
    } catch (err) {
      setError('Falha ao buscar os dados. Verifique se o back-end está rodando.');
    } finally {
      setLoading(false);
    }
  };

  // Roda na primeira vez que a página carrega
  useEffect(() => {
    fetchApiData(); // Carrega tudo na primeira vez
  }, []); // Dependência vazia

  // Requisito R5: Implementar busca ou filtro
  const handleFilter = () => {
    // Passa o tema selecionado no dropdown para a função de busca
    fetchApiData(selectedTheme);
  };
  
  const handleClearFilter = () => {
    setSelectedTheme(''); // Limpa o dropdown
    fetchApiData(); // Busca todas as cartas
  };

  // Requisito R6: Permitir exclusão
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta carta?')) {
      try {
        await deleteCard(id); 
        setCards(cards.filter(card => card.id !== id));
        
        // Opcional: Recarregar os temas caso o último de um tema seja excluído
        const themesResponse = await getThemes();
        setThemes(themesResponse.data);

      } catch (err) {
        setError('Falha ao excluir a carta.');
      }
    }
  };

  // Requisito R7: Feedback visual (loading/erro)
  if (loading && cards.length === 0) return <LoadingSpinner />;

  return (
    <div className="admin-list-page">
      <h2>Gerenciador de Cartas</h2>
      <Link to="/admin/new">
        <Button>Nova Carta</Button>
      </Link>
      
      {/* Requisito R5: Filtro (Agora com Dropdown) */}
      <div className="filter-section">
        
        {/* Este é o novo <select> */}
        <select 
          value={selectedTheme} 
          onChange={(e) => setSelectedTheme(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '50px', border: '2px solid #ccc' }}
        >
          <option value=""> Todos os Temas</option>
          {themes.map(theme => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
        
        <Button onClick={handleFilter}>Buscar</Button>
        <Button onClick={handleClearFilter} variant="secondary">Limpar</Button>
      </div>
      
      {error && <p className="error-message">{error}</p>}

      {/* Requisito R4: Exibir lista de entidades */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tema</th>
            <th>Imagem</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {cards.map(card => (
            <tr key={card.id}>
              <td>{card.name}</td>
              <td>{card.theme}</td>
              <td><img src={card.imageUrl} alt={card.name} /></td>
              <td>
                <Link to={`/admin/edit/${card.id}`}>
                  <Button variant="secondary">Editar</Button>
                </Link>
                <Button variant="danger" onClick={() => handleDelete(card.id)}>
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminCardListPage;