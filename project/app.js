// ---------- App Data ----------
const app = {
  courses: [
    {id:'docker',title:'Docker Essentials',desc:'Containers, images, Dockerfile basics',video:'https://www.youtube.com/embed/videoseries?list=PL8p2I9GklV47v6WZTjHAqdsHxpTIpjRwn'},
    {id:'terraform',title:'Terraform Basics',desc:'Infra as Code with Terraform',video:'https://www.youtube.com/embed/6aKQ9u_w3Qw'},
    {id:'jenkins',title:'Jenkins CI/CD',desc:'Build & Pipeline automation',video:'https://www.youtube.com/embed/6YZvp2GwT0A'},
    {id:'gitops',title:'GitOps with ArgoCD',desc:'Continuous delivery via GitOps',video:'https://www.youtube.com/embed/2wVvAt6kG6Y'},
    {id:'k8s',title:'Kubernetes Essentials',desc:'Pods, Deployments, Services',video:'https://www.youtube.com/embed/X48VuDVv0do'}
  ],
  devs: [
    {id:'dev1',name:'Aman Kumar',skills:'Docker, CI/CD, Kubernetes',status:'Open to Collaborate', role: 'DevOps Engineer', location: 'Bengaluru, India', experience: '5 years'},
    {id:'dev2',name:'Updeep Singh',skills:'AWS, Terraform, Python',status:'Looking for projects', role: 'Cloud Architect', location: 'Toronto, Canada', experience: '8 years'},
    {id:'dev3',name:'Rudraksh B',skills:'Automation, Selenium, Java',status:'Mentoring', role: 'QA Automation Lead', location: 'Mumbai, India', experience: '10 years'}
  ],
  pipeline: [
    {id:'step1',title:'Code Commit',desc:'Developers commit code to repo'},
    {id:'step2',title:'Build',desc:'Jenkins builds the project'},
    {id:'step3',title:'Test',desc:'Automated tests run'},
    {id:'step4',title:'Deploy',desc:'Code deployed via Terraform/Docker/K8s'},
    {id:'step5',title:'Monitor',desc:'Nagios/Grafana monitor the system'}
  ]
};

// ---------- Helpers ----------
function el(tag, attrs={}, children=[]){
  const e=document.createElement(tag);
  for(const k in attrs){
    if(k==='html') e.innerHTML=attrs[k];
    else e.setAttribute(k,attrs[k]);
  }
  children.forEach(c=>e.appendChild(c));
  return e;
}

const iconMap = { camera:'📷', mic:'🎤', endCall:'📞', role:'💼', location:'📍', exp:'⏳' };

// ---------- Auth ----------
function currentUser(){ return JSON.parse(localStorage.getItem('lp_user')||'null'); }
function setUser(u){ localStorage.setItem('lp_user',JSON.stringify(u)); renderUserPanel(); }
function logout(){ localStorage.removeItem('lp_user'); renderUserPanel(); }

function renderUserPanel(){
  const up = document.getElementById('userPanel'); const u=currentUser();
  const authBtn = document.getElementById('authBtn');
  if(u){
    up.innerHTML=`👋 <strong>${u.username}</strong> <span style="font-size:0.8rem;color:#9feaff">(${u.email||'dev'})</span>`;
    authBtn.innerText='Sign out';
  } else {
    up.innerText='Not signed in';
    authBtn.innerText='Login / Signup';
  }
}

function openAuthModal(){
  if(currentUser()){ logout(); return; }
  const modal=document.getElementById('modalBackdrop');
  const content=document.getElementById('modalContent');
  content.innerHTML=`
    <h3>Sign in / Sign up</h3>
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:15px">
      <input id="authName" placeholder="Username" required />
      <input id="authEmail" type="email" placeholder="Email (optional)" />
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">
        <button id="authSave" class="btn primary">Save & Sign in</button>
      </div>
    </div>
  `;
  modal.style.display='flex';
  document.getElementById('authSave').onclick=()=>{
    const name=document.getElementById('authName').value.trim();
    const email=document.getElementById('authEmail').value.trim();
    if(!name){ alert('Please enter a username'); return; }
    setUser({username:name,email:email||null,createdAt:Date.now()});
    modal.style.display='none';
    alert('Welcome, '+name);
    renderCourses();
  };
}

