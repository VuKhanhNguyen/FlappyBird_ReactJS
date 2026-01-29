import styled from "styled-components";
import { useEffect, useState } from "react";

const BIRD_HEIGHT = 28;
const BIRD_WIDTH = 33;
const WALL_HEIGHT = 600;
const WALL_WIDTH = 400;
const GRAVITY = 8;
const OBJ_WIDTH = 52;

const DIFFICULTY_SETTINGS = {
  Easy: { speed: 4, gap: 250 },
  Medium: { speed: 6, gap: 200 },
  Hard: { speed: 8, gap: 170 },
  Insane: { speed: 10, gap: 150 },
  Hell: { speed: 12, gap: 120 },
  Asian: { speed: 16, gap: 100 },
};

function App() {
  const [isStart, setIsStart] = useState(false);
  const [birdpos, setBirspos] = useState(300);
  const [objHeight, setObjHeight] = useState(0);
  const [objPos, setObjPos] = useState(WALL_WIDTH);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(
    parseInt(localStorage.getItem("bestScore")) || 0,
  );
  const [difficulty, setDifficulty] = useState("Medium");

  const currentSettings = DIFFICULTY_SETTINGS[difficulty];

  useEffect(() => {
    let intVal;
    if (isStart && birdpos < WALL_HEIGHT - BIRD_HEIGHT) {
      intVal = setInterval(() => {
        setBirspos((birdpos) => birdpos + GRAVITY);
      }, 24);
    }
    return () => clearInterval(intVal);
  });

  useEffect(() => {
    let objval;
    if (isStart && objPos >= -OBJ_WIDTH) {
      objval = setInterval(() => {
        setObjPos((objPos) => objPos - currentSettings.speed);
      }, 24);

      return () => {
        clearInterval(objval);
      };
    } else {
      setObjPos(WALL_WIDTH);
      setObjHeight(
        Math.floor(Math.random() * (WALL_HEIGHT - currentSettings.gap)),
      );
      if (isStart) setScore((score) => score + 1);
    }
  }, [isStart, objPos, currentSettings.speed, currentSettings.gap]);

  useEffect(() => {
    let topObj = birdpos >= 0 && birdpos < objHeight;
    let bottomObj =
      birdpos <= WALL_HEIGHT &&
      birdpos >=
        WALL_HEIGHT -
          (WALL_HEIGHT - currentSettings.gap - objHeight) -
          BIRD_HEIGHT;

    if (
      objPos >= OBJ_WIDTH &&
      objPos <= OBJ_WIDTH + 80 &&
      (topObj || bottomObj)
    ) {
      setIsStart(false);
      setBirspos(300);
      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem("bestScore", score);
      }
      setScore(0);
    }
  }, [
    isStart,
    birdpos,
    objHeight,
    objPos,
    currentSettings.gap,
    score,
    bestScore,
  ]);

  const handler = () => {
    if (!isStart) setIsStart(true);
    else if (birdpos < BIRD_HEIGHT) setBirspos(0);
    else setBirspos((birdpos) => birdpos - 50);
  };

  const handleDifficultyChange = (e, level) => {
    e.stopPropagation(); // Prevent game from starting when clicking buttons
    setDifficulty(level);
  };

  return (
    <Home onClick={handler}>
      <GameContainer>
        <Background height={WALL_HEIGHT} width={WALL_WIDTH}>
          <Score>{score}</Score>
          {!isStart && (
            <Startboard>
              <Title>Flappy Bird</Title>
              <BestScore>Best Score: {bestScore}</BestScore>
              <DifficultyContainer>
                <DifficultyWrapper>
                  {Object.keys(DIFFICULTY_SETTINGS).map((level) => (
                    <DifficultyBtn
                      key={level}
                      active={difficulty === level}
                      onClick={(e) => handleDifficultyChange(e, level)}
                    >
                      {level}
                    </DifficultyBtn>
                  ))}
                </DifficultyWrapper>
              </DifficultyContainer>
              <StartBtn>Click To Start</StartBtn>
            </Startboard>
          )}
          <Obj
            height={objHeight}
            width={OBJ_WIDTH}
            left={objPos}
            top={0}
            deg={180}
          />
          <Bird
            height={BIRD_HEIGHT}
            width={BIRD_WIDTH}
            top={birdpos}
            left={100}
          />
          <Obj
            height={WALL_HEIGHT - currentSettings.gap - objHeight}
            width={OBJ_WIDTH}
            left={objPos}
            top={
              WALL_HEIGHT -
              (objHeight + (WALL_HEIGHT - currentSettings.gap - objHeight))
            }
            deg={0}
          />
        </Background>
      </GameContainer>
    </Home>
  );
}

export default App;

const Home = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const GameContainer = styled.div`
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  overflow: hidden;
  border: 4px solid #333;
`;

const Background = styled.div`
  background-image: url("./images/background-day.png");
  background-repeat: no-repeat;
  background-size: cover;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  position: relative;
  overflow: hidden;
`;

const Bird = styled.div`
  position: absolute;
  background-image: url("./images/yellowbird-upflap.png");
  background-repeat: no-repeat;
  background-size: contain;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
  transition: top 0.1s linear;
`;

const Obj = styled.div`
  position: relative;
  background-image: url("./images/pipe-green.png");
  background-size: 100% 100%;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  transform: rotate(${(props) => props.deg}deg);
`;

const Startboard = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 20px;
  border-radius: 15px;
  backdrop-filter: blur(5px);
  z-index: 10;
  border: 2px solid white;
  width: 80%;
`;

const Title = styled.h1`
  font-size: 32px;
  color: #fff;
  text-shadow: 4px 4px 0 #000;
  margin-bottom: 10px;
  text-transform: uppercase;
  text-align: center;
`;

const BestScore = styled.div`
  font-size: 18px;
  color: #ffd700;
  margin-bottom: 20px;
  text-shadow: 2px 2px 0 #000;
`;

const DifficultyContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const DifficultyBtn = styled.button`
  background: ${(props) => (props.active ? "#ffd700" : "#fff")};
  color: ${(props) => (props.active ? "#000" : "#333")};
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  font-family: "Press Start 2P", cursive;
  font-size: 10px;
  cursor: pointer;
  text-transform: uppercase;
  border: 2px solid #333;
  box-shadow: 2px 2px 0 #000;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const DifficultyWrapper = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);
  justify-content: center;
`;

const StartBtn = styled.div`
  font-size: 20px;
  color: #fff;
  font-weight: bold;
  text-shadow: 2px 2px 0 #000;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  animation: blink 1s infinite;
  margin-top: 10px;

  @keyframes blink {
    50% {
      opacity: 0.5;
    }
  }
`;

const Score = styled.div`
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 48px;
  color: #fff;
  text-shadow: 3px 3px 0 #000;
  z-index: 5;
`;
