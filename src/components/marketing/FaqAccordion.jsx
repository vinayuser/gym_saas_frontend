import { useState } from 'react';
import Icon from '../fitsphere/Icon';

const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`glass-card overflow-hidden rounded-xl ${open ? 'border-primary-container/30' : ''}`}>
      <button
        type="button"
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-on-surface">{question}</span>
        <Icon
          name="expand_more"
          size={22}
          className={`text-secondary transition-transform ${open ? 'rotate-180 text-primary-container' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="px-6 pb-4 text-sm leading-relaxed text-secondary">{answer}</p>
      </div>
    </div>
  );
};

export default FaqItem;
