'use client';

export function Tooltip({
  label = 'Más información',
  content,
  className = '',
}: {
  label?: string;
  content: string;
  className?: string;
}) {
  return (
    <span className={`tooltip ${className}`.trim()} tabIndex={0} aria-label={label}>
      <span className="tooltip-trigger" aria-hidden="true">ⓘ</span>
      <span className="tooltip-bubble" role="tooltip">{content}</span>
    </span>
  );
}
