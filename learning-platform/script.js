// ---------- App Data ----------
const app = {
  courses: [
    {id:'docker',title:'Docker Essentials',desc:'Containers, images, Dockerfile basics',video:'https://www.youtube.com/embed/3c-iBn73dDE'},
    {id:'terraform',title:'Terraform Basics',desc:'Infra as Code with Terraform',video:'https://www.youtube.com/embed/6aKQ9u_w3Qw'},
    {id:'jenkins',title:'Jenkins CI/CD',desc:'Build & Pipeline automation',video:'https://www.youtube.com/embed/6YZvp2GwT0A'},
    {id:'gitops',title:'GitOps with ArgoCD',desc:'Continuous delivery via GitOps',video:'https://www.youtube.com/embed/2wVvAt6kG6Y'},
    {id:'k8s',title:'Kubernetes Essentials',desc:'Pods, Deployments, Services',video:'https://www.youtube.com/embed/X48VuDVv0do'}
  ],
  devs: [
    {id:'dev1',name:'Aman Kumar',skills:'Docker,CI/CD',status:'Open to Collaborate'},
    {id:'dev2',name:'Updeep Singh',skills:'AWS,Terraform',status:'Looking for projects'},
    {id:'dev3',name:'Rudraksh B',skills:'Automation,Selenium',status:'Mentoring'}
  ]
};

// ---------- Helpers ----------
function el(tag, attrs={}, children=[]) {
  const e = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'html') e.innerHTML = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  children.forEach(c => e.appendChild(c));
  return e;
}

// ---------- Auth ----------
function currentUser(){ return JSON.parse(localStorage.getItem('lp_user')||'null') }
function setUser(u){ localStorage.setItem('lp_user',JSON.stringify(u)); renderUserPanel(); }
function logout(){ localStorage.removeItem('lp_user'); renderUserPanel(); }

function renderUserPanel(){
  const up = document.getElementById('userPanel');
  const u = currentUser();
  if(u){
    up.innerHTML = `👋 ${u.username} <span style="margin-left:8px;font-size:0.8rem;color:#9feaff">(${u.email||'dev'})</span>`;
    document.getElementById('authBtn').innerText='Sign out';
  } else {
    up.innerText='Not signed in';
    document.getElementById('authBtn').innerText='Login / Signup';
  }
}

