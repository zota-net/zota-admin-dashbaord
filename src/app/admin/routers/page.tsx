'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Play,
  Loader2,
  Wifi,
  WifiOff,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Copy,
  Server,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { routersService } from '@/lib/api/services/mikrotik';
import type { Router } from '@/lib/api/types';

interface ExecutionEntry {
  id: string;
  routerName: string;
  routerId: string;
  script: string;
  output?: string;
  error?: string;
  success: boolean;
  executedAt: number;
}

const SCRIPT_TEMPLATES = [
  {
    name: 'Print system identity',
    script: ':put [/system identity get name]',
  },
  {
    name: 'List hotspot users',
    script: '/ip hotspot user print',
  },
  {
    name: 'Print uptime',
    script: ':put [/system resource get uptime]',
  },
  {
    name: 'List IP addresses',
    script: '/ip address print',
  },
  {
    name: 'Print CPU load',
    script: ':put [/system resource get cpu-load]',
  },
  {
    name: 'Flush DNS cache',
    script: '/ip dns cache flush',
  },
];

type RouterWithClient = Router;

export default function RouterExecutePage() {
  const [routers, setRouters] = useState<RouterWithClient[]>([]);
  const [selectedRouter, setSelectedRouter] = useState<RouterWithClient | null>(null);
  const [script, setScript] = useState('');
  const [scriptName, setScriptName] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoadingRouters, setIsLoadingRouters] = useState(true);
  const [history, setHistory] = useState<ExecutionEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const outputRef = useRef<HTMLDivElement>(null);

  const fetchRouters = useCallback(async () => {
    setIsLoadingRouters(true);
    try {
      const all = await routersService.getAll();
      setRouters((all ?? []).map((r) => ({ ...r })));
    } catch {
      toast.error('Failed to load routers');
    } finally {
      setIsLoadingRouters(false);
    }
  }, []);

  useEffect(() => {
    fetchRouters();
  }, [fetchRouters]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const handleExecute = async () => {
    if (!selectedRouter) {
      toast.error('Select a router first');
      return;
    }
    if (!script.trim()) {
      toast.error('Enter a script to execute');
      return;
    }

    setIsExecuting(true);
    const entry: ExecutionEntry = {
      id: Date.now().toString(),
      routerName: selectedRouter.name,
      routerId: selectedRouter.id,
      script: script.trim(),
      success: false,
      executedAt: Date.now(),
    };

    try {
      const result = await routersService.runScript(
        selectedRouter.id,
        script.trim(),
        scriptName.trim() || undefined
      );

      entry.success = result?.data?.success ?? true;
      entry.output = result?.data?.output ?? 'Script executed successfully (no output)';
      toast.success('Script executed');
    } catch (err: any) {
      entry.success = false;
      entry.error = err?.message ?? 'Execution failed';
      toast.error('Script execution failed');
    } finally {
      setIsExecuting(false);
      setHistory((prev) => [entry, ...prev]);
    }
  };

  const latestEntry = history[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" />
          Router Script Execution
        </h1>
        <p className="text-muted-foreground mt-1">
          Execute RouterOS scripts on connected MikroTik routers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Router List */}
        <Card className="lg:col-span-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4" />
                Routers
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={fetchRouters} disabled={isLoadingRouters}>
                <RefreshCw className={cn('h-4 w-4', isLoadingRouters && 'animate-spin')} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingRouters ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : routers.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No routers found
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {routers.map((router) => (
                    <button
                      key={router.id}
                      onClick={() => setSelectedRouter(router)}
                      className={cn(
                        'w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center gap-3',
                        selectedRouter?.id === router.id && 'bg-primary/5 border-l-2 border-primary'
                      )}
                    >
                      <div className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                        router.isConnected ? 'bg-green-500/10' : 'bg-red-500/10'
                      )}>
                        {router.isConnected
                          ? <Wifi className="h-4 w-4 text-green-500" />
                          : <WifiOff className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{router.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{router.ipAddress}</p>
                        <p className="text-xs text-muted-foreground truncate">Port {router.apiPort}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] shrink-0',
                          router.isConnected
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        )}
                      >
                        {router.isConnected ? 'Online' : 'Offline'}
                      </Badge>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Editor + Output */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tab switcher */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'editor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('editor')}
            >
              <Terminal className="h-4 w-4 mr-2" />
              Editor
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('history')}
            >
              <Clock className="h-4 w-4 mr-2" />
              History
              {history.length > 0 && (
                <Badge className="ml-2 h-5 px-1.5 text-[10px]">{history.length}</Badge>
              )}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'editor' ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-4"
              >
                {/* Templates */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Quick Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {SCRIPT_TEMPLATES.map((tpl) => (
                        <Button
                          key={tpl.name}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => setScript(tpl.script)}
                        >
                          {tpl.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Script Editor */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Script Editor</span>
                      {selectedRouter ? (
                        <Badge variant="outline" className="text-xs font-normal">
                          Target: {selectedRouter.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                          No router selected
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs">RouterOS Script</Label>
                      <div className="relative">
                        <Textarea
                          value={script}
                          onChange={(e) => setScript(e.target.value)}
                          placeholder="/ip hotspot user print&#10;:put [/system identity get name]"
                          className="font-mono text-sm min-h-[160px] resize-y bg-muted/30"
                          spellCheck={false}
                        />
                        {script && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={() => setScript('')}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Script Name (optional)</Label>
                      <Input
                        value={scriptName}
                        onChange={(e) => setScriptName(e.target.value)}
                        placeholder="my-script (leave blank to discard after run)"
                        className="text-sm font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        If provided, the script will be saved on the router for later use.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        onClick={handleExecute}
                        disabled={!script.trim() || !selectedRouter || isExecuting || !selectedRouter.isConnected}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        {isExecuting ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Executing...</>
                        ) : (
                          <><Play className="h-4 w-4 mr-2" />Run Script</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(script);
                          toast.success('Copied to clipboard');
                        }}
                        disabled={!script}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    {selectedRouter && !selectedRouter.isConnected && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        This router is offline. Connect it first before running scripts.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Output */}
                {latestEntry && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {latestEntry.success
                          ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                          : <XCircle className="h-4 w-4 text-red-500" />}
                        Output — {latestEntry.routerName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea>
                        <pre
                          className={cn(
                            'font-mono text-xs p-4 rounded-lg bg-muted/50 whitespace-pre-wrap break-words max-h-48 overflow-auto',
                            !latestEntry.success && 'text-red-500'
                          )}
                        >
                          {latestEntry.success ? (latestEntry.output ?? '') : (latestEntry.error ?? 'Unknown error')}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Execution History</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHistory([])}
                      disabled={history.length === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    {history.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        No executions yet
                      </div>
                    ) : (
                      <ScrollArea className="max-h-[500px]">
                        <div className="divide-y">
                          {history.map((entry) => (
                            <div key={entry.id} className="p-4 space-y-2">
                              <div className="flex items-center gap-2">
                                {entry.success
                                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                  : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                                <span className="font-medium text-sm">{entry.routerName}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {new Date(entry.executedAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <pre className="font-mono text-xs p-2 rounded bg-muted/50 overflow-x-auto text-muted-foreground">
                                {entry.script}
                              </pre>
                              {(entry.output || entry.error) && (
                                <pre className={cn(
                                  'font-mono text-xs p-2 rounded bg-muted/30 overflow-x-auto',
                                  !entry.success && 'text-red-500'
                                )}>
                                  {entry.success ? entry.output : entry.error}
                                </pre>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 px-2"
                                onClick={() => {
                                  setScript(entry.script);
                                  setSelectedRouter(routers.find((r) => r.id === entry.routerId) ?? null);
                                  setActiveTab('editor');
                                }}
                              >
                                <ChevronRight className="h-3 w-3 mr-1" />
                                Rerun
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
