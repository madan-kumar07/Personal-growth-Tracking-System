import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronRight, ChevronDown, CheckCircle2, Circle, BookOpen,
  Database, Server, Brain, Star, Zap, ExternalLink, X,
  Clock, Target, ArrowRight, TrendingUp, BarChart3, Layers, Globe, Terminal
} from 'lucide-react';
import {
  computeModuleProgress, computeModuleStatus, getNextRecommendedTopic,
  getWeakAreas, getRevisionRecommendations, computeRoadmapProgress
} from '../utils.js';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Database', 'DevOps', 'DSA'];
const CATEGORY_META = {
  All:{emoji:'🗺️'}, Frontend:{emoji:'🌐'}, Backend:{emoji:'⚙️'},
  Database:{emoji:'🗄️'}, DevOps:{emoji:'🔧'}, DSA:{emoji:'🧠'},
};
const MODULE_ICON_MAP = {
  html:'🌐',css:'🎨',javascript:'📜',typescript:'🔷',react:'⚛️',
  nodejs:'🟩',expressjs:'🚂',mongodb:'🍃',postgresql:'🐘',mysql:'🐬',
  redis:'🔴',docker:'🐳',git:'📦',linux:'🐧',aws:'☁️',
  dsa:'📊',arrays:'📋',linkedlist:'🔗',trees:'🌳',graphs:'🕸️',dp:'🎯',
};
const STATUS_CONFIG = {
  'not-started':{ label:'Not Started', color:'#7a90b0', bg:'rgba(120,144,176,0.1)', border:'rgba(120,144,176,0.25)' },
  'in-progress': { label:'In Progress', color:'#3b82f6', bg:'rgba(59,130,246,0.1)',  border:'rgba(59,130,246,0.3)'  },
  'completed':   { label:'Completed',   color:'#22c55e', bg:'rgba(34,197,94,0.1)',   border:'rgba(34,197,94,0.3)'   },
  'mastered':    { label:'Mastered',    color:'#f59e0b', bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.35)' },
};
const DIFF_STYLE = {
  Beginner:{color:'#22c55e',bg:'rgba(34,197,94,0.12)'},
  Intermediate:{color:'#f59e0b',bg:'rgba(245,158,11,0.12)'},
  Advanced:{color:'#ef4444',bg:'rgba(239,68,68,0.12)'},
  Expert:{color:'#a855f7',bg:'rgba(168,85,247,0.12)'},
};

function getModuleIcon(m){
  const key=(m.id||'').toLowerCase();
  return MODULE_ICON_MAP[key]||m.icon||CATEGORY_META[m.category]?.emoji||'📦';
}
function getTotalXP(roadmap=[]){
  let t=0;for(const m of roadmap)for(const tp of(m.topics||[]))if(tp.completed)t+=(tp.xp||20);return t;
}
function getDoneCount(roadmap=[]){return roadmap.reduce((s,m)=>s+(m.topics||[]).filter(t=>t.completed).length,0);}
function getTotalCount(roadmap=[]){return roadmap.reduce((s,m)=>s+(m.topics?.length||0),0);}

function progressColor(status){
  return status==='mastered'?'linear-gradient(90deg,var(--amber),var(--orange))':
         status==='completed'?'linear-gradient(90deg,var(--green),var(--cyan))':
         status==='in-progress'?'linear-gradient(90deg,var(--blue),var(--cyan))':
         'rgba(255,255,255,0.15)';
}

