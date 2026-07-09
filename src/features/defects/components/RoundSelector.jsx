function RoundSelector({ rounds, selectedRound, onRoundChange }) {
  const currentIndex = rounds.findIndex(
    (round) => round.roundKey === selectedRound?.roundKey
  );
  const prevRound =
    currentIndex >= 0 && currentIndex < rounds.length - 1
      ? rounds[currentIndex + 1]
      : null;
  const nextRound = currentIndex > 0 ? rounds[currentIndex - 1] : null;

  if (rounds.length === 0 || !selectedRound) {
    return null;
  }

  return (
    <div className="df-week-selector">
      <button
        type="button"
        className="df-week-nav-btn"
        onClick={() => prevRound && onRoundChange(prevRound)}
        disabled={!prevRound}
        aria-label="이전 주차"
      >
        ‹
      </button>
      <div className="df-week-label">
        <strong>
          {selectedRound.year}년 {selectedRound.roundLabel}
        </strong>
        <span>목요일 {selectedRound.thursdayDate.replaceAll("-", ".")}</span>
      </div>
      <button
        type="button"
        className="df-week-nav-btn"
        onClick={() => nextRound && onRoundChange(nextRound)}
        disabled={!nextRound}
        aria-label="다음 주차"
      >
        ›
      </button>
    </div>
  );
}

export default RoundSelector;
