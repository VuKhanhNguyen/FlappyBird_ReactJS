import styled from "styled-components";
import { useEffect, useState, useRef, useCallback } from "react";

const BIRD_HEIGHT = 28;
const BIRD_WIDTH = 33;
const WALL_HEIGHT = 600;
const WALL_WIDTH = 400;
// Physics tuned to feel like original Flappy Bird (velocity + gravity)
const GRAVITY_PX_PER_S2 = 2400;
const JUMP_VELOCITY_PX_PER_S = -710;
const MAX_FALL_SPEED_PX_PER_S = 950;
const OBJ_WIDTH = 52;
// (Legacy) OBJ_SPEED used to be px per 24ms tick; we now express speeds in px/second.
const OBJ_GAP = 200;
// Legacy constant kept for reference; jump is now velocity-based.
const JUMP_STRENGTH = 97;

const DIFFICULTY_SETTINGS = {
  // speed: px/second
  Easy: { speed: 120, gap: 230 },
  Medium: { speed: 150, gap: 200 },
  Hard: { speed: 180, gap: 180 },
  Hell: { speed: 230, gap: 140 },
  // Closest to the original feel
  Classic: { speed: 140, gap: 170 },
  Asian: { speed: 260, gap: 120 },
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
  const [scale, setScale] = useState(1);

  const scoreRef = useRef(score);
  const difficultyRef = useRef(difficulty);
  const settingsRef = useRef(DIFFICULTY_SETTINGS[difficulty]);
  const birdVelRef = useRef(0);
  const rafIdRef = useRef(null);
  const lastTimeRef = useRef(null);

  const currentSettings = DIFFICULTY_SETTINGS[difficulty];

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    difficultyRef.current = difficulty;
    settingsRef.current = DIFFICULTY_SETTINGS[difficulty];
  }, [difficulty]);

  // Handle resizing for responsive game container
  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;

      // Calculate scale based on available height (leaving some padding)
      // and width (on mobile)
      let newScale = Math.min(
        (windowHeight - 40) / WALL_HEIGHT,
        (windowWidth - 20) / WALL_WIDTH,
      );

      // Limit max scale to avoid pixelation looking too bad on huge screens
      // But ensure it's at least capable of fitting
      setScale(Math.max(0.5, Math.min(newScale, 1.2)));
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isStart) {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      lastTimeRef.current = null;
      birdVelRef.current = 0;
      return;
    }

    const loop = (time) => {
      if (lastTimeRef.current == null) lastTimeRef.current = time;
      const dtMs = Math.min(100, time - lastTimeRef.current);
      lastTimeRef.current = time;
      const dtSec = dtMs / 1000;

      // Bird physics: v += g*dt, y += v*dt
      setBirspos((prev) => {
        let v = birdVelRef.current;
        v = Math.min(v + GRAVITY_PX_PER_S2 * dtSec, MAX_FALL_SPEED_PX_PER_S);
        let next = prev + v * dtSec;

        if (next < 0) {
          next = 0;
          v = 0;
        }

        if (next > WALL_HEIGHT - BIRD_HEIGHT) {
          next = WALL_HEIGHT - BIRD_HEIGHT;
          v = 0;
        }

        birdVelRef.current = v;
        return next;
      });

      // Pipes movement (scaled by real elapsed time)
      setObjPos((prev) => {
        const settings = settingsRef.current;
        let speed = settings.speed;
        if (difficultyRef.current === "Classic") {
          speed += Math.floor(scoreRef.current / 10) * 10;
        }

        const next = prev - speed * dtSec;
        if (next < -OBJ_WIDTH) {
          setObjHeight(
            Math.floor(Math.random() * (WALL_HEIGHT - settings.gap)),
          );
          setScore((s) => s + 1);
          return WALL_WIDTH;
        }
        return next;
      });

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      lastTimeRef.current = null;
    };
  }, [isStart]);

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
      // Score reset removed to show score on game over screen
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

  const jump = useCallback(() => {
    setIsStart((started) => {
      if (!started) {
        setScore(0);
        // Ensure pipes start from a consistent position on new run
        setObjPos(WALL_WIDTH);
        setObjHeight(
          Math.floor(
            Math.random() *
              (WALL_HEIGHT - DIFFICULTY_SETTINGS[difficultyRef.current].gap),
          ),
        );
        setBirspos(300);
        birdVelRef.current = 0;
        return true;
      }
      return true;
    });

    // Original-like flap: set upward velocity impulse
    birdVelRef.current = JUMP_VELOCITY_PX_PER_S;
  }, []);

  const handler = () => {
    jump();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [jump]);

  const handleDifficultyChange = (e, level) => {
    e.stopPropagation(); // Prevent game from starting when clicking buttons
    setDifficulty(level);
  };

  return (
    <Home>
      <InfoPanel className="left">
        <PanelContent>
          <h2>HOW TO PLAY</h2>
          <InstructionRow>
            <KeyIcon>SPACE</KeyIcon> <span>or</span> <TapIcon>👆</TapIcon>
          </InstructionRow>
          <p>Press Space or Tap to fly</p>
          <p>Avoid pipes</p>
        </PanelContent>
      </InfoPanel>

      <GameWrapper>
        <GameContainer style={{ transform: `scale(${scale})` }}>
          <Background height={WALL_HEIGHT} width={WALL_WIDTH} onClick={handler}>
            <Score>{score}</Score>
            {!isStart && (
              <Startboard>
                <Title>Flappy Bird</Title>
                <BestScore>
                  Score: {score} <br />
                  <br />
                  Best: {bestScore}
                </BestScore>
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
      </GameWrapper>

      <InfoPanel className="right">
        <PanelContent>
          <h2>CREDITS</h2>
          <p>Developed with React</p>
          <p>Author: khanhkhiemton</p>
          <div style={{ marginTop: "20px" }}>
            <h3>DIFFICULTY</h3>
            <DifficultyDisplay>{difficulty}</DifficultyDisplay>
          </div>
        </PanelContent>
      </InfoPanel>
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
  overflow: hidden;
  gap: 20px;

  @media (max-width: 800px) {
    gap: 0;
  }
`;

const InfoPanel = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;

  @media (max-width: 1000px) {
    display: none;
  }

  &.left {
    align-items: center;
    justify-content: flex-end;
    padding-right: 50px;
  }

  &.right {
    align-items: center;
    justify-content: flex-start;
    padding-left: 50px;
  }
`;

const PanelContent = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 200px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);

  h2 {
    margin-bottom: 20px;
    font-size: 24px;
    text-shadow: 2px 2px 0 #000;
    color: #ffd700;
  }

  p {
    margin: 10px 0;
    line-height: 1.5;
    font-size: 14px;
    text-shadow: 1px 1px 0 #000;
  }
`;

const InstructionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
  font-size: 12px;
`;

const KeyIcon = styled.div`
  border: 2px solid white;
  padding: 5px 10px;
  border-radius: 5px;
  font-family: inherit;
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 0 #000;
`;

const TapIcon = styled.div`
  font-size: 24px;
`;

const DifficultyDisplay = styled.div`
  font-size: 20px;
  color: #ffd700;
  text-shadow: 2px 2px 0 #000;
  margin-top: 10px;
  text-transform: uppercase;
`;

// Wrapper to handle the scaling container centering
const GameWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
`;

const GameContainer = styled.div`
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  overflow: hidden;
  border: 4px solid #333;
  /* Transform origin center is default, but ensuring it scales from center */
  transform-origin: center center;
`;

const Background = styled.div`
  background-image: url("./images/background-day.png");
  background-repeat: no-repeat;
  background-size: cover;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
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
  /* Avoid smoothing; we want immediate, arcade-like response */
  transition: none;
  will-change: top;
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

const DifficultyWrapper = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);
  justify-content: center;
`;

const DifficultyBtn = styled.button`
  background: ${(props) => (props.active ? "#ffd700" : "#fff")};
  color: ${(props) => (props.active ? "#000" : "#333")};
  border: none;
  padding: 8px 5px;
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
