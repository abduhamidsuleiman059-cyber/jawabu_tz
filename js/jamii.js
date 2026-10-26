/* Jawabu TZ - Jamii: weka viungo vya vikundi hapa chini (mahali PEKEE panapohitaji kubadilishwa) */
(function(){
  var WHATSAPP_URL = 'https://whatsapp.com/channel/0029VbDZrfABKfi6R8nQYT2D';

  var $ = function(id){ return document.getElementById(id); };
  function setLink(id, url, label){
    var a = $(id); if(!a || !url) return;
    a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = label; a.classList.remove('soon');
  }
  setLink('jWa', WHATSAPP_URL, 'Jiunge WhatsApp');

  var base = location.href.split(/[?#]/)[0].replace(/[^\/]*$/, '');
  var text = 'Jawabu TZ: vikokotoo vya bure vya PAYE, NSSF, HESLB, BMI, GPA, VAT na zaidi.';
  var wa = $('jShareWa');
  if(wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + base);

  var toast = $('jToast'), tt;
  function say(m){ toast.textContent = m; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(function(){ toast.classList.remove('on'); }, 2200); }
  var sh = $('jShare');
  if(sh) sh.addEventListener('click', function(){
    if(navigator.share){ navigator.share({title: 'Jawabu TZ', text: text, url: base}).catch(function(){}); return; }
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(base).then(function(){ say('Kiungo kimenakiliwa'); }, function(){ say('Nakili kiungo: ' + base); }); }
    else say('Nakili kiungo: ' + base);
  });
})();