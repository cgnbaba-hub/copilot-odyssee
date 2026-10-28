import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  success:   'btn-success',
  danger:    'btn-danger',
  ghost:     'btn-ghost',
};

export default function PixelButton({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  fullWidth = false,
  className = '',
  type = 'button',
  ...rest
}: PixelButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        variantClass[variant],
        isDisabled ? 'opacity-50 cursor-not-allowed active:shadow-pixel active:translate-x-0 active:translate-y-0' : '',
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center gap-1 justify-center">
          <span className="inline-block w-2 h-2 bg-current" style={{ animation: 'pixelBlink 0.8s step-end 0s infinite' }} />
          <span className="inline-block w-2 h-2 bg-current" style={{ animation: 'pixelBlink 0.8s step-end 0.2s infinite' }} />
          <span className="inline-block w-2 h-2 bg-current" style={{ animation: 'pixelBlink 0.8s step-end 0.4s infinite' }} />
        </span>
      ) : children}
    </button>
  );
}
