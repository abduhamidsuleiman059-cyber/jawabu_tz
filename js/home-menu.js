/* Jawabu TZ - menyu ya juu ya simu (index pekee) */
(function(){
  var btn = document.getElementById('hmBtn'), panel = document.getElementById('hmPanel'), ov = document.getElementById('hmOv');
  if(!btn || !panel || !ov) return;
  function set(open){
    btn.classList.toggle('open', open); panel.classList.toggle('on', open); ov.classList.toggle('on', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('hm-lock', open);
  }
  btn.addEventListener('click', function(){ set(!panel.classList.contains('on')); });
  ov.addEventListener('click', function(){ set(false); });
  panel.addEventListener('click', function(e){ if(e.target.closest && e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') set(false); });
  window.addEventListener('resize', function(){ if(window.innerWidth >= 800) set(false); });
})();