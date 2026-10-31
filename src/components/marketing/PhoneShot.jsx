const PhoneShot = ({ src, alt }) => (
  <div className="aspect-[9/19] w-full max-w-[220px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
    <img src={src} alt={alt} className="h-full w-full object-cover object-top" />
  </div>
);

export default PhoneShot;
