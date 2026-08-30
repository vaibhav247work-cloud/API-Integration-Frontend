import { useState } from 'react';
import { Link as LinkIcon, Plus, Trash2, ArrowRight, Code } from 'lucide-react';

const MAPPING_TYPES = ['SOURCE_PATH', 'CONSTANT', 'EXPRESSION'];
const PATH_TYPES = ['JSON_PATH', 'XPATH'];

const REFERENCE_SECTIONS = [
  {
    title: 'Source Path',
    items: [
      { label: 'JSON', value: '$.customer.name' },
      { label: 'JSON Number', value: '$.amount' },
      { label: 'XPath', value: "./*[local-name()='RECEIPT_NO']" },
      { label: 'XPath Date', value: "./*[local-name()='TIMESTAMP']" },
    ],
  },
  {
    title: 'Expression',
    items: [
      { label: 'Full Name', value: "value('$.firstName') + ' ' + value('$.lastName')" },
      { label: 'Condition', value: "value('$.status') == 'PAID' ? 'SUCCESS' : 'PENDING'" },
      { label: 'Math', value: "num('$.net') + num('$.tax')" },
      { label: 'Context', value: "ctx('businessDate')" },
    ],
  },
  {
    title: 'Formatter',
    items: [
      { label: 'Uppercase', value: 'UPPERCASE' },
      { label: 'Trim', value: 'TRIM' },
      { label: 'Date', value: 'DATE:yyyy-MM-dd->dd/MM/yyyy' },
      { label: 'DateTime', value: 'DATETIME:yyyy-MM-dd HH:mm:ss->yyyy-MM-dd' },
    ],
  },
];

const normalizeMapping = (mapping = {}, idx = 0) => ({
  ...mapping,
  sortOrder: Number.isInteger(mapping.sortOrder) ? mapping.sortOrder : idx,
  mappingType: mapping.mappingType || 'SOURCE_PATH',
  sourcePath: mapping.sourcePath || '',
  pathType: mapping.pathType || 'JSON_PATH',
  targetHeader: mapping.targetHeader || mapping.targetName || '',
  expression: mapping.expression ?? mapping.constantValue ?? '',
  defaultValue: mapping.defaultValue || '',
  formatter: mapping.formatter || '',
  requiredFlag: mapping.requiredFlag ?? false,
});

