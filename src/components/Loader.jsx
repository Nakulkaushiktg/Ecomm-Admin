// Elegant spinning thread-spool loader for admin pages.
export default function Loader({ label = "Loading", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-16 ${className}`}>
      <div className="loader-ring">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p className="flex items-center font-serif text-base tracking-wide text-maroon/70">
        {label}
        <span className="loader-dots ml-1 text-maroon/50">
          <i></i>
          <i></i>
          <i></i>
        </span>
      </p>
    </div>
  );
}