// ---------- Courses ----------
function getCourseProgressKey(id){ return 'course_'+(currentUser()?currentUser().username+'_':'guest_')+id; }

function renderCourses(){
  const wrap=document.getElementById('coursesList'); wrap.innerHTML='';
  app.courses.forEach(c=>{
    const key=getCourseProgressKey(c.id);
    const progress=Number(localStorage.getItem(key)||0);
    const card=el('div',{class:'courseCard'});
    card.innerHTML=`
      <div class="courseMeta">
        <div>
          <strong>${c.title}</strong>
          <div class="small">${c.desc}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700; color:#00ffb3">${progress}%</div>
          <div class="small">progress</div>
        </div>
      </div>
      <div style="margin-top:8px;position:relative;padding-top:56.25%">
        <iframe src="${c.video}" frameborder="0" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%"></iframe>
      </div>
      <div class="progressTrack"><div class="progressBar" style="width:${progress}%"></div></div>
      <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
        <button class="btn primary" data-action="start" data-id="${c.id}">View/Update</button>
        <button class="btn secondary" data-action="reset" data-id="${c.id}">Reset</button>
      </div>
    `;
    wrap.appendChild(card);
  });
}

function openCourse(id){
  const course=app.courses.find(x=>x.id===id); if(!course)return;
  const key=getCourseProgressKey(id); let currentProgress=Number(localStorage.getItem(key)||0);
  const modal=document.getElementById('modalBackdrop'); const content=document.getElementById('modalContent');
  content.innerHTML=`
    <h3>${course.title}</h3>
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:15px">
      <div>${course.desc}</div>
      <div style="position:relative;padding-top:56.25%">
        <iframe src="${course.video}" frameborder="0" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%"></iframe>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
        <div class="small">Current Progress: <strong style="color:#00f2ff;">${currentProgress}%</strong></div>
        <div style="display:flex;gap:8px;">
          <button id="markComplete" class="btn primary">Mark +20%</button>
          <button id="closeCourse" class="btn secondary">Close</button>
        </div>
      </div>
    </div>
  `;
  modal.style.display='flex';
  document.getElementById('markComplete').onclick=()=>{
    if(!currentUser()){ alert("Sign in to save progress"); return; }
    let v=Number(localStorage.getItem(key)||0); v=Math.min(100,v+20);
    localStorage.setItem(key,v); renderCourses(); document.getElementById('closeCourse').click(); alert('Progress updated to '+v+'%');
  };
  document.getElementById('closeCourse').onclick=()=>{ modal.style.display='none'; };
}

// ---------- DevTinder ----------
function renderDevs(){
  const wrap=document.getElementById('devList'); wrap.innerHTML='';
  app.devs.forEach(d=>{
    const card=el('div',{class:'devtinderItem'});
    const initials=d.name.split(' ').map(n=>n.charAt(0)).join('');
    card.innerHTML=`
      <div class="avatar">${initials}</div>
      <strong>${d.name}</strong>
      <div class="small">${d.skills}</div>
      <div class="tag">${d.status}</div>
      <div style="margin-top:15px;display:flex;justify-content:center;gap:8px">
        <button class="btn primary" data-id="${d.id}" data-action="connect">${iconMap.endCall} Connect</button>
        <button class="btn secondary" data-id="${d.id}" data-action="view">${iconMap.role} View</button>
      </div>
    `;
    wrap.appendChild(card);
  });
}

function openVideoCall(devId){
  const dev=app.devs.find(d=>d.id===devId); if(!dev) return;
  if(!currentUser()){ if(confirm('Sign in to connect?')) openAuthModal(); return; }
  const modal=document.getElementById('modalBackdrop'); const content=document.getElementById('modalContent');
  content.innerHTML=`
    <h3>Connecting with ${dev.name}...</h3>
    <div class="videoCallScreen">
      <div class="ringing-title">Ringing ${dev.name} ${iconMap.endCall}</div>
      <p class="small">Waiting for ${dev.name}...</p>
      <div class="call-controls">
        <button class="control-btn end" id="endCallBtn">${iconMap.endCall}</button>
        <button class="control-btn camera" id="cameraBtn">${iconMap.camera}</button>
        <button class="control-btn mic" id="micBtn">${iconMap.mic}</button>
      </div>
    </div>
  `;
  modal.style.display='flex';
  document.getElementById('endCallBtn').onclick=()=>{ modal.style.display='none'; alert(`Call with ${dev.name} ended.`); };
  document.getElementById('cameraBtn').onclick=()=>alert('Camera toggled'); 
  document.getElementById('micBtn').onclick=()=>alert('Mic toggled');
}

