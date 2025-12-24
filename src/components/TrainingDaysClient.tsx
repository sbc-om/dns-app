'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Plus, Save, Sparkles } from 'lucide-react';
import type { Locale } from '@/config/i18n';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { WEEKDAYS, type GroupTrainingDays } from '@/lib/trainingDays/trainingDaysTypes';

const weekdayLabels: Record<Locale, Record<string, string>> = {
  en: { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' },
  ar: { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' },
};

type Props = {
  locale: Locale;
  dictionary: Dictionary;
  groups: string[];
  initialRecords: GroupTrainingDays[];
};

export function TrainingDaysClient({ locale, dictionary, groups, initialRecords }: Props) {
  const [busy, setBusy] = useState(false);
  const [newGroup, setNewGroup] = useState('');
  const [records, setRecords] = useState<GroupTrainingDays[]>(initialRecords);

  const groupKeys = useMemo(() => {
    const set = new Set<string>();
    for (const g of groups) set.add(g);
    for (const r of records) set.add(r.groupKey);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [groups, records]);

  const recordByGroup = useMemo(() => {
    return new Map(records.map((r) => [r.groupKey, r] as const));
  }, [records]);

  const addGroup = () => {
    const key = newGroup.trim();
    if (!key) return;
    if (groupKeys.includes(key)) {
      setNewGroup('');
      return;
    }
    setRecords((prev) => [...prev, { academyId: 'current', groupKey: key, days: [], updatedAt: '', updatedBy: '' }]);
    setNewGroup('');
  };

  const toggleDay = async (groupKey: string, dayIndex: number, checked: boolean) => {
    const current = recordByGroup.get(groupKey);
    const currentDays = current?.days ?? [];
    const nextDays = checked ? Array.from(new Set([...currentDays, dayIndex])) : currentDays.filter((d) => d !== dayIndex);

    setBusy(true);
    try {
      const resp = await fetch('/api/training-days', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ locale, groupKey, days: nextDays }),
      });

      const res = (await resp.json()) as
        | { success: true; record: GroupTrainingDays }
        | { success: false; error: string };

      if (!resp.ok || !res.success) {
        const msg = 'error' in res ? res.error : dictionary.common?.error || 'Failed';
        alert(msg);
        return;
      }

      setRecords((prev) => {
        const next = prev.filter((r) => r.groupKey !== groupKey);
        next.push(res.record);
        return next.sort((a, b) => a.groupKey.localeCompare(b.groupKey));
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative overflow-hidden rounded-3xl border-2 border-white/15 bg-white/70 dark:bg-white/5 dark:border-white/10 backdrop-blur-xl p-6"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.12),transparent_60%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#262626] dark:text-white">Training days</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Days only (no time selection). Set per group, not per player.
            </p>
          </div>
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.6 }}
            className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
          >
            <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </motion.div>
        </div>
      </motion.div>

      <Card className="rounded-3xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-white/80 dark:bg-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Add group
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 grid gap-2">
            <Label>Group key</Label>
            <Input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="e.g. U10" />
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="button" onClick={addGroup} className="rounded-2xl" disabled={!newGroup.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence>
          {groupKeys.map((groupKey, idx) => {
            const rec = recordByGroup.get(groupKey);
            const selected = new Set(rec?.days ?? []);

            return (
              <motion.div
                key={groupKey}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className="rounded-3xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-white/80 dark:bg-white/5">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-3">
                      <span className="font-black">{groupKey}</span>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {selected.size > 0 ? `${selected.size} days` : 'No days set'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {WEEKDAYS.map((d) => (
                        <motion.div key={d.key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <label className="flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-3 cursor-pointer">
                            <Checkbox
                              checked={selected.has(d.index)}
                              onCheckedChange={(val) => toggleDay(groupKey, d.index, Boolean(val))}
                              disabled={busy}
                            />
                            <span className="text-sm font-semibold text-[#262626] dark:text-white">{weekdayLabels[locale][d.key]}</span>
                          </label>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Save className="h-3.5 w-3.5" />
                      Changes save instantly.
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
