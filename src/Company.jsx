import React from 'react';
import {plans} from './data.js';
const services=plans.find(p=>p.id==='commercial');
const rows=services.pages[0].blocks.find(b=>b.type==='table').rows;
export function Company(){
  return <section className="company-page">
    <header className="company-head"><div><h1>الخدمات</h1><p>خدمات تطوير البرمجيات والتصميم والتحليلات والأتمتة.</p></div><a className="button" href={services.pdfUrl} download="Octagram-Services.pdf">تحميل دليل الخدمات</a></header>
    <div className="company-cards">{rows.map(row=><article key={row[0]}><h2>{row[0]}</h2><p>{row[1]}</p><div className="company-card-detail">{row[2]}</div></article>)}</div>
  </section>;
}
