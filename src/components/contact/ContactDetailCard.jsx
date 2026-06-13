import { memo } from 'react';

function ContactDetailCard({ label, value, href, external = false }) {
  const content = (
    <>
      <p className="contact-detail-label">{label}</p>
      <p className="contact-detail-value">{value}</p>
    </>
  );

  if (!href) {
    return <article className="contact-detail-card">{content}</article>;
  }

  return (
    <a
      href={href}
      className="contact-detail-card contact-detail-card--link"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </a>
  );
}

export default memo(ContactDetailCard);
