'use client';

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import type { Locale } from '@/config/i18n';
import type { User } from '@/lib/db/repositories/userRepository';
import type { ProgramLevel } from '@/lib/db/repositories/programLevelRepository';
import type { DnaAssessmentSession } from '@/lib/actions/dnaAssessmentActions';
import type { Program } from '@/lib/db/repositories/programRepository';
import type { ProgramEnrollment } from '@/lib/db/repositories/programEnrollmentRepository';
import {
  getPlayerProgramEnrollmentsAction,
  getProgramLevelsForPlayerProgramAction,
} from '@/lib/actions/programEnrollmentActions';
import {
  getProgramAttendanceForUserInProgramAction,
} from '@/lib/actions/programAttendanceActions';
import { getDnaAssessmentsForPlayerAction } from '@/lib/actions/dnaAssessmentActions';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Download,
  IdCard,
  Layers,
  Loader2,
} from 'lucide-react';

type CardStatus = 'current' | 'completed' | 'locked';

type AttendanceRow = { sessionDate: string; present: boolean };

type EnrollmentRow = ProgramEnrollment & {
  program?: Program | null;
  currentLevel?: ProgramLevel | null;
};

type ProgramLevelCardModel = {
  id: string;
  programId: string;
  programName: string;
  programImage?: string | null;
  levelId: string;
  levelOrder: number;
  levelName: string;
  levelColor: string;
  status: CardStatus;

  requiredSessions: number;
  attendedSessions: number;

  requiredPoints: number;
  earnedPoints: number;

  joinedAt?: string;
  levelStartedAt?: string;
  levelEndedAt?: string;

  programPointsTotal: number;
};

function dateOnlyFromIso(iso?: string | null): string | null {
  if (!iso) return null;
  // expected ISO or YYYY-MM-DD
  return iso.length >= 10 ? iso.slice(0, 10) : null;
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

async function waitForFontsReady() {
  try {
    const fonts = (document as any).fonts;
    if (fonts?.ready) await fonts.ready;
  } catch {
    // Non-fatal: proceed without waiting.
  }
}

async function waitForImagesReady(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll('img'));
  if (images.length === 0) return;

  await Promise.all(
    images.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              const done = () => {
                img.removeEventListener('load', done);
                img.removeEventListener('error', done);
                resolve();
              };
              img.addEventListener('load', done);
              img.addEventListener('error', done);
            })
    )
  );
}

function safeNumber(n: unknown) {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

function downloadDataUrl(filename: string, dataUrl: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

function getExportScale() {
  // Higher scale = sharper exports (bigger files). Cap to avoid huge memory spikes.
  if (typeof window === 'undefined') return 4;
  const dpr = Number.isFinite(window.devicePixelRatio) ? window.devicePixelRatio : 1;
  return Math.min(5, Math.max(3, Math.round(dpr * 3)));
}

function computeNaStats(sessions: DnaAssessmentSession[]) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return { latestNaScore: null as number | null, averageNaScore: null as number | null };
  }

  const latestNaScore = safeNumber(sessions[0]?.naScore);
  const total = sessions.reduce((sum, s) => sum + safeNumber(s.naScore), 0);
  const averageNaScore = total / Math.max(1, sessions.length);
  return { latestNaScore, averageNaScore };
}

function sumAttendanceInRange(records: AttendanceRow[], startDate: string | null, endDate: string | null) {
  if (!startDate) return 0;
  const end = endDate ?? '9999-12-31';
  let attended = 0;
  for (const r of records) {
    if (!r.present) continue;
    if (r.sessionDate >= startDate && r.sessionDate <= end) attended += 1;
  }
  return attended;
}

function sumPointsInRange(enrollment: EnrollmentRow, startIso: string | null, endIso: string | null) {
  if (!startIso) return 0;
  const start = startIso;
  const end = endIso ?? '9999-12-31T23:59:59.999Z';

  let sum = 0;
  for (const note of enrollment.coachNotes || []) {
    const t = note.createdAt;
    if (!t) continue;
    if (t >= start && t <= end) sum += safeNumber(note.pointsDelta);
  }
  return sum;
}

