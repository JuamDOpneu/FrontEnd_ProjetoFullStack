import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// A CORREÇÃO ESTÁ AQUI NA LINHA ABAIXO:
import { createCard, getCardById, updateCard } from '../services/cardService.js';
import Button from '../components/Button'; 
import Input from '../components/Input'; 
import LoadingSpinner from '../components/LoadingSpinner';

function AdminCardFormPage() {
  const [formData, setFormData] = useState({ name: '', theme: '', imageUrl: '' });
  const [loading, setLoading] = useState(false); // Loading do submit
  const [pageLoading, setPageLoading] = useState(false); // Loading da página (para edição)
  const [feedback, setFeedback] = useState(null); // Requisito R7
  
  const navigate = useNavigate();
  const { cardId } = useParams(); // Pega o ID da URL
  const isEditing = Boolean(cardId);

  useEffect(() => {
    // Se está em modo de edição, busca os dados da carta
    if (isEditing) {
      setPageLoading(true);
      getCardById(cardId)
        .then(response => {
          setFormData(response.data);
        })
        .catch(() => {
          setFeedback({ type: 'error', message: 'Carta não encontrada.' });
        })
        .finally(() => setPageLoading(false));
    }
  }, [cardId, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      if (isEditing) {
        await updateCard(cardId, formData);
        setFeedback({ type: 'success', message: 'Carta atualizada com sucesso!' });
      } else {
        await createCard(formData);
        setFeedback({ type: 'success', message: 'Carta criada com sucesso!' });
      }
      
      // Redireciona de volta para a lista após 1.5s
      setTimeout(() => navigate('/admin'), 1500); 
      
    } catch (err) {
      setFeedback({ type: 'error', message: 'Falha ao salvar. Verifique os dados.' });
    } finally {
      setLoading(false);
    }
  };

  // Requisito R7: Feedback de loading da página
  if (pageLoading) return <LoadingSpinner />;

  return (
    <div className="form-page">
      <h2>{isEditing ? 'Editar Carta' : 'Nova Carta'}</h2>
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Nome da Carta"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Leão"
        />
        <Input
          label="Tema"
          name="theme"
          value={formData.theme}
          onChange={handleChange}
          placeholder="Ex: Animais"
        />
        <Input
          label="URL da Imagem"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://exemplo.com/imagem.png"
        />
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>

      {/* Requisito R7: Feedback de sucesso/erro */}
      {feedback && (
        <p className={`feedback ${feedback.type}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}

export default AdminCardFormPage;