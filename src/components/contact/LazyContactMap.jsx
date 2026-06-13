import { memo, useEffect, useRef, useState } from 'react';

function LazyContactMap({ embedUrl, title = 'Location map' }) {
  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!embedUrl) return null;

  return (
    <div ref={containerRef} className="contact-map-shell">
      {shouldLoad ? (
        <iframe
          title={title}
          src={embedUrl}
          className="contact-map-frame"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="contact-map-placeholder" aria-hidden>
          <span className="text-sm font-medium text-stone-500">Map loading…</span>
        </div>
      )}
    </div>
  );
}

export default memo(LazyContactMap);
