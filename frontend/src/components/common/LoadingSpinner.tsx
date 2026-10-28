export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="flex gap-2">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="w-4 h-4 bg-accent-red"
            style={{ animation: `pixelBlink 0.8s step-end ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <div className="font-pixel text-[10px] text-gray-400" style={{ animation: 'pixelBlink 1s step-end infinite' }}>
        LOADING...
      </div>
    </div>
  );
}
