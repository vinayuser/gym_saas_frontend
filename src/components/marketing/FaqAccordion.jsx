import { useState } from 'react';
import Icon from '../fitsphere/Icon';

const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`glass-card overflow-hidden rounded-xl transition-colors ${
        open ? 'border-primary-container/30 bg-white/[0.02]' : 'hover:border-white/20'
      }`}
    >
      <button
        type="button"
        className="flex w-full items-start gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="min-w-0 flex-1 font-semibold leading-snug text-on-surface">{question}</span>
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
            open
              ? 'border-primary-container/40 bg-primary-container/10 text-primary-container'
              : 'border-white/10 bg-white/5 text-secondary'
          }`}
        >
          <Icon
            name="expand_more"
            size={20}
            className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="border-t border-white/5 px-5 pb-5 pt-4 text-sm leading-relaxed text-secondary sm:px-6">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FaqItem;
