(function(){
"use strict";

/* ===================== DATA ===================== */
const RARITIES = {
  raro:     {label:'Raro',      base:52,  color:'#3ba7ff', cls:'raro',     mult:2},
  epico:    {label:'Épico',     base:30,  color:'#b34bff', cls:'epico',    mult:3},
  lendario: {label:'Lendário',  base:14,  color:'#ffb020', cls:'lendario', mult:5},
  mitico:   {label:'Mítico',    base:3.5, color:null,      cls:'mitico',   mult:8},
  segredo:  {label:'Segredo',   base:0.5, color:null,      cls:'segredo',  mult:10},
  especial: {label:'Especial',  base:0,   color:'#ffe45e', cls:'especial', mult:15}
};
// RNG / Loja só sorteiam entre essas (Especial é exclusiva de Raid)
const RARITY_ORDER = ['raro','epico','lendario','mitico','segredo'];
const RARITY_ORDER_ALL = ['raro','epico','lendario','mitico','segredo','especial'];

const ITEMS = {
  raro:[
    {n:'Espada de Energia de Pixel', t:'faca', i:'🗡️'},
    {n:'Bastão Tung Tung', t:'faca', i:'🏏'},
    {n:'Lança Celestial', t:'faca', i:'🔱'},
    {n:'Abelha AK', t:'arma', i:'🔫'},
    {n:'Cacto', t:'arma', i:'🌵'},
    {n:'Pistola de Operações do Deserto', t:'arma', i:'🔫'},
    {n:'Revólver Estelar', t:'arma', i:'🔫'}
  ],
  epico:[
    {n:'Faca de Obsidiana Sobrecarregada', t:'faca', i:'🗡️'},
    {n:'Faca de Articulação Prismática', t:'faca', i:'🗡️'},
    {n:'Adaga de Lua de Sangue', t:'faca', i:'🗡️'},
    {n:'Karambit de Abelha', t:'faca', i:'🪝'},
    {n:'AK de Obsidiana Sobrecarregado', t:'arma', i:'🔫'},
    {n:'Slime AK', t:'arma', i:'🔫'},
    {n:'Slime Azul AK', t:'arma', i:'🔫'},
    {n:'SMG de Onda Sonora', t:'arma', i:'🔫'}
  ],
  lendario:[
    {n:'Karambit Estelar', t:'faca', i:'🪝'},
    {n:'Karambit Rosa Iluminado por Estrelas', t:'faca', i:'🪝'},
    {n:'Punhal de Flor Sombria Noturna', t:'faca', i:'🗡️'},
    {n:'Faca de Borboleta', t:'faca', i:'🦋'},
    {n:'Vórtice AK', t:'arma', i:'🔫'},
    {n:'Flor Rosa AK', t:'arma', i:'🔫'},
    {n:'Mecha Escorpião', t:'arma', i:'🦂'},
    {n:'Celestial M16', t:'arma', i:'🔫'},
    {n:'UFO Bullpup', t:'arma', i:'🛸'}
  ],
  mitico:[
    {n:'Faca de Borboleta do Vazio', t:'faca', i:'🦋'},
    {n:'Starnova Karambit', t:'faca', i:'🪝'},
    {n:'M16 Polarizado Azure', t:'arma', i:'🔫'},
    {n:'Runas Corruptas AK', t:'arma', i:'🔫'},
    {n:'Starnova Barrett', t:'arma', i:'🔫'}
  ],
  segredo:[
    {n:'Karambit do Crepúsculo', t:'faca', i:'🪝'},
    {n:'Faca de Borboleta de Desvio para o Vermelho', t:'faca', i:'🦋'},
    {n:'Barrett do Crepúsculo', t:'arma', i:'🔫'},
    {n:'Runas de Carnificação AK', t:'arma', i:'🔫'},
    {n:'M16 Polarizado Escarlate', t:'arma', i:'🔫'}
  ],
  especial:[
    {n:'Lâmina do Vazio Absoluto', t:'faca', i:'🗡️'},
    {n:'Karambit Singularidade', t:'faca', i:'🪝'},
    {n:'AWP Dimensional', t:'arma', i:'🔫'},
    {n:'Canhão Estelar Primordial', t:'arma', i:'🔫'}
  ]
};

const SHOP_TIERS = [
  {level:1,   price:1250,   rarity:'raro',     label:'Item Raro'},
  {level:10,  price:5000,   rarity:'epico',    label:'Item Épico'},
  {level:25,  price:10000,  rarity:'lendario', label:'Item Lendário'},
  {level:50,  price:30000,  rarity:'mitico',   label:'Item Mítico'},
  {level:100, price:500000, rarity:'segredo',  label:'Item Segredo'}
];

const RAIDS = [
  {key:'jjk',  name:'Jujutsu Kaisen', icon:'🌀', mult:2, color:'#7c5cff'},
  {key:'op',   name:'One Piece',      icon:'🏴‍☠️', mult:3, color:'#ff8a3d'},
  {key:'jojo', name:'JoJo',           icon:'⭐', mult:4, color:'#ffd23d'},
  {key:'ds',   name:'Demon Slayer',   icon:'🗡️', mult:5, color:'#ff4d5e'}
];

const SPECIAL_ITEMS = {
  rika:      {name:'Rika',                  icon:'🕊️', theme:'Jujutsu Kaisen', desc:'Passiva: após 2 ataques ou 1 crítico, o inimigo sangra por 4s. Especial: retira metade da vida do inimigo (mata se já estiver com metade ou menos). Não afeta escudo.'},
  gear5:     {name:'Gear 5',                icon:'🌊', theme:'One Piece',      desc:'Passiva: aumenta sua vida. Especial (Bajrang Gun): remove todo o escudo do boss e o atordoa por 4s; se ele já estiver sem escudo, retira metade da vida.'},
  theworld:  {name:'The World',             icon:'⏳', theme:'JoJo',           desc:'Especial: só pode ser usado logo após um acerto crítico. Fica invencível por 5s e desfere uma rajada contínua de socos.'},
  kokushibo: {name:'Espada do Kokushibo',   icon:'🌙', theme:'Demon Slayer',   desc:'Especial: retira metade da vida do inimigo. Toda vida retirada vira escudo para você.'}
};

const PASSIVES = {
  farmer:     {label:'Farmer',     tierLabel:'Rara',     bonus:1},
  solaris:    {label:'Solaris',    tierLabel:'Épica',    bonus:2},
  misterio:   {label:'Mistério',   tierLabel:'Lendária', bonus:3},
  celestial:  {label:'Celestial',  tierLabel:'Mítica',   bonus:4},
  abandonado: {label:'Abandonado', tierLabel:'Segredo',  bonus:5},
  primordial: {label:'Primordial', tierLabel:'Especial', bonus:8}
};
const PASSIVE_KEYS = Object.keys(PASSIVES);
const PASSIVE_ROLL_COST = 1000000;

const SHOP_REFRESH_MS = 30*60*1000;
const KAIDO_COOLDOWN_MS = 60*60*1000;
const KAIDO_MULT = 8;
const DRAGON_DROP_CHANCE = 0.005;
const BASE_HP = 100;
const BASE_ATK = 6;

/* ===================== STATE ===================== */
const STORE_KEY = 'nexusRngState_v2';
let state = loadState();

function defaultState(){
  return {
    level:1, xp:0, money:0,
    inventory:[],
    equippedFaca:null, equippedArma:null,
    equippedSpecial1:null, equippedSpecial2:null,
    settings:{drop2x:false, lucky2x:false},
    shop:{lastRefresh:Date.now(), tiers:{}},
    kaido:{nextSpawn: Date.now()+KAIDO_COOLDOWN_MS}
  };
}
function loadState(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return migrateOld();
    const parsed = JSON.parse(raw);
    const merged = Object.assign(defaultState(), parsed);
    merged.inventory = (merged.inventory||[]).map(normalizeItem);
    return merged;
  }catch(e){ return defaultState(); }
}
function migrateOld(){
  // tenta migrar de uma versão anterior do save (v1), se existir
  try{
    const raw = localStorage.getItem('nexusRngState_v1');
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const fresh = defaultState();
    fresh.level = parsed.level||1;
    fresh.xp = parsed.xp||0;
    fresh.money = parsed.money||0;
    fresh.settings = parsed.settings||fresh.settings;
    fresh.equippedFaca = parsed.equippedFaca||null;
    fresh.equippedArma = parsed.equippedArma||null;
    fresh.inventory = (parsed.inventory||[]).map(it=>normalizeItem({
      id:it.id, rarity:it.rarity, name:it.name, type:it.type, icon:it.icon,
      stars: it.rating||0, equipped: it.equipped, category:'weapon'
    }));
    return fresh;
  }catch(e){ return defaultState(); }
}
function normalizeItem(it){
  return Object.assign({
    id:it.id, category:it.category||'weapon', rarity:it.rarity||null,
    name:it.name, type:it.type||null, key:it.key||null, icon:it.icon||'❔',
    stars: typeof it.stars==='number'? it.stars : (it.rating||0),
    passive: it.passive||null, equipped: !!it.equipped
  }, {});
}
function saveState(){
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}
function xpToNext(level){ return 100 + (level-1)*50; }

/* ===================== HELPERS ===================== */
function uid(){ return 'w'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); }
function rnd(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function fmt(n){ return Math.round(n).toLocaleString('pt-BR'); }
function clamp(n,lo,hi){ return Math.max(lo,Math.min(hi,n)); }
function toast(msg){
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className='toast'; el.textContent=msg;
  wrap.appendChild(el);
  setTimeout(()=>el.remove(), 2800);
}

function addXp(amount){
  state.xp += amount;
  if(state.xp<0) state.xp=0;
  let need = xpToNext(state.level);
  while(state.xp >= need){
    state.xp -= need;
    state.level += 1;
    need = xpToNext(state.level);
    toast('🎉 Subiu para o nível '+state.level+'!');
  }
  saveState();
  renderTopbar();
}
function removeXp(amount){
  state.xp -= amount;
  while(state.xp < 0 && state.level>1){
    state.level -= 1;
    state.xp += xpToNext(state.level);
  }
  if(state.xp<0) state.xp = 0;
  saveState();
  renderTopbar();
}
function addLevels(n){
  state.level += n;
  if(state.level<1) state.level=1;
  saveState();
  renderTopbar();
}
function removeLevels(n){
  state.level -= n;
  if(state.level<1) state.level=1;
  saveState();
  renderTopbar();
}
function addMoney(n){
  state.money += n;
  if(state.money<0) state.money=0;
  saveState();
  renderTopbar();
}

/* ===================== ITEM POWER (raridade + estrelas + passiva) ===================== */
function itemMult(item){
  if(!item) return 0;
  let m = 0;
  if(item.rarity && RARITIES[item.rarity]) m += RARITIES[item.rarity].mult;
  m += (item.stars||0);
  if(item.passive && PASSIVES[item.passive]) m += PASSIVES[item.passive].bonus;
  return m;
}
function getFacaItem(){ return state.inventory.find(i=>i.id===state.equippedFaca) || null; }
function getArmaItem(){ return state.inventory.find(i=>i.id===state.equippedArma) || null; }
function getSpecial1Item(){ return state.inventory.find(i=>i.id===state.equippedSpecial1) || null; }
function getSpecial2Item(){ return state.inventory.find(i=>i.id===state.equippedSpecial2) || null; }
function totalDmgMult(){ return itemMult(getFacaItem()) + itemMult(getArmaItem()); }
function effMult(){ return Math.max(1, totalDmgMult()); }
function playerMaxHp(){ return Math.round(BASE_HP * effMult()); }
function playerAtk(){ return Math.round(BASE_ATK * effMult()); }

function rollRarityKey(){
  let weights = {};
  RARITY_ORDER.forEach(k=>weights[k]=RARITIES[k].base);
  if(state.settings.lucky2x){
    weights.epico *= 2; weights.lendario *= 2; weights.mitico *= 2;
    const others = weights.epico+weights.lendario+weights.mitico+weights.segredo;
    weights.raro = Math.max(100-others, 1);
  }
  const total = Object.values(weights).reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for(const k of RARITY_ORDER){
    if(r < weights[k]) return k;
    r -= weights[k];
  }
  return 'raro';
}
function rollItemFrom(rarityKey, explicitBase){
  const pool = ITEMS[rarityKey];
  const base = explicitBase || rnd(pool);
  return normalizeItem({id:uid(), category:'weapon', rarity:rarityKey, name:base.n, type:base.t, icon:base.i, stars:0, passive:null, equipped:false});
}
function addToInventory(item){
  state.inventory.push(item);
  saveState();
}

/* ===================== TOPBAR ===================== */
function renderTopbar(){
  document.getElementById('moneyDisplay').textContent = fmt(state.money);
  document.getElementById('lvlNum').textContent = state.level;
  const need = xpToNext(state.level);
  document.getElementById('xpNum').textContent = fmt(state.xp)+'/'+fmt(need)+' XP';
  document.getElementById('xpFill').style.width = Math.min(100,(state.xp/need)*100)+'%';
}

/* ===================== NAV ===================== */
const views = ['spin','inventory','shop','admin','battle','raids'];
function showView(name){
  views.forEach(v=>{
    document.getElementById('view-'+v).classList.toggle('hidden', v!==name);
  });
  document.getElementById('dropdown').classList.remove('open');
  if(name==='inventory') renderInventory();
  if(name==='shop') renderShop();
  if(name==='spin') renderLoadout();
  if(name==='admin' && !document.getElementById('adminPanel').classList.contains('hidden')) renderAdminInvList();
}
document.getElementById('menuBtn').addEventListener('click', ()=>{
  document.getElementById('dropdown').classList.toggle('open');
});
document.addEventListener('click', (e)=>{
  const wrap = document.querySelector('.menu-wrap');
  if(!wrap.contains(e.target)) document.getElementById('dropdown').classList.remove('open');
});
document.querySelectorAll('#dropdown [data-view]').forEach(btn=>{
  btn.addEventListener('click', ()=> showView(btn.dataset.view));
});

/* ===================== SPIN VIEW ===================== */
function renderOdds(){
  const wrap = document.getElementById('oddsRow');
  let weights = {};
  RARITY_ORDER.forEach(k=>weights[k]=RARITIES[k].base);
  if(state.settings.lucky2x){
    weights.epico*=2; weights.lendario*=2; weights.mitico*=2;
    const others = weights.epico+weights.lendario+weights.mitico+weights.segredo;
    weights.raro = Math.max(100-others,1);
  }
  const total = Object.values(weights).reduce((a,b)=>a+b,0);
  wrap.innerHTML = RARITY_ORDER.map(k=>{
    const pct = (weights[k]/total*100);
    const dispPct = pct<0.01? pct.toExponential(2) : pct.toFixed(pct<1?3:1);
    return '<span class="odd-chip tag-'+k+'">'+RARITIES[k].label+': '+dispPct+'%</span>';
  }).join('') + '<span class="odd-chip tag-especial">Especial: só em Raids</span>';
}

function renderLoadout(){
  const facaItem = getFacaItem();
  const armaItem = getArmaItem();
  const esp1 = getSpecial1Item();
  const esp2 = getSpecial2Item();
  const sf = document.getElementById('slotFaca');
  const sa = document.getElementById('slotArma');
  const se1 = document.getElementById('slotEsp1');
  const se2 = document.getElementById('slotEsp2');
  sf.querySelector('.slot-icon').textContent = facaItem? facaItem.icon : '🗡️';
  sf.querySelector('.slot-name').textContent = facaItem? (facaItem.name+' ('+itemMult(facaItem)+'x)') : 'Vazio';
  sa.querySelector('.slot-icon').textContent = armaItem? armaItem.icon : '🔫';
  sa.querySelector('.slot-name').textContent = armaItem? (armaItem.name+' ('+itemMult(armaItem)+'x)') : 'Vazio';
  se1.querySelector('.slot-icon').textContent = esp1? esp1.icon : '✨';
  se1.querySelector('.slot-name').textContent = esp1? esp1.name : 'Vazio';
  se2.querySelector('.slot-icon').textContent = esp2? esp2.icon : '✨';
  se2.querySelector('.slot-name').textContent = esp2? esp2.name : 'Vazio';
}
function openSlotPicker(kind){
  let pool;
  if(kind==='faca' || kind==='arma') pool = state.inventory.filter(i=>i.category==='weapon' && i.type===kind);
  else pool = state.inventory.filter(i=>i.category==='special');
  if(pool.length===0){
    const label = kind==='faca'?'faca':(kind==='arma'?'arma':'item especial');
    toast('Você ainda não tem nenhuma(um) '+label+' no inventário.');
    return;
  }
  showItemPickerModal(kind, pool);
}
document.getElementById('slotFaca').addEventListener('click', ()=>openSlotPicker('faca'));
document.getElementById('slotArma').addEventListener('click', ()=>openSlotPicker('arma'));
document.getElementById('slotEsp1').addEventListener('click', ()=>openSlotPicker('esp1'));
document.getElementById('slotEsp2').addEventListener('click', ()=>openSlotPicker('esp2'));

function showItemPickerModal(kind, pool){
  const overlay = document.createElement('div');
  overlay.className='overlay';
  const titleMap = {faca:'Escolher Faca', arma:'Escolher Arma', esp1:'Escolher Especial (Esquerdo)', esp2:'Escolher Especial (Direito)'};
  overlay.innerHTML =
    '<div class="modal" style="width:340px;">'+
      '<h3>'+titleMap[kind]+'</h3>'+
      '<div style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-top:12px;">'+
        pool.map(it=>{
          const sub = it.category==='weapon'
            ? '<small class="tag-'+it.rarity+'" style="text-transform:uppercase;font-weight:700;">'+RARITIES[it.rarity].label+' · '+itemMult(it)+'x</small>'
            : '<small style="color:var(--cyan);font-weight:700;">'+(SPECIAL_ITEMS[it.key]?SPECIAL_ITEMS[it.key].theme:'')+'</small>';
          return '<button class="mbtn picker-item" data-id="'+it.id+'" style="display:flex;align-items:center;gap:10px;text-align:left;">'+
            '<span style="font-size:22px;">'+it.icon+'</span>'+
            '<span style="flex:1;">'+it.name+'<br>'+sub+'</span>'+
          '</button>';
        }).join('')+
      '</div>'+
      '<div class="modal-actions"><button class="mbtn" id="pickerClose">Fechar</button></div>'+
    '</div>';
  document.body.appendChild(overlay);
  overlay.querySelectorAll('.picker-item').forEach(b=>{
    b.addEventListener('click', ()=>{
      equipItem(b.dataset.id, kind);
      overlay.remove();
    });
  });
  overlay.querySelector('#pickerClose').addEventListener('click', ()=>overlay.remove());
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) overlay.remove(); });
}

