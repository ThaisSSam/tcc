import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('exibe o titulo da aplicacao', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /gestão de tarefas/i })).toBeInTheDocument();
  });

  it('exibe o botao do shadcn na pagina inicial', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /começar/i })).toBeInTheDocument();
  });
});
