import React, { useState } from 'react';

const ReactMarkdown = (window as any).ReactMarkdown;
const remarkGfm = (window as any).remarkGfm;

interface Tab {
  label: string;
  content: string;
}

interface TabsProps {
  tabs: Tab[];
}

export const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(index)}
              className={`${
                activeTab === index
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-brand-text-secondary hover:text-brand-text hover:border-gray-500'
              } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 rounded-t-md`}
              aria-current={activeTab === index ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {tabs.map((tab, index) => (
          <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
            <article className="prose prose-invert prose-headings:text-brand-secondary prose-strong:text-brand-primary max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{tab.content}</ReactMarkdown>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
};
