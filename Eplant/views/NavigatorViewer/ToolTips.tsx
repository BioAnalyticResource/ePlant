import React, { ReactNode,useEffect, useRef, useState } from 'react';

interface ToolTipProps {
  content: ReactNode;
  children: ReactNode;
  delayDuration?: number;
}

const ToolTip: React.FC<ToolTipProps> = ({ content, children, delayDuration = 200 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  const handleMouseEnter = (event: React.MouseEvent<SVGGElement>) => {
    const rect = (event.currentTarget as SVGGElement).getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX + (rect.width / 2)
    });
    setIsVisible(true);
  };
  
  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <g
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </g>
      {isVisible && (
        <foreignObject
          x={position.left - 100} // Center the tooltip by offsetting half its width
          y={position.top}
          width="200"
          height="100"
          style={{ overflow: 'visible' }}
        >
          <div
            className="fixed z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-md shadow-lg max-w-sm transform -translate-x-1/2"
            style={{
              backdropFilter: 'blur(7px)',
            }}
          >
            {content}
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"
            />
          </div>
        </foreignObject>
      )}
    </>
  );
};

export default ToolTip;