import React, { useState } from 'react';
import { plans } from './data.js';
import { Icon } from './icons.jsx';
import { link, normalize, people, projectNames, tasks } from './management.js';
import './workviews.css';

const periods = [...new Set(tasks.map(task => task.section))];
const projectIds = Object.keys(projectNames);
const personIcons = ['board', 'screen', 'database', 'spark'];
const documentGroups = [
  { title: 'وثائق الشركة', ids: ['master', 'commercial'] },
  { title: 'وثائق المشاريع', ids: ['octaclub', 'octacare'] },
  { title: 'خطط الفريق', ids: people.map(person => person.id) },
];

function ToolIcon({ name }) {
  const paths = {
    search: <><circle cx="10.7" cy="10.7" r="6.4"/><path d="m16 16 4.6 4.6"/></>,
    download: <><path d="M12 3.5v11m-4-4 4 4 4-4M4 15v4.5h16V15"/></>,
  };
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function WorkHeading({ title, children }) {
  return <header className="wv-heading"><h1>{title}</h1>{children}</header>;
}

export function DownloadLink({ plan, children }) {
  return <a className="wv-action wv-download" download={`Octagram-2027-${plan.id}.pdf`} href={plan.pdfUrl} aria-label={`تحميل ${plan.name} بصيغة PDF`}><ToolIcon name="download"/>{children || 'PDF'}</a>;
}

function TaskRow({ task }) {
  return <details className="wv-task">
    <summary>
      <span className="wv-task-copy">
        <span className={`wv-project-name is-${task.project}`}>{projectNames[task.project]}</span>
        <strong className="wv-task-name">{task.title}</strong>
        <span className="wv-task-output">{task.deliverable}</span>
      </span>
      <span className="wv-task-context"><strong>{task.owner}</strong>{task.deadline && <span><Icon name="calendar" size={15}/>{task.deadline}</span>}</span>
      <span className="wv-disclosure" aria-hidden="true"/>
    </summary>
    <div className="wv-task-detail">
      <section><h3>معايير القبول</h3><ul>{task.acceptance.map((criterion, index) => <li key={index}>{criterion}</li>)}</ul></section>
      {task.dependencies?.length > 0 && <section><h3>الاعتماديات</h3><ul>{task.dependencies.map((dependency, index) => <li key={index}>{dependency}</li>)}</ul></section>}
      <a className="wv-inline-link" href={link(task.person, task.page)}><Icon name="book" size={17}/>قراءة القسم في خطة المسؤول</a>
    </div>
  </details>;
}

const searchIndex = new Map(tasks.map(task => [task.id, normalize([
  task.title, task.deliverable, task.owner, projectNames[task.project], task.section,
  task.deadline || '', ...task.acceptance, ...(task.dependencies || []),
].join(' '))]));

function initialOwner(initialPerson) {
  const supplied = initialPerson || (typeof window !== 'undefined' && new URLSearchParams(window.location.hash.split('?')[1]).get('person'));
  return people.some(person => person.id === supplied) ? supplied : 'all';
}

export function TasksView({ initialProject = 'all', initialPerson }) {
  const [project, setProject] = useState(projectIds.includes(initialProject) ? initialProject : 'all');
  const [owner, setOwner] = useState(() => initialOwner(initialPerson));
  const [period, setPeriod] = useState('all');
  const [query, setQuery] = useState('');
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  const filtered = tasks.filter(task =>
    (project === 'all' || project === task.project) &&
    (owner === 'all' || owner === task.person) &&
    (period === 'all' || period === task.section) &&
    words.every(word => searchIndex.get(task.id).includes(word))
  );
  const hasFilters = project !== 'all' || owner !== 'all' || period !== 'all' || Boolean(query);
  function resetFilters() {
    setProject('all'); setOwner('all'); setPeriod('all'); setQuery('');
  }
  return <div className="wv-view wv-tasks-view">
    <WorkHeading title="المهام والمسؤوليات"/>
    <section className="wv-filter-panel" aria-label="تصفية المهام">
      <div className="wv-project-filter" role="group" aria-label="المشروع">
        {['all', ...projectIds].map(id => <button key={id} type="button" className={project === id ? 'is-selected' : ''} aria-pressed={project === id} onClick={() => setProject(id)}>{id === 'all' ? 'كل المشاريع' : projectNames[id]}</button>)}
      </div>
      <div className="wv-controls">
        <label className="wv-query">البحث في المهام<span><ToolIcon name="search"/><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="اسم المهمة أو المخرج أو معيار القبول"/></span></label>
        <label>المسؤول<select value={owner} onChange={event => setOwner(event.target.value)}><option value="all">كل المسؤولين</option>{people.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
        <label>الفترة<select value={period} onChange={event => setPeriod(event.target.value)}><option value="all">كل الفترات</option>{periods.map(section => <option key={section}>{section}</option>)}</select></label>
      </div>
    </section>
    <div className="wv-results"><span role="status" aria-live="polite">عدد المهام <strong>{filtered.length}</strong></span>{hasFilters && <button type="button" onClick={resetFilters}>مسح التصفية</button>}</div>
    {periods.map(section => {
      const rows = filtered.filter(task => task.section === section);
      return rows.length > 0 && <section key={section} className="wv-group">
        <header className="wv-group-head"><Icon name="calendar" size={19}/><h2>{section}</h2><span aria-label="عدد المهام">{rows.length}</span></header>
        <div className="wv-task-list">{rows.map(task => <TaskRow task={task} key={task.id}/>)}</div>
      </section>;
    })}
    {!filtered.length && <p className="wv-empty">لا توجد مهام تطابق خيارات البحث والتصفية.</p>}
  </div>;
}

function TeamCard({ person, index }) {
  const mine = tasks.filter(task => task.person === person.id);
  const distribution = projectIds.map(id => ({ id, count: mine.filter(task => task.project === id).length }));
  return <article className={`wv-person wv-tone-${index}`}>
    <header className="wv-person-head"><span className="wv-person-icon"><Icon name={personIcons[index]} size={28}/></span><div><h2>{person.name}</h2><span className="wv-role" dir="ltr">{person.role}</span></div></header>
    <p>{person.summary}</p>
    <div className="wv-assignment"><strong>{mine.length}</strong><span>مهمة مسندة</span><span className="wv-section-total">أقسام الخطة <b>{person.pages.length}</b></span></div>
    <div className="wv-distribution" aria-hidden="true">{distribution.filter(item => item.count).map(item => <i className={`is-${item.id}`} style={{ flexGrow: item.count }} key={item.id}/>)}</div>
    <ul className="wv-key" aria-label="توزيع المهام حسب المشروع">{distribution.filter(item => item.count).map(item => <li key={item.id} className={`is-${item.id}`}>{projectNames[item.id]} <b>{item.count}</b></li>)}</ul>
    <footer><a className="wv-action" href={link(person.id)}><Icon name="book" size={17}/>قراءة الخطة</a><a className="wv-inline-link" href={`#/tasks?person=${person.id}`}>عرض المهام</a></footer>
  </article>;
}

export function Team() {
  return <div className="wv-view"><WorkHeading title="الفريق والمسؤوليات"/><div className="wv-team-grid">{people.map((person, i) => <TeamCard person={person} key={person.id} index={i}/>)}</div></div>;
}

function DocumentRow({ plan, group }) {
  const url = plan.id === 'commercial' ? '#/company/services' : link(plan.id);
  const icon = group === 2 ? 'document' : group === 1 ? 'layers' : 'book';
  return <article className={`wv-document wv-shelf-${group}`}>
    <span className="wv-book-cover" aria-hidden="true"><Icon name={icon} size={25}/></span>
    <div className="wv-document-copy"><h3><a href={url}>{plan.title}</a></h3><span>{plan.pages.length === 1 ? 'قسم واحد' : `عدد الأقسام ${plan.pages.length}`}</span></div>
    <div className="wv-document-actions"><a className="wv-action" href={url} aria-label={`قراءة ${plan.name}`}><Icon name="book" size={17}/>قراءة</a><DownloadLink plan={plan}/></div>
  </article>;
}

export function Documents() {
  return <div className="wv-view"><WorkHeading title="مكتبة الوثائق"/>{documentGroups.map((group, index) => <section key={group.title} className="wv-group"><header className="wv-group-head"><h2>{group.title}</h2><span aria-label="عدد الوثائق">{group.ids.length}</span></header><div className="wv-document-list">{group.ids.map(id => <DocumentRow key={id} plan={plans.find(plan => plan.id === id)} group={index}/>)}</div></section>)}</div>;
}
