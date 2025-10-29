import React, { useState, useEffect } from 'react';
// A CORREÇÃO ESTÁ AQUI NA LINHA ABAIXO:
import { getCards } from '../services/cardService.js';
import MemoryCardComponent from '../components/MemoryCardComponent';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

// Função para embaralhar
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

function GamePage() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); 
  const [matched, setMatched] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moves, setMoves] = useState(0); // Funcionalidade extra

  const loadGame = async () => {
    setLoading(true);
    setError(null);
    setCards([]);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    try {
      const response = await getCards(); // Pega todas as cartas
      
      if (response.data.length === 0) {
        setError("Nenhuma carta cadastrada. Adicione cartas na área de Admin.");
        setLoading(false);
        return;
      }
      
      // Pega 8 pares (ou menos se não houver)
      const pairs = response.data.slice(0, 8);
      const gameDeck = [...pairs, ...pairs].map((card, i) => ({
        ...card,
        uniqueId: i, // ID único para a key do React
      }));
      setCards(shuffleArray(gameDeck));
    } catch (err) {
      setError("Falha ao carregar o jogo. O back-end está rodando?");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGame();
  }, []);

  const handleCardClick = (index) => {
    // Não faz nada se já tem 2 viradas, ou clicou na mesma, ou já deu match
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].name)) {
      return; 
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1); // Incrementa contador de jogadas
      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].name === cards[secondIndex].name) {
        // MATCH
        setMatched([...matched, cards[firstIndex].name]);
        setFlipped([]);
      } else {
        // NO MATCH
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  
  const isWin = cards.length > 0 && matched.length === cards.length / 2;

  return (
    <div className="game-page">
      <h2>Jogo da Memória</h2>
      <div style={{display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem'}}>
        <Button onClick={loadGame}>Reiniciar Jogo</Button>
        <p style={{margin: 0}}>Jogadas: {moves}</p>
      </div>
      
      {isWin && <h3 className="success-message">Parabéns, você venceu!</h3>}
      {error && <p className="error-message">{error}</p>}

      <div className="game-board">
        {cards.map((card, index) => (
          <MemoryCardComponent
            key={card.uniqueId}
            card={card}
            isFlipped={flipped.includes(index) || matched.includes(card.name)}
            onClick={() => handleCardClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default GamePage;