function openAuthModal(){
  const modal = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <h3>Sign in / Sign up</h3>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
      <input id="authName" placeholder="Username" />
      <input id="authEmail" placeholder="Email (optional)" />
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px">
        <button id="authSave" class="btn">Save</button>
      </div>
    </div>
  `;
  modal.style.display='flex';
  document.getElementById('authSave').onclick = () => {
    const name = document.getElementById('authName').value.trim();
    const email = document.getElementById('authEmail').value.trim();
    if(!name){ alert('Enter username'); return; }
    setUser({username:name,email:email||null,createdAt:Date.now()});
    modal.style.display='none';
    alert('Welcome, '+name+' — you can now save progress & chat with devs!');
  };
}

// ---------- Courses ----------
function renderCourses(){
  const wrap = document.getElementById('coursesList'); wrap.innerHTML='';
  app.courses.forEach(c=>{
    const progress = Number(localStorage.getItem('course_'+c.id)||0);
    const card = el('div',{class:'courseCard'});
    card.innerHTML = `
      <div class="courseMeta">
        <div>
          <strong>${c.title}</strong>
          <div class="small">${c.desc}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700">${progress}%</div>
          <div class="small">progress</div>
        </div>
      </div>
      <div style="margin-top:8px;position:relative;padding-top:56.25%"><iframe src="${c.video}" frameborder="0" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%"></iframe></div>
      <div class="progressTrack"><div class="progressBar" data-id="${c.id}" style="width:${progress}%"></div></div>
      <div style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end">
        <button class="btn" data-action="start" data-id="${c.id}">Start</button>
        <button class="btn secondary" data-action="reset" data-id="${c.id}">Reset</button>
      </div>
    `;
    wrap.appendChild(card);
  });
}

function openCourse(id){
  const course = app.courses.find(x=>x.id===id);
  if(!course) return;
  const modal = document.getElementById('modalBackdrop'); const content = document.getElementById('modalContent');
  content.innerHTML = `
    <h3>${course.title}</h3>
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px">
      <div>${course.desc}</div>
      <div style="position:relative;padding-top:56.25%"><iframe src="${course.video}" frameborder="0" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%"></iframe></div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px">
        <button id="markComplete" class="btn">Mark +20%</button>
        <button id="closeCourse" class="btn secondary">Close</button>
      </div>
    </div>
  `;
  modal.style.display='flex';
  document.getElementById('markComplete').onclick = ()=>{
    const key = 'course_'+id; let v = Number(localStorage.getItem(key)||0); v = Math.min(100, v+20); localStorage.setItem(key, v); renderCourses(); alert('Progress updated: '+v+'%');
  };
  document.getElementById('closeCourse').onclick = ()=>{ modal.style.display='none' };
}

// ---------- DevTinder & Chat ----------
function renderDevs(){
  const wrap = document.getElementById('devList'); wrap.innerHTML='';
  app.devs.forEach(d=>{
    const card = document.createElement('div'); card.className='devtinderItem';
    card.innerHTML = `
      <div class="avatar">${d.name.split(' ')[0].charAt(0)}</div>
      <strong>${d.name}</strong>
      <div class="small">${d.skills}</div>
      <div class="tag" style="margin-top:8px">${d.status}</div>
      <div style="margin-top:10px;display:flex;justify-content:center;gap:6px">
        <button class="btn" data-id="${d.id}" data-action="connect">Connect</button>
        <button class="btn secondary" data-id="${d.id}" data-action="view">View</button>
      </div>
    `;
    wrap.appendChild(card);
  });
}

function openChat(devId){
  const dev = app.devs.find(d=>d.id===devId); if(!dev) return;
  const modal = document.getElementById('modalBackdrop'); const content = document.getElementById('modalContent');
  const chatKey = 'chat_'+(currentUser()?currentUser().username:'guest')+'_'+devId;
  const msgs = JSON.parse(localStorage.getItem(chatKey)||'[]');
  content.innerHTML = `
    <h3>Chat — ${dev.name}</h3>
    <div class="chatWindow" style="margin-top:8px">
      <div class="chatMessages" id="chatMessages"></div>
      <div class="chatInputWrap">
        <input id="chatInput" placeholder="Type a message..." />
        <button id="sendChat" class="btn">Send</button>
      </div>
    </div>
  `;
  modal.style.display='flex';
  const messagesWrap = document.getElementById('chatMessages');
  function renderMsgs(){ messagesWrap.innerHTML=''; JSON.parse(localStorage.getItem(chatKey)||'[]').forEach(m=>{ const div = document.createElement('div'); div.className='msg '+(m.from==='me'?'me':'them'); div.innerText = m.text; messagesWrap.appendChild(div) }); messagesWrap.scrollTop = messagesWrap.scrollHeight; }
  if(msgs.length===0){ msgs.push({from:'them',text:`Hi, I'm ${dev.name}. Happy to chat!`}); localStorage.setItem(chatKey, JSON.stringify(msgs)); }
  renderMsgs();
  document.getElementById('sendChat').onclick = ()=>{
    const t = document.getElementById('chatInput').value.trim(); if(!t) return;
    const arr = JSON.parse(localStorage.getItem(chatKey)||'[]'); arr.push({from:'me',text:t}); localStorage.setItem(chatKey, JSON.stringify(arr)); document.getElementById('chatInput').value=''; renderMsgs();
  };
}

// ---------- Contact ----------
document.getElementById('sendContact').addEventListener('click', ()=>{
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const msg = document.getElementById('contactMessage').value.trim();
  const result = document.getElementById('contactResult');
  if(!name||!email||!msg){ result.innerText = 'Please complete all fields'; result.style.color='tomato'; return; }
  const arr = JSON.parse(localStorage.getItem('messages')||'[]'); arr.push({name,email,msg,at:Date.now()}); localStorage.setItem('messages', JSON.stringify(arr));
  document.getElementById('contactName').value=''; document.getElementById('contactEmail').value=''; document.getElementById('contactMessage').value='';
  result.innerText = 'Thanks — your message is saved (demo).'; result.style.color='#8feaff';
});

