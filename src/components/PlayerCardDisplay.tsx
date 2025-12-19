'use client';

import type { PlayerCardData } from '@/lib/db/repositories/playerCardRepository';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, User } from 'lucide-react';

interface PlayerCardDisplayProps {
  card: PlayerCardData;
  size?: 'small' | 'medium' | 'large';
}

export function PlayerCardDisplay({ card, size = 'large' }: PlayerCardDisplayProps) {
  const cardColors = {
    bronze: 'from-amber-700 via-amber-600 to-amber-800',
    silver: 'from-gray-400 via-gray-300 to-gray-500',
    gold: 'from-yellow-500 via-yellow-400 to-yellow-600',
    platinum: 'from-cyan-400 via-blue-400 to-cyan-500',
    diamond: 'from-purple-500 via-pink-500 to-purple-600',
  };
  
  const cardGradient = cardColors[card.cardColor];
  
  const sizeClasses = {
    small: 'w-48',
    medium: 'w-64',
    large: 'w-80',
  };
  
  return (
    <div className={`${sizeClasses[size]} mx-auto`}>
      <Card className={`relative overflow-hidden bg-linear-to-br ${cardGradient} p-6 text-white shadow-2xl`}>
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-4xl font-bold">{card.overallRating}</div>
            <div className="text-sm font-medium uppercase">{card.position}</div>
          </div>
          <div className="text-right">
            {card.countryFlag && (
              <div className="w-12 h-8 bg-white/20 rounded mb-2" />
            )}
            <div className="text-xs opacity-80">{card.dnaStage}</div>
          </div>
        </div>
        
        {/* Player Photo */}
        <div className="flex justify-center mb-4">
          {card.playerPhoto ? (
            <img
              src={card.playerPhoto}
              alt={card.name}
              className="w-32 h-32 object-cover rounded-full border-4 border-white/30"
            />
          ) : (
            <div className="w-32 h-32 bg-white/20 rounded-full border-4 border-white/30 flex items-center justify-center">
              <User className="w-16 h-16 text-white/50" />
            </div>
          )}
        </div>
        
        {/* Player Name */}
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold uppercase tracking-wider">{card.name}</h3>
          <p className="text-sm opacity-80">{card.age} years old</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatItem label="PAC" value={card.ratings.pace} />
          <StatItem label="DRI" value={card.ratings.dribbling} />
          <StatItem label="PHY" value={card.ratings.physical} />
          <StatItem label="STR" value={card.ratings.strength} />
          <StatItem label="AGI" value={card.ratings.agility} />
          <StatItem label="END" value={card.ratings.endurance} />
        </div>
        
        {/* Footer - Logo */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-medium">DISCOVER NATURAL ABILITY</span>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-none">
            {card.preferredFoot.toUpperCase()}
          </Badge>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
      </Card>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded p-2 text-center">
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
