import Icon from './Icon';

const FinanceExportActions = ({ onExportCsv, onExportPdf, exporting = false, disabled = false, className = '' }) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    <button
      type="button"
      disabled={disabled || exporting}
      onClick={onExportCsv}
      className="inline-flex items-center gap-2 rounded-lg border border-primary-container/40 bg-primary-container/10 px-4 py-2 text-sm font-semibold text-primary-container hover:bg-primary-container/20 disabled:opacity-50"
    >
      <Icon name="download" size={18} />
      {exporting ? 'Exporting…' : 'Export CSV'}
    </button>
    {onExportPdf && (
      <button
        type="button"
        disabled={disabled || exporting}
        onClick={onExportPdf}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/5 disabled:opacity-50"
      >
        <Icon name="picture_as_pdf" size={18} />
        Export PDF
      </button>
    )}
  </div>
);

export default FinanceExportActions;
