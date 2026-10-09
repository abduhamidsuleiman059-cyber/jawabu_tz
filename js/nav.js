(function(){
  var root = document.body.getAttribute('data-root') || '';
  var MENU = [
    {t:'Nyumbani', i:'home', u:'index.html'},
    {t:'Pesa', i:'calc', sub:[['PAYE','pesa/paye.html'],['NSSF','pesa/nssf.html'],['HESLB','pesa/heslb.html'],['Mkopo','pesa/mkopo.html'],['Kodi ya TRA','pesa/kodi.html']]},
    {t:'Afya', i:'heart', sub:[['BMI','afya/bmi.html'],['Kalori','afya/kalori.html'],['Tarehe ya kujifungua','afya/kujifungua.html']]},
    {t:'Elimu', i:'cap', sub:[['GPA','elimu/gpa.html'],['Alama','elimu/alama.html'],['NECTA','elimu/necta.html']]},
    {t:'Zaidi', i:'more', sub:[['Faida na Hasara','biashara/faida.html'],['VAT','biashara/vat.html'],['Bei ya Kuuza','biashara/bei-ya-kuuza.html'],['Kuhusu','about.html'],['Mawasiliano','contact.html']]}
  ];
  var nav = document.getElementById('bottom-nav');
  if(!nav) return;
  var here = location.pathname.split('/').slice(-2).join('/');
  var inFolder = /(pesa|afya|elimu|biashara)\//.test(here);
  var html = '';
  MENU.forEach(function(m){
    if(m.u){
      var on = !inFolder && (location.pathname.slice(-1) === '/' || /index\.html$/.test(location.pathname));
      html += '<a class="nv'+(on?' on':'')+'" href="'+root+m.u+'"><i>'+ICON(m.i)+'</i>'+m.t+'</a>';
    } else {
      var active = m.sub.some(function(s){return here === s[1];});
      html += '<div class="nv'+(active?' on':'')+'"><button type="button" class="nvbtn" aria-expanded="false" style="display:flex;flex-direction:column;align-items:center;gap:2px;width:100%;color:inherit;font-size:inherit;font-weight:inherit"><i>'+ICON(m.i)+'</i>'+m.t+'<span class="caret">▲</span></button><div class="drop">'+
        m.sub.map(function(s){return '<a href="'+root+s[1]+'">'+s[0]+'</a>';}).join('')+'</div></div>';
    }
  });
  nav.innerHTML = html;
  nav.addEventListener('click', function(e){
    var b = e.target.closest('.nvbtn');
    if(!b) return;
    var box = b.parentNode, was = box.classList.contains('open');
    nav.querySelectorAll('.nv.open').forEach(function(x){x.classList.remove('open');});
    if(!was){ box.classList.add('open'); b.setAttribute('aria-expanded','true'); }
    e.stopPropagation();
  });
  document.addEventListener('click', function(){
    nav.querySelectorAll('.nv.open').forEach(function(x){x.classList.remove('open');});
  });
})();