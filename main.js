// Interactive behaviors & dashboard simulation
(() => {
  // Hero stat animation
  function animateStats(){
    const bins = document.getElementById('statBins');
    const saves = document.getElementById('statSaves');
    const co2 = document.getElementById('statCO2');
    let i = 0;
    const ints = setInterval(() => {
      i++;
      if(bins) bins.textContent = 100 + i + '+';
      if(saves) saves.textContent = Math.min(40, Math.floor(i/2)) + '%';
      if(co2) co2.textContent = '-' + Math.min(25, Math.floor(i/3)) + '%';
      if(i>50) clearInterval(ints);
    }, 30);
  }

  // HERO fill animation (non-dashboard)
  function setHeroFill(val){
    const el = document.getElementById('heroFill');
    if(el){
      el.style.height = val + '%';
      el.textContent = Math.round(val) + '%';
    }
  }
  setHeroFill(65);
  animateStats();

  // Dashboard bins data
  const binDefs = [
    {id:'A1', label:'Bin A1', value:45},
    {id:'B7', label:'Bin B7', value:72},
    {id:'C3', label:'Bin C3', value:28},
    {id:'D9', label:'Bin D9', value:10},
    {id:'E5', label:'Bin E5', value:88},
    {id:'F2', label:'Bin F2', value:53}
  ];

  let simInterval = null;
  let simDelay = 2000;

  function createBinCard(def){
    const card = document.createElement('div');
    card.className = 'bin-card';
    card.dataset.id = def.id;
    card.innerHTML = `
      <div class="badge" id="badge-${def.id}">${statusText(def.value)}</div>
      <h4>${def.label}</h4>
      <div class="mini-fill">
        <div class="bin-fill-bar" id="bar-${def.id}" style="height:${def.value}%">${def.value}%</div>
      </div>
      <p class="meta">Last updated: <span id="time-${def.id}">--:--:--</span></p>
    `;
    // click -> open modal
    card.addEventListener('click', () => openModal(def.id));
    return card;
  }

  function statusText(v){
    if(v > 85) return 'FULL';
    if(v > 60) return 'HIGH';
    return 'OK';
  }

  function openModal(id){
    const modal = document.getElementById('binModal');
    const def = binDefs.find(b => b.id === id);
    if(!def) return;
    document.getElementById('modalTitle').textContent = def.label;
    document.getElementById('modalFill').textContent = def.value + '%';
    document.getElementById('modalDist').textContent = Math.round((1 - def.value/100) * 40 + 2) + ' cm';
    document.getElementById('modalTime').textContent = new Date().toLocaleTimeString();
    document.getElementById('modalStatus').textContent = statusText(def.value);
    document.getElementById('binModal').classList.remove('hidden');

    // wire modal actions
    document.getElementById('emptyBtn').onclick = () => {
      updateBinValue(id, 0);
      document.getElementById('binModal').classList.add('hidden');
    };
    document.getElementById('alertBtn').onclick = () => {
      alert('Alert sent for ' + def.label + ' (demo)');
    };
  }

  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('binModal').classList.add('hidden');
  });

  function renderBins(){
    const grid = document.getElementById('binsGrid');
    if(!grid) return;
    grid.innerHTML = '';
    binDefs.forEach(def => {
      grid.appendChild(createBinCard(def));
      const t = document.getElementById('time-' + def.id);
      if(t) t.textContent = new Date().toLocaleTimeString();
    });
    drawFleet();
  }

  function updateBinValue(id, newVal){
    const def = binDefs.find(b => b.id === id);
    if(!def) return;
    def.value = Math.max(0, Math.min(100, Math.round(newVal)));
    const bar = document.getElementById('bar-' + id);
    const badge = document.getElementById('badge-' + id);
    const tim = document.getElementById('time-' + id);
    if(bar) { bar.style.height = def.value + '%'; bar.textContent = def.value + '%'; }
    if(badge) { badge.textContent = statusText(def.value); badge.style.background = def.value > 85 ? '#4b0011' : def.value > 60 ? '#5a2b00' : '#062a1e'; }
    if(tim) tim.textContent = new Date().toLocaleTimeString();
    drawFleet();
  }

  function stepSim(){
    binDefs.forEach(b => {
      const change = Math.floor(Math.random() * 18) - 3; // -3..14
      let next = b.value + change;
      if(next > 100) next = 100;
      if(next < 0) next = 0;
      updateBinValue(b.id, next);
    });
  }

  // fleet chart
  function drawFleet(){
    const cvs = document.getElementById('fleetChart');
    if(!cvs) return;
    const ctx = cvs.getContext('2d');
    const w = cvs.width = cvs.clientWidth;
    const h = cvs.height = cvs.clientHeight;
    ctx.clearRect(0,0,w,h);
    // background
    ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.fillRect(0,0,w,h);
    const points = binDefs.map(b => b.value);
    ctx.beginPath();
    const step = w / (points.length - 1);
    points.forEach((p,i) => {
      const x = i * step;
      const y = h - (p/100) * h;
      if(i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.lineWidth = 3; ctx.strokeStyle = '#7a5cff'; ctx.stroke();
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'rgba(122,92,255,0.18)'); grad.addColorStop(1,'rgba(0,245,212,0.02)');
    ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
  }

  // controls
  document.getElementById('startSim').addEventListener('click', () => {
    if(simInterval) return;
    const sel = document.getElementById('intervalSel');
    simDelay = parseInt(sel.value,10);
    simInterval = setInterval(stepSim, simDelay);
    stepSim();
  });
  document.getElementById('stopSim').addEventListener('click', () => {
    if(simInterval){ clearInterval(simInterval); simInterval = null; }
  });
  document.getElementById('intervalSel').addEventListener('change', (e) => {
    simDelay = parseInt(e.target.value,10);
    if(simInterval){ clearInterval(simInterval); simInterval = setInterval(stepSim, simDelay); }
  });

  // init
  window.addEventListener('load', () => {
    renderBins();
  });

})();
