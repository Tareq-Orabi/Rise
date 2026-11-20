import React, { useState } from 'react';
import { logoUrl } from './assets.js';
import { Icon } from './icons.jsx';
import { plans } from './data.js';
import { link, people, tasks } from './management.js';

const metrics = [
  { href:'#/projects', label:'مشاريع الخطة', value:2, tone:'mint', icon:'layers' },
  { href:'#/tasks', label:'مهام مخططة', value:tasks.length, tone:'peach', icon:'checklist' },
  { href:'#/team', label:'أعضاء الفريق', value:people.length, tone:'gold', icon:'users' },
  { href:'#/documents', label:'وثائق مرجعية', value:plans.length, tone:'sage', icon:'book' },
];
const quarters = [
  { label:'الأول', range:'يناير – مارس', title:'إطلاق منصة التعلّم', detail:'يستهدف الفريق قبول الإصدار الأول في 28 فبراير، ثم تثبيت التشغيل وتجهيز التجربة الطلابية في مارس.', target:'عميل مدفوع واحد' },
  { label:'الثاني', range:'أبريل – يونيو', title:'اختبار المنتجين ميدانيًا', detail:'تُقاس تجربة OctaClub مع الطلاب، وتحدّد مقابلات عمّان واتفاقات التجربة جدوى تطوير OctaCare.', target:'عميلان مدفوعان' },
  { label:'الثالث', range:'يوليو – سبتمبر', title:'تطوير المسار المعتمد', detail:'توجّه نتائج التجربة توسّع OctaClub. ويبدأ تطوير رحلة تشغيلية واحدة لـ OctaCare عند اعتماد قرار يونيو.', target:'4 عملاء مدفوعين' },
  { label:'الرابع', range:'أكتوبر – ديسمبر', title:'تقييم التشغيل والتوسّع', detail:'تُراجع استدامة العقود والشراكات ونتائج التجارب لتحديد نطاق الاستثمار في كل منتج لعام 2028.', target:'5 عملاء مدفوعين' },
];
const projects = [
  {id:'octaclub', name:'OctaClub + THINK', category:'التقنيات التعليمية', description:'منصة تعلّم تجمع المسارات الأكاديمية والتقييم ومساعد THINK في تجربة واحدة.', date:'28 فبراير 2027', gate:'قرار قبول الإصدار', page:32},
  {id:'octacare', name:'OctaCare', category:'التقنيات الصحية', description:'دراسة احتياجات العيادات والمؤسسات الطبية في عمّان لاختيار أول مسار تشغيلي يستحق التطوير.', date:'30 يونيو 2027', gate:'قرار بدء التطوير', page:4},
];

function QuarterCard() {
  const [index, setIndex] = useState(0);
  const item = quarters[index];
  return <section className="home-quarter">
    <div className="home-section-head"><h2>مسار السنة</h2><Icon name="calendar" size={22}/></div>
    <div className="home-periods" role="group" aria-label="اختر الربع">
      {quarters.map((q,i) => <button type="button" key={q.label} aria-label={'الربع ' + q.label} aria-pressed={i === index} onClick={() => setIndex(i)}><bdi>Q{i+1}</bdi></button>)}
    </div>
    <div className="home-quarter-copy" aria-live="polite" aria-atomic="true">
      <small>{item.range} 2027</small><h3>{item.title}</h3><p>{item.detail}</p>
      <div className="home-quarter-target"><span>المستهدف التجاري التراكمي</span><b>{item.target}</b></div>
    </div>
    <a className="home-link" href={link('master',5+index)}>قراءة خطة الربع {item.label}<Icon name="arrow" size={17}/></a>
  </section>;
}

export function Overview() {
  return <div className="home-overview">
    <section className="home-cover" aria-labelledby="plan-title">
      <div className="home-cover-copy">
        <div className="home-dates"><span aria-hidden="true"></span>ديسمبر 2026 – ديسمبر 2027</div>
        <h1 id="plan-title">خطة النهوض <bdi>2027</bdi></h1>
        <p>خارطة تنفيذ Octagram لإطلاق منصة التعلّم، ودراسة منتج الرعاية الصحية، وتنمية أعمال الشركة.</p>
        <div className="home-cover-actions"><a href={link('master')} className="home-cover-primary"><Icon name="book" size={17}/>قراءة الخطة العامة</a><a href="#/timeline" className="home-cover-secondary">الجدول التنفيذي<Icon name="arrow" size={17}/></a></div>
      </div>
      <div className="home-logo-field"><img src={logoUrl} alt="شعار Octagram الأصلي" fetchpriority="high"/></div>
    </section>
    <nav className="home-metrics" aria-label="ملخص الخطة">
      {metrics.map(m => <a key={m.href} href={m.href} className={'home-metric '+m.tone}><span className="home-metric-label"><Icon name={m.icon} size={18}/>{m.label}</span><span className="home-metric-value"><b>{m.value}</b><Icon name="arrow" size={17}/></span></a>)}
    </nav>
    <div className="home-spread">
      <section className="home-portfolio">
        <div className="home-section-head"><h2>محفظة المشاريع</h2><a className="home-link" href="#/projects">كل المشاريع<Icon name="arrow" size={16}/></a></div>
        {projects.map(p => <article key={p.id} className={'home-project '+p.id}>
          <div className="home-project-line"><small>{p.category}</small><span>{p.date}</span></div>
          <h3><a href={link(p.id)}><bdi>{p.name}</bdi></a></h3><p>{p.description}</p>
          <a className="home-project-gate" href={link(p.id,p.page)}>{p.gate}<Icon name="arrow" size={15}/></a>
        </article>)}
      </section>
      <div className="home-asides"><QuarterCard/>
        <section className="home-goals"><div className="home-section-head"><h2>الأهداف السنوية</h2><Icon name="target" size={21}/></div>
          <div><strong>5</strong><span>عملاء لخدمات الشركة</span></div>
          <div><strong>2</strong><span>شراكتان فعّالتان</span></div>
          <div><strong dir="ltr">3–5</strong><span>اشتراكات OctaCare، بعد اعتماد التجربة</span></div>
          <a className="home-link" href="#/company/services">استعراض خدمات الشركة<Icon name="arrow" size={16}/></a>
        </section>
      </div>
    </div>
  </div>;
}