function TopStatsBar({state}){
  const roadmap=state.roadmap||[];
  const overall=computeRoadmapProgress(roadmap);
  const done=getDoneCount(roadmap);
  const total=getTotalCount(roadmap);
  const xp=getTotalXP(roadmap);
  const next=getNextRecommendedTopic(roadmap);
  const stats=[
    {icon:<BarChart3 size={20}/>,label:'Overall Progress',value:`${overall}%`,sub:'of full roadmap',c:'var(--cyan)',bg:'rgba(6,214,240,0.1)'},
    {icon:<CheckCircle2 size={20}/>,label:'Topics Done',value:`${done} / ${total}`,sub:'total topics',c:'var(--green)',bg:'rgba(34,197,94,0.1)'},
    {icon:<Zap size={20}/>,label:'XP from Roadmap',value:`+${xp}`,sub:'earned so far',c:'var(--amber)',bg:'rgba(245,158,11,0.1)'},
    {icon:<Target size={20}/>,label:'Next Topic',value:next?next.topic.slice(0,22)+(next.topic.length>22?'…':''):'All Done! 🎉',sub:next?next.module:'Complete!',c:'var(--purple)',bg:'rgba(168,85,247,0.1)'},
  ];
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:20}}>
      {stats.map((s,i)=>(
        <div key={i} className="glass-card" style={{padding:'18px 20px',display:'flex',alignItems:'center',gap:14,borderLeft:`3px solid ${s.c}`,transition:'transform 0.2s'}}
          onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
          <div style={{width:44,height:44,borderRadius:12,flexShrink:0,background:s.bg,color:s.c,display:'flex',alignItems:'center',justifyContent:'center'}}>{s.icon}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:'var(--font-head)',fontSize:'1.05rem',fontWeight:800,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.value}</div>
            <div style={{fontSize:'.72rem',color:'var(--text-muted)',marginTop:1}}>{s.label}</div>
            <div style={{fontSize:'.65rem',color:'var(--text-dim)'}}>{s.sub}</div>
          </div>
        </div>
      ))}
      <div className="glass-card" style={{gridColumn:'1/-1',padding:'16px 20px',display:'flex',flexDirection:'column',gap:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:'.82rem',fontWeight:600}}>🗺️ Full Roadmap Progress</span>
          <span style={{fontSize:'.82rem',fontWeight:700,color:'var(--cyan)'}}>{overall}%</span>
        </div>
        <div style={{height:12,borderRadius:999,background:'rgba(255,255,255,0.06)',overflow:'hidden'}}>
          <div style={{height:'100%',borderRadius:999,width:`${overall}%`,background:'linear-gradient(90deg,var(--cyan),var(--purple),var(--indigo))',backgroundSize:'200%',transition:'width 0.8s cubic-bezier(.4,0,.2,1)',animation:'xp-shimmer 3s ease-in-out infinite'}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'.68rem',color:'var(--text-dim)'}}>
          <span>{done} topics completed</span><span>{total-done} remaining</span>
        </div>
      </div>
    </div>
  );
}
function CategoryTabs({roadmap,selected,onSelect}){
  return (
    <div className="scrollable-chips" style={{marginBottom:16}}>
      {CATEGORIES.map(cat=>{
        const mods=cat==='All'?roadmap:roadmap.filter(m=>m.category===cat);
        const t=mods.reduce((s,m)=>s+(m.topics?.length||0),0);
        const d=mods.reduce((s,m)=>s+(m.topics||[]).filter(tp=>tp.completed).length,0);
        const pct=t?Math.round((d/t)*100):0;
        const active=selected===cat;
        return (
          <button key={cat} onClick={()=>onSelect(cat)} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 16px',borderRadius:999,border:active?'1px solid rgba(6,214,240,0.45)':'1px solid var(--border)',background:active?'rgba(6,214,240,0.12)':'rgba(255,255,255,0.03)',color:active?'var(--cyan)':'var(--text-muted)',fontWeight:active?700:400,fontSize:'.84rem',cursor:'pointer',transition:'all 0.2s'}}>
            <span>{CATEGORY_META[cat]?.emoji||'📦'}</span>
            <span>{cat}</span>
            <span style={{fontSize:'.68rem',padding:'1px 6px',borderRadius:999,background:active?'rgba(6,214,240,0.2)':'rgba(255,255,255,0.07)',color:active?'var(--cyan)':'var(--text-dim)',fontWeight:600}}>
              {mods.length}{pct>0?` · ${pct}%`:''}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ModuleCard({module,onClick,isSelected}){
  const progress=computeModuleProgress(module);
  const status=computeModuleStatus(progress);
  const sc=STATUS_CONFIG[status];
  const icon=getModuleIcon(module);
  const diff=DIFF_STYLE[module.difficulty]||DIFF_STYLE['Beginner'];
  const done=(module.topics||[]).filter(t=>t.completed).length;
  const total=module.topics?.length||0;
  const mastered=status==='mastered';
  return (
    <div className="glass-card" onClick={()=>onClick(module)} style={{padding:18,cursor:'pointer',border:isSelected?'1px solid rgba(6,214,240,0.5)':mastered?'1px solid rgba(245,158,11,0.4)':`1px solid ${sc.border}`,background:isSelected?'rgba(6,214,240,0.08)':mastered?'rgba(245,158,11,0.05)':'var(--panel)',transition:'all 0.2s',position:'relative',overflow:'hidden'}}
      onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.transform='translateY(-3px)';}}
      onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
      {mastered&&<div style={{position:'absolute',top:-30,right:-30,width:100,height:100,borderRadius:'50%',background:'radial-gradient(circle,rgba(245,158,11,0.2),transparent)',pointerEvents:'none'}}/>}
      <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
        <div style={{width:44,height:44,borderRadius:10,flexShrink:0,background:'rgba(255,255,255,0.06)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem'}}>{icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:'.92rem',marginBottom:4,fontFamily:'var(--font-head)',display:'flex',alignItems:'center',gap:6}}>{module.title}{mastered&&<span>⭐</span>}</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            <span style={{fontSize:'.65rem',padding:'2px 8px',borderRadius:999,fontWeight:700,color:diff.color,background:diff.bg}}>{module.difficulty||'Beginner'}</span>
            <span style={{fontSize:'.65rem',padding:'2px 8px',borderRadius:999,fontWeight:600,color:sc.color,background:sc.bg,border:`1px solid ${sc.border}`}}>{sc.label}</span>
          </div>
        </div>
        <ChevronRight size={16} style={{color:'var(--text-dim)',flexShrink:0,marginTop:4}}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:'.75rem',color:'var(--text-muted)',marginBottom:8}}>
        <span>{done} / {total} topics</span>
        <span style={{fontWeight:700,color:progress===100?'var(--amber)':'var(--cyan)'}}>{progress}%</span>
      </div>
      <div style={{height:6,borderRadius:999,background:'rgba(255,255,255,0.06)',overflow:'hidden'}}>
        <div style={{height:'100%',borderRadius:999,width:`${progress}%`,background:progressColor(status),transition:'width 0.6s cubic-bezier(.4,0,.2,1)'}}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:4,fontSize:'.65rem',color:'var(--text-dim)',marginTop:8}}>
        <Clock size={11}/><span>{module.estimatedHours}h est · +{module.xpReward} XP</span>
      </div>
    </div>
  );
}