function equipItem(id, kindHint){
  const item = state.inventory.find(i=>i.id===id);
  if(!item) return;
  if(item.category==='weapon'){
    state.inventory.forEach(i=>{ if(i.category==='weapon' && i.type===item.type) i.equipped=false; });
    item.equipped = true;
    if(item.type==='faca') state.equippedFaca = item.id;
    else state.equippedArma = item.id;
  } else if(item.category==='special'){
    const slot = kindHint==='esp2' ? 2 : (kindHint==='esp1' ? 1 : (state.equippedSpecial1? 2:1));
    // não deixa equipar o mesmo item duas vezes
    if(state.equippedSpecial1===item.id) state.equippedSpecial1=null;
    if(state.equippedSpecial2===item.id) state.equippedSpecial2=null;
    const prevId = slot===1? state.equippedSpecial1 : state.equippedSpecial2;
    const prevItem = state.inventory.find(i=>i.id===prevId);
    if(prevItem) prevItem.equipped=false;
    item.equipped = true;
    if(slot===1) state.equippedSpecial1 = item.id; else state.equippedSpecial2 = item.id;
  }
  saveState();
  renderLoadout(); renderInventory();
  toast('✅ '+item.name+' equipado(a)!');
}
function unequipItem(id){
  const item = state.inventory.find(i=>i.id===id);
  if(!item) return;
  item.equipped=false;
  if(state.equippedFaca===id) state.equippedFaca=null;
  if(state.equippedArma===id) state.equippedArma=null;
  if(state.equippedSpecial1===id) state.equippedSpecial1=null;
  if(state.equippedSpecial2===id) state.equippedSpecial2=null;
  saveState();
  renderLoadout(); renderInventory();
}

