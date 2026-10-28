interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  dark?: boolean;
}

export default function PixelCard({ children, className = '', title, dark = false }: PixelCardProps) {
  return (
    <div className={[(dark ? 'card-pixel-dark' : 'card-pixel'), className].filter(Boolean).join(' ')}>
      {title && (
        <div className="font-pixel text-[10px] text-xp-gold border-b-2 border-white pb-2 mb-3">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
