import SectionHeading from './SectionHeading';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-current' : 'fill-stone-200 text-stone-200'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const FALLBACK_REVIEWS = [
  {
    id: 'fallback-1',
    rating: 5,
    comment: 'The dum biryani here is absolutely incredible — fragrant, perfectly spiced, and worth every rupee. A true taste of Andhra!',
    author: 'Priya S.',
    label: 'Regular Guest',
  },
  {
    id: 'fallback-2',
    rating: 5,
    comment: 'Fast delivery, hot food, and flavors that remind me of home. The starters and curries are always fresh and delicious.',
    author: 'Rahul M.',
    label: 'Food Enthusiast',
  },
  {
    id: 'fallback-3',
    rating: 4,
    comment: 'Beautiful ambiance for dine-in and equally great for pickup. The staff is warm and the portions are generous.',
    author: 'Ananya K.',
    label: 'Local Diner',
  },
];

export default function CustomerReviewsSection({ reviews, loading }) {
  const displayReviews =
    reviews?.length > 0
      ? reviews.slice(0, 6).map((r, i) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          author: r.customer_name || `Guest ${i + 1}`,
          label: r.order_id ? `Order ${r.order_id}` : 'Verified Diner',
        }))
      : FALLBACK_REVIEWS;

  if (loading) {
    return (
      <section className="mb-14 sm:mb-20" aria-label="Customer reviews loading">
        <SectionHeading eyebrow="Testimonials" title="Customer Reviews" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-surface-soft h-48 animate-pulse rounded-[1.75rem]" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-14 sm:mb-20" aria-labelledby="reviews-heading">
      <SectionHeading
        eyebrow="Testimonials"
        title="Customer Reviews"
        subtitle="Hear from diners who've experienced our flavors, service, and hospitality firsthand."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {displayReviews.map((review, index) => (
          <blockquote
            key={review.id}
            className="glass-surface-soft flex flex-col p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6 glass-rise"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <StarRating rating={review.rating} />
            <p className="mt-4 flex-1 text-sm leading-relaxed text-stone-700">
              &ldquo;{review.comment}&rdquo;
            </p>
            <footer className="mt-5 flex items-center gap-3 border-t border-white/50 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-200 to-brand-400 text-sm font-bold text-white shadow-inner">
                {review.author.charAt(0)}
              </div>
              <div>
                <cite className="not-italic text-sm font-semibold text-stone-900">{review.author}</cite>
                <p className="text-xs text-stone-500">{review.label}</p>
              </div>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