function TopicItem({topic,moduleId,onToggle,disabled}){
  const [anim,setAnim]=useState(false);
  function click(){
    if(disabled)return;
    if(!topic.completed){setAnim(true);setTimeout(()=>setAnim(false),600);}
    onToggle(moduleId,topic.id,!topic.completed);
  }
  return (
    <div onClick={click} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:10,background:topic.completed?'rgba(34,197,94,0.07)':'rgba(255,255,255,0.02)',border:topic.completed?'1px solid rgba(34,197,94,0.2)':'1px solid var(--border)',cursor:disabled?'not-allowed':'pointer',transition:'all 0.2s',animation:anim?'topicCheck 0.5s ease-out':'none'}}
      onMouseEnter={e=>{if(!disabled&&!topic.completed)e.currentTarget.style.background='rgba(255,255,255,0.05)';}}
      onMouseLeave={e=>e.currentTarget.style.background=topic.completed?'rgba(34,197,94,0.07)':'rgba(255,255,255,0.02)'}>
      <div style={{flexShrink:0,color:topic.completed?'var(--green)':'var(--text-dim)',transition:'color 0.2s'}}>
        {topic.completed?<CheckCircle2 size={20}/>:<Circle size={20}/>}
      </div>
      <span style={{flex:1,fontSize:'.86rem',textDecoration:topic.completed?'line-through':'none',color:topic.completed?'var(--text-muted)':'var(--text)',transition:'all 0.2s'}}>{topic.title}</span>
      <span style={{fontSize:'.68rem',fontWeight:topic.completed?700:400,color:topic.completed?'var(--amber)':'var(--text-dim)',padding:topic.completed?'1px 7px':'0',background:topic.completed?'rgba(245,158,11,0.12)':'transparent',borderRadius:999,border:topic.completed?'1px solid rgba(245,158,11,0.25)':'none',flexShrink:0}}>
        {topic.completed?`+${topic.xp||20} XP`:`+${topic.xp||20}`}
      </span>
    </div>
  );
}

