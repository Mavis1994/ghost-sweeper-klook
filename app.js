const $=id=>document.getElementById(id), ghost='<span class="ghost-art" aria-hidden="true"></span>';
let game=new GhostGame(),flagMode=false,startTime=0,elapsed=0,tick=null,modal='welcome',lastFocus=null;
const buttons=game.cells.map((_,i)=>{let b=document.createElement('button');b.className='cell';b.setAttribute('aria-label',`第${Math.floor(i/game.size)+1}行，第${i%game.size+1}列，未翻开`);b.addEventListener('click',()=>{if(b.suppress){b.suppress=false;return;}play(i,flagMode)});b.addEventListener('contextmenu',e=>{e.preventDefault();clearTimeout(b.hold);if(b.touch)return;b.suppress=true;play(i,true);setTimeout(()=>b.suppress=false,700)});b.addEventListener('pointerdown',e=>{b.suppress=false;b.touch=e.pointerType!=='mouse';if(!b.touch)return;b.origin=[e.clientX,e.clientY];b.hold=setTimeout(()=>{b.hold=null;b.suppress=true;play(i,true)},450)});b.addEventListener('pointermove',e=>{if(b.origin&&Math.hypot(e.clientX-b.origin[0],e.clientY-b.origin[1])>10){clearTimeout(b.hold);b.suppress=true}});['pointerup','pointercancel','pointerleave'].forEach(type=>b.addEventListener(type,()=>clearTimeout(b.hold)));b.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='f'){e.preventDefault();play(i,true)}let dest={ArrowRight:i+1,ArrowLeft:i-1,ArrowUp:i-game.size,ArrowDown:i+game.size}[e.key];if(dest!==undefined&&dest>=0&&dest<game.cells.length){e.preventDefault();buttons[dest].focus()}});$('board').append(b);return b});
function render(){buttons.forEach((b,i)=>{let c=game.cells[i],showGhost=c.mine&&(game.state==='lost'||game.state==='won');b.className='cell'+((i*17+Math.floor(i/game.size)*7)%11<3?' peach':'')+(c.open?' open':'')+(game.hit===i?' hit':'');b.dataset.n=c.count;b.innerHTML=showGhost?ghost:c.flag?(game.state==='lost'&&!c.mine?'×':'<span class="flag-icon" aria-hidden="true">⚑</span>'):c.open?(c.count||''):'';b.setAttribute('aria-label',`第${Math.floor(i/game.size)+1}行，第${i%game.size+1}列，${showGhost?'幽灵':c.flag?'已插旗':c.open?c.count+'只相邻幽灵':'未翻开'}`);b.setAttribute('aria-disabled',['won','lost'].includes(game.state)?'true':'false')});$('remaining').textContent=String(game.mines-game.flags).padStart(3,'0');$('register-result').hidden=game.state!=='won';$('progress').textContent=`${game.opened} / ${game.cells.length-game.mines} SAFE`;$('status').textContent=game.state==='won'?'All safe. You did it, KLOOKer!':game.state==='lost'?'Oops! You bumped into a ghost.':game.state==='ready'?'Ready? Your first click is safe.':'Follow the numbers. Trust your logic.';}
function play(i,flag){if(!$('overlay').hidden)return;let before=game.state;let changed=flag?game.flag(i):game.reveal(i);if(!changed)return;if(before==='ready'&&game.state!=='ready'){startTime=Date.now();tick=setInterval(()=>{elapsed=Math.floor((Date.now()-startTime)/1000);$('timer').textContent=String(Math.min(elapsed,999)).padStart(3,'0')},250)}render();if(['lost','won'].includes(game.state)){clearInterval(tick);elapsed=Math.floor((Date.now()-startTime)/1000);show(game.state);}}
function reset(){$('employee-id').disabled=false;winnerRecord=null;$('winner-form').reset();clearInterval(tick);game=new GhostGame();elapsed=0;startTime=0;$('timer').textContent='000';flagMode=false;flagUI();render();}
function flagUI(){$('flag').setAttribute('aria-pressed',String(flagMode));$('flag').innerHTML='<span class="flag-icon" aria-hidden="true">⚑</span> 插旗模式 '+(flagMode?'ON':'OFF')}
function show(kind){$('winner-form').hidden=true;$('action').hidden=false;lastFocus=document.activeElement;modal=kind;document.querySelector('.dialog').dataset.screen=kind;let win=kind==='won',lost=kind==='lost',help=kind==='help';$('dialog-title').textContent=win?'🎃 Congratulations!':lost?'🎃 Game Over!':help?'📄 Readme.txt':'🎃 KLOOK Ghost Sweeper';$('dialog-tag').textContent=win?'ACHIEVEMENT UNLOCKED':lost?'THE HAUNTED COMPUTER AWAITS':help?'HOW TO PLAY':'YOU HAVE A NEW CHALLENGE';$('dialog-heading').innerHTML=win?'恭喜你！':lost?'Oops! You bumped into a ghost!':help?'小心幽灵，放心点击。':'Welcome to<br>KLOOK Ghost Sweeper';$('dialog-text').innerHTML=win?`所有${game.cells.length-game.mines}个安全格子已翻开，用时${elapsed}秒。`:lost?'挑战失败，幽灵已经现身。<br>再试一次，找到所有安全格子！':help?'数字表示周围 8 格中的幽灵数量。<br>空白格会自动展开；翻开所有安全格即通关。':'KLOOKer，复古电脑里藏着 20 只幽灵。<br>根据数字提示，翻开所有安全格子！';$('instructions').innerHTML=help?'右键 / 长按 450ms 插旗，或开启插旗模式<br>键盘：方向键移动 · Enter 翻格 · F 插旗':win?'':lost?'每局重新随机分布 · 首击及周围格子安全':'数字 = 周围 8 格的幽灵数量<br>点击翻开 · 右键 / 长按插旗';$('action').innerHTML=win?'OK':(lost?'RETRY':help?'GOT IT':'START')+' <span>→</span>';$('play-again').hidden=!win;$('instructions').hidden=win;document.querySelector('.dialog').dataset.result=win?'won':lost?'lost':'';$('dialog-ghost').dataset.mood=win?'happy':lost?'sad':'neutral';$('dialog-ghost').setAttribute('role','img');$('dialog-ghost').setAttribute('aria-label',win?'高兴的幽灵':lost?'沮丧的幽灵':'幽灵');$('overlay').hidden=false;document.querySelector('.game').inert=true;$('action').focus();}
function hide(){$('overlay').hidden=true;document.querySelector('.game').inert=false;(lastFocus&&lastFocus!==document.body?lastFocus:buttons[Math.floor(game.cells.length/2)]).focus()}
$('action').onclick=()=>{if(modal==='won'){showRegistration();return;}if(modal==='welcome'||modal==='lost')reset();document.querySelector('.game').classList.remove('hidden');hide()};$('play-again').onclick=()=>{reset();hide()};$('dismiss').onclick=hide;$('flag').onclick=()=>{flagMode=!flagMode;flagUI()};['new','face'].forEach(id=>$(id).onclick=()=>{reset();hide()});['help','readme','computer'].forEach(id=>$(id).onclick=()=>show('help'));['start','launch'].forEach(id=>$(id).onclick=()=>{document.querySelector('.game').classList.remove('hidden');show('welcome')});$('close').onclick=()=>show('welcome');$('minimize').onclick=()=>document.querySelector('.game').classList.add('hidden');$('task').onclick=()=>document.querySelector('.game').classList.remove('hidden');document.addEventListener('keydown',e=>{if($('overlay').hidden)return;if(e.key==='Escape')hide();if(e.key==='Tab'){const focusable=[...document.querySelector('.dialog').querySelectorAll('button,input')].filter(el=>!el.disabled&&el.getClientRects().length);let a=focusable[0],b=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus()}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus()}}});function clock(){$('clock').textContent=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}clock();setInterval(clock,30000);render();show('welcome');