function getLevelPeriodBounds(enrollment: EnrollmentRow, levelId: string) {
  const entries = (enrollment.levelHistory || []).filter((h) => h.levelId === levelId);
  if (entries.length === 0) return { startedAt: null as string | null, endedAt: null as string | null };
  const startedAt = entries
    .map((e) => e.startedAt)
    .filter(Boolean)
    .sort()[0] ?? null;

  const endedAtCandidates = entries
    .map((e) => e.endedAt)
    .filter(Boolean)
    .sort();
  const endedAt = endedAtCandidates.length > 0 ? endedAtCandidates[endedAtCandidates.length - 1]! : null;

  return { startedAt, endedAt };
}

export function PlayerCardPageClient(props: {
  dictionary: Dictionary;
  locale: Locale;
  academyId: string;
  kid: User;
}) {
  const title =
    (props.dictionary as any).playerCardPage?.title ??
    props.dictionary.playerProfile?.actions?.viewCard ??
    'Player card';

  const subtitle = (props.dictionary as any).playerCardPage?.subtitle ?? '';

  const t = useMemo(() => (props.dictionary as any).playerCardPage ?? {}, [props.dictionary]);
  const tCommon = useMemo(() => (props.dictionary as any).common ?? {}, [props.dictionary]);

  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<ProgramLevelCardModel[]>([]);
  const [programsCount, setProgramsCount] = useState(0);
  const [naStats, setNaStats] = useState<{ latestNaScore: number | null; averageNaScore: number | null }>({
    latestNaScore: null,
    averageNaScore: null,
  });
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  const [levelQuery, setLevelQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CardStatus | 'all'>('all');

  const cardShell =
    'rounded-3xl border-2 border-[#DDDDDD] bg-white shadow-lg dark:border-[#000000] dark:bg-[#262626] overflow-hidden';
  const inputClass =
    'h-12 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#111114] text-[#262626] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500';
  const outlineButtonClass =
    'h-11 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-white/80 dark:bg-[#111114] text-[#262626] dark:text-white hover:bg-gray-50 dark:hover:bg-[#1a1a1d]';
  const ctaButtonClass =
    'h-11 rounded-xl bg-[#0b0b0f] text-white hover:bg-[#14141a] disabled:opacity-60 disabled:hover:bg-[#0b0b0f]';

  // Store refs by card id so we can export each card.
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const setCardRef = useCallback((id: string) => {
    return (el: HTMLDivElement | null) => {
      cardRefs.current[id] = el;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [enrollmentsRes, assessmentsRes] = await Promise.all([
          getPlayerProgramEnrollmentsAction({
            locale: props.locale,
            academyId: props.academyId,
            userId: props.kid.id,
          }),
          getDnaAssessmentsForPlayerAction({
            locale: props.locale,
            academyId: props.academyId,
            playerId: props.kid.id,
          }),
        ]);

        if (cancelled) return;

        if (assessmentsRes.success) {
          setNaStats(computeNaStats(assessmentsRes.sessions as DnaAssessmentSession[]));
        }

        if (!enrollmentsRes.success) {
          toast.error(enrollmentsRes.error || tCommon.error || 'Failed to load programs');
          setCards([]);
          setProgramsCount(0);
          setActiveProgramId(null);
          return;
        }

        const enrollments = enrollmentsRes.enrollments as EnrollmentRow[];
        setProgramsCount(enrollments.length);
        setActiveProgramId((prev) => prev ?? enrollments[0]?.programId ?? null);

        // Fetch levels + attendance timeline per program.
        const perProgram = await Promise.all(
          enrollments.map(async (enrollment) => {
            const [levelsRes, attendanceRes] = await Promise.all([
              getProgramLevelsForPlayerProgramAction({
                locale: props.locale,
                academyId: props.academyId,
                programId: enrollment.programId,
                userId: props.kid.id,
              }),
              getProgramAttendanceForUserInProgramAction({
                locale: props.locale,
                academyId: props.academyId,
                programId: enrollment.programId,
                userId: props.kid.id,
              }),
            ]);

            const levels = levelsRes.success ? (levelsRes.levels as ProgramLevel[]) : [];
            const attendance: AttendanceRow[] = attendanceRes.success
              ? (attendanceRes.records as AttendanceRow[])
              : [];

            const sortedLevels = [...levels].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            const currentLevelOrder = sortedLevels.find((l) => l.id === enrollment.currentLevelId)?.order ?? null;

            const programName = enrollment.program
              ? props.locale === 'ar'
                ? (enrollment.program as any).nameAr || enrollment.program.name
                : enrollment.program.name
              : 'Program';

            const programImage = enrollment.program ? ((enrollment.program as any).image as string | undefined) : undefined;

            const models: ProgramLevelCardModel[] = sortedLevels.map((lvl) => {
              const levelName = props.locale === 'ar' ? lvl.nameAr || lvl.name : lvl.name;

              const { startedAt, endedAt } = getLevelPeriodBounds(enrollment, lvl.id);
              const startDate = dateOnlyFromIso(startedAt);
              const endDate = endedAt ? dateOnlyFromIso(endedAt) : null;

              const requiredSessions = safeNumber(lvl.passRules?.minSessionsAttended);
              const requiredPoints = safeNumber(lvl.passRules?.minPointsEarned);

              const attendedSessions = sumAttendanceInRange(attendance, startDate, endDate);
              const earnedPoints = sumPointsInRange(enrollment, startedAt, endedAt);

              let status: CardStatus = 'locked';
              if (enrollment.currentLevelId && lvl.id === enrollment.currentLevelId) status = 'current';
              else if (currentLevelOrder !== null && lvl.order < currentLevelOrder) status = 'completed';
              else if ((enrollment.levelHistory || []).some((h) => h.levelId === lvl.id)) status = 'completed';

              return {
                id: `${enrollment.programId}:${lvl.id}`,
                programId: enrollment.programId,
                programName,
                programImage: programImage ?? null,
                levelId: lvl.id,
                levelOrder: lvl.order,
                levelName,
                levelColor: lvl.color,
                status,
                requiredSessions,
                attendedSessions,
                requiredPoints,
                earnedPoints,
                joinedAt: enrollment.joinedAt,
                levelStartedAt: startedAt ?? undefined,
                levelEndedAt: endedAt ?? undefined,
                programPointsTotal: safeNumber(enrollment.pointsTotal),
              };
            });

            return models;
          })
        );

        if (cancelled) return;
        setCards(perProgram.flat());
      } catch (e) {
        console.error(e);
        if (!cancelled) toast.error(tCommon.error || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [props.academyId, props.kid.id, props.locale, t, tCommon]);

  const programs = useMemo(() => {
    const map = new Map<string, { programId: string; programName: string }>();
    for (const c of cards) {
      if (!map.has(c.programId)) map.set(c.programId, { programId: c.programId, programName: c.programName });
    }
    return Array.from(map.values()).sort((a, b) => a.programName.localeCompare(b.programName));
  }, [cards]);

  const visibleCards = useMemo(() => {
    const q = levelQuery.trim().toLowerCase();
    let list = !activeProgramId ? cards : cards.filter((c) => c.programId === activeProgramId);

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }

    if (q) {
      list = list.filter((c) => {
        const hay = `${c.programName} ${c.levelName} ${c.levelOrder}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return list;
  }, [activeProgramId, cards, levelQuery, statusFilter]);

  const exportCardToPng = useCallback(
    async (cardId: string, filename: string) => {
      const el = cardRefs.current[cardId];
      if (!el) throw new Error('Card not found');

      await waitForFontsReady();
      await waitForImagesReady(el);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const canvas = await html2canvas(el, {
        scale: getExportScale(),
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        onclone: (doc) => {
          // Force light theme for clean, print-friendly exports.
          doc.documentElement.classList.remove('dark');
          const clone = doc.querySelector(`[data-card-root="${cardId}"]`);
          if (clone instanceof HTMLElement) {
            clone.style.setProperty('--card-export-bg', '#ffffff');
          }
        },
      });
      downloadDataUrl(filename, canvas.toDataURL('image/png'));
    },
    []
  );

  const exportCardToPdf = useCallback(
    async (cardId: string, filename: string) => {
      const el = cardRefs.current[cardId];
      if (!el) throw new Error('Card not found');

      await waitForFontsReady();
      await waitForImagesReady(el);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const canvas = await html2canvas(el, {
        scale: getExportScale(),
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        onclone: (doc) => {
          doc.documentElement.classList.remove('dark');
          const clone = doc.querySelector(`[data-card-root="${cardId}"]`);
          if (clone instanceof HTMLElement) {
            clone.style.setProperty('--card-export-bg', '#ffffff');
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height],
        compress: true,
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(filename);
    },
    []
  );

  const exportAllVisibleToPdf = useCallback(async () => {
    if (visibleCards.length === 0) return;
    const { jsPDF } = await import('jspdf');

    // Render first card to set initial page size.
    const firstEl = cardRefs.current[visibleCards[0]!.id];
    if (!firstEl) throw new Error('Card not found');

    await waitForFontsReady();
    await waitForImagesReady(firstEl);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    const firstCanvas = await html2canvas(firstEl, {
      scale: getExportScale(),
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      onclone: (doc) => {
        doc.documentElement.classList.remove('dark');
        const clone = doc.querySelector(`[data-card-root="${visibleCards[0]!.id}"]`);
        if (clone instanceof HTMLElement) {
          clone.style.setProperty('--card-export-bg', '#ffffff');
        }
      },
    });

    const pdf = new jsPDF({
      orientation: firstCanvas.width > firstCanvas.height ? 'l' : 'p',
      unit: 'px',
      format: [firstCanvas.width, firstCanvas.height],
      compress: true,
    });

    pdf.addImage(firstCanvas.toDataURL('image/png'), 'PNG', 0, 0, firstCanvas.width, firstCanvas.height);

    for (let i = 1; i < visibleCards.length; i += 1) {
      const c = visibleCards[i]!;
      const el = cardRefs.current[c.id];
      if (!el) continue;

      await waitForImagesReady(el);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const canvas = await html2canvas(el, {
        scale: getExportScale(),
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        onclone: (doc) => {
          doc.documentElement.classList.remove('dark');
          const clone = doc.querySelector(`[data-card-root="${c.id}"]`);
          if (clone instanceof HTMLElement) {
            clone.style.setProperty('--card-export-bg', '#ffffff');
          }
        },
      });

      // Keep consistent page size; add image scaled to page.
      pdf.addPage([firstCanvas.width, firstCanvas.height], firstCanvas.width > firstCanvas.height ? 'l' : 'p');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, firstCanvas.width, firstCanvas.height);
    }

    const baseName = `${props.kid.fullName || props.kid.username}-cards.pdf`;
    pdf.save(baseName);
  }, [props.kid.fullName, props.kid.username, visibleCards]);

  const handleExportAllPng = useCallback(async () => {
    if (visibleCards.length === 0) return;
    setExportBusy(true);
    try {
      for (const c of visibleCards) {
        const safeProgram = c.programName.replace(/[^a-z0-9-_]+/gi, '_');
        const safeLevel = `L${c.levelOrder}_${c.levelName}`.replace(/[^a-z0-9-_]+/gi, '_');
        const filename = `${props.kid.fullName || props.kid.username}-${safeProgram}-${safeLevel}.png`;
        await exportCardToPng(c.id, filename);
        // Give the browser a beat between downloads.
        await new Promise((r) => setTimeout(r, 250));
      }
      toast.success(t.allDownloaded || tCommon.success || 'Downloaded');
    } catch (e) {
      console.error(e);
      toast.error(tCommon.error || 'Failed to export');
    } finally {
      setExportBusy(false);
    }
  }, [exportCardToPng, props.kid.fullName, props.kid.username, t, tCommon, visibleCards]);

  const handleExportAllPdf = useCallback(async () => {
    if (visibleCards.length === 0) return;
    setExportBusy(true);
    try {
      await exportAllVisibleToPdf();
      toast.success(t.allDownloaded || tCommon.success || 'Downloaded');
    } catch (e) {
      console.error(e);
      toast.error(tCommon.error || 'Failed to export');
    } finally {
      setExportBusy(false);
    }
  }, [exportAllVisibleToPdf, t, tCommon, visibleCards.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 22 }}
      className="space-y-6"
    >
      <Card className={cardShell}>
        <CardHeader className="border-b border-black/10 dark:border-white/10 bg-gray-50/80 dark:bg-[#0f0f12]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button asChild variant="outline" size="icon" className="rounded-xl">
                <Link href={`/${props.locale}/dashboard/players/${props.kid.id}`} aria-label={tCommon.back || 'Back'}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#262626] dark:text-white truncate">{title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{subtitle}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {programsCount} {t.programsLabel || 'Programs'}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {visibleCards.length} {t.cardsLabel || 'Cards'}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <motion.div whileHover={{ rotate: [-2, 2, -1, 0] }} transition={{ duration: 0.35 }}>
                <Button
                  onClick={handleExportAllPng}
                  disabled={exportBusy || loading || visibleCards.length === 0}
                  className="rounded-xl bg-[#FF5F02] text-white hover:bg-[#FF7A2E]"
                >
                  {exportBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  {t.downloadAllPng || 'Download all (PNG)'}
                </Button>
              </motion.div>
              <motion.div whileHover={{ rotate: [2, -2, 1, 0] }} transition={{ duration: 0.35 }}>
                <Button
                  onClick={handleExportAllPdf}
                  disabled={exportBusy || loading || visibleCards.length === 0}
                  variant="outline"
                  className={outlineButtonClass}
                >
                  {exportBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  {t.downloadAllPdf || 'Download all (PDF)'}
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-5">
              <Input
                value={levelQuery}
                onChange={(e) => setLevelQuery(e.target.value)}
                placeholder={t.searchPlaceholder || tCommon.search || 'Search'}
                className={inputClass}
              />
            </div>

            <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? ctaButtonClass : outlineButtonClass}
              >
                {t.allStatuses || 'All'}
              </Button>
              <Button
                type="button"
                variant={statusFilter === 'current' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('current')}
                className={statusFilter === 'current' ? ctaButtonClass : outlineButtonClass}
              >
                {t.statusCurrent || 'Current'}
              </Button>
              <Button
                type="button"
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
                className={statusFilter === 'completed' ? ctaButtonClass : outlineButtonClass}
              >
                {t.statusCompleted || 'Completed'}
              </Button>
              <Button
                type="button"
                variant={statusFilter === 'locked' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('locked')}
                className={statusFilter === 'locked' ? ctaButtonClass : outlineButtonClass}
              >
                {t.statusLocked || 'Locked'}
              </Button>

              <div className="w-full h-px bg-black/10 dark:bg-white/10 my-1" />

              {programs.map((p) => (
                <Button
                  key={p.programId}
                  type="button"
                  variant={activeProgramId === p.programId ? 'default' : 'outline'}
                  onClick={() => setActiveProgramId(p.programId)}
                  className={activeProgramId === p.programId ? ctaButtonClass : outlineButtonClass}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  <span className="truncate max-w-56">{p.programName}</span>
                </Button>
              ))}

              {programs.length > 1 && (
                <Button
                  type="button"
                  variant={!activeProgramId ? 'default' : 'outline'}
                  onClick={() => setActiveProgramId(null)}
                  className={!activeProgramId ? ctaButtonClass : outlineButtonClass}
                >
                  {t.allPrograms || 'All programs'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="sm:hidden mb-4 flex gap-2">
            <Button
              onClick={handleExportAllPng}
              disabled={exportBusy || loading || visibleCards.length === 0}
              className="flex-1 rounded-xl bg-[#FF5F02] text-white hover:bg-[#FF7A2E]"
            >
              {exportBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {t.downloadAllPng || 'Download all (PNG)'}
            </Button>
            <Button
              onClick={handleExportAllPdf}
              disabled={exportBusy || loading || visibleCards.length === 0}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              {exportBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {t.downloadAllPdf || 'Download all (PDF)'}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-14"
              >
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t.loading || tCommon.loading || 'Loading...'}</span>
                </div>
              </motion.div>
            ) : visibleCards.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f0f12] p-10 text-center"
              >
                <div className="mx-auto inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FF5F02]/10 border border-[#FF5F02]/20 mb-3">
                  <IdCard className="h-6 w-6 text-[#FF5F02]" />
                </div>
                <div className="text-base font-semibold text-[#262626] dark:text-white">
                  {t.noPrograms || 'No program enrollments found'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t.noProgramsHint || ''}</div>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {visibleCards.map((c, idx) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="space-y-3"
                  >
                    <ProgramLevelCard
                      ref={setCardRef(c.id)}
                      player={props.kid}
                      model={c}
                      locale={props.locale}
                      dictionary={props.dictionary}
                      latestNaScore={naStats.latestNaScore}
                      averageNaScore={naStats.averageNaScore}
                    />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className={`flex-1 ${outlineButtonClass}`}
                        disabled={exportBusy}
                        onClick={async () => {
                          setExportBusy(true);
                          try {
                            const safeProgram = c.programName.replace(/[^a-z0-9-_]+/gi, '_');
                            const safeLevel = `L${c.levelOrder}_${c.levelName}`.replace(/[^a-z0-9-_]+/gi, '_');
                            await exportCardToPng(
                              c.id,
                              `${props.kid.fullName || props.kid.username}-${safeProgram}-${safeLevel}.png`
                            );
                          } catch (e) {
                            console.error(e);
                            toast.error(tCommon.error || 'Failed to export');
                          } finally {
                            setExportBusy(false);
                          }
                        }}
                      >
                        {exportBusy ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {t.downloadPng || 'Download PNG'}
                      </Button>
                      <Button
                        className={`flex-1 ${ctaButtonClass}`}
                        disabled={exportBusy}
                        onClick={async () => {
                          setExportBusy(true);
                          try {
                            const safeProgram = c.programName.replace(/[^a-z0-9-_]+/gi, '_');
                            const safeLevel = `L${c.levelOrder}_${c.levelName}`.replace(/[^a-z0-9-_]+/gi, '_');
                            await exportCardToPdf(
                              c.id,
                              `${props.kid.fullName || props.kid.username}-${safeProgram}-${safeLevel}.pdf`
                            );
                          } catch (e) {
                            console.error(e);
                            toast.error(tCommon.error || 'Failed to export');
                          } finally {
                            setExportBusy(false);
                          }
                        }}
                      >
                        {exportBusy ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {t.downloadPdf || 'Download PDF'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const ProgramLevelCard = forwardRef<
  HTMLDivElement,
  {
    player: User;
    model: ProgramLevelCardModel;
    locale: Locale;
    dictionary: Dictionary;
    latestNaScore: number | null;
    averageNaScore: number | null;
  }
>(function ProgramLevelCardInner(props, ref) {
  const { player, model } = props;
  const t = (props.dictionary as any).playerCardPage ?? {};

  const sessionsProgress =
    model.requiredSessions > 0
      ? clamp01(model.attendedSessions / model.requiredSessions)
      : model.status === 'completed'
        ? 1
        : 0;
  const pointsProgress =
    model.requiredPoints > 0
      ? clamp01(model.earnedPoints / model.requiredPoints)
      : model.status === 'completed'
        ? 1
        : 0;

  const statusLabel =
    model.status === 'current'
      ? t.statusCurrent || 'Current'
      : model.status === 'completed'
        ? t.statusCompleted || 'Completed'
        : t.statusLocked || 'Locked';

  // Avoid Tailwind alpha colors in exported subtree (they compile to `color-mix(in oklab, ...)`).
  const statusStyle: React.CSSProperties =
    model.status === 'current'
      ? {
          backgroundColor: 'rgba(16, 185, 129, 0.14)',
          borderColor: 'rgba(16, 185, 129, 0.32)',
          color: '#065f46',
        }
      : model.status === 'completed'
        ? {
            backgroundColor: 'rgba(37, 99, 235, 0.14)',
            borderColor: 'rgba(37, 99, 235, 0.32)',
            color: '#1d4ed8',
          }
        : {
            backgroundColor: 'rgba(107, 114, 128, 0.14)',
            borderColor: 'rgba(107, 114, 128, 0.32)',
            color: '#374151',
          };

  const accent = model.levelColor || '#FF5F02';
  const safeAccent = /^#[0-9a-f]{6}$/i.test(accent) ? accent : '#FF5F02';

  const imageSrc = player.profilePicture || model.programImage || '';
  const imageAlt = model.programName || (player.fullName || player.username) || 'Program';

  const sessionsPct = Math.round(sessionsProgress * 100);
  const pointsPct = Math.round(pointsProgress * 100);

  // The global CSS policy disables gradients and shadows.
  // Design this card using solid colors + borders so it stays readable and exportable.
  const frameColor =
    model.status === 'locked'
      ? '#9CA3AF'
      : model.status === 'completed'
        ? '#2563EB'
        : safeAccent;

  return (
    <div
      ref={ref}
      data-card-root={model.id}
      className="relative rounded-[34px] border p-3 bg-white dark:bg-[#0f0f12]"
      style={{ borderColor: safeAccent, borderWidth: 1.5 }}
    >
      <div
        className="relative rounded-[28px] overflow-hidden border-2 bg-white dark:bg-[#0f0f12]"
        style={{ borderColor: 'rgba(0,0,0,0.12)' }}
      >
        {/* Top stripe */}
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'rgba(0,0,0,0.12)' }}
        >
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#4B5563] dark:text-[#D1D5DB] truncate">
              {t.programLabel || 'Program'}
            </div>
            <div className="text-base font-extrabold text-[#262626] dark:text-white truncate">{model.programName}</div>
          </div>
          <div
            className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap"
            style={statusStyle}
          >
            {statusLabel}
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-[120px,1fr] gap-4 items-start">
            <div className="flex items-start gap-3">
              <div
                className="h-[108px] w-[108px] rounded-3xl border-2 bg-[#f3f4f6] dark:bg-[#141417] overflow-hidden shrink-0"
                style={{ borderColor: 'rgba(0,0,0,0.12)' }}
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={imageAlt}
                    crossOrigin="anonymous"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
              </div>

              <div className="min-w-0">
                <div className="text-lg font-extrabold text-[#262626] dark:text-white truncate">
                  {player.fullName || player.username || (t.playerLabel || 'Player')}
                </div>
                {player.username ? (
                  <div className="text-sm font-semibold text-[#4B5563] dark:text-[#D1D5DB] truncate">@{player.username}</div>
                ) : null}

                <div className="mt-2 flex items-center gap-2 text-xs text-[#4B5563] dark:text-[#D1D5DB]">
                  <Layers className="h-4 w-4 shrink-0" />
                  <span className="font-semibold whitespace-nowrap">
                    {t.levelLabel || 'Level'} {model.levelOrder}
                  </span>
                  <span className="text-[#9CA3AF]">•</span>
                  <span className="truncate">{model.levelName}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <RingStat
                label={t.sessionsLabel || 'Sessions'}
                value={`${sessionsPct}%`}
                color={frameColor}
                percent={sessionsPct}
                tone="light"
              />
              <RingStat
                label={t.pointsLabel || 'Points'}
                value={`${pointsPct}%`}
                color={safeAccent}
                percent={pointsPct}
                tone="light"
              />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <ProgressRow
              label={t.sessionsProgress || t.sessionsLabel || 'Sessions'}
              progress={sessionsProgress}
              left={`${model.attendedSessions}`}
              right={model.requiredSessions > 0 ? `${model.requiredSessions}` : `${model.attendedSessions}`}
              color={frameColor}
            />
            <ProgressRow
              label={t.pointsProgress || t.pointsLabel || 'Points'}
              progress={pointsProgress}
              left={`${Math.round(model.earnedPoints)}`}
              right={model.requiredPoints > 0 ? `${Math.round(model.requiredPoints)}` : `${Math.round(model.earnedPoints)}`}
              color={safeAccent}
            />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <MiniKpi
              label={t.programPointsTotal || 'Program points'}
              value={`${Math.round(model.programPointsTotal)}`}
            />
            <MiniKpi
              label={t.latestNaScore || 'Latest NA'}
              value={props.latestNaScore === null ? '—' : `${Math.round(props.latestNaScore)}`}
            />
            <MiniKpi
              label={t.averageNaScore || 'Avg NA'}
              value={props.averageNaScore === null ? '—' : `${Math.round(props.averageNaScore)}`}
            />
          </div>
        </div>

        <div
          className="px-4 py-3 border-t"
          style={{ borderColor: 'rgba(0,0,0,0.12)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4B5563] dark:text-[#D1D5DB]">
            <span className="truncate">
              {t.programLabel || 'Program'}: <span className="font-semibold">{model.programName}</span>
            </span>
            <span className="truncate">
              {t.levelLabel || 'Level'}: <span className="font-semibold">{model.levelOrder}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

function RingStat(props: { label: string; value: string; percent: number; color: string; tone?: 'light' | 'dark' }) {
  const pct = Math.max(0, Math.min(100, Math.round(props.percent)));
  const tone = props.tone ?? 'light';
  const track = tone === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  const labelColor = tone === 'dark' ? 'rgba(255,255,255,0.60)' : '#4B5563';
  const valueColor = tone === 'dark' ? '#FFFFFF' : '#111827';
  const innerBg = tone === 'dark' ? 'rgba(0,0,0,0.75)' : '#FFFFFF';
  const innerBorder = tone === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12">
        <svg viewBox="0 0 36 36" className="h-12 w-12">
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={track} strokeWidth="3.2" />
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="transparent"
            stroke={props.color}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeDashoffset="25"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div
            className="h-9 w-9 rounded-full border"
            style={{ backgroundColor: innerBg, borderColor: innerBorder }}
          />
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-xs truncate" style={{ color: labelColor }}>{props.label}</div>
        <div className="text-base font-extrabold" style={{ color: valueColor }}>{props.value}</div>
      </div>
    </div>
  );
}

function ProgressRow(props: { label: string; progress: number; left: string; right: string; color: string }) {
  const pct = Math.round(clamp01(props.progress) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-[#4B5563] dark:text-[#9CA3AF]">
        <span className="truncate">{props.label}</span>
        <span className="shrink-0">
          {props.left} / {props.right} · {pct}%
        </span>
      </div>
      <div className="mt-2 h-2.5 rounded-full bg-[#e5e7eb] dark:bg-[#2a2a2a] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: props.color }}
        />
      </div>
    </div>
  );
}

function MiniKpi(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 dark:border-[#2a2a2a] dark:bg-[#141417]">
      <div className="text-[10px] uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF]">{props.label}</div>
      <div className="mt-1 text-base font-extrabold text-[#262626] dark:text-white">{props.value}</div>
    </div>
  );
}