function ModuleDetailPanel({module,onClose,onTopicToggle,toggling}){
  const [activeTab,setActiveTab]=useState('topics');
  const [notes,setNotes]=useState(module.studyNotes||'');
  const [openQ,setOpenQ]=useState(null);
  const progress=computeModuleProgress(module);
  const status=computeModuleStatus(progress);
  const sc=STATUS_CONFIG[status];
  const done=(module.topics||[]).filter(t=>t.completed).length;
  const total=module.topics?.length||0;
  const diff=DIFF_STYLE[module.difficulty]||DIFF_STYLE['Beginner'];
  const icon=getModuleIcon(module);
  const mastered=status==='mastered';
  const TABS=[
    {id:'topics',label:'Topics',badge:`${done}/${total}`},
    {id:'resources',label:'Resources',badge:module.resources?.length||0},
    {id:'projects',label:'Projects',badge:module.practiceProjects?.length||0},
    {id:'interview',label:'Interview Q',badge:module.interviewQuestions?.length||0},
    {id:'notes',label:'Notes',badge:null},
  ];
  return (
    <div className="glass-card" style={{position:'fixed',top:0,right:0,width:'min(580px,100vw)',height:'100vh',zIndex:500,display:'flex',flexDirection:'column',boxShadow:'-8px 0 40px rgba(0,0,0,0.6)',background:'rgba(6,12,28,0.97)',backdropFilter:'blur(30px)',borderLeft:'1px solid var(--border-2)'}}>
      <div style={{padding:'20px 24px 16px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
          <div style={{width:52,height:52,borderRadius:12,flexShrink:0,background:'rgba(255,255,255,0.06)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.7rem'}}>{icon}</div>
          <div style={{flex:1,minWidth:0}}>
            <h2 style={{fontFamily:'var(--font-head)',fontSize:'1.1rem',fontWeight:800,marginBottom:4,display:'flex',alignItems:'center',gap:8}}>{module.title}{mastered&&'⭐'}</h2>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              <span style={{fontSize:'.65rem',padding:'2px 8px',borderRadius:999,fontWeight:700,color:diff.color,background:diff.bg}}>{module.difficulty}</span>
              <span style={{fontSize:'.65rem',padding:'2px 8px',borderRadius:999,fontWeight:600,color:sc.color,background:sc.bg,border:`1px solid ${sc.border}`}}>{sc.label}</span>
              <span style={{fontSize:'.65rem',padding:'2px 8px',borderRadius:999,color:'var(--text-dim)',background:'rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:4}}><Clock size={10}/> {module.estimatedHours}h</span>
              <span style={{fontSize:'.65rem',padding:'2px 8px',borderRadius:999,color:'var(--amber)',background:'rgba(245,158,11,0.1)'}}>+{module.xpReward} XP</span>
            </div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:'1px solid var(--border)',background:'rgba(255,255,255,0.04)',color:'var(--text-muted)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}><X size={16}/></button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'.78rem'}}>
            <span style={{color:'var(--text-muted)'}}>{done} / {total} topics</span>
            <span style={{fontWeight:800,color:mastered?'var(--amber)':status==='completed'?'var(--green)':status==='in-progress'?'var(--blue)':'var(--text-dim)'}}>{progress}%</span>
          </div>
          <div style={{height:10,borderRadius:999,background:'rgba(255,255,255,0.06)',overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:999,width:`${progress}%`,background:progressColor(status),transition:'width 0.6s cubic-bezier(.4,0,.2,1)'}}/>
          </div>
        </div>
        {progress===100&&<div style={{marginTop:10,padding:'8px 14px',borderRadius:10,background:'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(34,197,94,0.1))',border:'1px solid rgba(245,158,11,0.3)',color:'var(--amber)',fontSize:'.82rem',fontWeight:700,textAlign:'center'}}>⭐ {mastered?'Module Mastered! You are an expert.':'100% Complete — True Mastery!'}</div>}
        <div style={{display:'flex',gap:4,marginTop:14,overflowX:'auto',paddingBottom:2}}>
          {TABS.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{padding:'6px 12px',borderRadius:999,fontSize:'.78rem',fontWeight:activeTab===tab.id?700:400,border:activeTab===tab.id?'1px solid rgba(6,214,240,0.4)':'1px solid var(--border)',background:activeTab===tab.id?'rgba(6,214,240,0.12)':'rgba(255,255,255,0.03)',color:activeTab===tab.id?'var(--cyan)':'var(--text-muted)',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,display:'flex',alignItems:'center',gap:5,transition:'all 0.15s'}}>
              {tab.label}{tab.badge!==null&&<span style={{fontSize:'.65rem',padding:'1px 5px',borderRadius:999,background:activeTab===tab.id?'rgba(6,214,240,0.2)':'rgba(255,255,255,0.07)',fontWeight:700}}>{tab.badge}</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px 24px 24px'}}>
        {activeTab==='topics'&&(
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <p style={{fontSize:'.8rem',color:'var(--text-muted)',marginBottom:8,lineHeight:1.5}}>{module.description}</p>
            {module.whyLearn&&<div style={{padding:'10px 14px',borderRadius:10,background:'rgba(6,214,240,0.06)',border:'1px solid rgba(6,214,240,0.15)',marginBottom:10}}>
              <div style={{fontSize:'.68rem',textTransform:'uppercase',letterSpacing:'.08em',color:'var(--cyan)',marginBottom:4,fontWeight:700}}>💡 Why Learn This?</div>
              <p style={{fontSize:'.8rem',color:'var(--text)',lineHeight:1.5}}>{module.whyLearn}</p>
            </div>}
            <div style={{fontSize:'.8rem',fontWeight:700,marginBottom:4,color:'var(--text-muted)'}}>{done}/{total} topics completed</div>
            {(module.topics||[]).map(t=><TopicItem key={t.id} topic={t} moduleId={module.id} onToggle={onTopicToggle} disabled={toggling}/>)}
          </div>
        )}
        {activeTab==='resources'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <p style={{fontSize:'.8rem',color:'var(--text-muted)',marginBottom:4}}>Curated resources for {module.title}:</p>
            {!(module.resources?.length)?<div style={{textAlign:'center',padding:40,color:'var(--text-dim)'}}>No resources added</div>:
            (module.resources||[]).map((r,i)=>(
              <a key={i} href={r.url} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',textDecoration:'none',color:'var(--text)',transition:'all 0.15s'}}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(6,214,240,0.06)';e.currentTarget.style.borderColor='rgba(6,214,240,0.3)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)';e.currentTarget.style.borderColor='var(--border)';}}>
                <div style={{width:36,height:36,borderRadius:8,background:'rgba(6,214,240,0.1)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--cyan)',flexShrink:0}}><BookOpen size={16}/></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:'.88rem',marginBottom:2}}>{r.title}</div>
                  <div style={{fontSize:'.72rem',color:'var(--text-dim)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.url}</div>
                </div>
                <ExternalLink size={14} style={{color:'var(--cyan)',flexShrink:0}}/>
              </a>
            ))}
          </div>
        )}
        {activeTab==='projects'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <p style={{fontSize:'.8rem',color:'var(--text-muted)',marginBottom:4}}>Practice projects for {module.title}:</p>
            {!(module.practiceProjects?.length)?<div style={{textAlign:'center',padding:40,color:'var(--text-dim)'}}>No projects defined</div>:
            (module.practiceProjects||[]).map((p,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)'}}>
                <div style={{width:32,height:32,borderRadius:8,background:'rgba(168,85,247,0.12)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--purple)',flexShrink:0,fontFamily:'var(--font-head)',fontWeight:800,fontSize:'.9rem'}}>{i+1}</div>
                <span style={{fontSize:'.88rem',fontWeight:500}}>{p}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab==='interview'&&(
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <p style={{fontSize:'.8rem',color:'var(--text-muted)',marginBottom:4}}>Interview questions for {module.title}:</p>
            {!(module.interviewQuestions?.length)?<div style={{textAlign:'center',padding:40,color:'var(--text-dim)'}}>No questions added</div>:
            (module.interviewQuestions||[]).map((q,i)=>(
              <div key={i} onClick={()=>setOpenQ(openQ===i?null:i)} style={{padding:'14px 16px',borderRadius:10,cursor:'pointer',background:openQ===i?'rgba(6,214,240,0.06)':'rgba(255,255,255,0.03)',border:openQ===i?'1px solid rgba(6,214,240,0.25)':'1px solid var(--border)',transition:'all 0.2s'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:24,height:24,borderRadius:6,background:openQ===i?'rgba(6,214,240,0.15)':'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'center',color:openQ===i?'var(--cyan)':'var(--text-dim)',fontSize:'.7rem',fontWeight:700,flexShrink:0}}>Q{i+1}</div>
                  <span style={{fontSize:'.86rem',fontWeight:600,flex:1}}>{q}</span>
                  {openQ===i?<ChevronDown size={14} style={{color:'var(--cyan)',flexShrink:0}}/>:<ChevronRight size={14} style={{color:'var(--text-dim)',flexShrink:0}}/>}
                </div>
                {openQ===i&&<div style={{marginTop:10,paddingTop:10,borderTop:'1px solid var(--border)',fontSize:'.82rem',color:'var(--text-muted)',lineHeight:1.6}}>
                  <span style={{display:'inline-block',padding:'2px 8px',borderRadius:4,background:'rgba(6,214,240,0.1)',color:'var(--cyan)',fontSize:'.7rem',marginBottom:6,fontWeight:700}}>Study Tip</span>
                  <p>Research this topic thoroughly. Cover the definition, real-world examples, and edge cases. Practice explaining it simply — interviewers value clear communicators.</p>
                </div>}
              </div>
            ))}
          </div>
        )}
        {activeTab==='notes'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <p style={{fontSize:'.8rem',color:'var(--text-muted)'}}>Your study notes for {module.title}. Auto-saved to state.</p>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)}
              placeholder={'Write your notes...\n\n• Key concepts\n• Things to remember\n• Code snippets'}
              style={{minHeight:280,resize:'vertical',background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:10,padding:14,fontSize:'.85rem',lineHeight:1.7,color:'var(--text)',fontFamily:'var(--font-body)'}}/>
            <div style={{fontSize:'.72rem',color:'var(--text-dim)',textAlign:'right'}}>{notes.length} characters</div>
          </div>
        )}
      </div>
    </div>
  );
}

function SmartRecommendations({roadmap,onModuleSelect}){
  const next=getNextRecommendedTopic(roadmap);
  const weak=getWeakAreas(roadmap);
  const revision=getRevisionRecommendations(roadmap);
  if(!next&&!weak.length&&!revision.length)return null;
  return (
    <div className="glass-card" style={{padding:'20px 24px',marginTop:8}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
        <Brain size={18} style={{color:'var(--purple)'}}/>
        <h3 style={{fontFamily:'var(--font-head)',fontWeight:800,fontSize:'1rem'}}>Smart Recommendations</h3>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12}}>
        {next&&<div onClick={()=>{const m=roadmap.find(m=>m.id===next.moduleId);if(m)onModuleSelect(m);}} style={{padding:'14px 16px',borderRadius:12,cursor:'pointer',background:'rgba(6,214,240,0.07)',border:'1px solid rgba(6,214,240,0.25)',transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
            <div style={{width:28,height:28,borderRadius:6,background:'rgba(6,214,240,0.15)',color:'var(--cyan)',display:'flex',alignItems:'center',justifyContent:'center'}}><ArrowRight size={14}/></div>
            <span style={{fontSize:'.68rem',textTransform:'uppercase',letterSpacing:'.08em',color:'var(--cyan)',fontWeight:700}}>Next Up</span>
          </div>
          <div style={{fontWeight:700,fontSize:'.88rem',marginBottom:3}}>{next.topic}</div>
          <div style={{fontSize:'.72rem',color:'var(--text-muted)'}}>in {next.module}</div>
        </div>}
        {weak.map(m=>(
          <div key={m.id} onClick={()=>onModuleSelect(m)} style={{padding:'14px 16px',borderRadius:12,cursor:'pointer',background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <span style={{fontSize:'.9rem'}}>⚠️</span>
              <span style={{fontSize:'.68rem',textTransform:'uppercase',letterSpacing:'.08em',color:'var(--red)',fontWeight:700}}>Weak Area</span>
            </div>
            <div style={{fontWeight:700,fontSize:'.88rem',marginBottom:3}}>{m.title}</div>
            <div style={{fontSize:'.72rem',color:'var(--text-muted)'}}>{m.progress}% · needs more work</div>
            <div style={{marginTop:8,height:4,borderRadius:999,background:'rgba(255,255,255,0.06)',overflow:'hidden'}}><div style={{height:'100%',width:`${m.progress}%`,borderRadius:999,background:'var(--red)'}}/></div>
          </div>
        ))}
        {revision.map(m=>(
          <div key={m.id} onClick={()=>onModuleSelect(m)} style={{padding:'14px 16px',borderRadius:12,cursor:'pointer',background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.22)',transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <div style={{width:28,height:28,borderRadius:6,background:'rgba(245,158,11,0.12)',color:'var(--amber)',display:'flex',alignItems:'center',justifyContent:'center'}}><TrendingUp size={14}/></div>
              <span style={{fontSize:'.68rem',textTransform:'uppercase',letterSpacing:'.08em',color:'var(--amber)',fontWeight:700}}>Revise Soon</span>
            </div>
            <div style={{fontWeight:700,fontSize:'.88rem',marginBottom:3}}>{m.title}</div>
            <div style={{fontSize:'.72rem',color:'var(--text-muted)'}}>{m.progress}% · almost done!</div>
            <div style={{marginTop:8,height:4,borderRadius:999,background:'rgba(255,255,255,0.06)',overflow:'hidden'}}><div style={{height:'100%',width:`${m.progress}%`,borderRadius:999,background:'linear-gradient(90deg,var(--amber),var(--green))'}}/></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Roadmap({ state, setState, onNav, onXP }) {
  const [selectedCategory,setSelectedCategory]=useState('All');
  const [selectedModule,setSelectedModule]=useState(null);
  const [toggling,setToggling]=useState(false);
  const roadmap=state.roadmap||[];

  const filteredModules=useMemo(()=>{
    if(selectedCategory==='All')return roadmap;
    return roadmap.filter(m=>m.category===selectedCategory);
  },[roadmap,selectedCategory]);

  const liveModule=useMemo(()=>{
    if(!selectedModule)return null;
    return roadmap.find(m=>m.id===selectedModule.id)||null;
  },[roadmap,selectedModule]);

  const handleTopicToggle=useCallback(async(moduleId,topicId,completed)=>{
    if(toggling)return;
    setToggling(true);
    const mod=roadmap.find(m=>m.id===moduleId);
    const topic=mod?.topics?.find(t=>t.id===topicId);
    setState(cur=>({...cur,roadmap:(cur.roadmap||[]).map(m=>m.id===moduleId?{...m,topics:(m.topics||[]).map(t=>t.id===topicId?{...t,completed}:t)}:m)}));
    try{
      const res=await fetch('/api/roadmap/topic',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({moduleId,topicId,completed})});
      const data=await res.json();
      if(data.ok&&completed&&data.xpEarned>0){
        setState(cur=>({...cur,gamification:{...cur.gamification,xp:data.totalXP,xpHistory:[...(cur.gamification?.xpHistory||[]),{date:new Date().toISOString().slice(0,10),amount:data.xpEarned,source:'roadmap',title:`Completed: ${topic?.title}`}]}}));
        onXP(data.xpEarned,`Topic: ${topic?.title||'Completed'}`);
      }
    }catch(e){
      setState(cur=>({...cur,roadmap:(cur.roadmap||[]).map(m=>m.id===moduleId?{...m,topics:(m.topics||[]).map(t=>t.id===topicId?{...t,completed:!completed}:t)}:m)}));
    }finally{setToggling(false);}
  },[toggling,roadmap,setState,onXP]);

  return (
    <>
      <style>{`
        @keyframes topicCheck{0%{transform:scale(1)}40%{transform:scale(1.04)}100%{transform:scale(1)}}
        @keyframes slideInRight{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes fadeInBackdrop{from{opacity:0}to{opacity:1}}
      `}</style>
      <div style={{display:'flex',flexDirection:'column',gap:0}}>
        <div style={{marginBottom:20}}>
          <h1 style={{fontFamily:'var(--font-head)',fontSize:'1.5rem',fontWeight:900,marginBottom:4,background:'linear-gradient(135deg,var(--cyan),var(--purple))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>🗺️ Full Stack Developer Roadmap</h1>
          <p style={{fontSize:'.85rem',color:'var(--text-muted)',lineHeight:1.5}}>Your complete learning path from zero to job-ready. Check off topics, earn XP, and track your mastery.</p>
        </div>
        <TopStatsBar state={state}/>
        <CategoryTabs roadmap={roadmap} selected={selectedCategory} onSelect={cat=>{setSelectedCategory(cat);setSelectedModule(null);}}/>
        {roadmap.length===0?(
          <div className="glass-card" style={{padding:'60px 24px',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
            <div style={{fontSize:'3rem'}}>🗺️</div>
            <h3 style={{fontFamily:'var(--font-head)',fontSize:'1.1rem',fontWeight:800}}>Roadmap Loading...</h3>
            <p style={{color:'var(--text-muted)',fontSize:'.85rem',maxWidth:380}}>Your roadmap modules will appear here. Each has topics, resources, and XP to earn.</p>
          </div>
        ):filteredModules.length===0?(
          <div className="glass-card" style={{padding:'40px',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:8}}>📭</div>
            <div style={{color:'var(--text-muted)'}}>No modules in {selectedCategory} yet.</div>
          </div>
        ):(
          <div style={{display:'grid',gridTemplateColumns:liveModule?'repeat(auto-fill,minmax(230px,1fr))':'repeat(auto-fill,minmax(270px,1fr))',gap:12,marginBottom:16,transition:'grid-template-columns 0.3s'}}>
            {filteredModules.map(m=><ModuleCard key={m.id} module={m} onClick={mod=>setSelectedModule(mod)} isSelected={liveModule?.id===m.id}/>)}
          </div>
        )}
        {roadmap.length>0&&<SmartRecommendations roadmap={roadmap} onModuleSelect={m=>{setSelectedModule(m);if(m.category)setSelectedCategory(m.category);}}/>}
      </div>
      {liveModule&&<>
        <div onClick={()=>setSelectedModule(null)} style={{position:'fixed',inset:0,zIndex:499,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',animation:'fadeInBackdrop 0.2s ease-out'}}/>
        <div style={{position:'fixed',top:0,right:0,bottom:0,zIndex:500,animation:'slideInRight 0.3s cubic-bezier(.34,1.56,.64,1)'}}>
          <ModuleDetailPanel module={liveModule} onClose={()=>setSelectedModule(null)} onTopicToggle={handleTopicToggle} toggling={toggling}/>
        </div>
      </>}
    </>
  );
}
