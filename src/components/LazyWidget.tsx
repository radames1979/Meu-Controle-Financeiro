import React, { Suspense } from 'react';
import { useInView } from 'react-intersection-observer';

interface LazyWidgetProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    placeholderHeight?: string;
}

export const LazyWidget: React.FC<LazyWidgetProps> = ({ 
    children, 
    fallback, 
    placeholderHeight = '200px' 
}) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px', // Start loading before it enters viewport
    });

    return (
        <div ref={ref} style={{ minHeight: inView ? 'auto' : placeholderHeight }}>
            {inView ? (
                <Suspense fallback={fallback || <DefaultFallback height={placeholderHeight} />}>
                    {children}
                </Suspense>
            ) : (
                <DefaultFallback height={placeholderHeight} />
            )}
        </div>
    );
};

const DefaultFallback = ({ height }: { height: string }) => <SkeletonBlock height={height} />;

export const SkeletonBlock = ({ height }: { height: string }) => (
    <div
        className="w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl"
        style={{ height }}
    />
);