let spinning = false;
document.getElementById('spinBtn').addEventListener('click', ()=>{
  if(spinning) return;
  spinning = true;
  const ring = document.getElementById('revealRing');
  const icon = document.getElementById('revealIcon');
  const caption = document.getElementById('revealCaption');
  document.getElementById('spinBtn').disabled = true;
  ring.classList.add('spinning');
  ring.style.borderColor = 'var(--cyan)';
  caption.innerHTML = '<div class="r-name" style="color:var(--muted)">Girando...</div>';

  const shuffleTimer = setInterval(()=>{
    const allNames = RARITY_ORDER.map(k=>ITEMS[k]).flat();
    icon.textContent = rnd(allNames).i;
  }, 90);

  setTimeout(()=>{
    clearInterval(shuffleTimer);
    const rarityKey = rollRarityKey();
    const item = rollItemFrom(rarityKey);
    addToInventory(item);

    ring.classList.remove('spinning');
    ring.style.borderColor = '';
    ring.style.boxShadow = '';
    ring.className = 'reveal-ring';
    if(RARITIES[rarityKey].color && rarityKey!=='especial'){
      ring.style.borderColor = RARITIES[rarityKey].color;
      ring.style.boxShadow = '0 0 30px '+RARITIES[rarityKey].color+'55';
    } else {
      ring.classList.add('card-outer','br-'+rarityKey);
      ring.style.borderColor='transparent';
    }
    icon.textContent = item.icon;
    caption.innerHTML =
      '<div class="r-name">'+item.name+'</div>'+
      '<div class="r-tag tag-'+rarityKey+'">'+RARITIES[rarityKey].label+'</div>'+
      '<div class="r-type">'+(item.type==='faca'?'Faca':'Arma')+' adicionada ao inventário</div>';

    document.getElementById('spinBtn').disabled = false;
    spinning = false;
  }, 1500);
});

