export default function Stars({ value = 0, size = "text-sm", onChange }) {
  const interactive = typeof onChange === "function";
  return (
    <span className={`inline-flex ${size}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange(n)}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} ${
            n <= Math.round(value) ? "text-gold" : "text-ink/25"
          }`}
        >
          ★
        </button>
      ))}
    </span>
  );
}
