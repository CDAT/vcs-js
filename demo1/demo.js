$(function () {
  document.body.style.padding = '0';
  document.body.style.margin = '0';
  const divRenderer = document.getElementById('one');
  divRenderer.style.position = 'relative';
  divRenderer.style.overflow = 'hidden';  
  vcs.remoteRenderer(divRenderer, window)

  const divRenderer1 = document.getElementById('two');
  divRenderer1.style.position = 'relative';
  divRenderer1.style.overflow = 'hidden';  
  vcs.remoteRenderer(divRenderer1, window)  
});