/* ===================== INVENTORY ===================== */
let invFilter = 'todos';
document.querySelectorAll('#invFilters .filter-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#invFilters .filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    invFilter = btn.dataset.f;
    renderInventory();
  });
});

function renderInventory(){
  const grid = document.getElementById('invGrid');
  let items = state.inventory.slice().reverse();
  if(invFilter==='faca' || invFilter==='arma') items = items.filter(i=>i.category==='weapon' && i.type===invFilter);
  else if(invFilter==='especiais') items = items.filter(i=>i.category!=='weapon');
  else if(invFilter!=='todos') items = items.filter(i=>i.rarity===invFilter);

  if(items.length===0){
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Nenhum item aqui ainda. Vá em <b>Girar</b> ou participe de <b>Raids</b> para conseguir itens!</div>';
    return;
  }
  grid.innerHTML = items.map(it=>{
    let outerCls = '', borderStyle = '';
    if(it.category==='weapon'){
      outerCls = RARITIES[it.rarity].color && it.rarity!=='especial' ? '' : ('card-outer br-'+it.rarity);
      borderStyle = (RARITIES[it.rarity].color && it.rarity!=='especial') ? ('style="border:2px solid '+RARITIES[it.rarity].color+';box-shadow:0 0 14px '+RARITIES[it.rarity].color+'55;border-radius:16px;padding:0;"') : '';
    } else {
      outerCls = 'card-outer br-especial';
    }
    const tagLine = it.category==='weapon'
      ? '<div class="tag tag-'+it.rarity+'">'+RARITIES[it.rarity].label+'</div>'
      : '<div class="tag" style="color:var(--cyan);">'+(SPECIAL_ITEMS[it.key]?SPECIAL_ITEMS[it.key].theme:'Consumível')+'</div>';
    const starsLine = it.category!=='consumivel' ? ('★'.repeat(it.stars||0)+'☆'.repeat(5-(it.stars||0))) : '';
    const passiveLine = it.passive ? ('Passiva: '+PASSIVES[it.passive].label) : '';
    return (
    '<div class="card-outer '+outerCls+'" '+borderStyle+' data-id="'+it.id+'">'+
      '<div class="card-inner">'+
        (it.equipped?'<div class="equipped-badge">EQUIP.</div>':'')+
        '<div class="icon">'+it.icon+'</div>'+
        '<div class="name">'+it.name+'</div>'+
        tagLine+
        '<div class="stars">'+starsLine+'</div>'+
        '<div class="passive-line">'+passiveLine+'</div>'+
      '</div>'+
    '</div>');
  }).join('');
  grid.querySelectorAll('.card-outer').forEach(card=>{
    card.addEventListener('click', ()=> openItemModal(card.dataset.id));
  });
}

function openItemModal(id){
  const item = state.inventory.find(i=>i.id===id);
  if(!item) return;
  const overlay = document.createElement('div');
  overlay.className='overlay';
  const isWeapon = item.category==='weapon';
  const isSpecial = item.category==='special';
  const isConsumable = item.category==='consumivel';
  const tagHtml = isWeapon
    ? ('<div class="modal-tag tag-'+item.rarity+'">'+RARITIES[item.rarity].label+' · '+(item.type==='faca'?'Faca':'Arma')+' · '+itemMult(item)+'x</div>')
    : (isSpecial ? '<div class="modal-tag" style="color:var(--cyan);">'+SPECIAL_ITEMS[item.key].theme+'</div>' : '<div class="modal-tag" style="color:var(--especial);">Consumível de Raid</div>');
  const starsHtml = !isConsumable ? ('★'.repeat(item.stars||0)+'☆'.repeat(5-(item.stars||0))) : '';
  const descHtml = isSpecial ? ('<div class="modal-desc">'+SPECIAL_ITEMS[item.key].desc+'</div>') : (isConsumable ? '<div class="modal-desc">Durante 30 segundos em batalha, sua vida e escudo se igualam aos do inimigo atual.</div>' : '');
  overlay.innerHTML =
    '<div class="modal">'+
      '<div class="icon">'+item.icon+'</div>'+
      '<h3>'+item.name+'</h3>'+
      tagHtml+
      (!isConsumable ? '<div class="modal-stars">'+starsHtml+'</div>' : '')+
      (!isConsumable ? '<div class="modal-passive">'+(item.passive? 'Passiva: '+PASSIVES[item.passive].label+' (+'+PASSIVES[item.passive].bonus+'x)' : 'Sem passiva')+'</div>' : '')+
      descHtml+
      '<div class="modal-actions">'+
        (isConsumable
          ? '<button class="mbtn primary" id="modalUseConsumable">Usar em batalha</button>'
          : '<button class="mbtn primary" id="modalEquip">'+(item.equipped?'Desequipar':'Equipar')+'</button>')+
        (!isConsumable ? '<button class="mbtn gold" id="modalPassiveRoll" '+(item.passive?'disabled':'')+'>Girar passiva (💰 '+fmt(PASSIVE_ROLL_COST)+')</button>' : '')+
        '<button class="mbtn danger" id="modalDelete">Excluir item</button>'+
        '<button class="mbtn" id="modalClose">Fechar</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(overlay);
  const eqBtn = overlay.querySelector('#modalEquip');
  if(eqBtn) eqBtn.addEventListener('click', ()=>{
    if(item.equipped) unequipItem(item.id); else equipItem(item.id, item.category==='weapon'? item.type : null);
    overlay.remove();
  });
  const useBtn = overlay.querySelector('#modalUseConsumable');
  if(useBtn) useBtn.addEventListener('click', ()=>{
    useDragonTransform(item.id);
    overlay.remove();
  });
  const rollBtn = overlay.querySelector('#modalPassiveRoll');
  if(rollBtn) rollBtn.addEventListener('click', ()=>{
    if(item.passive) return;
    if(state.money < PASSIVE_ROLL_COST){ toast('Money insuficiente para girar a passiva.'); return; }
    state.money -= PASSIVE_ROLL_COST;
    item.passive = rnd(PASSIVE_KEYS);
    saveState();
    renderTopbar();
    toast('🎰 Passiva obtida: '+PASSIVES[item.passive].label+' (+'+PASSIVES[item.passive].bonus+'x)');
    overlay.remove();
    renderInventory(); renderLoadout();
  });
  overlay.querySelector('#modalDelete').addEventListener('click', ()=>{
    deleteInventoryItem(item.id);
    overlay.remove();
  });
  overlay.querySelector('#modalClose').addEventListener('click', ()=>overlay.remove());
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) overlay.remove(); });
}

function deleteInventoryItem(id){
  const idx = state.inventory.findIndex(i=>i.id===id);
  if(idx===-1) return;
  const item = state.inventory[idx];
  if(state.equippedFaca===id) state.equippedFaca=null;
  if(state.equippedArma===id) state.equippedArma=null;
  if(state.equippedSpecial1===id) state.equippedSpecial1=null;
  if(state.equippedSpecial2===id) state.equippedSpecial2=null;
  state.inventory.splice(idx,1);
  saveState();
  renderInventory(); renderLoadout();
  toast('🗑️ '+item.name+' excluído do inventário.');
}