let winnerRecord=null;
function showRegistration(){
 if(game.state!=='won')return;
 if(!winnerRecord)winnerRecord={runId:crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2),elapsedSeconds:elapsed,boardSize:game.size,ghosts:game.mines,completedAt:new Date().toISOString(),submitted:false};
 show('won');modal='register';document.querySelector('.dialog').dataset.screen='register';$('dialog-ghost').dataset.mood='register';$('dialog-title').textContent='🎃 通关登记';$('dialog-heading').textContent='留下你的通关记录';$('dialog-text').textContent=`恭喜通关！用时${winnerRecord.elapsedSeconds}秒，请填写工号登记。`;
 $('winner-form').hidden=false;$('action').hidden=true;
 const configured=Boolean(window.GHOST_CONFIG?.registrationEndpoint);
 $('submit-winner').disabled=!configured||winnerRecord.submitted;
 $('employee-id').disabled=winnerRecord.submitted;
 $('registration-status').textContent=winnerRecord.submitted?'登记成功，感谢参与！':'';
 $('employee-id').focus();
}
$('register-result').onclick=showRegistration;
$('winner-form').addEventListener('submit',async event=>{
 event.preventDefault();if(game.state!=='won'||!winnerRecord||winnerRecord.submitted)return;
 const employeeId=$('employee-id').value.trim().toUpperCase();$('employee-id').value=employeeId;
 if(!/^K\d{6}$/.test(employeeId)){$('employee-id').setCustomValidity('工号格式不正确，应为 K + 6位数字，例如 K007309');$('registration-status').textContent='工号格式不正确，应为 K + 6位数字，例如 K007309';$('employee-id').reportValidity();return;}
 const endpoint=window.GHOST_CONFIG?.registrationEndpoint;if(!endpoint)return;
 const record=winnerRecord,button=$('submit-winner');button.disabled=true;$('registration-status').textContent='正在提交…';
 const pad=n=>String(n).padStart(2,'0'),d=new Date(record.completedAt);
 const payload={employeeId,runId:record.runId,elapsedSeconds:record.elapsedSeconds,boardSize:record.boardSize,ghosts:record.ghosts,completedAt:`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`};
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 const done=()=>{record.submitted=true;if(winnerRecord===record){$('registration-status').textContent='登记成功，感谢参与！';$('employee-id').disabled=true;}};
 try{
  // 优先标准 JSON 请求（可读取 Lark 的返回结果）
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
  if(!response.ok)throw Error('submit');
  let result={};try{result=await response.json()}catch(e){}
  if(result.ok===false||(typeof result.code==='number'&&result.code!==0))throw Error('receipt');
  done();
 }catch(error){
  if(error.name==='AbortError'){if(winnerRecord===record)$('registration-status').textContent='提交超时，请重试。';}
  else if(error instanceof TypeError){
   // 浏览器因跨域限制读不到 Lark 返回时，改用 no-cors 直接发送（无法读取回执）
   try{await fetch(endpoint,{method:'POST',mode:'no-cors',body:JSON.stringify(payload)});done();}
   catch(e2){if(winnerRecord===record)$('registration-status').textContent='未能确认登记成功，请重试。';}
  }else if(winnerRecord===record)$('registration-status').textContent='未能确认登记成功，请重试。';
 }
 finally{clearTimeout(timeout);if(winnerRecord===record)button.disabled=record.submitted;}
});
$('employee-id').addEventListener('input',()=>{$('employee-id').setCustomValidity('');if($('registration-status').textContent.startsWith('工号格式'))$('registration-status').textContent='';});

const voxelField=document.querySelector('.voxel-field');
for(let i=0;i<46;i++){const block=document.createElement('i');block.style.cssText=`--x:${(i*37)%100}%;--y:${(i*19)%100}%;--size:${24+(i*13)%42}px;--hue:${i%3===0?32:265};--delay:${i%7}s`;voxelField.append(block);}
