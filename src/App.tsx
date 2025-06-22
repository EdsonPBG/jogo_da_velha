import styles from "./styles.module.css";
import { useState } from "react";

// --- Definição das Props para o componente Square ---
interface SquareProps {
    value: string | null; // O valor que o quadrado irá exibir: 'X', 'O' ou null (vazio).
    onSquareClick: () => void; // Uma função a ser chamada quando este quadrado for clicado.
}

// --- Componente Square ---
// Representa um único quadrado clicável no jogo.
export function Square({ value, onSquareClick }: SquareProps) {
    return (
        <button className={styles.square} onClick={onSquareClick}>
            {value}
        </button>
    );
}

// --- Definição das Props para o componente Board ---
interface BoardProps {
    xIsNext: boolean; // Indica se é a vez do 'X'.
    squares: (string | null)[]; // O estado atual dos 9 quadrados.
    onPlay: (nextSquares: (string | null)[]) => void; // Função para notificar o componente pai (Game) sobre uma nova jogada.
}

// --- Componente Board ---
// Gerencia a exibição do tabuleiro e a lógica de clique nos quadrados, mas o estado é gerenciado pelo componente pai (Game).
export function Board({ xIsNext, squares, onPlay }: BoardProps) {
    // REMOVIDO: const [squares, setSquares] = useState<(string | null)[]>(Array(9).fill(null));
    // REMOVIDO: const [xIsNext, setXIsNext] = useState(true);
    // O Board AGORA recebe 'squares' e 'xIsNext' como props do componente Game.
    // Ele não gerencia mais esses estados internamente.

    // Função que lida com o clique em qualquer um dos quadrados.
    // 'i' é o índice (posição de 0 a 8) do quadrado clicado.
    function handleClick(i: number) {
        // 1. Verifica se o jogo já acabou (há um vencedor no tabuleiro atual)
        // Ou se o quadrado clicado já está preenchido.
        if (calculateWinner(squares) || squares[i]) {
            return; // Se sim, não faz nada.
        }

        // 2. Cria uma CÓPIA do array de 'squares' que veio via props.
        const nextSquares = squares.slice();

        // 3. Define o valor do quadrado clicado ('X' ou 'O') com base no 'xIsNext' que veio via props.
        if (xIsNext) {
            nextSquares[i] = "X";
        } else {
            nextSquares[i] = "O";
        }

        // 4. CHAMA a função 'onPlay' (passada via props) para notificar o componente pai (Game)
        // sobre a nova jogada, passando o array 'nextSquares' atualizado.
        // O componente Game será responsável por atualizar seu próprio estado (history, currentMove, etc.).
        onPlay(nextSquares);

        // REMOVIDO: setSquares(nextSquares);
        // REMOVIDO: setXIsNext(!xIsNext);
        // Essas atualizações de estado agora são responsabilidade do componente Game via 'onPlay'.
    }

    // Calcula o vencedor a cada renderização do Board, usando o array 'squares' que recebeu via props.
    const winner = calculateWinner(squares);
    let status: string; // Define o tipo da variável status.

    // Define a mensagem de status para exibição.
    if (winner) {
        status = `Vencedor: ${winner}`; // Mensagem de vencedor.
    } else {
        // Se não há vencedor, mostra de quem é a próxima jogada.
        status = "Próximo jogador: " + (xIsNext ? "X" : "O");
    }

    return (
        <>
            {/* Exibe a mensagem de status (próximo jogador ou vencedor) */}
            <div className={styles.status}>{status}</div>

            {/* Renderiza as linhas do tabuleiro com os Squares */}
            <div className={styles.boardRow}>
                <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
                <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
                <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
            </div>

            <div className={styles.boardRow}>
                <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
                <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
                <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
            </div>

            <div className={styles.boardRow}>
                <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
                <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
                <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
            </div>
        </>
    );
}

// --- Função calculateWinner ---
// Esta função é uma utilidade pura: ela apenas recebe um array de quadrados
// e verifica se alguém venceu, sem modificar nada ou depender de estado.
function calculateWinner(squares: (string | null)[]): string | null {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontais
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticais
        [0, 4, 8], [2, 4, 6],           // Diagonais
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a]; // Retorna 'X' ou 'O' como vencedor.
        }
    }
    return (
        null
    ); // Sem vencedor.
    
}

// --- Componente Principal Game ---
// Gerencia o histórico de jogadas e o estado geral do jogo.
export default function Game() {
    // 'history' é um array de arrays, onde cada sub-array é um estado do tabuleiro em um determinado turno.
    const [history, setHistory] = useState<(string | null)[][]>([Array(9).fill(null)]);
    // 'currentMove' indica qual o índice da jogada atual no histórico.
    const [currentMove, setCurrentMove] = useState(0);

    // Determina se é a vez do 'X' (se o número da jogada atual for par).
    const xIsNext = currentMove % 2 === 0;
    // Pega o estado do tabuleiro na jogada atual do histórico.
    const currentSquares = history[currentMove];

    // Função chamada pelo Board quando uma nova jogada é feita.
    function handlePlay(nextSquares: (string | null)[]) {
        // Cria um novo histórico, adicionando a nova jogada e "cortando" qualquer futuro
        // se o usuário voltou no tempo e fez uma nova jogada.
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory); // Atualiza o histórico.
        setCurrentMove(nextHistory.length - 1); // Move para a última jogada (a recém-adicionada).
    }

    // Função para "voltar no tempo" para uma jogada específica.
    function jumpTo(nextMove: number) {
        setCurrentMove(nextMove); // Atualiza o índice da jogada atual.
    }

    // Mapeia o histórico para criar os botões "Go to move #..."
    const moves = history.map((squares, move) => {
        let description;
        if (move > 0) {
            description = "Ir para a jogada #" + move;
        } else {
            description = "Ir para o início do jogo";
        }
        return (
            <li key={move}> {/* 'key' é importante para listas em React */}
                <button onClick={() => jumpTo(move)}> {description} </button>
            </li>
        );
    });

    return (
        <div className={styles.game}>
            <div className={styles.gameBoard}>
                {/* O componente Board recebe o estado atual do jogo do Game. */}
                <Board
                    xIsNext={xIsNext}       // De quem é a vez.
                    squares={currentSquares} // O array de quadrados da jogada atual.
                    onPlay={handlePlay}     // A função para o Board chamar quando houver uma nova jogada.
                />
            </div>
            <div className={styles.gameInfo}>
                <ol>{moves}</ol> {/* Lista de botões para o histórico de jogadas. */}
            </div>
        </div>
    );
}