function useDragonTransform(id){
  if(!battle){ toast('Use este item durante uma batalha.'); return; }
  const idx = state.inventory.findIndex(i=>i.id===id);
  if(idx===-1) return;
  state.player.hp = Math.min(playerMaxHp(), battle.hp || playerMaxHp());
  state.player.shield = battle.shield || 0;
  state.player.dragonUntil = performance.now()+30000;
  state.inventory.splice(idx,1);
  saveState();
  toast('🐉 Transformação do Dragão ativada por 30 segundos!');
  renderInventory();
  updatePlayerBars();
}

/* ===================== SHOP ===================== */
function ensureShopTiers(){
  const now = Date.now();
  if(now - state.shop.lastRefresh >= SHOP_REFRESH_MS){
    state.shop.lastRefresh = now;
    state.shop.tiers = {};
    saveState();
  }
  SHOP_TIERS.forEach(t=>{
    if(!state.shop.tiers[t.rarity]) state.shop.tiers[t.rarity] = {purchased:false};
  });
}
function renderShop(){
  ensureShopTiers();
  const grid = document.getElementById('shopGrid');
  grid.innerHTML = SHOP_TIERS.map(t=>{
    const locked = state.level < t.level;
    const tierState = state.shop.tiers[t.rarity] || {purchased:false};
    const canAfford = state.money >= t.price;
    const disabled = locked || tierState.purchased || !canAfford;
    let btnLabel = 'Comprar';
    if(locked) btnLabel = 'Nível '+t.level+' necessário';
    else if(tierState.purchased) btnLabel = 'Comprado (aguarde reposição)';
    else if(!canAfford) btnLabel = 'Money insuficiente';
    const sampleIcon = ITEMS[t.rarity][0].i;
    return (
    '<div class="shop-card '+(locked?'locked':'')+'">'+
      (locked?'<div class="lock-badge">🔒</div>':'')+
      '<div class="lvl-req">Requer nível '+t.level+'</div>'+
      '<div class="shop-icon">'+sampleIcon+'</div>'+
      '<div class="shop-name">'+t.label+' Aleatório</div>'+
      '<div class="shop-tag tag-'+t.rarity+'">'+RARITIES[t.rarity].label+'</div>'+
      '<div class="price">💰 '+fmt(t.price)+'</div>'+
      '<button class="buy-btn" data-rarity="'+t.rarity+'" data-price="'+t.price+'" '+(disabled?'disabled':'')+'>'+btnLabel+'</button>'+
    '</div>');
  }).join('');
  grid.querySelectorAll('.buy-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const rarity = btn.dataset.rarity;
      const price = parseInt(btn.dataset.price,10);
      buyFromShop(rarity, price);
    });
  });
  updateShopTimer();
}
function buyFromShop(rarity, price){
  const tier = SHOP_TIERS.find(t=>t.rarity===rarity);
  if(state.level < tier.level){ toast('Nível insuficiente para este item.'); return; }
  if(state.money < price){ toast('Money insuficiente.'); return; }
  if(state.shop.tiers[rarity] && state.shop.tiers[rarity].purchased){ toast('Você já comprou este item nesta reposição.'); return; }
  state.money -= price;
  state.shop.tiers[rarity] = {purchased:true};
  const item = rollItemFrom(rarity);
  addToInventory(item);
  saveState();
  renderTopbar();
  renderShop();
  toast('🛒 Você comprou: '+item.name+' ('+RARITIES[rarity].label+')');
}
function resetShopStock(){
  state.shop.lastRefresh = Date.now();
  state.shop.tiers = {};
  saveState();
  renderShop();
  toast('🛠️ Estoque da loja resetado.');
}
function updateShopTimer(){
  const remain = SHOP_REFRESH_MS - (Date.now()-state.shop.lastRefresh);
  const m = Math.max(0,Math.floor(remain/60000));
  const s = Math.max(0,Math.floor((remain%60000)/1000));
  const el = document.getElementById('shopTimer');
  if(el) el.textContent = 'Próxima atualização em '+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
setInterval(()=>{
  if(!document.getElementById('view-shop').classList.contains('hidden')){
    if(Date.now()-state.shop.lastRefresh >= SHOP_REFRESH_MS) renderShop();
    else updateShopTimer();
  }
}, 1000);

/* ===================== ADMIN ===================== */
const ADMIN_PASS = 'Pjnf2311';
document.getElementById('adminEnter').addEventListener('click', tryAdminLogin);
document.getElementById('adminPass').addEventListener('keydown', (e)=>{ if(e.key==='Enter') tryAdminLogin(); });
function tryAdminLogin(){
  const val = document.getElementById('adminPass').value;
  if(val === ADMIN_PASS){
    document.getElementById('adminGate').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    document.getElementById('adminErr').textContent='';
    document.getElementById('adminPass').value='';
    syncAdminToggles();
    populateAdminItemSelects();
    renderAdminInvList();
    updateKaidoAdminStatus();
  } else {
    document.getElementById('adminErr').textContent = 'Senha incorreta.';
  }
}
document.getElementById('adminLogout').addEventListener('click', ()=>{
  document.getElementById('adminGate').classList.remove('hidden');
  document.getElementById('adminPanel').classList.add('hidden');
});

function populatePassiveSelect(selectEl){
  selectEl.innerHTML = '<option value="">Sem passiva</option>' +
    PASSIVE_KEYS.map(k=>'<option value="'+k+'">'+PASSIVES[k].label+' (+'+PASSIVES[k].bonus+'x)</option>').join('');
}
function populateAdminItemSelects(){
  const typeSel = document.getElementById('admType');
  const raritySel = document.getElementById('admRarity');
  const nameSel = document.getElementById('admItemName');
  function refreshNames(){
    const type = typeSel.value;
    const rarity = raritySel.value;
    const pool = ITEMS[rarity].filter(it=>it.t===type);
    nameSel.innerHTML = pool.map(it=>'<option value="'+it.n+'">'+it.i+' '+it.n+'</option>').join('') || '<option value="">Nenhum item nessa combinação</option>';
  }
  typeSel.onchange = refreshNames;
  raritySel.onchange = refreshNames;
  refreshNames();
  populatePassiveSelect(document.getElementById('admPassive'));

  const specKeySel = document.getElementById('admSpecialKey');
  specKeySel.innerHTML = Object.keys(SPECIAL_ITEMS).map(k=>'<option value="'+k+'">'+SPECIAL_ITEMS[k].icon+' '+SPECIAL_ITEMS[k].name+' ('+SPECIAL_ITEMS[k].theme+')</option>').join('');
  populatePassiveSelect(document.getElementById('admSpecialPassive'));
}

document.getElementById('admAddSpecificItem').addEventListener('click', ()=>{
  const type = document.getElementById('admType').value;
  const rarity = document.getElementById('admRarity').value;
  const name = document.getElementById('admItemName').value;
  const stars = parseInt(document.getElementById('admStars').value,10)||0;
  const passive = document.getElementById('admPassive').value || null;
  const base = ITEMS[rarity].find(it=>it.t===type && it.n===name);
  if(!base){ toast('Selecione um item válido.'); return; }
  const item = rollItemFrom(rarity, base);
  item.stars = stars;
  item.passive = passive;
  addToInventory(item);
  renderAdminInvList();
  toast('🛠️ Adicionado: '+item.name+' ('+RARITIES[rarity].label+', '+stars+'★)');
});

document.getElementById('admAddSpecial').addEventListener('click', ()=>{
  const key = document.getElementById('admSpecialKey').value;
  const stars = parseInt(document.getElementById('admSpecialStars').value,10)||0;
  const passive = document.getElementById('admSpecialPassive').value || null;
  const def = SPECIAL_ITEMS[key];
  const item = normalizeItem({id:uid(), category:'special', rarity:null, name:def.name, type:null, key:key, icon:def.icon, stars:stars, passive:passive, equipped:false});
  addToInventory(item);
  renderAdminInvList();
  toast('🛠️ Item especial adicionado: '+item.name);
});

document.getElementById('admAddXp').addEventListener('click', ()=>{
  const v = parseInt(document.getElementById('admXp').value,10);
  if(!v || v<=0) return;
  addXp(v);
  toast('🛠️ +'+v+' XP adicionado');
});
document.getElementById('admRemXp').addEventListener('click', ()=>{
  const v = parseInt(document.getElementById('admXp').value,10);
  if(!v || v<=0) return;
  removeXp(v);
  toast('🛠️ -'+v+' XP removido');
});
document.getElementById('admAddLvl').addEventListener('click', ()=>{
  const v = parseInt(document.getElementById('admLvl').value,10);
  if(!v || v<=0) return;
  addLevels(v);
  toast('🛠️ +'+v+' nível(is) adicionado(s)');
});
document.getElementById('admRemLvl').addEventListener('click', ()=>{
  const v = parseInt(document.getElementById('admLvl').value,10);
  if(!v || v<=0) return;
  removeLevels(v);
  toast('🛠️ -'+v+' nível(is) removido(s)');
});
document.getElementById('admAddMoney').addEventListener('click', ()=>{
  const v = parseInt(document.getElementById('admMoney').value,10);
  if(!v || v<=0) return;
  addMoney(v);
  toast('🛠️ +💰 '+fmt(v)+' adicionado');
});
document.getElementById('admResetShop').addEventListener('click', resetShopStock);
document.getElementById('admSkipKaido').addEventListener('click', ()=>{
  state.kaido.nextSpawn = Date.now();
  saveState();
  updateKaidoAdminStatus();
  toast('🛠️ Cooldown da Raid do Kaido pulado.');
});
document.getElementById('admForceKaido').addEventListener('click', ()=>{
  state.kaido.nextSpawn = Date.now();
  saveState();
  updateKaidoAdminStatus();
  toast('🛠️ Kaido forçado a aparecer! Vá em Raids para batalhar.');
});
function updateKaidoAdminStatus(){
  const el = document.getElementById('kaidoAdminStatus');
  if(!el) return;
  const ready = Date.now() >= state.kaido.nextSpawn;
  el.textContent = ready ? 'Kaido está DISPONÍVEL agora.' : 'Próximo Kaido em '+formatCountdown(state.kaido.nextSpawn-Date.now());
}

function renderAdminInvList(){
  const wrap = document.getElementById('adminInvList');
  if(!wrap) return;
  if(state.inventory.length===0){ wrap.innerHTML = '<div class="admin-note">Inventário vazio.</div>'; return; }
  wrap.innerHTML = state.inventory.slice().reverse().map(it=>{
    const label = it.category==='weapon' ? (RARITIES[it.rarity].label+' · '+it.name) : it.name;
    return '<div class="admin-inv-row"><span>'+it.icon+' '+label+'</span><button data-id="'+it.id+'">Excluir</button></div>';
  }).join('');
  wrap.querySelectorAll('button[data-id]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      deleteInventoryItem(btn.dataset.id);
      renderAdminInvList();
    });
  });
}

