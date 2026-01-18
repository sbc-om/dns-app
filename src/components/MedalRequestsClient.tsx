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
import { Medal, User, Building2, CheckCircle, Clock, XCircle, Trophy, Sparkles } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/getDictionary';

export interface MedalRequest {
  id: string;
  playerId: string;
  playerName: string;
  academyId: string;
  academyName: string;
  requestDate: string;
  levelPassed: string;
  status: 'pending' | 'approved' | 'delivered' | 'rejected';
  notes?: string;
}

export interface MedalRequestsClientProps {
  dictionary: Dictionary;
  locale: string;
  requests: MedalRequest[];
  academies: Array<{ id: string; name: string }>;
}

export function MedalRequestsClient({ dictionary, locale, requests, academies }: MedalRequestsClientProps) {
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
      case 'approved':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-600"><Trophy className="h-3 w-3 mr-1" />Delivered</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800">
              <Medal className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            {dictionary.nav?.medalRequests || 'Medal Requests'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Manage medal requests from academies for players who passed levels
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medal Requests ({filteredRequests.length})</CardTitle>
          <CardDescription>Review and manage medal requests</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Medal className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No medal requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Academy</TableHead>
                  <TableHead>Level Passed</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
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
                      <Badge variant="outline">{request.levelPassed}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.requestDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button size="sm" variant="default">
                              Approve
                            </Button>
                            <Button size="sm" variant="outline">
                              Reject
                            </Button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <Button size="sm" variant="default">
                            Mark Delivered
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
