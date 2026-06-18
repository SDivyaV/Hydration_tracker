import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

const dailyGoal = 3000;
const quickAdds = [250, 500, 750, 1000];
const confettiColors = ["#38bdf8", "#22c55e", "#facc15", "#fb7185", "#a78bfa", "#2dd4bf"];

const api = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatHeroDate(date = new Date()) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

const pageMotion = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

function getHydrationScore(progressPercent) {
  if (progressPercent >= 100) {
    return "Great job! \uD83D\uDCA7";
  }

  if (progressPercent >= 75) {
    return "Almost there!";
  }

  if (progressPercent >= 45) {
    return "Nice rhythm!";
  }

  if (progressPercent > 0) {
    return "Keep sipping!";
  }

  return "Start strong!";
}

function WaterBottle({ progressPercent, todayTotal }) {
  const fillPercent = Math.min(Math.max(progressPercent, 0), 100);
  const fillHeight = `${fillPercent}%`;

  return (
    <div className="bottleStage" aria-label={`Animated water bottle showing ${fillPercent}% progress`}>
      <motion.div
        className="bottleCap"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="bottleNeck"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="bottle"
        animate={{ y: [0, -6, 0], rotate: [0, -1.2, 0.8, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="bottleGlass" />
        <motion.div
          className="bottleFill"
          initial={{ height: 0 }}
          animate={{ height: fillHeight }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="wave waveBack" />
          <div className="wave waveFront" />
          <div className="waterGlow" />
        </motion.div>
        <div className="bottleShine" />
        <div className="measurements" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="bottleLabel">
          <strong>{(todayTotal / 1000).toFixed(1)}L</strong>
          <span>of 3.0L</span>
        </div>
      </motion.div>
    </div>
  );
}

function ConfettiBurst({ burstKey }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 44 }, (_, index) => ({
        id: `${burstKey}-${index}`,
        color: confettiColors[index % confettiColors.length],
        x: Math.cos((index / 44) * Math.PI * 2) * (110 + (index % 5) * 24),
        y: Math.sin((index / 44) * Math.PI * 2) * (80 + (index % 4) * 20) - 60,
        rotate: (index % 2 === 0 ? 1 : -1) * (160 + index * 9),
        delay: (index % 8) * 0.018,
      })),
    [burstKey],
  );

  return (
    <div className="confettiLayer" aria-hidden="true">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          className="confettiPiece"
          style={{ backgroundColor: piece.color }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: piece.x,
            y: piece.y,
            scale: [0, 1, 0.9],
            opacity: [1, 1, 0],
            rotate: piece.rotate,
          }}
          transition={{ duration: 1.35, delay: piece.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [todayTotal, setTodayTotal] = useState(0);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const previousTotal = useRef(null);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const dateA = `${a.date || ""}-${String(a.id || 0).padStart(8, "0")}`;
      const dateB = `${b.date || ""}-${String(b.id || 0).padStart(8, "0")}`;
      return dateB.localeCompare(dateA);
    });
  }, [history]);

  const progressPercent = useMemo(() => {
    return Math.min(Math.round((todayTotal / dailyGoal) * 100), 100);
  }, [todayTotal]);

  const remaining = Math.max(dailyGoal - todayTotal, 0);
  const intakeLiters = (todayTotal / 1000).toFixed(1);
  const hydrationScore = getHydrationScore(progressPercent);

  async function loadDashboard() {
    setIsLoading(true);
    setError("");

    try {
      const [totalResponse, historyResponse] = await Promise.all([
        api.get("/water/today"),
        api.get("/api/water-intake"),
      ]);

      setTodayTotal(Number(totalResponse.data) || 0);
      setHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Unable to load dashboard.");
    } finally {
      setIsLoading(false);
    }
  }

  async function addWater(milliliters) {
    setIsSaving(true);
    setError("");

    try {
      await api.post("/water", {
        date: todayIsoDate(),
        milliliters,
      });

      await loadDashboard();
      setToast(`Added ${milliliters} ml`);
      window.setTimeout(() => setToast(""), 2600);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Unable to save water intake.");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (previousTotal.current !== null && previousTotal.current < dailyGoal && todayTotal >= dailyGoal) {
      setConfettiBurst((burst) => burst + 1);
      setToast("3L goal reached!");
      window.setTimeout(() => setToast(""), 2800);
    }

    previousTotal.current = todayTotal;
  }, [todayTotal]);

  return (
    <main className={`dashboardShell ${isDarkMode ? "themeDark" : "themeLight"}`}>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{confettiBurst > 0 && <ConfettiBurst key={confettiBurst} burstKey={confettiBurst} />}</AnimatePresence>

      <motion.section
        className="dashboard"
        variants={pageMotion}
        initial="hidden"
        animate="visible"
      >
        <motion.header
          className="dashboardHeader"
          variants={cardMotion}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div>
            <p className="dateText">{formatHeroDate()}</p>
            <h1>Hydration dashboard</h1>
          </div>

          <div className="headerActions">
            <button
              type="button"
              onClick={() => setIsDarkMode((value) => !value)}
              className="themeToggle"
              aria-pressed={isDarkMode}
              aria-label="Toggle dark mode"
            >
              <span className="toggleTrack">
                <motion.span className="toggleThumb" layout />
              </span>
              <span>{isDarkMode ? "Dark" : "Light"}</span>
            </button>

            <button type="button" onClick={loadDashboard} disabled={isLoading || isSaving} className="refreshButton">
              Refresh
            </button>
          </div>
        </motion.header>

        <motion.section
          className="heroPanel"
          variants={cardMotion}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="heroCopy">
            <motion.div
              className="scorePill"
              key={hydrationScore}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {hydrationScore}
            </motion.div>

            <div className="literRow">
              <span>{isLoading ? "..." : intakeLiters}</span>
              <strong>L</strong>
            </div>
            <p className="remainingText">
              {remaining > 0 ? `${remaining} ml left to complete your 3L goal.` : "You have completed your 3L goal."}
            </p>

            <div className="progressPanel">
              <div className="progressMeta">
                <p>Progress to 3L</p>
                <strong>{progressPercent}%</strong>
              </div>
              <div className="progressTrack">
                <motion.div
                  className="progressFill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          <WaterBottle progressPercent={progressPercent} todayTotal={todayTotal} />
        </motion.section>

        <div className="contentGrid">
          <motion.section
            className="panel"
            variants={cardMotion}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <p className="sectionKicker">Quick add</p>
            <h2>Log water</h2>

            <div className="quickGrid">
              {quickAdds.map((value) => (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => addWater(value)}
                  disabled={isSaving}
                  className="quickButton"
                  whileTap={{ scale: 0.98 }}
                >
                  <span>+{value}ml</span>
                  <strong>Add</strong>
                </motion.button>
              ))}
            </div>

            {error && (
              <motion.p
                className="errorText"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}
          </motion.section>

          <motion.section
            className="panel"
            variants={cardMotion}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="historyHeader">
              <div>
                <p className="sectionKicker">History</p>
                <h2>Water intake log</h2>
              </div>
              <span className="entryCount">{history.length} entries</span>
            </div>

            <div className="tableFrame">
              <div className="tableScroller">
                <table>
                  <thead>
                    <tr>
                      <th>Entry</th>
                      <th>Date</th>
                      <th className="alignRight">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHistory.length === 0 ? (
                      <tr>
                        <td className="emptyState" colSpan="3">
                          No water logged yet
                        </td>
                      </tr>
                    ) : (
                      sortedHistory.map((entry) => (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <td>#{entry.id}</td>
                          <td>{formatDate(entry.date)}</td>
                          <td className="alignRight amountCell">{entry.milliliters ?? 0} ml</td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        </div>
      </motion.section>
    </main>
  );
}
