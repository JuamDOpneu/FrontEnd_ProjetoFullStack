import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h1>Bem-vindo ao Jogo da Memória Full-stack!</h1>
      <p>Use a navegação acima para jogar ou gerenciar as cartas que aparecem no jogo.</p>
      <Link to="/game">
        <button className="btn btn-primary">Começar a Jogar</button>
      </Link>
    </div>
  );
}

export default HomePage;