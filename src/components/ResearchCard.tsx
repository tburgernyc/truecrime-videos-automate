import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle2, AlertCircle, Clock, Users, MapPin } from 'lucide-react';

interface ResearchCardProps {
  data: {
    caseName: string;
    summary: string;
    timeline: Array<{date: string, event: string}>;
    keyPeople: Array<{name: string, role: string}>;
    locations: string[];
    outcomes: string[];
    sources: Array<{
      title: string;
      url: string;
      snippet: string;
      source: string;
      credibility: 'high' | 'medium' | 'low';
    }>;
    sensitiveElements: string[];
    factCheckingScore: number;
    researchedAt: string;
  };
}

export const ResearchCard: React.FC<ResearchCardProps> = ({ data }) => {
  const getCredibilityColor = (cred: string) => {
    if (cred === 'high') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (cred === 'medium') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Header with Fact-Checking Score */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-white">{data.caseName}</h3>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
            <span className={`text-2xl font-bold ${getScoreColor(data.factCheckingScore)}`}>
              {data.factCheckingScore}%
            </span>
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{data.summary}</p>
      </Card>

      {/* Timeline */}
      {data.timeline.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-teal-400" />
            <h4 className="font-semibold text-white">Timeline</h4>
          </div>
          <div className="space-y-2">
            {data.timeline.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <Badge variant="outline" className="bg-slate-700/50 text-teal-300 border-teal-500/30">
                  {item.date}
                </Badge>
                <span className="text-slate-300 text-sm">{item.event}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Key People & Locations */}
      <div className="grid md:grid-cols-2 gap-4">
        {data.keyPeople.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-amber-400" />
              <h4 className="font-semibold text-white">Key People</h4>
            </div>
            <div className="space-y-2">
              {data.keyPeople.map((person, i) => (
                <div key={i} className="text-sm">
                  <span className="text-slate-300">{person.name}</span>
                  <Badge className="ml-2 text-xs bg-slate-700 text-slate-300">{person.role}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {data.locations.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-crimson-400" />
              <h4 className="font-semibold text-white">Locations</h4>
            </div>
            <div className="space-y-1">
              {data.locations.map((loc, i) => (
                <p key={i} className="text-slate-300 text-sm">{loc}</p>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Sources */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <h4 className="font-semibold text-white mb-3">Sources ({data.sources.length})</h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.sources.map((source, i) => (
            <div key={i} className="border-l-2 border-slate-600 pl-3 py-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 text-sm font-medium flex items-center gap-1 flex-1"
                >
                  {source.title}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <Badge className={`text-xs ${getCredibilityColor(source.credibility)}`}>
                  {source.credibility}
                </Badge>
              </div>
              <p className="text-slate-400 text-xs">{source.source}</p>
              <p className="text-slate-300 text-xs mt-1">{source.snippet}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Sensitive Elements Warning */}
      {data.sensitiveElements.length > 0 && (
        <Card className="bg-amber-900/20 border-amber-600/30 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-300 mb-2">Sensitive Content</h4>
              <div className="flex flex-wrap gap-2">
                {data.sensitiveElements.map((element, i) => (
                  <Badge key={i} className="bg-amber-800/30 text-amber-200 border-amber-600/30">
                    {element}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
