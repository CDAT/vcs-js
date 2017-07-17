$(function () {
  document.body.style.padding = '0';
  document.body.style.margin = '0';
  const divRenderer = document.createElement('div');
  document.body.appendChild(divRenderer);
  divRenderer.style.position = 'relative';
  divRenderer.style.width = '100vw';
  divRenderer.style.height = '100vh';
  divRenderer.style.overflow = 'hidden';  
  vcs.remoteRenderer(divRenderer, window)
});
