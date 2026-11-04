import lightSymbol from '@/assets/brand/variants/symbol-light.png';
import darkSymbol from '@/assets/brand/variants/symbol-dark.png';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  symbolOnly?: boolean;
  className?: string;
};

export function Logo({ size = 'md', symbolOnly = false, className = '' }: LogoProps) {
  return (
    <span aria-label="DayFlow" className={`logo logo--${size}${symbolOnly ? ' logo--symbol-only' : ''}${className ? ` ${className}` : ''}`} role="img">
      <span aria-hidden="true" className="logo__symbol">
        <img alt="" className="logo__variant logo__variant--light" src={lightSymbol} />
        <img alt="" className="logo__variant logo__variant--dark" src={darkSymbol} />
      </span>
      {!symbolOnly && <span aria-hidden="true" className="logo__wordmark">DayFlow</span>}
    </span>
  );
}
