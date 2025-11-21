'use client';

import { useState } from 'react';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createPlayerCardAction } from '@/lib/actions/playerCardActions';
import { Upload, Check, Download, Share2 } from 'lucide-react';
import { PlayerCardDisplay } from '@/components/PlayerCardDisplay';
import type { PlayerCardData } from '@/lib/db/repositories/playerCardRepository';

interface PlayerCardGeneratorProps {
  dictionary: Dictionary;
  locale: Locale;
  userId: string;
  userName: string;
}

export function PlayerCardGenerator({ dictionary, locale, userId, userName }: PlayerCardGeneratorProps) {
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [loading, setLoading] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<PlayerCardData | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: userName,
    age: 10,
    position: 'Forward',
    preferredFoot: 'right' as 'left' | 'right' | 'both',
    height: 0,
    weight: 0,
    playerPhoto: '',
    countryFlag: '',
    
    // Physical Tests
    verticalJump: 0,
    broadJump: 0,
    sprint10m: 0,
    sprint20m: 0,
    sprint30m: 0,
    illinoisAgilityTest: 0,
    tTest: 0,
    agility505Test: 0,
    singleLegBalance: 0,
    plankHold: 0,
    enduranceTest: 0,
    pullUpTest: 0,
  });

  const handleSubmit = async () => {
    setLoading(true);
    
    const result = await createPlayerCardAction({
      userId,
      name: formData.name,
      age: formData.age,
      position: formData.position,
      preferredFoot: formData.preferredFoot,
      height: formData.height || undefined,
      weight: formData.weight || undefined,
      playerPhoto: formData.playerPhoto || undefined,
      countryFlag: formData.countryFlag || undefined,
      physicalTests: {
        verticalJump: formData.verticalJump || undefined,
        broadJump: formData.broadJump || undefined,
        sprint10m: formData.sprint10m || undefined,
        sprint20m: formData.sprint20m || undefined,
        sprint30m: formData.sprint30m || undefined,
        illinoisAgilityTest: formData.illinoisAgilityTest || undefined,
        tTest: formData.tTest || undefined,
        agility505Test: formData.agility505Test || undefined,
        singleLegBalance: formData.singleLegBalance || undefined,
        plankHold: formData.plankHold || undefined,
        enduranceTest: formData.enduranceTest || undefined,
        pullUpTest: formData.pullUpTest || undefined,
      },
    });
    
    setLoading(false);
    
    if (result.success && result.card) {
      setGeneratedCard(result.card);
      setStep('preview');
    } else {
      alert(result.error || 'Failed to generate player card');
    }
  };

  const handleDownload = () => {
    // Implement download functionality
    alert('Download feature coming soon!');
  };

  const handleShare = () => {
    // Implement share functionality
    alert('Share feature coming soon!');
  };

  if (step === 'preview' && generatedCard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{dictionary.playerCard.cardCreated}</h2>
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              {dictionary.playerCard.download}
            </Button>
            <Button onClick={handleShare} variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              {dictionary.playerCard.share}
            </Button>
            <Button onClick={() => setStep('form')}>
              {dictionary.playerCard.createCard}
            </Button>
          </div>
        </div>
        
        <PlayerCardDisplay card={generatedCard} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.playerCard.createCard}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">{dictionary.playerCard.basicInfo}</TabsTrigger>
              <TabsTrigger value="tests">{dictionary.playerCard.physicalTests}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{dictionary.playerCard.playerName}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="age">{dictionary.playerCard.age}</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="position">{dictionary.playerCard.position}</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Goalkeeper">{dictionary.playerCard.positions.goalkeeper}</SelectItem>
                      <SelectItem value="Defender">{dictionary.playerCard.positions.defender}</SelectItem>
                      <SelectItem value="Midfielder">{dictionary.playerCard.positions.midfielder}</SelectItem>
                      <SelectItem value="Forward">{dictionary.playerCard.positions.forward}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="foot">{dictionary.playerCard.preferredFoot}</Label>
                  <Select value={formData.preferredFoot} onValueChange={(value: any) => setFormData({ ...formData, preferredFoot: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">{dictionary.playerCard.foot.left}</SelectItem>
                      <SelectItem value="right">{dictionary.playerCard.foot.right}</SelectItem>
                      <SelectItem value="both">{dictionary.playerCard.foot.both}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="height">{dictionary.playerCard.height}</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height || ''}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="weight">{dictionary.playerCard.weight}</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="photo">{dictionary.playerCard.uploadPhoto}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // TODO: Implement image upload
                          alert('Image upload coming soon!');
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tests" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="verticalJump">{dictionary.playerCard.tests.verticalJump}</Label>
                  <Input
                    id="verticalJump"
                    type="number"
                    step="0.1"
                    value={formData.verticalJump || ''}
                    onChange={(e) => setFormData({ ...formData, verticalJump: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="broadJump">{dictionary.playerCard.tests.broadJump}</Label>
                  <Input
                    id="broadJump"
                    type="number"
                    step="0.1"
                    value={formData.broadJump || ''}
                    onChange={(e) => setFormData({ ...formData, broadJump: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sprint10m">{dictionary.playerCard.tests.sprint10m}</Label>
                  <Input
                    id="sprint10m"
                    type="number"
                    step="0.01"
                    value={formData.sprint10m || ''}
                    onChange={(e) => setFormData({ ...formData, sprint10m: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sprint20m">{dictionary.playerCard.tests.sprint20m}</Label>
                  <Input
                    id="sprint20m"
                    type="number"
                    step="0.01"
                    value={formData.sprint20m || ''}
                    onChange={(e) => setFormData({ ...formData, sprint20m: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sprint30m">{dictionary.playerCard.tests.sprint30m}</Label>
                  <Input
                    id="sprint30m"
                    type="number"
                    step="0.01"
                    value={formData.sprint30m || ''}
                    onChange={(e) => setFormData({ ...formData, sprint30m: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="illinois">{dictionary.playerCard.tests.agilityTest}</Label>
                  <Input
                    id="illinois"
                    type="number"
                    step="0.01"
                    value={formData.illinoisAgilityTest || ''}
                    onChange={(e) => setFormData({ ...formData, illinoisAgilityTest: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tTest">{dictionary.playerCard.tests.agilityTest} (T-Test)</Label>
                  <Input
                    id="tTest"
                    type="number"
                    step="0.01"
                    value={formData.tTest || ''}
                    onChange={(e) => setFormData({ ...formData, tTest: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="agility505">{dictionary.playerCard.tests.agilityTest} (5-0-5)</Label>
                  <Input
                    id="agility505"
                    type="number"
                    step="0.01"
                    value={formData.agility505Test || ''}
                    onChange={(e) => setFormData({ ...formData, agility505Test: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="balance">{dictionary.playerCard.tests.balanceTest}</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.1"
                    value={formData.singleLegBalance || ''}
                    onChange={(e) => setFormData({ ...formData, singleLegBalance: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="plank">{dictionary.playerCard.tests.sitUps} (Plank)</Label>
                  <Input
                    id="plank"
                    type="number"
                    step="0.1"
                    value={formData.plankHold || ''}
                    onChange={(e) => setFormData({ ...formData, plankHold: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endurance">{dictionary.playerCard.tests.cooperTest}</Label>
                  <Input
                    id="endurance"
                    type="number"
                    value={formData.enduranceTest || ''}
                    onChange={(e) => setFormData({ ...formData, enduranceTest: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="pullups">{dictionary.playerCard.tests.pullUps}</Label>
                  <Input
                    id="pullups"
                    type="number"
                    value={formData.pullUpTest || ''}
                    onChange={(e) => setFormData({ ...formData, pullUpTest: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSubmit} disabled={loading} className="gap-2">
              {loading ? dictionary.common.loading : (
                <>
                  <Check className="h-4 w-4" />
                  {dictionary.playerCard.generate}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
