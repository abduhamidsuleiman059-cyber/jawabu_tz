window.loadTools = function(){ return Promise.resolve(window.JAWABU_TOOLS || []); };
window.initSearch = function(){
  var q = document.getElementById('q'), box = document.getElementById('results');
  if(!q || !box) return;
  var root = document.body.getAttribute('data-root') || '';
  var btn = document.querySelector('.sbtn');

  function find(s){
    s = s.trim().toLowerCase();
    if(!s) return [];
    return (window.JAWABU_TOOLS || []).filter(function(t){
      return (t.name+' '+t.cat+' '+t.tags).toLowerCase().indexOf(s) > -1;
    });
  }
  function show(force){
    var s = q.value.trim();
    if(s.length < 2 && !force){ box.hidden = true; return; }
    var hits = find(s).slice(0,6);
    box.innerHTML = hits.length
      ? hits.map(function(t){
          return '<a href="'+root+t.url+'"><span class="ric">'+ICON(CAT_ICON[t.cat])+'</span><span>'+t.name+'</span><em>'+t.cat+'</em></a>';
        }).join('')
      : '<div class="none">Hakuna kilichopatikana. Jaribu neno lingine.</div>';
    box.hidden = false;
  }
  function go(){
    var hits = find(q.value);
    if(hits.length){ location.href = root + hits[0].url; }
    else { q.focus(); if(q.value.trim()) show(true); }
  }
  q.addEventListener('input', function(){ show(false); });
  q.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); go(); } });
  if(btn) btn.addEventListener('click', go);
  document.addEventListener('click', function(e){ if(!e.target.closest('.search')) box.hidden = true; });
};