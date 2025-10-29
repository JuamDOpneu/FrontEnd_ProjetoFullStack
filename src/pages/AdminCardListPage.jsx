import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createCard, getCardById, updateCard } from "../services/cardService.js";
import { getCards, deleteCard } from '../services/cardService.js';
import Button from '../components/Button'; 
import LoadingSpinner from '../components/LoadingSpinner'; 

function AdminCardListPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(''); // Estado para o filtro

  const fetchApiData = async (query = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCards(query);
      setCards(response.data);
    } catch (err) {
      setError('Falha ao buscar as cartas. Verifique se o back-end está rodando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiData();
  }, []);

  // Requisito R5: Implementar busca ou filtro
  const handleFilter = () => {
    fetchApiData({ theme: filter });
  };
  
  const handleClearFilter = () => {
    setFilter('');
    fetchApiData();
  };

  // Requisito R6: Permitir exclusão
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta carta?')) {
      try {
        await deleteCard(id);
        // Remove a carta da lista no estado, sem precisar recarregar
        setCards(cards.filter(card => card.id !== id));
      } catch (err) {
        setError('Falha ao excluir a carta.');
      }
    }
  };

  // Requisito R7: Feedback visual (loading/erro)
  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-list-page">
      <h2>Gerenciador de Cartas</h2>
      <Link to="/admin/new">
        <Button>Nova Carta</Button>
      </Link>
      
      {/* Requisito R5: Filtro */}
      <div className="filter-section">
        <input 
          type="text" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)} 
          placeholder="Filtrar por tema..."
        />
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