export default function MappingsStep({ data, onChange }) {
  const mappings = (data || []).map((mapping, idx) => normalizeMapping(mapping, idx));
  const [openHelperIdx, setOpenHelperIdx] = useState(null);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);

  const getNextSortOrder = () => {
    const maxSortOrder = mappings.reduce(
      (max, mapping) => Math.max(max, Number.isInteger(mapping.sortOrder) ? mapping.sortOrder : -1),
      -1
    );
    return maxSortOrder + 1;
  };

  const commitMappings = (nextMappings) => {
    onChange(nextMappings.map((mapping, idx) => normalizeMapping(mapping, idx)));
  };

  const addMapping = () => {
    commitMappings([
      ...mappings,
      {
        sortOrder: getNextSortOrder(),
        mappingType: 'SOURCE_PATH',
        sourcePath: '',
        pathType: 'JSON_PATH',
        targetHeader: '',
        expression: '',
        defaultValue: '',
        formatter: '',
        requiredFlag: false,
      }
    ]);
  };

  const updateMapping = (idx, field, value) => {
    const nextMappings = [...mappings];
    nextMappings[idx] = { ...nextMappings[idx], [field]: value };
    commitMappings(nextMappings);
  };

  const removeMapping = (idx) => {
    commitMappings(mappings.filter((_, i) => i !== idx));
  };

  const insertSnippet = (idx, snippet) => {
    const currentExpr = mappings[idx].expression || '';
    updateMapping(idx, 'expression', currentExpr + snippet);
    setOpenHelperIdx(null);
  };

  return (
    <div className="h-full min-h-0 animate-fade-in bg-zinc-50 dark:bg-zinc-900">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex-none border-b border-zinc-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#14111c] sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary-500" />
                Field Mappings
              </h3>
              <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
                Map the extracted JSON or XML values from the source response to the final CSV headers.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2 md:w-auto md:min-w-[11rem]">
              <button
                type="button"
                onClick={addMapping}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white shadow-sm transition-all hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" /> Add Field
              </button>
              <button
                type="button"
                onClick={() => setIsReferenceOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 font-medium text-zinc-700 transition-all hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
              >
                Reference
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 hidden-scrollbar">
          {mappings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-12 text-center dark:border-white/10 dark:bg-[#14111c]">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <LinkIcon className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="mb-1 font-medium text-zinc-600 dark:text-zinc-400">No Mappings Configured</p>
              <p className="mx-auto max-w-sm text-sm text-zinc-500">
                You must map at least one field to generate a valid CSV output record.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mappings.map((mapping, idx) => (
                <div key={idx} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#14111c]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                      Mapping #{idx + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMapping(idx)}
                      className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-500">Mapping Type</label>
                      <select
                        value={mapping.mappingType}
                        onChange={e => updateMapping(idx, 'mappingType', e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-[#14111c]"
                      >
                        {MAPPING_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-500">Source / Expression</label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={mapping.mappingType === 'SOURCE_PATH' ? mapping.sourcePath : mapping.expression}
                          onChange={e => updateMapping(
                            idx,
                            mapping.mappingType === 'SOURCE_PATH' ? 'sourcePath' : 'expression',
                            e.target.value
                          )}
                          placeholder={mapping.mappingType === 'CONSTANT' ? 'Enter static value' : mapping.mappingType === 'EXPRESSION' ? 'Enter expression' : 'Enter source path'}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-mono shadow-sm dark:border-white/10 dark:bg-[#14111c]"
                        />
                        {mapping.mappingType === 'EXPRESSION' && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenHelperIdx(openHelperIdx === idx ? null : idx)}
                              className="h-full rounded-lg border border-zinc-200 bg-zinc-100 px-2 text-zinc-500 transition-colors hover:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                            >
                              <Code className="w-4 h-4" />
                            </button>
                            {openHelperIdx === idx && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenHelperIdx(null)}></div>
                                <div className="absolute right-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white text-xs shadow-xl dark:border-white/10 dark:bg-[#14111c]">
                                  <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 font-bold text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">Insert Snippet</div>
                                  <div className="max-h-48 overflow-y-auto py-1 hidden-scrollbar">
                                    <button type="button" onClick={() => insertSnippet(idx, "value('$.path')")} className="block w-full px-3 py-1.5 text-left font-mono text-emerald-600 hover:bg-zinc-50 dark:text-emerald-400 dark:hover:bg-white/5">value('path') <span className="ml-1 block font-sans text-[10px] text-zinc-400">Extract JSON path</span></button>
                                    <button type="button" onClick={() => insertSnippet(idx, "ctx('clientName')")} className="block w-full px-3 py-1.5 text-left font-mono text-purple-600 hover:bg-zinc-50 dark:text-purple-400 dark:hover:bg-white/5">ctx('varName') <span className="ml-1 block font-sans text-[10px] text-zinc-400">Runtime context/variable</span></button>
                                    <button type="button" onClick={() => insertSnippet(idx, "column('Prev_Header')")} className="block w-full px-3 py-1.5 text-left font-mono text-blue-600 hover:bg-zinc-50 dark:text-blue-400 dark:hover:bg-white/5">column('header') <span className="ml-1 block font-sans text-[10px] text-zinc-400">Value of prior column</span></button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-500">Path Type</label>
                      <select
                        value={mapping.pathType}
                        onChange={e => updateMapping(idx, 'pathType', e.target.value)}
                        disabled={mapping.mappingType !== 'SOURCE_PATH'}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm disabled:opacity-50 dark:border-white/10 dark:bg-[#14111c]"
                      >
                        {PATH_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-500">Sort Order</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={mapping.sortOrder}
                        onChange={e => updateMapping(
                          idx,
                          'sortOrder',
                          Number.isNaN(Number(e.target.value)) ? 0 : Math.max(0, Number(e.target.value))
                        )}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-mono shadow-sm dark:border-white/10 dark:bg-[#14111c]"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="inline-flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          checked={!!mapping.requiredFlag}
                          onChange={e => updateMapping(idx, 'requiredFlag', e.target.checked)}
                          className="h-4 w-4 rounded border-zinc-300 text-primary-600 focus:ring-primary-500"
                        />
                        Required field
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <ArrowRight className="w-4 h-4" />
                    <span>Maps to</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-500">Target Header</label>
                      <input
                        type="text"
                        value={mapping.targetHeader}
                        onChange={e => updateMapping(idx, 'targetHeader', e.target.value)}
                        placeholder="User_ID"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-mono shadow-sm dark:border-white/10 dark:bg-[#14111c]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-500">Default Value</label>
                      <input
                        type="text"
                        value={mapping.defaultValue}
                        onChange={e => updateMapping(idx, 'defaultValue', e.target.value)}
                        placeholder="(Null)"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-mono shadow-sm dark:border-white/10 dark:bg-[#14111c]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-500">Formatter</label>
                      <input
                        type="text"
                        value={mapping.formatter}
                        onChange={e => updateMapping(idx, 'formatter', e.target.value)}
                        placeholder="Optional formatter"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-mono shadow-sm dark:border-white/10 dark:bg-[#14111c]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isReferenceOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsReferenceOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#14111c]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-white/10">
              <div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Mapping Reference</h4>
                <p className="text-sm text-zinc-500 mt-1">
                  JSON, XPath, expression, and formatter examples for field mappings.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReferenceOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5 transition-colors"
              >
                <span className="text-lg leading-none">x</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto hidden-scrollbar max-h-[calc(85vh-88px)]">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {REFERENCE_SECTIONS.map((section) => (
                  <div key={section.title} className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                      {section.title}
                    </div>
                    <div className="space-y-3">
                      {section.items.map((item) => (
                        <div key={item.label} className="space-y-1">
                          <div className="text-xs font-medium text-zinc-500">{item.label}</div>
                          <div className="rounded-lg bg-white px-3 py-2 font-mono text-xs text-zinc-700 border border-zinc-200 break-all dark:bg-[#14111c] dark:text-zinc-200 dark:border-white/10">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300">
                <p>
                  <span className="font-semibold">Sort order:</span> if you use <span className="font-mono">column('HEADER')</span> or <span className="font-mono">columnNum('HEADER')</span>, the referenced field must come first.
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Path type:</span> use <span className="font-mono">JSON_PATH</span> for JSON and <span className="font-mono">XPATH</span> for XML source paths.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