function syncAdminToggles(){
  document.getElementById('toggleDrop').classList.toggle('on', state.settings.drop2x);
  document.getElementById('toggleLucky').classList.toggle('on', state.settings.lucky2x);
}
document.getElementById('toggleDrop').addEventListener('click', ()=>{
  state.settings.drop2x = !state.settings.drop2x;
  saveState(); syncAdminToggles();
  toast('2x Drop: '+(state.settings.drop2x?'ATIVADO':'DESATIVADO'));
});
document.getElementById('toggleLucky').addEventListener('click', ()=>{
  state.settings.lucky2x = !state.settings.lucky2x;
  saveState(); syncAdminToggles();
  renderOdds();
  toast('2x Lucky: '+(state.settings.lucky2x?'ATIVADO':'DESATIVADO'));
});

/* ===================== BATTLE SYSTEM ===================== */
let battle = null; // {mode:'wave'|'raid'|'kaido', wave, hp, maxHp, shield, shieldMax, isBoss, raidKey, targetLo, targetHi, stunUntil, lastWasCrit}
let markerAnim = null;
let markerStart = 0;
let lastTick = 0;
const MARKER_PERIOD = 1300;
const specialCooldowns = {left:0, right:0};

if(!state.player) state.player = {hp:playerMaxHp(), maxHp:playerMaxHp(), shield:0, dragonUntil:0, invulnUntil:0};

function enemyStats(wave, isBoss){
  const base = 60 + wave*14;
  const hp = isBoss ? base*4.2 : base;
  const shieldMax = isBoss ? hp*0.5 : 0;
  return {hp, maxHp:hp, shield:shieldMax, shieldMax};
}
function raidBossStats(mult){
  const hp = 900*mult;
  const shieldMax = hp*0.5;
  return {hp, maxHp:hp, shield:shieldMax, shieldMax};
}

function initPlayerForBattle(){
  const maxHp = playerMaxHp();
  state.player = {hp:maxHp, maxHp:maxHp, shield:0, dragonUntil:0, invulnUntil:0};
  specialCooldowns.left = 0; specialCooldowns.right = 0;
}

function startBattle(){
  initPlayerForBattle();
  battle = Object.assign({mode:'wave', wave:1, isBoss:false, raidKey:null, lastWasCrit:false, stunUntil:0}, enemyStats(1,false));
  battle.targetLo = 40; battle.targetHi = 60;
  showView('battle');
  renderBattle();
  startMarker();
}
function startRaid(raidKey){
  const raid = RAIDS.find(r=>r.key===raidKey);
  initPlayerForBattle();
  battle = Object.assign({mode:'raid', wave:1, isBoss:true, raidKey, raidMult:raid.mult, lastWasCrit:false, stunUntil:0}, raidBossStats(raid.mult));
  battle.targetLo = 44; battle.targetHi = 56;
  showView('battle');
  renderBattle(true);
  startMarker();
}
function startKaidoRaid(){
  if(Date.now() < state.kaido.nextSpawn){ toast('O Kaido ainda não está disponível.'); return; }
  if(state.level < 20){ toast('Nível 20+ necessário para enfrentar o Kaido.'); return; }
  initPlayerForBattle();
  battle = Object.assign({mode:'kaido', wave:1, isBoss:true, raidKey:'kaido', raidMult:KAIDO_MULT, lastWasCrit:false, stunUntil:0}, raidBossStats(KAIDO_MULT));
  battle.targetLo = 46; battle.targetHi = 54;
  showView('battle');
  renderBattle(true);
  startMarker();
}
function stopBattle(){
  battle = null;
  stopMarker();
  showView('spin');
}
document.getElementById('battleBtn').addEventListener('click', startBattle);
document.getElementById('stopBattleBtn').addEventListener('click', stopBattle);

function currentEnemyMeta(){
  if(!battle) return null;
  if(battle.mode==='raid') return RAIDS.find(r=>r.key===battle.raidKey);
  if(battle.mode==='kaido') return {key:'kaido', name:'Kaido', icon:'🐲', color:'#ffe45e'};
  return null;
}

