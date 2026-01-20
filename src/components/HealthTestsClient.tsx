'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Stethoscope, 
  Calendar, 
  User, 
  Building2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye,
  MoreHorizontal,
  CalendarCheck
} from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface HealthTestRequest {
  id: string;
  playerId: string;
  playerName: string;
  academyId: string;
  academyName: string;
  requestDate: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  scheduledDate?: string;
  notes?: string;
}

export interface HealthTestsClientProps {
  dictionary: Dictionary;
  locale: string;
  requests: HealthTestRequest[];
  academies: Array<{ id: string; name: string }>;
}

export function HealthTestsClient({ dictionary, locale, requests, academies }: HealthTestsClientProps) {
  const [selectedAcademy, setSelectedAcademy] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRequests = requests.filter((req) => {
    if (selectedAcademy !== 'all' && req.academyId !== selectedAcademy) return false;
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    return true;
  });

  const healthTestsDict = dictionary.healthTests || {};

  const statusOptions = [
    { key: 'all', label: healthTestsDict.allStatuses || 'All Statuses', count: requests.length },
    { key: 'pending', label: healthTestsDict.pending || 'Pending', count: requests.filter(r => r.status === 'pending').length },
    { key: 'scheduled', label: healthTestsDict.scheduled || 'Scheduled', count: requests.filter(r => r.status === 'scheduled').length },
    { key: 'completed', label: healthTestsDict.completed || 'Completed', count: requests.filter(r => r.status === 'completed').length },
    { key: 'cancelled', label: healthTestsDict.cancelled || 'Cancelled', count: requests.filter(r => r.status === 'cancelled').length },
  ];

  const academyOptions = [
    { key: 'all', label: healthTestsDict.allAcademies || 'All Academies', count: requests.length },
    ...academies.map(academy => ({
      key: academy.id,
      label: academy.name,
      count: requests.filter(r => r.academyId === academy.id).length
    }))
  ];

  const getStatusBadge = (status: string) => {
    const statusTexts: Record<string, string> = {
      pending: healthTestsDict.pending || 'Pending',
      scheduled: healthTestsDict.scheduled || 'Scheduled',
      completed: healthTestsDict.completed || 'Completed',
      cancelled: healthTestsDict.cancelled || 'Cancelled'
    };

    switch (status) {
      case 'pending':
        return (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Badge variant="secondary" className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300">
              <Clock className="h-3 w-3 mr-1" />
              {statusTexts.pending}
            </Badge>
          </motion.div>
        );
      case 'scheduled':
        return (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Badge variant="default" className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
              <Calendar className="h-3 w-3 mr-1" />
              {statusTexts.scheduled}
            </Badge>
          </motion.div>
        );
      case 'completed':
        return (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Badge variant="default" className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              {statusTexts.completed}
            </Badge>
          </motion.div>
        );
      case 'cancelled':
        return (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Badge variant="destructive" className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
              <XCircle className="h-3 w-3 mr-1" />
              {statusTexts.cancelled}
            </Badge>
          </motion.div>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="relative">
            <motion.div
              className="absolute -inset-4 bg-linear-to-r from-green-600/10 via-emerald-600/10 to-teal-600/10 rounded-2xl blur-xl"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <div className="relative">
              <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                <Stethoscope className="h-8 w-8 text-emerald-600" />
                {healthTestsDict.title || dictionary.nav?.healthTests || 'Health Tests'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {healthTestsDict.description || 'Manage health test requests from academies for new players'}
              </p>
            </div>
          </div>

          {/* Professional Filter Controls */}
          <div className="w-full sm:w-auto">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-background/80 backdrop-blur-xl shadow-lg">
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-green-600/8 via-emerald-600/8 to-teal-600/8"
                animate={{ opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative p-2">
                <div className="flex h-12 w-full items-stretch overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-lg shadow-black/10 dark:shadow-black/40">
                  <div className="flex-1 min-w-0 h-full">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-full! w-full rounded-none border-0 bg-transparent px-4 py-0! text-foreground hover:bg-accent">
                        <div className={`flex h-full w-full items-center gap-2 min-w-0 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                          <Stethoscope className="h-4 w-4 text-foreground shrink-0" />
                          <SelectValue placeholder={healthTestsDict.filterByStatus || 'Filter by status'} className="leading-none" />
                        </div>
                      </SelectTrigger>
                      <SelectContent align="start" className="rounded-xl border border-border bg-popover text-popover-foreground">
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            <span className={`flex w-full items-center justify-between gap-3 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                              <span className="font-semibold">{opt.label}</span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-border bg-muted/60">
                                {opt.count}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-px bg-border" />

                  <div className="flex-1 min-w-0 h-full">
                    <Select value={selectedAcademy} onValueChange={setSelectedAcademy}>
                      <SelectTrigger className="h-full! w-full rounded-none border-0 bg-transparent px-4 py-0! text-foreground hover:bg-accent">
                        <div className={`flex h-full w-full items-center gap-2 min-w-0 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                          <Building2 className="h-4 w-4 text-foreground shrink-0" />
                          <SelectValue placeholder={healthTestsDict.filterByAcademy || 'Filter by academy'} className="leading-none" />
                        </div>
                      </SelectTrigger>
                      <SelectContent align="start" className="rounded-xl border border-border bg-popover text-popover-foreground">
                        {academyOptions.map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            <span className={`flex w-full items-center justify-between gap-3 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                              <span className="font-semibold">{opt.label}</span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-border bg-muted/60">
                                {opt.count}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Professional Health Test Requests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000] rounded-2xl shadow-lg relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-linear-to-r from-green-600/5 via-emerald-600/5 to-teal-600/5"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative">
          {/* Header */}
          <div className="border-b border-[#DDDDDD] dark:border-[#000000] p-6">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="p-2 rounded-xl bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800"
                >
                  <Stethoscope className="h-5 w-5 text-green-600 dark:text-green-400" />
                </motion.div>
                <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {healthTestsDict.title || 'Health Test Requests'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {healthTestsDict.requestsCount?.replace('{count}', filteredRequests.length.toString()).replace('{total}', requests.length.toString()) || `${filteredRequests.length} of ${requests.length} requests`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-6">
            {filteredRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 mb-4"
                >
                  <Stethoscope className="h-12 w-12 text-gray-400" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {healthTestsDict.noRequests || 'No Health Test Requests'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {healthTestsDict.noRequestsMessage || 'No health test requests match your current filters.'}
                </p>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-[#DDDDDD] dark:border-[#000000] hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <TableHead className="font-bold text-gray-900 dark:text-white">{healthTestsDict.player || 'Player'}</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white">{healthTestsDict.academy || 'Academy'}</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white">{healthTestsDict.requestDate || 'Request Date'}</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white">{healthTestsDict.status || 'Status'}</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white">{healthTestsDict.scheduledDate || 'Scheduled Date'}</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white">{healthTestsDict.actions || 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request, index) => (
                      <motion.tr
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-[#DDDDDD] dark:border-[#000000] hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group"
                      >
                        <TableCell className="py-4">
                          <div className={`flex items-center gap-3 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-colors"
                            >
                              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </motion.div>
                            <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
                              <p className="font-semibold text-gray-900 dark:text-white">{request.playerName}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">ID: {request.playerId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-900 dark:text-white font-medium">{request.academyName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-900 dark:text-white font-medium">
                              {new Date(request.requestDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell className="py-4">
                          {request.scheduledDate ? (
                            <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                              <CalendarCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="text-gray-900 dark:text-white font-medium">
                                {new Date(request.scheduledDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">{healthTestsDict.notScheduled || 'Not scheduled'}</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="border-2 border-[#DDDDDD] dark:border-[#000000] hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000]">
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className={`h-4 w-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                {healthTestsDict.viewDetails || 'View Details'}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <CalendarCheck className={`h-4 w-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                {healthTestsDict.scheduleTest || 'Schedule Test'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}