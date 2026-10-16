/* Standalone classic minesweeper model; also exported for automated tests. */
(function(root){
class GhostGame {
 constructor(size=12,mines=20,rng=Math.random){this.size=size;this.mines=mines;this.rng=rng;this.cells=Array.from({length:size*size},()=>({mine:false,open:false,flag:false,count:0}));this.state='ready';this.opened=0;this.flags=0;}
 neighbors(i){let a=[];let x=i%this.size,y=Math.floor(i/this.size);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){let nx=x+dx,ny=y+dy;if((dx||dy)&&nx>=0&&nx<this.size&&ny>=0&&ny<this.size)a.push(ny*this.size+nx);}return a;}
 plant(first){let safe=new Set([first,...this.neighbors(first)]),pool=this.cells.map((_,i)=>i).filter(i=>!safe.has(i));if(this.mines>pool.length)throw Error('Too many ghosts');for(let i=pool.length-1;i>0;i--){let j=Math.floor(this.rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}pool.slice(0,this.mines).forEach(i=>this.cells[i].mine=true);this.cells.forEach((c,i)=>c.count=this.neighbors(i).filter(n=>this.cells[n].mine).length);this.state='playing';}
 flag(i){let c=this.cells[i];if(!c||c.open||['won','lost'].includes(this.state))return false;c.flag=!c.flag;this.flags+=c.flag?1:-1;return true;}
 reveal(i){let c=this.cells[i];if(!c||c.open||c.flag||['won','lost'].includes(this.state))return false;if(this.state==='ready')this.plant(i);if(c.mine){c.open=true;this.hit=i;this.state='lost';return true;}let queue=[i];while(queue.length){let n=queue.pop(),v=this.cells[n];if(v.open||v.flag||v.mine)continue;v.open=true;this.opened++;if(!v.count)queue.push(...this.neighbors(n));}if(this.opened===this.cells.length-this.mines)this.state='won';return true;}
}
root.GhostGame=GhostGame;if(typeof module!=='undefined')module.exports=GhostGame;
})(typeof window==='undefined'?globalThis:window);