function renderBattle(){
  if(!battle) return;
  const meta = currentEnemyMeta();
  document.getElementById('waveBadge').innerHTML = (battle.mode!=='wave')
    ? (meta.icon+' <b>'+meta.name+'</b>')
    : ('Onda <b>'+battle.wave+'</b>'+(battle.isBoss?' · <span style="color:var(--danger)">BOSS</span>':''));
  document.getElementById('enemyIcon').textContent = battle.isBoss ? (meta?meta.icon:'👹') : rnd(['👾','🤖','👻','🧟']);
  document.getElementById('enemyName').textContent = battle.mode==='raid' ? (meta.name+' — Chefe') : (battle.mode==='kaido' ? 'Kaido — Chefe da Tempestade' : (battle.isBoss?'Boss da Onda '+battle.wave:'Boneco'));
  const shieldRow = document.getElementById('shieldTrackWrap');
  const shieldLabelRow = document.getElementById('shieldLabelRow');
  const hasShield = battle.shieldMax>0;
  shieldRow.classList.toggle('hidden', !hasShield);
  shieldLabelRow.classList.toggle('hidden', !hasShield);
  updateEnemyBars();
  const target = document.getElementById('timingTarget');
  target.style.left = battle.targetLo+'%';
  target.style.width = (battle.targetHi-battle.targetLo)+'%';
  document.getElementById('hitFeedback').textContent='';
  renderSpecialButtons();
  updatePlayerBars();
}
function updateEnemyBars(){
  const hpPct = Math.max(0,(battle.hp/battle.maxHp)*100);
  document.getElementById('enemyHpFill').style.width = hpPct+'%';
  document.getElementById('hpPct').textContent = Math.round(hpPct)+'%';
  if(battle.shieldMax>0){
    const sPct = Math.max(0,(battle.shield/battle.shieldMax)*100);
    document.getElementById('enemyShieldFill').style.width = sPct+'%';
    document.getElementById('shieldPct').textContent = Math.round(sPct)+'%';
  }
  document.getElementById('enemyIcon').classList.toggle('stunned', battle.stunUntil>performance.now());
}
function updatePlayerBars(){
  const p = state.player;
  const hpPct = Math.max(0,(p.hp/p.maxHp)*100);
  document.getElementById('playerHpFill').style.width = hpPct+'%';
  document.getElementById('playerHpPct').textContent = Math.round(hpPct)+'%';
  const shieldMaxRef = Math.max(p.shield, p.maxHp);
  const sPct = p.shield>0 ? Math.max(0,Math.min(100,(p.shield/p.maxHp)*100)) : 0;
  document.getElementById('playerShieldFill').style.width = sPct+'%';
  const now = performance.now();
  let status = '';
  if(p.invulnUntil>now) status = '⏳ Invencível!';
  else if(p.dragonUntil>now) status = '🐉 Transformação do Dragão ativa!';
  document.getElementById('playerStatus').textContent = status;
}
function renderSpecialButtons(){
  const esp1 = getSpecial1Item();
  const esp2 = getSpecial2Item();
  document.getElementById('specialLeftBtn').textContent = esp1? esp1.icon : '✖';
  document.getElementById('specialRightBtn').textContent = esp2? esp2.icon : '✖';
  document.getElementById('specialLeftBtn').disabled = !esp1;
  document.getElementById('specialRightBtn').disabled = !esp2;
}

function startMarker(){
  markerStart = performance.now();
  lastTick = markerStart;
  const marker = document.getElementById('timingMarker');
  function step(ts){
    if(!battle) return;
    const t = ((ts - markerStart) % MARKER_PERIOD) / MARKER_PERIOD;
    const pos = t<0.5 ? t*2 : 2-(t*2);
    marker.style.left = (pos*96)+'%';
    battleTick(ts);
    lastTick = ts;
    markerAnim = requestAnimationFrame(step);
  }
  markerAnim = requestAnimationFrame(step);
}
function stopMarker(){
  if(markerAnim) cancelAnimationFrame(markerAnim);
  markerAnim = null;
}
function currentMarkerPct(){
  const marker = document.getElementById('timingMarker');
  return parseFloat(marker.style.left||'0');
}

// tick de status (cooldowns, invencibilidade, atordoamento) — apenas atualiza a UI de cooldown
function battleTick(){
  const now = performance.now();
  updateCooldownUI(now);
}
function updateCooldownUI(now){
  const cdL = document.getElementById('cdLeft');
  const cdR = document.getElementById('cdRight');
  const remL = specialCooldowns.left - now;
  const remR = specialCooldowns.right - now;
  if(remL>0){ cdL.classList.remove('hidden'); cdL.textContent = Math.ceil(remL/1000); }
  else cdL.classList.add('hidden');
  if(remR>0){ cdR.classList.remove('hidden'); cdR.textContent = Math.ceil(remR/1000); }
  else cdR.classList.add('hidden');
}

function dealDamageToEnemy(amount, bypassShield){
  if(!battle || amount<=0) return;
  if(!bypassShield && battle.shield>0){
    if(amount <= battle.shield){ battle.shield -= amount; amount = 0; }
    else { amount -= battle.shield; battle.shield = 0; }
  }
  battle.hp = clamp(battle.hp - amount, 0, battle.maxHp);
  updateEnemyBars();
}
function dealDamageToPlayer(amount){
  const p = state.player;
  const now = performance.now();
  if(p.invulnUntil>now) return;
  if(amount<=0) return;
  if(p.shield>0){
    if(amount<=p.shield){ p.shield -= amount; amount=0; }
    else { amount -= p.shield; p.shield=0; }
  }
  p.hp = clamp(p.hp - amount, 0, p.maxHp);
  updatePlayerBars();
  if(p.hp<=0) resolvePlayerDefeat();
}
function resolvePlayerDefeat(){
  toast('💀 Você foi derrotado! Recuperando suas forças...');
  stopBattle();
}
function enemyCounterAttack(){
  if(!battle) return;
  if(battle.stunUntil>performance.now()) return;
  const baseDmg = battle.isBoss ? (14+battle.wave*1.6) : (7+battle.wave*0.9);
  const dmg = baseDmg*(0.8+Math.random()*0.5);
  dealDamageToPlayer(dmg);
}

document.getElementById('attackBtn').addEventListener('click', ()=>{
  if(!battle) return;
  const pos = currentMarkerPct();
  const inZone = pos >= battle.targetLo && pos <= battle.targetHi;
  battle.lastWasCrit = inZone;
  const atk = playerAtk();
  const dmg = atk * (inZone ? (1.6+Math.random()*0.4) : (0.9+Math.random()*0.3));
  document.getElementById('enemyIcon').classList.add('hit');
  setTimeout(()=>document.getElementById('enemyIcon').classList.remove('hit'),120);
  document.getElementById('hitFeedback').textContent = inZone ? '🎯 ACERTO CRÍTICO!' : 'Acerto';
  document.getElementById('hitFeedback').style.color = inZone ? 'var(--cyan)' : 'var(--muted)';
  dealDamageToEnemy(dmg, false);

  if(battle.hp <= 0){
    resolveEnemyDefeat();
  } else {
    enemyCounterAttack();
  }
});

