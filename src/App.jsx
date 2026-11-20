import React, { useEffect, useRef, useState } from 'react';
import './fonts.css';
import './app.css';
import { plans } from './data.js';
import { logoUrl } from './assets.js';
import { Icon } from './icons.jsx';
import { PlanReader, PrintDocument } from './Reader.jsx';
import { Company } from './Company.jsx';
import { Documents, TasksView, Team } from './WorkViews.jsx';
import { Projects, Schedule } from './ProjectViews.jsx';
import { Overview } from './Overview.jsx';
import { people, projectNames, sections, normalize, link } from './management.js';
import './shell.css';

const navigation = [
  { id: 'home', title: 'نظرة عامة', icon: 'grid' },
  { id: 'projects', title: 'المشاريع', icon: 'layers' },
  { id: 'timeline', title: 'الجدول التنفيذي', icon: 'calendar' },
  { id: 'tasks', title: 'المهام والمسؤوليات', icon: 'checklist' },
  { id: 'team', title: 'الفريق', icon: 'users' },
  { id: 'documents', title: 'مكتبة الوثائق', icon: 'book' },
  { id: 'company', title: 'الخدمات', icon: 'case' },
];
const labels = Object.fromEntries(navigation.map(item => [item.id, item.title]));
const navHref = id => id === 'home' ? '#/' : id === 'company' ? '#/company/services' : '#/' + id;

