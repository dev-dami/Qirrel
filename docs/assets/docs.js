const entries = document.querySelectorAll('[data-motion]');

const io = new IntersectionObserver(
  (nodes) => {
    nodes.forEach((node) => {
      if (!node.isIntersecting) return;
      node.target.classList.add('in');
      io.unobserve(node.target);
    });
  },
  { threshold: 0.12 },
);

entries.forEach((entry, idx) => {
  entry.style.transitionDelay = `${Math.min(idx * 45, 240)}ms`;
  io.observe(entry);
});
