import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Save, Play, Settings2, ArrowLeft, Terminal, LayoutTemplate, Link as LinkIcon, Lock, ListOrdered, FileJson, Layers, Database, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { cn, extractError } from '../lib/utils';
import integrationPromptTemplate from '../lib/integrationPromptTemplate';
import BasicsStep from '../components/integration-builder/BasicsStep';
import ScheduleStep from '../components/integration-builder/ScheduleStep';
import AuthStep from '../components/integration-builder/AuthStep';
import StepsBuilder from '../components/integration-builder/StepsBuilder';
import ResponseStep from '../components/integration-builder/ResponseStep';
import PaginationStep from '../components/integration-builder/PaginationStep';
import StorageStep from '../components/integration-builder/StorageStep';
import MappingsStep from '../components/integration-builder/MappingsStep';
import PayloadPreview from '../components/integration-builder/PayloadPreview';
import TemplatePicker from '../components/integration-builder/TemplatePicker';
import { MoreVertical, Download, Upload, Copy } from 'lucide-react';

const TABS = [
  { id: 'basics', label: 'Basics', icon: Settings2 },
  { id: 'schedule', label: 'Schedule', icon: Clock },
  { id: 'auth', label: 'Authentication', icon: Lock },
  { id: 'steps', label: 'Fetch Steps', icon: ListOrdered },
  { id: 'response', label: 'Response', icon: FileJson },
  { id: 'pagination', label: 'Pagination', icon: Layers },
  { id: 'storage', label: 'Storage', icon: Database },
  { id: 'mappings', label: 'Field Mappings', icon: LinkIcon },
];

const normalizeAuthState = (rawAuth) => {
  if (!rawAuth || typeof rawAuth !== 'object') {
    return { type: 'NONE', config: {} };
  }

  const { type = 'NONE', config, ...flatConfig } = rawAuth;
  return {
    type,
    config: config && typeof config === 'object'
      ? { ...flatConfig, ...config }
      : flatConfig,
  };
};

const normalizeStorageState = (rawStorage) => {
  if (!rawStorage || typeof rawStorage !== 'object') {
    return { type: 'LOCAL', config: {} };
  }

  const { type = 'LOCAL', config, ...flatConfig } = rawStorage;
  return {
    type,
    config: config && typeof config === 'object'
      ? { ...flatConfig, ...config }
      : flatConfig,
  };
};

