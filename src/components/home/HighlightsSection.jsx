import SectionHeading from './SectionHeading';

const HIGHLIGHTS = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Curated Picks',
    description: 'Handpicked restaurants and trending cuisines to help you discover your next favorite meal.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'Fresh Ingredients',
    description: 'Farm-fresh produce and premium spices sourced daily for unmatched taste and quality.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Real-Time Tracking',
    description: 'Follow your order from kitchen to doorstep with live updates and reliable delivery.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'Flexible Dining',
    description: 'Delivery, pickup, or dine-in — choose how you want to enjoy every time you order.',
  },
];

export default function HighlightsSection() {
  return (
    <section className="mb-10 sm:mb-16 md:mb-20" aria-labelledby="highlights-heading">
      <SectionHeading
        eyebrow="Why Food Buddy"
        title="Discover More, Enjoy More"
        subtitle="A platform built for food lovers — explore cuisines, compare restaurants, and find your perfect meal."
        compactMobile
      />

      {/* Horizontal swipe row on mobile; grid on larger screens */}
      <div className="home-mobile-scroll-row flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
        {HIGHLIGHTS.map((item, index) => (
          <article
            key={item.title}
            className="glass-surface-soft home-mobile-scroll-card group shrink-0 p-4 transition-all duration-300 active:scale-[0.98] sm:p-6 sm:active:scale-100 sm:hover:-translate-y-1 sm:hover:shadow-xl glass-rise"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 shadow-inner sm:mb-4 sm:h-12 sm:w-12 sm:group-hover:scale-105 sm:transition-transform sm:duration-300">
              {item.icon}
            </div>
            <h3 className="font-display text-base font-bold text-stone-900 sm:text-lg">{item.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600 sm:mt-2">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
