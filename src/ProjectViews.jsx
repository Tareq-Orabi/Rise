import React from 'react';
import { Icon } from './icons.jsx';
import { link, phases, projectNames } from './management.js';
import './projectviews.css';

const portfolio = [
  {
    id: 'octaclub', field: 'التعليم التقني', status: 'إصدار مخطّط',
    period: 'ديسمبر 2026 — فبراير 2027',
    description: 'إعادة هندسة MedClub لبناء منصة تجمع الدروس والتقييمات والمساعد التعليمي THINK والتدريب العملي ضمن Tech Path.',
    decision: 'قبول الإصدار الأول', when: '28 فبراير 2027',
    condition: 'اكتمال نطاق P0 ونجاح اختبارات الرحلة المتكاملة والعزل والاستعادة، ثم توثيق قرار الإطلاق.',
    links: [ ['نطاق الإصدار', 8], ['متطلبات THINK', 17], ['معايير القبول', 32] ],
  },
  {
    id: 'octacare', field: 'التقنية الصحية', status: 'مقترح للاعتماد',
    period: 'أبريل — ديسمبر 2027',
    description: 'دراسة عمل العيادات والمراكز الطبية في عمّان لاختيار عملية واحدة وتطويرها مع المؤسسات المشاركة.',
    decision: 'اختيار المنتج الأول', when: 'نهاية يونيو 2027',
    condition: 'توثيق مشكلة متكررة، وتحديد المشتري والمستخدم، واستهداف اتفاقين تجريبيين مكتوبين، والتحقق من قدرة الفريق.',
    links: [ ['اختيار المنتج', 3], ['متطلبات النسخة الأولى', 5], ['شروط قياس النجاح', 10] ],
  },
];

function PortfolioCard({ project }) {
  const { id, field, status, period, description, decision, when, condition, links } = project;
  return <article className={`pv-project pv-${id}`}>
    <header className="pv-cover">
      <div className="pv-cover-copy">
        <span className="pv-field">{field}</span>
        <h2 dir="ltr">{projectNames[id]}</h2>
        <p><Icon name="calendar" size={16}/><span>{id === 'octaclub' ? 'تنفيذ الإصدار' : 'الدراسة والتجربة'} · {period}</span></p>
      </div>
    </header>
    <div className="pv-project-content">
      <div className="pv-status"><i/>{status}</div>
      <p className="pv-description">{description}</p>
      <dl className="pv-owner"><dt>قيادة المشروع</dt><dd>طارق عرابي</dd></dl>
      <div className="pv-decision">
        <div className="pv-decision-head"><h3>{decision}</h3><span>{when}</span></div>
        <p>{condition}</p>
      </div>
      <div className="pv-refs" aria-label="أقسام الوثيقة">{links.map(([title,index])=><a key={title} href={link(id,index)}>{title}</a>)}</div>
      <div className="pv-links">
        <a className="pv-primary" href={link(id)}><Icon name="document" size={17}/>وثيقة المشروع</a>
        <a href={`#/timeline?project=${id}`}><Icon name="calendar" size={17}/>الجدول</a>
        <a href={`#/tasks?project=${id}`}><Icon name="check" size={17}/>المهام</a>
      </div>
    </div>
  </article>;
}

export function Projects() {
  return <div className="pv-view">
    <header className="pv-lead"><h1>محفظة المشاريع</h1><p>نطاق كل مشروع، وموعد القرار الذي يحدد مرحلته التالية.</p></header>
    <div className="pv-portfolio">{portfolio.map(p=><PortfolioCard key={p.id} project={p}/>)}</div>
    <section className="pv-candidates">
      <header><h2>مسارا OctaCare قيد الدراسة</h2><p>تحدد دراسة الربع الثاني جدوى اختيار مسار واحد. يبدأ تطويره في الربع الثالث عند اعتماد قرار يونيو وتأكيد قدرة الفريق.</p></header>
      <div className="pv-paths">
        <div><Icon name="calendar"/><h3><bdi>OctaClinic</bdi></h3><p>إدارة الحجوزات والجلسات المتكررة. يُقاس زمن تثبيت الموعد وعدد التعارضات ودقة متابعة الحضور.</p></div>
        <div><Icon name="layers"/><h3><bdi>OctaOperations</bdi></h3><p>تنسيق الإجراءات بين العيادة والمستشفى. يُقاس زمن تأكيد الطلب وعدد الاتصالات اللازمة لمعرفة حالته.</p></div>
      </div>
    </section>
  </div>;
}

const periods = [
  { id: 'dec', label: 'التحضير', date: 'ديسمبر 2026' },
  { id: 'q1', label: 'الربع الأول', date: 'يناير – مارس' },
  { id: 'q2', label: 'الربع الثاني', date: 'أبريل – يونيو' },
  { id: 'q3', label: 'الربع الثالث', date: 'يوليو – سبتمبر' },
  { id: 'q4', label: 'الربع الرابع', date: 'أكتوبر – ديسمبر' },
];

