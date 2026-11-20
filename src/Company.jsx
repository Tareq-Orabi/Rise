import React from 'react';
import { plans } from './data.js';
import { Icon } from './icons.jsx';
import { DownloadLink, WorkHeading } from './WorkViews.jsx';

const guide = plans.find(plan => plan.id === 'commercial');
const services = guide.pages[0].blocks.find(block => block.type === 'table').rows;
const serviceIcons = ['screen', 'board', 'layers', 'spark', 'database', 'board', 'screen', 'layers'];

export function Company() {
  return <div className="wv-view">
    <WorkHeading title="الخدمات"><DownloadLink plan={guide}>تحميل دليل الخدمات</DownloadLink></WorkHeading>
    <div className="wv-service-grid">{services.map(([name, purpose, scope], i) => <article key={name} className={`wv-service wv-tone-${i % 4}`}>
      <span className="wv-service-icon"><Icon name={serviceIcons[i]} size={24}/></span>
      <h2>{name}</h2><p>{purpose}</p><div className="wv-service-scope">{scope}</div>
    </article>)}</div>
  </div>;
}
