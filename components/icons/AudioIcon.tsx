import React from 'react';

export const AudioIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 20a4 4 0 0 0 4-4V8a4 4 0 0 0-8 0v8a4 4 0 0 0 4 4Z" />
        <path d="M12 4v4" />
        <path d="M8 8v8" />
        <path d="M16 8v8" />
        <path d="M4 14v.01" />
        <path d="M20 14v.01" />
    </svg>
);