// ---------- 3D Pipeline (Three.js) ----------
let renderer, scene, camera; let pipelineNodes = []; let mover;
function initThree(){
  const canvas = document.getElementById('threeCanvas');
  renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  function setSize(){ renderer.setSize(canvas.clientWidth, canvas.clientHeight); camera.aspect = canvas.clientWidth / canvas.clientHeight; camera.updateProjectionMatrix(); }
  setSize();
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 1000); camera.position.set(0,3,8);
  const light = new THREE.DirectionalLight(0xffffff,0.9); light.position.set(5,10,7); scene.add(light);
  scene.add(new THREE.AmbientLight(0x66e6ff,0.3));

  // Node labels and colors
  const labels = ['Code','Build','Test','Deploy','Monitor'];
  const colors = [0x00f2ff,0x00d4ff,0x00ffb3,0x7effc8,0xfff176];
  labels.forEach((lab,i)=>{
    const g = new THREE.BoxGeometry(1.2,0.6,0.8);
    const m = new THREE.MeshStandardMaterial({color:colors[i]});
    const mesh = new THREE.Mesh(g,m);
    mesh.position.set((i-2)*2.2, 0, 0);
    scene.add(mesh);

    // tool icon label (canvas texture)
    const cvs = document.createElement('canvas'); cvs.width=256; cvs.height=64;
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0,0,256,64);
    ctx.font = '22px Poppins';
    ctx.fillStyle = '#001';
    const toolNames = ['GitHub','Jenkins','Docker','AWS','Prometheus'];
    ctx.fillText(toolNames[i], 14, 36);
    const txt = new THREE.CanvasTexture(cvs);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.4), new THREE.MeshBasicMaterial({map:txt,transparent:true}));
    plane.position.set(mesh.position.x,0.65,0);
    scene.add(plane);

    pipelineNodes.push({mesh,label:lab,pos:mesh.position});
  });

  // connecting lines
  for(let i=0;i<pipelineNodes.length-1;i++){
    const a=pipelineNodes[i].pos, b=pipelineNodes[i+1].pos;
    const mat = new THREE.LineBasicMaterial({color:0x66f0ff,linewidth:2});
    const pts = [new THREE.Vector3(a.x,a.y,a.z), new THREE.Vector3(b.x,b.y,b.z)];
    const ln = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(ln,mat); scene.add(line);
  }

  // mover sphere
  const sphere = new THREE.SphereGeometry(0.18,16,16);
  const sm = new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x00ffcc,emissiveIntensity:0.6});
  mover = new THREE.Mesh(sphere,sm);
  mover.position.copy(pipelineNodes[0].pos);
  mover.position.y = 0.35;
  scene.add(mover);

  // animate loop
  function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
  }
  animate();

  // handle resize
  window.addEventListener('resize', ()=>{ setSize(); });
}

function run3DPipelineDemo(){
  const status = document.getElementById('pipelineStatus'); status.innerText='Status: Running';
  let i=0; const nodes = pipelineNodes;
  function step(){
    if(i>=nodes.length){ status.innerText='Status: Completed'; return Promise.resolve(); }
    status.innerText = 'Status: Running — '+nodes[i].label;
    return new Promise(res=>{
      const from = mover.position.clone(); const to = nodes[i].pos.clone(); to.y = 0.35; let t=0; const dur=1000;
      const id = setInterval(()=>{ t+=50; const p = Math.min(1,t/dur); mover.position.lerpVectors(from,to,p); if(p>=1){ clearInterval(id); i++; setTimeout(()=>res(step()),350) } },50);
    });
  }
  return step();
}

