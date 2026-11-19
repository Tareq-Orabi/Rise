import React from 'react';
import {plans} from './data.js';
import {PlanBlocks} from './Reader.jsx';
const company=plans.find(p=>p.id==='commercial');
export const companySlugs=['overview','services','method','experience','engagement','offer'];
export function Company({section}){
  const index=Math.max(0,companySlugs.indexOf(section)),page=company.pages[index];
  return <section className="company-page">
    <header className="company-head"><div><span className="eyebrow">مرجع الشركة التجاري</span><h1>الشركة والخدمات</h1><p>تعريف موحد بالخدمات والخبرات ومنهجية التنفيذ وإعداد العروض.</p></div><a className="button" href={company.pdfUrl} download="Octagram-Commercial-Proposal-English.pdf">تحميل الأصل الإنجليزي</a></header>
    <nav className="company-tabs" aria-label="أقسام الشركة والخدمات">{company.pages.map((p,i)=><a key={p.title} href={`#/company/${companySlugs[i]}`} aria-current={i===index?'page':undefined}>{p.title}</a>)}</nav>
    <div className="panel company-content"><h2>{page.title}</h2>{page.blocks.map((b,i)=>b.type==='table'&&index!==5?<div className={`company-cards ${index===3?'experience-cards':''}`} key={i}>{b.rows.map((row,j)=><article key={row[0]}><span className="company-card-label">{index===1?'خدمة هندسية':index===2?`المرحلة ${j+1}`:index===3?row[1]:index===4?'نموذج تعاون':'تحدٍ تشغيلي'}</span><h3>{row[0]}</h3><p>{index===3?row[2]:row[1]}</p>{row[2]&&index!==3&&<div className="company-card-detail">{row[2]}</div>}{index===3&&j===2&&<a className="button" href="#/plan/octaclub/1">خطة OctaClub + THINK</a>}</article>)}</div>:<div className="octa-reader" key={i}><PlanBlocks page={{blocks:[b]}}/></div>)}</div>
    <div className="company-links"><a className="button" href="#/plan/master/13">خطة الخدمات والمبيعات 2027</a><a className="button" href="#/documents">مكتبة الوثائق</a>{index===0&&<><a className="button" href="https://octagramjo.com" target="_blank" rel="noopener noreferrer">الموقع الإلكتروني</a><a className="button" href="tel:+962780668491">0780668491</a></>}</div>
  </section>;
}