function readLocation() {
  const [path, search] = window.location.hash.replace(/^#\/?/, '').split('?');
  const [kind, section, number] = path.split('/');
  if (kind === 'plan') {
    const plan = plans.find(item => item.id === section);
    if (plan) {
      const page = Number(number);
      const index = Number.isSafeInteger(page) ? Math.min(Math.max(page - 1, 0), plan.pages.length - 1) : 0;
      return { kind, plan, index };
    }
  }
  const query = new URLSearchParams(search);
  return { kind: Object.hasOwn(labels, kind) ? kind : 'home', section, project: query.get('project'), person: query.get('person'), search };
}

function Navigation({ active, onNavigate }) {
  return <>
    <a className="desk-brand" href="#/" onClick={onNavigate} aria-label="Octagram، نظرة عامة">
      <img src={logoUrl} alt=""/><span><b lang="en" dir="ltr">Octagram</b><small>مساحة الفريق</small></span>
    </a>
    <nav className="desk-nav" aria-label="التنقّل الرئيسي">
      {navigation.map(({id, title, icon}) => <a key={id} href={navHref(id)} onClick={onNavigate} aria-current={active === id ? 'page' : undefined}>
        <Icon name={icon} size={19}/><span>{title}</span>{active === id && <i aria-hidden="true"/>}
      </a>)}
    </nav>
    <div className="desk-shortcuts">
      <p>وثائق المشاريع</p>
      {['octaclub', 'octacare'].map(id => <a key={id} href={link(id)} onClick={onNavigate}><i className={id} aria-hidden="true"/><bdi>{projectNames[id]}</bdi><Icon name="outward" size={14}/></a>)}
    </div>
    <div className="desk-side-foot"><span>الخطة السنوية</span><b>2027</b></div>
  </>;
}

function SearchDialog({dialogRef}) {
  const [query, setQuery] = useState('');
  const q = normalize(query.trim());
  const pageLinks = navigation.filter(n => normalize(n.title).includes(q));
  const results = q ? sections.map(s => ({ ...s, rank: normalize(s.title + ' ' + s.name).includes(q) ? 2 : s.text.includes(q) ? 1 : 0 }))
    .filter(s => s.rank).sort((a,b) => b.rank - a.rank) : [];
  const shortcuts = q ? pageLinks : navigation.filter(n => ['projects','tasks','timeline','documents'].includes(n.id));
  const close = () => dialogRef.current.close();
  return <dialog className="desk-search" ref={dialogRef} aria-label="البحث في مساحة الفريق" onClose={() => setQuery('')} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div className="desk-search-inner">
      <div className="desk-search-field"><Icon name="search"/><input autoFocus type="search" aria-label="بحث شامل" placeholder="ابحث عن مشروع أو مهمة أو وثيقة…" value={query} onChange={e => setQuery(e.target.value)}/><button className="desk-icon" aria-label="إغلاق البحث" onClick={close}><Icon name="close" size={18}/></button></div>
      <div className="desk-hits">
        <h2>{q ? 'نتائج البحث' : 'انتقال سريع'}</h2>
        {shortcuts.map(n => <a key={n.id} onClick={close} href={navHref(n.id)}><Icon name={n.icon} size={18}/><strong>{n.title}</strong><Icon name="arrow" size={17}/></a>)}
        {results.slice(0,50).map(s => <a key={s.plan + s.index} href={s.href || link(s.plan,s.index)} onClick={close}><Icon name="document" size={18}/><span><small>{s.name} · القسم {s.index+1}</small><strong>{s.title}</strong></span><Icon name="arrow" size={17}/></a>)}
        {q && <p role="status">{results.length + shortcuts.length === 0 ? 'لم نعثر على نتيجة. جرّب اسم المشروع أو المسؤول.' : results.length > 50 ? 'تُعرض أول 50 نتيجة من الوثائق. استخدم كلمة أدق لتضييق البحث.' : (results.length + shortcuts.length) + ' نتيجة'}</p>}
      </div>
    </div>
  </dialog>;
}

function Screen({current}) {
  switch (current.kind) {
    case 'plan': return <PlanReader plan={current.plan} pageIndex={current.index} onSelectPage={i => { window.location.hash = link(current.plan.id,i); }} onPrint={() => window.print()}/>;
    case 'projects': return <Projects/>;
    case 'timeline': return <Schedule search={current.search}/>;
    case 'tasks': return <TasksView key={current.search} initialProject={Object.hasOwn(projectNames,current.project) ? current.project : 'all'} initialPerson={people.some(p => p.id === current.person) ? current.person : 'all'}/>;
    case 'team': return <Team/>;
    case 'documents': return <Documents/>;
    case 'company': return <Company section={current.section}/>;
    default: return <Overview/>;
  }
}

export default function App() {
  const [current, setCurrent] = useState(readLocation);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme);
  const search = useRef(null), menu = useRef(null), main = useRef(null);
  const active = current.kind === 'plan' ? people.some(p => p.id === current.plan.id) ? 'team' : ['octaclub','octacare'].includes(current.plan.id) ? 'projects' : 'documents' : current.kind;
  const title = current.plan?.name || labels[active];
  useEffect(() => {
    function navigate(event) {
      setCurrent(readLocation());
      search.current?.close();
      menu.current?.close();
      const routePath = url => new URL(url).hash.split('?')[0];
      if (routePath(event.oldURL) !== routePath(event.newURL)) {
        window.scrollTo(0,0);
        main.current?.focus({preventScroll:true});
      }
    }
    function shortcuts(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        menu.current?.close();
        if (search.current?.open) search.current.close();
        else search.current?.showModal();
      }
    }
    const wide = window.matchMedia('(min-width: 941px)');
    const closeWideMenu = () => { if (wide.matches) menu.current?.close(); };
    wide.addEventListener('change', closeWideMenu);
    window.addEventListener('hashchange', navigate);
    window.addEventListener('keydown', shortcuts);
    return () => { window.removeEventListener('hashchange', navigate); window.removeEventListener('keydown', shortcuts); wide.removeEventListener('change', closeWideMenu); };
  }, []);
  useEffect(() => { document.title = title + ' | Octagram — خطة النهوض 2027'; }, [title]);
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try { localStorage.setItem('octagram-theme',next); } catch {}
  }
  const themeLabel = theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن';
  return <>
    <div className="admin-app desk-app" dir="rtl">
      <a className="skip" href="#main" onClick={e => { e.preventDefault(); main.current.focus(); }}>انتقل إلى المحتوى</a>
      <aside className="desk-aside"><Navigation active={active}/></aside>
      <dialog className="desk-drawer" aria-label="قائمة التنقّل" ref={menu} onClick={e => { if(e.target === e.currentTarget) menu.current.close(); }}>
        <div><button className="desk-drawer-close" aria-label="إغلاق القائمة" onClick={() => menu.current.close()}><Icon name="close" size={20}/></button><Navigation active={active} onNavigate={() => menu.current.close()}/></div>
      </dialog>
      <div className="desk-workspace">
        <header className="desk-header"><div className="desk-header-inner">
          <button className="desk-icon desk-menu" aria-label="فتح القائمة" aria-haspopup="dialog" onClick={() => menu.current.showModal()}><Icon name="menu"/></button>
          <div className="desk-crumb"><a href="#/">مساحة الفريق</a><Icon name="chevron" size={13}/><strong>{title}</strong></div>
          <div className="desk-tools"><button className="desk-find" aria-haspopup="dialog" aria-label="البحث في مساحة الفريق" onClick={() => search.current.showModal()}><Icon name="search" size={17}/><span>بحث في الخطة</span><kbd dir="ltr">⌘ / Ctrl K</kbd></button>
          <button className="desk-icon" title={themeLabel} aria-label={themeLabel} onClick={toggleTheme}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19}/></button></div>
        </div></header>
        <main className="desk-main" id="main" tabIndex={-1} ref={main}><Screen current={current}/></main>
        <footer className="desk-footer"><span>Octagram · خطة النهوض 2027</span><a href="#/documents">مكتبة الوثائق <Icon name="arrow" size={14}/></a></footer>
      </div>
      <SearchDialog dialogRef={search}/>
    </div>
    <div className="oa-print-only"><PrintDocument plan={current.plan || plans[0]}/></div>
  </>;
}
