import { useEffect } from 'react';
import * as d3 from 'd3';
import { BaseType } from 'd3';

/** Centralized tooltip management */
export class TooltipManager {
  private static instance: TooltipManager;
  private tooltip: d3.Selection<HTMLDivElement, null, BaseType, unknown>;

  private constructor() {
    this.tooltip = d3.select('body').selectAll<HTMLDivElement, unknown>('.d3-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('backdrop-filter', 'blur(7px)');
  }

  /** Singleton pattern to ensure only one tooltip is created */
  public static getInstance(): TooltipManager {
    if (!TooltipManager.instance) {
      TooltipManager.instance = new TooltipManager();
    }
    return TooltipManager.instance;
  }

  /** Show tooltip with specific content */
  public show(event: MouseEvent | React.MouseEvent, content: string) {
    this.tooltip
      .style('visibility', 'visible')
      .html(content)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY + 10}px`);
  }

  /** Hide tooltip */
  public hide() {
    this.tooltip.style('visibility', 'hidden');
  }

  /** Remove tooltip completely */
  public remove() {
    this.tooltip.remove();
  }
}

/** React hook for tooltip management */
export const useTooltip = () => {
  useEffect(() => {
    const tooltipManager = TooltipManager.getInstance();
    return () => {
      tooltipManager.remove();
    };
  }, []);
  return TooltipManager.getInstance();
};

/** Convenient tooltip handlers for components */
export const tooltipHandlers = {
  show: (event: React.MouseEvent, content: string) => {
    TooltipManager.getInstance().show(event, content);
  },
  hide: () => {
    TooltipManager.getInstance().hide();
  }
};