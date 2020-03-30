const ga = window.ga||function(){(ga.q=ga.q||[]).push(arguments)};
ga.l =+ new Date;

ga('create', 'UA-68373171-8', 'auto');
ga('send', 'pageview');

export function sendEvent(...args) {
  ga('event', ...args);
}
