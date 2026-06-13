export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
  compactMobile = false,
}) {
  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
  const subtitleClass =
    align === 'left' ? '' : align === 'right' ? 'ml-auto' : 'mx-auto';
  const spacingClass = compactMobile
    ? 'mb-5 sm:mb-8 md:mb-10'
    : align === 'left' || align === 'right'
      ? 'mb-0'
      : 'mb-6 sm:mb-8 md:mb-10';

  return (
    <div className={`${spacingClass} ${alignClass} ${className}`.trim()}>
      {eyebrow && <p className="home-eyebrow mb-2">{eyebrow}</p>}
      <h2 className="home-heading">{title}</h2>
      {subtitle && (
        <p className={`home-lead mt-2 max-w-2xl sm:mt-2.5 md:mt-3 ${subtitleClass}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