// Each stage links to its acceptance criteria or the plan section governing delivery.
const stageRefs = {
  'الفحص الفني وقرارات إعادة الهندسة': ['dec','octaclub',5],
  'إعادة هندسة الأساس': ['dec','octaclub',7],
  'التعلم والمحتوى': ['q1','octaclub',12],
  'THINK والتعلم التفاعلي': ['q1','octaclub',17],
  'الجودة والنسخة المرشحة': ['q1','octaclub',27],
  'القبول والإطلاق': ['q1','octaclub',32],
  'الاستقرار وتجهيز التجربة': ['q1','master',5],
  'الدراسة الميدانية': ['q2','octacare',4],
  'اختبار الحل': ['q2','octacare',4],
  'قرار المنتج والاستثمار': ['q2','octacare',3],
  'تطوير النسخة الأولى': ['q3','octacare',5],
  'التشغيل التجريبي': ['q4','octacare',10],
};
const annualStages = [
  { project:'octaclub', period:'q2', date:'أبريل–يونيو 2027', title:'التجربة الطلابية', detail:'تجربة تستهدف 30–50 طالبًا لمدة 4–6 أسابيع بعد تثبيت الجهة المشاركة.', gate:'تقرير عن الاستخدام والجودة والتكلفة والطلب على الاشتراك', reference:link('master',6) },
  { project:'octaclub', period:'q3', date:'يوليو–سبتمبر 2027', title:'اختبار الطلب المدفوع', detail:'تجربة دفع محدودة بعد اجتياز معايير الجودة والاستخدام والتكلفة.', gate:'قرار موثق بشأن التوسع التجاري', reference:link('master',7) },
  { project:'octaclub', period:'q4', date:'أكتوبر–ديسمبر 2027', title:'تحديد اتجاه 2028', detail:'مراجعة أدلة الاستخدام والدفع لتحديد نطاق المنتج في العام التالي.', gate:'قرار بالتوسع أو الاستمرار المحدود أو تغيير الاتجاه', reference:link('master',8) },
];
const schedule = phases.map(phase=>{
  const [period,doc,page] = stageRefs[phase.title];
  return { ...phase, period, reference:link(doc,page) };
}).concat(annualStages);

function scheduleUrl(project, period) {
  const query = new URLSearchParams();
  if (project !== 'all') query.set('project',project);
  if (period !== 'all') query.set('period',period);
  const params = query.toString();
  return '#/timeline' + (params ? '?' + params : '');
}
function Stage({ stage }) {
  return <li className={`pv-stage pv-${stage.project}`}>
    <div className="pv-stage-meta"><span className="pv-stage-date">{stage.date}</span><bdi>{projectNames[stage.project]}</bdi></div>
    <div className="pv-stage-main"><h3><a href={stage.reference}>{stage.title}<Icon name="arrow" size={15}/></a></h3><p>{stage.detail}</p><div className="pv-gate"><Icon name="check" size={16}/><span>{stage.gate}</span></div></div>
  </li>;
}
export function Schedule({ search = '' }) {
  const query = new URLSearchParams(search);
  const project = portfolio.some(p=>p.id===query.get('project')) ? query.get('project') : 'all';
  const period = periods.some(p=>p.id===query.get('period')) ? query.get('period') : 'all';
  const filteredStages = schedule.filter(s=>(project==='all'||s.project===project)&&(period==='all'||s.period===period));
  return <div className="pv-view">
    <header className="pv-lead"><h1>الجدول التنفيذي</h1><p>مراحل التنفيذ من ديسمبر 2026 حتى ديسمبر 2027، مع المخرج المطلوب لكل مرحلة.</p></header>
    <section className="pv-controls" aria-label="تصفية الجدول التنفيذي">
      <div className="pv-periods" aria-label="الفترة الزمنية">{[{id:'all',label:'الفترة كاملة',date:'2026 – 2027'},...periods].map(p=>
        <a key={p.id} href={scheduleUrl(project,p.id)} aria-current={p.id===period?'true':undefined}><strong>{p.label}</strong><span>{p.date}</span></a>
      )}</div>
      <div className="pv-stage-filters"><label>المشروع<select value={project} onChange={e=>{window.location.hash=scheduleUrl(e.target.value,period)}}><option value="all">كل المشاريع</option>{portfolio.map(p=><option key={p.id} value={p.id}>{projectNames[p.id]}</option>)}</select></label><span aria-live="polite">عدد المراحل المعروضة <b>{filteredStages.length}</b></span></div>
    </section>
    {periods.map(p=>{
      const rows=filteredStages.filter(s=>s.period===p.id);
      if (!rows.length) return null;
      return <section className="pv-stage-group" key={p.id}><div className="pv-period-heading"><h2>{p.label}</h2><span>{p.date}{p.id==='dec'?'':' 2027'}</span></div>
        <ol>{rows.map(s=><Stage key={s.title} stage={s}/>)}</ol>
      </section>;
    })}
    {!filteredStages.length&&<div className="pv-no-stage"><h2>لا توجد مراحل ضمن هذه الفترة</h2><a href={scheduleUrl(project,'all')}>عرض جدول المشروع كاملًا</a></div>}
  </div>;
}
