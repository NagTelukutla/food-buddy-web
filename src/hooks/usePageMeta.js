import { useEffect } from 'react';

const DEFAULT_TITLE = document.title;

function upsertMeta(name, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/** Sets document title and description for the current page; restores title on unmount. */
export default function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    if (title) document.title = title;
    upsertMeta('description', description);

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description]);
}
