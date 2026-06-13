import { memo } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import PageTitle from '../components/common/PageTitle';
import SectionHeading from '../components/home/SectionHeading';
import ContactDetailCard from '../components/contact/ContactDetailCard';
import {
  CONTACT_CONFIG,
  CONTACT_DETAILS,
  CONTACT_SEO,
  DEVELOPER_INFO,
} from '../data/contactConfig';
import usePageMeta from '../hooks/usePageMeta';
import { formatPhoneDisplay } from '../utils/phone';

const ContactHoursList = memo(function ContactHoursList({ hours }) {
  return (
    <ul className="contact-hours-list">
      {hours.map((row) => (
        <li key={row.label} className="contact-hours-row">
          <span className="contact-hours-label">{row.label}</span>
          <span className="contact-hours-value">{row.value}</span>
        </li>
      ))}
    </ul>
  );
});

export default function ContactUsPage() {
  usePageMeta(CONTACT_SEO);

  const details = CONTACT_DETAILS.map((item) =>
    item.id === 'phone' ? { ...item, value: formatPhoneDisplay(item.value) } : item
  );

  return (
    <PageContainer className="!px-4 !py-5 sm:!px-6 sm:!py-8">
      <header className="mb-6 sm:mb-8">
        <PageTitle className="mb-2 sm:mb-3">Contact Us</PageTitle>
        <p className="home-lead max-w-2xl">
          Questions about {CONTACT_CONFIG.companyName}, the app, or your account? Reach our support
          team—we are here to help.
        </p>
      </header>

      <div className="contact-details-grid">
        {details.map((item) => (
          <ContactDetailCard key={item.id} {...item} />
        ))}

        <article className="contact-detail-card">
          <p className="contact-detail-label">Support hours</p>
          <ContactHoursList hours={CONTACT_CONFIG.workingHours} />
        </article>
      </div>

      <section className="premium-info-panel mt-6 sm:mt-8" aria-labelledby="about-heading">
        <SectionHeading
          eyebrow="About the app"
          title={CONTACT_CONFIG.companyName}
          subtitle={CONTACT_CONFIG.about}
          align="left"
          compactMobile
          className="!mb-0"
        />
        <p className="mt-4 text-sm text-stone-600">{CONTACT_CONFIG.tagline}</p>
      </section>

      <section className="premium-info-panel mt-6 sm:mt-8" aria-labelledby="developer-heading">
        <SectionHeading
          eyebrow="Built by"
          title={DEVELOPER_INFO.title}
          subtitle={DEVELOPER_INFO.about}
          align="left"
          compactMobile
          className="!mb-0"
        />
        <dl className="mt-4 space-y-2 text-sm text-stone-600">
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-stone-800">Team</dt>
            <dd>{DEVELOPER_INFO.name}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-stone-800">Role</dt>
            <dd>{DEVELOPER_INFO.role}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-stone-800">Version</dt>
            <dd>{DEVELOPER_INFO.version}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-stone-800">Stack</dt>
            <dd>{DEVELOPER_INFO.stack.join(' · ')}</dd>
          </div>
        </dl>
      </section>

      {CONTACT_CONFIG.socialLinks.length > 0 && (
        <section className="mt-6 sm:mt-8" aria-labelledby="social-heading">
          <h2 id="social-heading" className="home-heading mb-3 text-lg sm:text-xl">
            Follow {CONTACT_CONFIG.companyName}
          </h2>
          <div className="flex flex-wrap gap-3">
            {CONTACT_CONFIG.socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-pill px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50/80"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>
      )}

      <p className="mt-8 text-center text-sm text-stone-600">
        Prefer to browse menus first?{' '}
        <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">
          Discover restaurants
        </Link>
      </p>
    </PageContainer>
  );
}
