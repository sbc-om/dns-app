'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Stethoscope, Calendar, User, Building2, CheckCircle, Clock, XCircle, Sparkles } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/getDictionary';

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'scheduled':
        return <Badge variant="default"><Calendar className="h-3 w-3 mr-1" />Scheduled</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800">
              <Stethoscope className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            {dictionary.nav?.healthTests || 'Health Tests'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Manage health test requests from academies for new players
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Requests</CardTitle>
          <CardDescription>Filter by academy and status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Academy</label>
            <Select value={selectedAcademy} onValueChange={setSelectedAcademy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Academies</SelectItem>
                {academies.map((academy) => (
                  <SelectItem key={academy.id} value={academy.id}>
                    {academy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Health Test Requests ({filteredRequests.length})</CardTitle>
          <CardDescription>Review and manage health test requests</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No health test requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Academy</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.playerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {request.academyName}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(request.requestDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.scheduledDate
                        ? new Date(request.scheduledDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline">
                              Schedule
                            </Button>
                            <Button size="sm" variant="outline">
                              Cancel
                            </Button>
                          </>
                        )}
                        {request.status === 'scheduled' && (
                          <Button size="sm" variant="outline">
                            Mark Complete
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
