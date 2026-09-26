import { useState } from 'react';

export const businessInitials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const BrandMark = ({ logo, name, className = 'h-14 w-14 text-lg' }) => {
  const [failed, setFailed] = useState(false);

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt=""
        onError={() => setFailed(true)}
        className={`${className} shrink-0 rounded-2xl bg-white/5 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} grid shrink-0 place-items-center rounded-2xl bg-[#c3f400]/15 font-bold tracking-wide text-[#c3f400]`}
    >
      {businessInitials(name)}
    </div>
  );
};

export default BrandMark;
