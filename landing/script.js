/* ═══ PARTICLE NETWORK ═══ */
(function(){
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, mouse = {x:-9999, y:-9999};
  const NODES = 80, DIST = 150, REPEL = 120;
  let particles = [];

  function resize(){ W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor(){
      this.x = Math.random()*W;
      this.y = Math.random()*H;
      this.vx = (Math.random()-0.5)*0.4;
      this.vy = (Math.random()-0.5)*0.4;
      this.r = Math.random()*2+1;
      this.baseAlpha = Math.random()*0.4+0.2;
      this.alpha = this.baseAlpha;
      this.pulse = Math.random()*Math.PI*2;
    }
    update(){
      this.pulse += 0.02;
      this.alpha = this.baseAlpha + Math.sin(this.pulse)*0.1;
      // mouse repulsion
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if(dist < REPEL && dist > 0){
        const force = (REPEL - dist)/REPEL * 2;
        this.vx += (dx/dist)*force*0.3;
        this.vy += (dy/dist)*force*0.3;
      }
      this.vx *= 0.98; this.vy *= 0.98;
      this.x += this.vx; this.y += this.vy;
      if(this.x<0){this.x=0;this.vx*=-1;}
      if(this.x>W){this.x=W;this.vx*=-1;}
      if(this.y<0){this.y=0;this.vy*=-1;}
      if(this.y>H){this.y=H;this.vy*=-1;}
    }
    draw(){
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle=`rgba(91,82,245,${this.alpha})`;
      ctx.fill();
    }
  }

  for(let i=0;i<NODES;i++) particles.push(new Particle());

  function animate(){
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>p.update());
    // draw connections
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const dx=particles[i].x-particles[j].x;
        const dy=particles[i].y-particles[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<DIST){
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle=`rgba(91,82,245,${0.12*(1-d/DIST)})`;
          ctx.lineWidth=0.6;
          ctx.stroke();
        }
      }
    }
    particles.forEach(p=>p.draw());
    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener('mousemove',e=>{ mouse.x=e.clientX; mouse.y=e.clientY; });
  document.addEventListener('mouseleave',()=>{ mouse.x=-9999; mouse.y=-9999; });
})();

/* ═══ CUSTOM CURSOR ═══ */
(function(){
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if(!dot||!ring) return;
  let mx=0,my=0,rx=0,ry=0;

  document.addEventListener('mousemove',e=>{
    mx=e.clientX; my=e.clientY;
    dot.style.transform=`translate(${mx-4}px,${my-4}px)`;
  });

  function lerp(){ 
    rx+=(mx-rx)*0.15; ry+=(my-ry)*0.15;
    ring.style.transform=`translate(${rx-18}px,${ry-18}px)`;
    requestAnimationFrame(lerp);
  }
  lerp();

  const hoverEls = document.querySelectorAll('a,button,[data-hover]');
  hoverEls.forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('hovering'));
    el.addEventListener('mouseleave',()=>ring.classList.remove('hovering'));
  });
})();

/* ═══ SCROLL REVEAL ═══ */
(function(){
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const delay = entry.target.dataset.delay || 0;
        setTimeout(()=>entry.target.classList.add('visible'), delay*1000);
        obs.unobserve(entry.target);
      }
    });
  },{threshold:0.15, rootMargin:'-40px'});
  reveals.forEach(el=>obs.observe(el));
})();
