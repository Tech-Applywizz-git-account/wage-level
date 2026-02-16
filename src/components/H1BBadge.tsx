"use client";

import { Info } from "lucide-react";
import { H1BWageData, WAGE_LEVEL_INFO } from "@/lib/types/job";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface H1BBadgeProps {
    wageData: H1BWageData;
    compact?: boolean;
}

export const H1BBadge = ({ wageData, compact = false }: H1BBadgeProps) => {
    const levelInfo = WAGE_LEVEL_INFO[wageData.level];

    if (!levelInfo) return null;

    const formatCurrency = (amount: number) => {
        return `$${(amount / 1000).toFixed(0)}K`;
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-2">
                        <div
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${levelInfo.bgColor} ${levelInfo.color}`}
                        >
                            H1B Level: [{wageData.level}] {levelInfo.name}
                        </div>
                        {!compact && (
                            <div className="text-sm text-gray-600">
                                {formatCurrency(wageData.wageMin)} - {formatCurrency(wageData.wageMax)}
                            </div>
                        )}
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-4 bg-white border border-gray-200 shadow-lg">
                    <div className="space-y-2">
                        <h4 className={`font-bold text-lg ${levelInfo.color}`}>
                            H1B Wage Level {wageData.level} - {levelInfo.name}
                        </h4>
                        <div className="space-y-1 text-sm text-gray-700">
                            <p>• Bachelor&apos;s degree + {levelInfo.experience} experience</p>
                            <p>• {levelInfo.description}</p>
                            <p>• {levelInfo.percentile} percentile wage level</p>
                            {wageData.onetCode && (
                                <p>• O*NET Code: {wageData.onetCode}</p>
                            )}
                            {wageData.msaName && (
                                <p>• MSA: {wageData.msaName}</p>
                            )}
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                            <p className="font-semibold text-gray-900">
                                Prevailing Wage Range:
                            </p>
                            <p className={`text-lg font-bold ${levelInfo.color}`}>
                                {formatCurrency(wageData.wageMin)} - {formatCurrency(wageData.wageMax)}
                            </p>
                        </div>
                        <p className="text-xs text-gray-500 pt-1">
                            Source: {wageData.dataSource}
                        </p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

// Compact version for mobile/table cells
export const H1BBadgeCompact = ({ wageData }: H1BBadgeProps) => {
    const levelInfo = WAGE_LEVEL_INFO[wageData.level];

    if (!levelInfo) return null;

    return (
        <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${levelInfo.bgColor} ${levelInfo.color}`}
        >
            <span>H1B {wageData.level}</span>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-3 w-3 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                        <div className="space-y-1 text-xs">
                            <p className="font-semibold">{levelInfo.name}</p>
                            <p>{levelInfo.experience}</p>
                            <p>${(wageData.wageMin / 1000).toFixed(0)}K - ${(wageData.wageMax / 1000).toFixed(0)}K</p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};