export default function IntegrationBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basics');
  const [templatePicked, setTemplatePicked] = useState(isEditing);
  const [advancedMenuOpen, setAdvancedMenuOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  // The global builder state recommended by the guide
  const [builderState, setBuilderState] = useState({
    basics: {
      id: null,
      clientName: "",
      brandCode: "",
      baseUrl: "",
      enabled: true,
      csvFileName: "",
      outputDirectory: "",
      maxRetries: 2,
    },
    schedule: {
      schedulerMode: "QUEUE",
      useLegacyCron: false,
      legacyCron: "",
      items: [],
    },
    auth: {
      type: "NONE",
      config: {},
    },
    steps: [],
    response: {
      recordPath: "",
      recordPathType: "JSON_PATH",
      filterByWindow: false,
      recordDatePath: "",
      recordDatePathType: "JSON_PATH",
      recordDateFormat: "",
      duplicateHandling: {
        enabled: false,
        keyHeaders: [],
        defaultAction: "KEEP_FIRST",
        fieldActions: {},
      },
    },
    pagination: {
      enabled: false,
      mode: "PAGE_NUMBER",
      startPage: 1,
      pageParam: "page",
      sizeParam: "",
      pageSize: null,
      totalPagesPath: "",
      totalPagesPathType: "JSON_PATH",
      nextPagePath: "",
      nextPagePathType: "JSON_PATH",
    },
    storage: {
      type: "LOCAL",
      config: {},
    },
    mappings: [],
    advanced: {
      rawJsonOverride: false,
      rawJson: "",
    },
  });

  const handleTemplateSelect = (templateId) => {
    setTemplatePicked(true);
    if (templateId === 'blank') return;
    
    let newState = { ...builderState };
    if (templateId === 'simple-range') {
      newState.steps = [{
        orderIndex: 0, name: 'Fetch Data', enabled: true, method: 'GET', url: '/v1/data?start=${windowStartDate}&end=${windowEndDateExclusive}',
        requestFormat: 'JSON', responseFormat: 'JSON', requestWindowMode: 'DATE_RANGE', paginate: false, dataStep: true, headers: [], queryParams: [], bodyTemplate: '', responseVariables: {}, responseVariablePathType: 'JSON_PATH'
      }];
    } else if (templateId === 'single-date') {
      newState.steps = [{
        orderIndex: 0, name: 'Fetch Daily Data', enabled: true, method: 'GET', url: '/v1/data?date=${requestDateIso}',
        requestFormat: 'JSON', responseFormat: 'JSON', requestWindowMode: 'SINGLE_DATE', requestDateVariable: 'requestDateIso', requestDateFormat: 'yyyy-MM-dd', paginate: false, dataStep: true, headers: [], queryParams: [], bodyTemplate: '', responseVariables: {}, responseVariablePathType: 'JSON_PATH'
      }];
      newState.schedule.items = [{ type: 'DAILY', enabled: true }];
    } else if (templateId === 'session-auth') {
      newState.auth = {
        type: 'TOKEN_API',
        config: { method: 'POST', tokenUrl: '/v1/auth/login', tokenPath: '$.session_token', tokenPathType: 'JSON_PATH', tokenHeaderName: 'Authorization', tokenPrefix: 'Bearer ', bodyTemplate: '{"username":"${username}","password":"${password}"}' }
      };
      newState.steps = [{
        orderIndex: 0, name: 'Fetch Secured Data', enabled: true, method: 'GET', url: '/v1/secure-data',
        requestFormat: 'JSON', responseFormat: 'JSON', requestWindowMode: 'NONE', paginate: false, dataStep: true, headers: [], queryParams: [], bodyTemplate: '', responseVariables: {}, responseVariablePathType: 'JSON_PATH'
      }];
    }
    setBuilderState(newState);
  };

  useEffect(() => {
    if (isEditing) {
      loadIntegration();
    }
  }, [id]);

  const loadIntegration = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/integrations/${id}`);
      
      const parsedSchedule = typeof data.scheduleConfig === 'string' ? JSON.parse(data.scheduleConfig) : (data.scheduleConfig || []);
      const rawAuth = typeof data.authConfig === 'string' ? JSON.parse(data.authConfig) : (data.authConfig || {});
      const parsedAuth = normalizeAuthState(rawAuth);
      const parsedResponse = typeof data.responseConfig === 'string' ? JSON.parse(data.responseConfig) : (data.responseConfig || {});
      const parsedPagination = typeof data.paginationConfig === 'string' ? JSON.parse(data.paginationConfig) : (data.paginationConfig || {});
      const rawStorage = typeof data.storageConfig === 'string' ? JSON.parse(data.storageConfig) : (data.storageConfig || {});
      const parsedStorage = normalizeStorageState(rawStorage);
      const parsedSteps = typeof data.stepConfig === 'string' ? JSON.parse(data.stepConfig) : (data.stepConfig || []);

      setBuilderState({
        basics: {
          id: data.id,
          clientName: data.clientName || "",
          brandCode: data.brandCode || "",
          baseUrl: data.baseUrl || "",
          enabled: data.enabled ?? true,
          csvFileName: data.csvFileName || "",
          outputDirectory: data.outputDirectory || "",
          maxRetries: data.maxRetries ?? 2,
        },
        schedule: {
          schedulerMode: data.schedulerMode || "QUEUE",
          useLegacyCron: !!data.scheduleCron,
          legacyCron: data.scheduleCron || "",
          items: Array.isArray(parsedSchedule) ? parsedSchedule : [],
        },
        auth: parsedAuth,
        steps: Array.isArray(parsedSteps) ? parsedSteps : [],
        response: {
          recordPath: parsedResponse.recordPath || "",
          recordPathType: parsedResponse.recordPathType || "JSON_PATH",
          filterByWindow: !!parsedResponse.filterByWindow,
          recordDatePath: parsedResponse.recordDatePath || "",
          recordDatePathType: parsedResponse.recordDatePathType || "JSON_PATH",
          recordDateFormat: parsedResponse.recordDateFormat || "",
          duplicateHandling: parsedResponse.duplicateHandling || {
            enabled: false,
            keyHeaders: [],
            defaultAction: "KEEP_FIRST",
            fieldActions: {},
          },
        },
        pagination: {
          enabled: !!parsedPagination.enabled,
          mode: parsedPagination.mode || "PAGE_NUMBER",
          startPage: parsedPagination.startPage || 1,
          pageParam: parsedPagination.pageParam || "page",
          sizeParam: parsedPagination.sizeParam || "",
          pageSize: parsedPagination.pageSize || null,
          totalPagesPath: parsedPagination.totalPagesPath || "",
          totalPagesPathType: parsedPagination.totalPagesPathType || "JSON_PATH",
          nextPagePath: parsedPagination.nextPagePath || "",
          nextPagePathType: parsedPagination.nextPagePathType || "JSON_PATH",
        },
        storage: parsedStorage,
        mappings: data.fieldMappings || [],
        advanced: {
          rawJsonOverride: false,
          rawJson: "",
        },
      });

      toast.success('Loaded integration data');
    } catch (error) {
      toast.error('Failed to load integration: ' + extractError(error));
      navigate('/integrations');
    } finally {
      setLoading(false);
    }
  };

  const generatePayload = () => {
    // Basic mapping for preview and submission
    const st = builderState;
    const authState = st.auth || { type: 'NONE', config: {} };
    const { config: nestedAuthConfig, ...flatAuthConfig } = authState;
    const authConfig = nestedAuthConfig && typeof nestedAuthConfig === 'object'
      ? { ...flatAuthConfig, ...nestedAuthConfig }
      : flatAuthConfig;
    const storageState = st.storage || { type: 'LOCAL', config: {} };
    const { config: nestedStorageConfig, ...flatStorageConfig } = storageState;
    const storageConfig = nestedStorageConfig && typeof nestedStorageConfig === 'object'
      ? { ...flatStorageConfig, ...nestedStorageConfig }
      : flatStorageConfig;

    return {
      clientName: st.basics.clientName,
      brandCode: st.basics.brandCode,
      baseUrl: st.basics.baseUrl,
      enabled: st.basics.enabled,
      schedulerMode: st.schedule.schedulerMode,
      scheduleCron: st.schedule.useLegacyCron ? st.schedule.legacyCron : null,
      scheduleConfig: st.schedule.items,
      csvFileName: st.basics.csvFileName,
      outputDirectory: st.basics.outputDirectory,
      maxRetries: Number(st.basics.maxRetries ?? 0),
      // The backend expects auth fields next to `type`, not under `config`.
        authConfig,
        responseConfig: st.response,
        paginationConfig: st.pagination,
      storageConfig,
        stepConfig: st.steps,
        fieldMappings: st.mappings,
    };
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = generatePayload();
      let res;
      if (isEditing) {
        res = await api.put(`/integrations/${id}`, payload);
        toast.success('Integration updated successfully!');
      } else {
        res = await api.post('/integrations', payload);
        toast.success('Integration created successfully!');
        navigate(`/integrations/${res.id}/edit`, { replace: true });
      }
    } catch (error) {
      toast.error('Failed to save integration: ' + extractError(error));
    } finally {
      setSaving(false);
    }
  };

  const loadFromRawJson = (rawJsonString) => {
    try {
      const data = JSON.parse(rawJsonString);
      const parsedSchedule = Array.isArray(data.scheduleConfig) ? data.scheduleConfig : (typeof data.scheduleConfig === 'string' ? JSON.parse(data.scheduleConfig) : []);
      const rawAuth = data.authConfig && typeof data.authConfig === 'object' ? data.authConfig : (typeof data.authConfig === 'string' ? JSON.parse(data.authConfig) : { type: 'NONE' });
      const parsedAuth = normalizeAuthState(rawAuth);
      const parsedResponse = data.responseConfig && typeof data.responseConfig === 'object' ? data.responseConfig : (typeof data.responseConfig === 'string' ? JSON.parse(data.responseConfig) : {});
      const parsedPagination = data.paginationConfig && typeof data.paginationConfig === 'object' ? data.paginationConfig : (typeof data.paginationConfig === 'string' ? JSON.parse(data.paginationConfig) : {});
      const rawStorage = data.storageConfig && typeof data.storageConfig === 'object' ? data.storageConfig : (typeof data.storageConfig === 'string' ? JSON.parse(data.storageConfig) : { type: 'LOCAL' });
      const parsedStorage = normalizeStorageState(rawStorage);
      const parsedSteps = Array.isArray(data.stepConfig) ? data.stepConfig : (typeof data.stepConfig === 'string' ? JSON.parse(data.stepConfig) : []);

      setBuilderState({
        basics: {
          id: data.id || null, clientName: data.clientName || "", brandCode: data.brandCode || "", baseUrl: data.baseUrl || "", enabled: data.enabled ?? true, csvFileName: data.csvFileName || "", outputDirectory: data.outputDirectory || "", maxRetries: data.maxRetries ?? 2,
        },
        schedule: { schedulerMode: data.schedulerMode || "QUEUE", useLegacyCron: !!data.scheduleCron, legacyCron: data.scheduleCron || "", items: parsedSchedule },
        auth: parsedAuth,
        steps: parsedSteps,
        response: {
          recordPath: parsedResponse.recordPath || "", recordPathType: parsedResponse.recordPathType || "JSON_PATH", filterByWindow: !!parsedResponse.filterByWindow, recordDatePath: parsedResponse.recordDatePath || "", recordDatePathType: parsedResponse.recordDatePathType || "JSON_PATH", recordDateFormat: parsedResponse.recordDateFormat || "", duplicateHandling: parsedResponse.duplicateHandling || { enabled: false, keyHeaders: [], defaultAction: "KEEP_FIRST", fieldActions: {} },
        },
        pagination: {
          enabled: !!parsedPagination.enabled, mode: parsedPagination.mode || "PAGE_NUMBER", startPage: parsedPagination.startPage || 1, pageParam: parsedPagination.pageParam || "page", sizeParam: parsedPagination.sizeParam || "", pageSize: parsedPagination.pageSize || null, totalPagesPath: parsedPagination.totalPagesPath || "", totalPagesPathType: parsedPagination.totalPagesPathType || "JSON_PATH", nextPagePath: parsedPagination.nextPagePath || "", nextPagePathType: parsedPagination.nextPagePathType || "JSON_PATH",
        },
        storage: parsedStorage,
        mappings: data.fieldMappings || [],
        advanced: { rawJsonOverride: false, rawJson: "" },
      });
      setTemplatePicked(true);
      return true;
    } catch (error) {
      toast.error('Invalid JSON format');
      return false;
    }
  };

  const handleImportSubmit = () => {
    if (loadFromRawJson(importJsonText)) {
      setImportModalOpen(false);
      setImportJsonText('');
      toast.success('Successfully imported payload');
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(integrationPromptTemplate);
      toast.success('Integration prompt copied');
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!templatePicked && !isEditing) {
    return <TemplatePicker onSelect={handleTemplateSelect} />;
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] max-h-full flex-col -mt-2 -mb-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Header */}
      <div className="z-10 flex-none border-b border-zinc-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#14111c] sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <button 
            onClick={() => navigate('/integrations')}
            className="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
             <h1 className="flex flex-col gap-1 text-lg font-bold text-zinc-900 dark:text-white sm:flex-row sm:items-center sm:gap-2 sm:text-xl">
               {isEditing ? 'Edit Integration' : 'New Integration'}
               {builderState.basics.clientName && (
                 <span className="text-zinc-400 font-normal px-2">— {builderState.basics.clientName}</span>
               )}
             </h1>
          </div>
          </div>
          <div className="relative flex w-full items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
            <div className="relative shrink-0">
            <button 
              onClick={() => setAdvancedMenuOpen(!advancedMenuOpen)}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {advancedMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAdvancedMenuOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden text-sm animate-in fade-in slide-in-from-top-2">
                  <div className="py-1">
                    <button onClick={() => { setImportModalOpen(true); setAdvancedMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <Download className="w-4 h-4 text-zinc-400" /> Import JSON
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(generatePayload(), null, 2)); toast.success('Copied JSON payload'); setAdvancedMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <Upload className="w-4 h-4 text-zinc-400" /> Export JSON
                    </button>
                    {isEditing && (
                      <button onClick={() => { 
                        const p = generatePayload(); 
                        p.clientName = p.clientName + ' (Clone)';
                        loadFromRawJson(JSON.stringify(p)); 
                        setBuilderState(prev => ({ ...prev, basics: { ...prev.basics, id: null } })); 
                        navigate('/integrations/new'); 
                        setAdvancedMenuOpen(false); 
                        toast.success('Cloned successfully. Remember to save.'); 
                      }} className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <Copy className="w-4 h-4 text-zinc-400" /> Clone
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
            </div>
            {!isEditing && (
              <button
                onClick={handleCopyPrompt}
                className="flex min-w-0 shrink-0 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-100 dark:border-white/10 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-white/5"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy Prompt</span>
                <span className="sm:hidden">Prompt</span>
              </button>
            )}
            <button
            onClick={handleSave}
            disabled={saving}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-50 sm:w-auto sm:flex-none"
          >
            {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <span className="sm:hidden">Save</span>
                <span className="hidden sm:inline">Save Changes</span>
              </>
            )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-zinc-50 dark:bg-zinc-900">
        
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex-none bg-white dark:bg-[#14111c] border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-white/10 overflow-x-auto lg:overflow-y-auto hidden-scrollbar">
          <div className="flex lg:flex-col p-2 lg:p-4 gap-1 min-w-max lg:min-w-0">
            {TABS.map((tab) => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={cn(
                     "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                     isActive 
                       ? "bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400" 
                       : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200"
                   )}
                 >
                   <Icon className={cn("w-4 h-4", isActive ? "text-primary-600 dark:text-primary-400" : "text-zinc-400")} />
                   {tab.label}
                 </button>
               );
            })}
          </div>
        </div>

        {/* Builder Area */}
        <div
          className={cn(
            "flex-1 min-h-0",
            activeTab === 'mappings'
              ? "overflow-hidden"
              : "overflow-y-auto hidden-scrollbar p-4 sm:p-6 lg:p-8"
          )}
        >
           <div className={cn(
             "space-y-8",
             activeTab === 'mappings' ? "h-full min-h-0 w-full" : "max-w-4xl mx-auto"
           )}>
             {activeTab === 'basics' && (
               <div className="bg-white dark:bg-[#14111c] rounded-2xl border border-zinc-200 dark:border-white/10 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Basic Configuration</h2>
                  <BasicsStep data={builderState.basics} onChange={(d) => setBuilderState({...builderState, basics: d})} />
               </div>
             )}
             
             {activeTab === 'schedule' && (
               <div className="bg-white dark:bg-[#14111c] rounded-2xl border border-zinc-200 dark:border-white/10 p-6 shadow-sm">
                 <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Execution Schedule</h2>
                 <ScheduleStep data={builderState.schedule} onChange={(d) => setBuilderState({...builderState, schedule: d})} />
               </div>
             )}

             {activeTab === 'auth' && (
               <div className="bg-white dark:bg-[#14111c] rounded-2xl border border-zinc-200 dark:border-white/10 p-6 shadow-sm">
                 <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Authentication Strategy</h2>
                 <AuthStep data={builderState.auth} onChange={(d) => setBuilderState({...builderState, auth: d})} />
               </div>
             )}

             {activeTab === 'steps' && (
               <div className="bg-white dark:bg-[#14111c] rounded-2xl border border-zinc-200 dark:border-white/10 p-6 shadow-sm">
                 <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">HTTP Fetch Steps</h2>
                 <StepsBuilder data={builderState.steps} onChange={(d) => setBuilderState({...builderState, steps: d})} />
               </div>
             )}

             {activeTab === 'response' && (
               <div className="space-y-6">
                 <h2 className="text-lg font-bold text-zinc-900 dark:text-white px-2">Response Extraction</h2>
                 <ResponseStep data={builderState.response} onChange={(d) => setBuilderState({...builderState, response: d})} />
               </div>
             )}

             {activeTab === 'pagination' && (
               <div className="bg-white dark:bg-[#14111c] rounded-2xl border border-zinc-200 dark:border-white/10 p-6 shadow-sm">
                 <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Pagination Details</h2>
                 <PaginationStep data={builderState.pagination} onChange={(d) => setBuilderState({...builderState, pagination: d})} />
               </div>
             )}

             {activeTab === 'storage' && (
               <div className="bg-white dark:bg-[#14111c] rounded-2xl border border-zinc-200 dark:border-white/10 p-6 shadow-sm">
                 <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Storage Destination</h2>
                 <StorageStep data={builderState.storage} onChange={(d) => setBuilderState({...builderState, storage: d})} />
               </div>
             )}

             {activeTab === 'mappings' && (
               <div className="h-full min-h-0">
                 <MappingsStep data={builderState.mappings} onChange={(d) => setBuilderState({...builderState, mappings: d})} />
               </div>
             )}
           </div>
        </div>

        {/* Live Preview Panel (Right Side) */}
        <div className="hidden xl:flex w-96 flex-col border-l border-zinc-200 dark:border-white/10 bg-zinc-950">
           <div className="p-4 border-b border-white/10 flex items-center justify-between">
             <h3 className="font-medium flex items-center gap-2 text-zinc-300 text-sm">
               <Terminal className="w-4 h-4 text-primary-500" />
               Live Payload
             </h3>
           </div>
           <div className="flex-1 p-4 overflow-hidden">
             <PayloadPreview payload={generatePayload()} />
           </div>
        </div>

      </div>

      {importModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14111c] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-zinc-200 dark:border-white/10 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-lg dark:text-white">Import Raw JSON Payload</h3>
              <button onClick={() => setImportModalOpen(false)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white">✕</button>
            </div>
            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              <p className="text-sm text-zinc-500 mb-2">Paste a valid IntegrationDefinition JSON object below to hydate the builder state instantly.</p>
              <textarea 
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                className="w-full flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 font-mono text-xs dark:text-emerald-400 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[300px] custom-scrollbar"
                placeholder='{"clientName": "Test", "stepConfig": [], ...}'
              />
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-white/10 flex justify-end gap-2">
              <button onClick={() => setImportModalOpen(false)} className="px-4 py-2 text-zinc-600 dark:text-zinc-400">Cancel</button>
              <button onClick={handleImportSubmit} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">Import Payload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
