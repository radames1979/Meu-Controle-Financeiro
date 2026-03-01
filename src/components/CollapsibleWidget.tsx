import React from 'react';
import { ChevronDown } from 'lucide-react';
import { DENSITY_CLASSES } from '../constants';

export const CollapsibleWidget = ({ title, children, isCollapsed, onToggle, density, actions }: any) => {
    const paddingClass = DENSITY_CLASSES.padding[density as keyof typeof DENSITY_CLASSES.padding];
    return (
        <div>
            <div onClick={onToggle} className={`flex justify-between items-center cursor-pointer ${paddingClass} ${!isCollapsed ? 'border-b' : ''}`}>
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
                    {actions && <div onClick={(e) => e.stopPropagation()}>{actions}</div>}
                </div>
                <ChevronDown className={`transform transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
            </div>
            {!isCollapsed && (
                <div className={paddingClass}>
                    {children}
                </div>
            )}
        </div>
    );
};
