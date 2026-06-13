import { APP_NAME } from '../utils/constants';

/** Static Food Buddy app contact — bundled at build time, no API or restaurant data. */
export const CONTACT_CONFIG = {
  brandName: APP_NAME,
  companyName: APP_NAME,
  tagline: 'Discover restaurants and order food you love.',
  about:
    'Food Buddy is a modern food ordering platform that helps you discover local restaurants, place delivery orders, and track your meals in real time.',
  phone: '+91 9885418917',
  email: 'nagtelukutla123@gmail.com',
  workingHours: [{ label: 'App support', value: 'Monday – Sunday, 9 AM – 9 PM IST' }],
  socialLinks: [
    {
      id: 'instagram',
      label: 'Instagram',
      href: 'https://www.instagram.com/',
    },
    {
      id: 'whatsapp',
      label: 'Whatsapp',
      href: 'https://wa.me/919885418917',
    },
  ],
};

/** Static developer / project information for the Contact page. */
export const DEVELOPER_INFO = {
  title: 'Developer information',
  name: 'Food Buddy Development Team',
  role: 'Design & engineering',
  about:
    'Food Buddy is built with React, Vite, Tailwind CSS, and FastAPI. This project focuses on a smooth ordering experience for customers and simple tools for restaurants and delivery partners.',
  email: 'nagtelukutla123@gmail.com',
  version: '1.0.0',
  stack: ['React 18', 'Vite', 'Tailwind CSS', 'FastAPI', 'PostgreSQL'],
};

function telHref(phone = '') {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `tel:+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `tel:+${digits}`;
  return `tel:${phone.replace(/\s/g, '')}`;
}

export const CONTACT_SEO = {
  title: `Contact Us | ${APP_NAME}`,
  description: `Reach ${CONTACT_CONFIG.companyName} support on ${CONTACT_CONFIG.phone} or ${CONTACT_CONFIG.email}.`,
};

export const CONTACT_DETAILS = [
  {
    id: 'phone',
    label: 'Support phone',
    value: CONTACT_CONFIG.phone,
    href: telHref(CONTACT_CONFIG.phone),
  },
  {
    id: 'email',
    label: 'Support email',
    value: CONTACT_CONFIG.email,
    href: `mailto:${CONTACT_CONFIG.email}`,
  },
  {
    id: 'dev-email',
    label: 'Developer email',
    value: DEVELOPER_INFO.email,
    href: `mailto:${DEVELOPER_INFO.email}`,
  },
];