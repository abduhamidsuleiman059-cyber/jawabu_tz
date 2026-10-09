(function(){
  var root = document.body.getAttribute('data-root') || '';
  loadTools().then(function(tools){
    initSearch();
    var chips = document.getElementById('chips');
    if(chips){
      chips.innerHTML = tools.slice(0,4).map(function(t){
        return '<a class="chip" href="'+root+t.url+'">'+t.name.replace('Kikokotoo cha ','')+'</a>';
      }).join('');
    }
    var pop = document.getElementById('popular');
    if(pop){
      pop.innerHTML = tools.slice(0,8).map(function(t){
        return '<a href="'+root+t.url+'"><span class="ic">'+t.icon+'</span>'+t.name+'<em>'+t.cat+'</em></a>';
      }).join('');
    }
  });
})();