function openDevProfile(devId){
  const dev=app.devs.find(d=>d.id===devId); if(!dev)return;
  const modal=document.getElementById('modalBackdrop'); const content=document.getElementById('modalContent');
  content.innerHTML=`
    <h3>Developer Profile: ${dev.name}</h3>
    <p class="small">${dev.status}</p>
    <div class="profile-meta">
      <div class="profile-item"><strong>${iconMap.role} Role</strong><span>${dev.role}</span></div>
      <div class="profile-item"><strong>${iconMap.location} Location</strong><span>${dev.location}</span></div>
      <div class="profile-item"><strong>${iconMap.exp} Experience</strong><span>${dev.experience}</span></div>
      <div class="profile-item"><strong>Skills</strong><span>${dev.skills}</span></div>
    </div>
    <div style="margin-top:20px;text-align:right;">
      <button class="btn secondary" onclick="document.getElementById('modalBackdrop').style.display='none';">Close</button>
    </div>
  `;
  modal.style.display='flex';
}

// ---------- Pipeline ----------
function renderPipeline(){
  const wrap=document.getElementById('pipelineList'); wrap.innerHTML='';
  app.pipeline.forEach(p=>{
    const card=el('div',{class:'pipelineStep'});
    card.innerHTML=`
      <strong>${p.title}</strong>
      <div class="small">${p.desc}</div>
    `;
    wrap.appendChild(card);
  });
}

// ---------- Contact ----------
document.getElementById('sendContact').addEventListener('click',()=>{
  const name=document.getElementById('contactName').value.trim();
  const email=document.getElementById('contactEmail').value.trim();
  const msg=document.getElementById('contactMessage').value.trim();
  const result=document.getElementById('contactResult');
  if(!name||!email||!msg){ result.innerText='⚠️ Please fill all fields'; result.style.color='tomato'; return; }
  const arr=JSON.parse(localStorage.getItem('messages')||'[]'); arr.push({name,email,msg,at:Date.now()}); localStorage.setItem('messages',JSON.stringify(arr));
  document.getElementById('contactName').value=''; document.getElementById('contactEmail').value=''; document.getElementById('contactMessage').value='';
  result.innerText='✅ Message saved (demo)'; result.style.color='#8feaff';
});

// ---------- Init ----------
window.addEventListener('load',()=>{
  renderUserPanel(); renderCourses(); renderDevs(); renderPipeline();

  // Auth Btn
  document.getElementById('authBtn').addEventListener('click',openAuthModal);

  // Courses buttons
  document.getElementById('coursesList').addEventListener('click',e=>{
    const btn=e.target.closest('button'); if(!btn)return;
    const id=btn.dataset.id, action=btn.dataset.action;
    if(action==='start') openCourse(id);
    if(action==='reset'){ localStorage.removeItem(getCourseProgressKey(id)); renderCourses(); alert('Progress reset'); }
  });

  // DevTinder buttons
  document.getElementById('devList').addEventListener('click',e=>{
    const btn=e.target.closest('button'); if(!btn)return;
    const {id,action}=btn.dataset;
    if(action==='connect') openVideoCall(id);
    if(action==='view') openDevProfile(id);
  });

  // Modal close
  document.getElementById('closeModal').onclick=()=>{ document.getElementById('modalBackdrop').style.display='none'; };

  // Open first course demo
  document.getElementById('openCoursesBtn').onclick=()=>{ openCourse(app.courses[0].id); };

  // Navbar smooth scrolling
  document.querySelectorAll('.navBtn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const target=document.getElementById(btn.dataset.target);
      if(target) target.scrollIntoView({behavior:'smooth'});
    });
  });
});