// ---------- Pipeline Step-by-step ----------
function openPipelineSteps(){
  const modal = document.getElementById('modalBackdrop'); const content = document.getElementById('modalContent');
  const labels = ['Code','Build','Test','Deploy','Monitor'];
  const descs = ['Push to Git (GitHub)','CI Build (Jenkins)','Run Tests (Selenium / Unit)','Deploy (Docker + AWS)','Monitor (Prometheus / Grafana)'];
  let html = '<h3>Pipeline — Step by step</h3><div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">';
  labels.forEach((l,i) => html += `<div style="padding:8px;border-radius:8px;background:rgba(255,255,255,0.02)"><strong>${l}</strong><div class="small">${descs[i]}</div></div>`);
  html += '</div><div style="display:flex;justify-content:flex-end;margin-top:10px"><button id="closeSteps" class="btn secondary">Close</button></div>';
  content.innerHTML = html; modal.style.display='flex'; document.getElementById('closeSteps').onclick = ()=>modal.style.display='none';
}

// ---------- Demo textual pipeline (for runDemoBtn) ----------
async function runSimpleTextPipeline(){
  const statusEl = document.getElementById('pipelineStatus'); statusEl.innerText='Status: Running demo';
  const messages = ['Pulling code from Git...','Building artifacts...','Executing tests...','Packaging image...','Deploying to demo environment...','Verifying deployment...'];
  for(let i=0;i<messages.length;i++){ statusEl.innerText = messages[i]; await new Promise(r=>setTimeout(r,900)); }
  statusEl.innerText='Demo pipeline finished ✅';
  const u = currentUser(); if(u){ const key='badges_'+u.username; const badges = JSON.parse(localStorage.getItem(key)||'[]'); if(!badges.includes('demo-run')){ badges.push('demo-run'); localStorage.setItem(key, JSON.stringify(badges)); alert('Congrats — demo pipeline completed! Badge saved.'); } }
}

// ---------- Wiring & init ----------
window.addEventListener('load', ()=>{
  renderUserPanel(); renderCourses(); renderDevs(); initThree();

  // course actions
  document.getElementById('coursesList').addEventListener('click', (e)=>{
    const action = e.target.dataset.action; const id = e.target.dataset.id; if(!action) return;
    if(action==='start') openCourse(id);
    if(action==='reset'){ localStorage.setItem('course_'+id,0); renderCourses(); alert('Progress reset'); }
  });

  // devtinder actions
  document.getElementById('devList').addEventListener('click', (e)=>{
    const id = e.target.dataset.id; const a = e.target.dataset.action; if(!id) return;
    if(a==='connect'){ if(!currentUser()){ if(confirm('You must be signed in to chat. Sign in now?')) openAuthModal(); return } openChat(id); }
    if(a==='view'){ alert('Developer profile (demo): '+ app.devs.find(x=>x.id===id).name); }
  });

  // auth button
  document.getElementById('authBtn').addEventListener('click', ()=>{
    if(currentUser()){ if(confirm('Sign out?')){ logout(); alert('Signed out'); } } else openAuthModal();
  });

  // modal close
  document.getElementById('closeModal').addEventListener('click', ()=>{ document.getElementById('modalBackdrop').style.display='none'; });
  document.getElementById('modalBackdrop').addEventListener('click', (e)=>{ if(e.target===document.getElementById('modalBackdrop')) document.getElementById('modalBackdrop').style.display='none'; });

  // pipeline controls
  document.getElementById('start3DPipeline').addEventListener('click', async ()=>{ await run3DPipelineDemo(); document.getElementById('pipelineStatus').innerText='Status: Idle'; });
  document.getElementById('explainPipeline').addEventListener('click', openPipelineSteps);
  document.getElementById('runDemoBtn').addEventListener('click', runSimpleTextPipeline);
  document.getElementById('openCoursesBtn').addEventListener('click', ()=>{ openCourse(app.courses[0].id) });

  // contact clear
  document.getElementById('clearContact').addEventListener('click', ()=>{ document.getElementById('contactName').value=''; document.getElementById('contactEmail').value=''; document.getElementById('contactMessage').value=''; });

  // small demo progress
  if(!localStorage.getItem('course_docker')) localStorage.setItem('course_docker',20);
});