function useSpecial(slot){
  if(!battle) return;
  const item = slot==='left' ? getSpecial1Item() : getSpecial2Item();
  if(!item){ toast('Nenhum item especial equipado nesse slot.'); return; }
  const now = performance.now();
  if(specialCooldowns[slot] > now){ toast('Especial em cooldown: '+Math.ceil((specialCooldowns[slot]-now)/1000)+'s'); return; }

  let used = true;
  switch(item.key){
    case 'rika':
      if(battle.hp <= battle.maxHp*0.5){ battle.hp = 0; toast('💀 '+item.name+': abate instantâneo!'); }
      else { dealDamageToEnemy(battle.hp*0.5, true); toast('🩸 '+item.name+': retirou metade da vida do inimigo!'); }
      break;
    case 'gear5':
      if(battle.shield>0){ battle.shield=0; battle.stunUntil=now+4000; toast('🌊 Bajrang Gun: escudo destruído! Boss atordoado por 4s.'); }
      else { dealDamageToEnemy(battle.hp*0.5, true); toast('🌊 Bajrang Gun: retirou metade da vida do inimigo!'); }
      break;
    case 'theworld':
      if(!battle.lastWasCrit){ toast('⏳ The World só pode ser usado logo após um acerto crítico.'); used=false; break; }
      state.player.invulnUntil = now+5000;
      dealDamageToEnemy(playerAtk()*4, false);
      toast('⏳ THE WORLD! Invencível por 5s e rajada de socos!');
      battle.lastWasCrit = false;
      break;
    case 'kokushibo':
      { const amt = battle.hp*0.5;
        dealDamageToEnemy(amt, true);
        state.player.shield = Math.min(state.player.maxHp, state.player.shield+amt);
        toast('🌙 Espada do Kokushibo: retirou metade da vida do inimigo e virou escudo para você!'); }
      break;
    default: used=false;
  }
  if(!used) return;
  specialCooldowns[slot] = now+15000;
  updateEnemyBars(); updatePlayerBars();
  if(battle.hp<=0){ resolveEnemyDefeat(); return; }
  enemyCounterAttack();
}
document.getElementById('specialLeftBtn').addEventListener('click', ()=>useSpecial('left'));
document.getElementById('specialRightBtn').addEventListener('click', ()=>useSpecial('right'));

function resolveEnemyDefeat(){
  const drop2x = state.settings.drop2x;
  let xpReward, moneyReward;
  if(battle.mode==='raid'){
    const raid = RAIDS.find(r=>r.key===battle.raidKey);
    xpReward = (drop2x?1000:500) * raid.mult;
    moneyReward = (drop2x?2000:1000) * raid.mult;
    addXp(xpReward); addMoney(moneyReward);
    toast('🏆 Você derrotou o chefe de '+raid.name+'! +'+fmt(xpReward)+' XP · +💰'+fmt(moneyReward));
    stopBattle();
    return;
  }
  if(battle.mode==='kaido'){
    const dsXp = (drop2x?1000:500)*5;
    const dsMoney = (drop2x?2000:1000)*5;
    xpReward = dsXp*4;
    moneyReward = dsMoney*4;
    addXp(xpReward); addMoney(moneyReward);
    state.kaido.nextSpawn = Date.now()+KAIDO_COOLDOWN_MS;
    saveState();
    toast('🐲 Você derrotou o KAIDO! +'+fmt(xpReward)+' XP · +💰'+fmt(moneyReward));
    if(Math.random() < DRAGON_DROP_CHANCE){
      const dragonItem = normalizeItem({id:uid(), category:'consumivel', rarity:'especial', name:'Transformação do Dragão', type:null, key:'dragon', icon:'🐉', stars:0, passive:null, equipped:false});
      addToInventory(dragonItem);
      toast('🌟 DROP RARÍSSIMO: Transformação do Dragão!');
    }
    stopBattle();
    return;
  }
  if(battle.isBoss){
    xpReward = drop2x?1000:500;
    moneyReward = 1000;
  } else {
    xpReward = drop2x?200:100;
    moneyReward = 250;
  }
  addXp(xpReward); addMoney(moneyReward);
  toast('✅ Inimigo derrotado! +'+fmt(xpReward)+' XP · +💰'+fmt(moneyReward));

  const nextWave = battle.wave + 1;
  const isBoss = nextWave % 10 === 0;
  const stats = enemyStats(nextWave, isBoss);
  battle = Object.assign({mode:'wave', wave:nextWave, isBoss, raidKey:null, lastWasCrit:false, stunUntil:0}, stats);
  battle.targetLo = isBoss?44:40; battle.targetHi = isBoss?56:60;
  renderBattle();
}

/* ===================== RAIDS VIEW ===================== */
document.getElementById('raidsBtn').addEventListener('click', ()=>{
  showView('raids');
  renderRaidsView();
});
document.getElementById('raidsBackBtn').addEventListener('click', ()=>{
  showView('spin');
});
function formatCountdown(ms){
  if(ms<=0) return '00:00:00';
  const totalSec = Math.floor(ms/1000);
  const h = Math.floor(totalSec/3600);
  const m = Math.floor((totalSec%3600)/60);
  const s = totalSec%60;
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
function renderRaidsView(){
  const locked = state.level < 20;
  document.getElementById('raidLockedMsg').classList.toggle('hidden', !locked);
  const grid = document.getElementById('raidGrid');
  if(locked){ grid.innerHTML=''; return; }
  const kaidoReady = Date.now() >= state.kaido.nextSpawn;
  grid.innerHTML = RAIDS.map(r=>
    '<div class="raid-card" data-key="'+r.key+'" style="border-color:'+r.color+'55;">'+
      '<div class="raid-icon">'+r.icon+'</div>'+
      '<h4>'+r.name+'</h4>'+
      '<div class="raid-mult">Chefe com '+r.mult+'x vida + escudo · apenas boss</div>'+
    '</div>').join('') +
    '<div class="raid-card kaido '+(kaidoReady?'':'locked-raid')+'" id="kaidoCard">'+
      '<div class="raid-icon">🐲</div>'+
      '<h4>Raid do Kaido</h4>'+
      '<div class="raid-mult">Chefe com '+KAIDO_MULT+'x vida + escudo · drop exclusivo 0.5%</div>'+
      (kaidoReady ? '<div class="raid-timer">DISPONÍVEL AGORA</div>' : '<div class="raid-timer" id="kaidoCountdown">Próximo em '+formatCountdown(state.kaido.nextSpawn-Date.now())+'</div>')+
    '</div>';
  grid.querySelectorAll('.raid-card[data-key]').forEach(c=>{
    c.addEventListener('click', ()=> startRaid(c.dataset.key));
  });
  const kaidoCard = document.getElementById('kaidoCard');
  kaidoCard.addEventListener('click', ()=>{
    if(Date.now() >= state.kaido.nextSpawn) startKaidoRaid();
    else toast('O Kaido ainda não está disponível. Aguarde o cooldown.');
  });
}
setInterval(()=>{
  const raidsVisible = !document.getElementById('view-raids').classList.contains('hidden');
  if(raidsVisible){
    const el = document.getElementById('kaidoCountdown');
    if(el) el.textContent = 'Próximo em '+formatCountdown(state.kaido.nextSpawn-Date.now());
    if(Date.now()>=state.kaido.nextSpawn && el) renderRaidsView();
  }
  const adminVisible = !document.getElementById('view-admin').classList.contains('hidden') && !document.getElementById('adminPanel').classList.contains('hidden');
  if(adminVisible) updateKaidoAdminStatus();
}, 1000);

/* ===================== INIT ===================== */
renderTopbar();
renderOdds();
renderLoadout();
showView('spin');

})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}
