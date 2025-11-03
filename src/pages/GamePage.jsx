import React, { useState, useEffect } from 'react';
import { getCards } from '../services/cardService.js'; // Corrigido com .js
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
  const [moves, setMoves] = useState(0);

  // Novos estados para a seleção de tema
  const [gameState, setGameState] = useState('loading'); // 'loading', 'themeSelection', 'playing', 'won'
  const [availableThemes, setAvailableThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [error, setError] = useState(null);

  // 1. Efeito para buscar os temas disponíveis na primeira carga
  useEffect(() => {
    const loadThemes = async () => {
      setGameState('loading');
      setError(null);
      try {
        // Busca TODAS as cartas para descobrir os temas
        const response = await getCards();
        if (response.data.length === 0) {
          setError("Nenhuma carta cadastrada. Adicione cartas na área de Admin.");
        } else {
          // Filtra temas únicos usando um Set
          const uniqueThemes = [...new Set(response.data.map(card => card.theme))];
          setAvailableThemes(uniqueThemes);
          setGameState('themeSelection');
        }
      } catch (err) {
        setError("Falha ao carregar temas. O back-end está rodando?");
        setGameState('error');
      }
    };
    
    loadThemes();
  }, []); // Roda apenas uma vez

  // 2. Função para iniciar o jogo DEPOIS que um tema é selecionado
  const startGame = async (theme) => {
    setGameState('loading');
    setSelectedTheme(theme);
    setError(null);
    setCards([]);
    setFlipped([]);
    setMatched([]);
    setMoves(0);

    try {
      // Busca apenas as cartas do tema selecionado
      const response = await getCards({ theme: theme });
      
      // Verifica se há cartas suficientes (precisa de pelo menos 2)
      if (response.data.length < 2) {
         setError(`O tema "${theme}" não tem cartas suficientes. Cadastre mais cartas!`);
         setGameState('themeSelection');
         return;
      }

      // Pega até 8 cartas para formar 8 pares (16 cartas)
      const pairs = response.data.slice(0, 8);
      const gameDeck = [...pairs, ...pairs].map((card, i) => ({
        ...card,
        uniqueId: i, 
      }));
      setCards(shuffleArray(gameDeck));
      setGameState('playing');

    } catch (err) {
      setError("Falha ao carregar o jogo.");
      setGameState('error');
    }
  };

  // 3. Lógica de clique no card
  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].name)) {
      return; 
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1); 
      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].name === cards[secondIndex].name) {
        const newMatched = [...matched, cards[firstIndex].name];
        setMatched(newMatched);
        setFlipped([]);
        
        // Checa se venceu
        if (newMatched.length === cards.length / 2) {
          setGameState('won');
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  // 4. Função para voltar à seleção de temas
  const resetGame = () => {
    setGameState('themeSelection');
    setSelectedTheme(null);
    setCards([]);
  };

  // 5. Renderização condicional
  const renderContent = () => {
    if (gameState === 'loading') {
      return <LoadingSpinner />;
    }
    
    if (error) {
      return <p className="error-message">{error}</p>;
    }
    
    if (gameState === 'themeSelection') {
      return (
        <div className="theme-selection">
          <h2>Escolha um Tema para Jogar!</h2>
          <div className="theme-buttons">
            {availableThemes.length > 0 ? (
              availableThemes.map(theme => (
                <Button key={theme} onClick={() => startGame(theme)}>
                  {theme}
                </Button>
              ))
            ) : (
              <p>Nenhum tema encontrado. Cadastre cartas no Admin.</p>
            )}
          </div>
        </div>
      );
    }
    
    if (gameState === 'playing' || gameState === 'won') {
      return (
        <div>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem'}}>
            <Button onClick={resetGame} variant="secondary">Voltar (Escolher Tema)</Button>
            <p style={{margin: 0, fontWeight: 'bold', fontSize: '1.2rem'}}>Tema: {selectedTheme}</p>
            <p style={{margin: 0, fontWeight: 'bold', fontSize: '1.2rem'}}>Jogadas: {moves}</p>
          </div>
          
          {gameState === 'won' && (
            <h3 className="success-message">Parabéns, você venceu em {moves} jogadas!</h3>
          )}

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
    
    return null; // Caso de erro
  };

  return (
    <div className="game-page">
      {renderContent()}
    </div>
  );
}

export default GamePage;