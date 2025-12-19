import {
  Component,
  ComponentInterface,
  h,
  Host,
  Prop,
  Watch,
} from '@stencil/core';
import { loadD3JS } from '../../../3d-party/d3js';
import { debounce } from '../../../utils/utils';
import { chartColors, convertToHex } from '../chart-colors';
import { getColorScale, getPieData } from '../pie/pie';

/**
 * @label Chart Doughnut
 * @name chart-doughnut
 * @description A doughnut chart is a circular chart with a blank center. The chart is similar to a pie chart with the center cut out. The area in the center can be used to display information.
 * @category Charts
 * @tag chart
 * @img /assets/img/chart-doughnut.webp
 * @imgDark /assets/img/chart-doughnut-dark.webp
 */
@Component({
  tag: 'goat-chart-doughnut',
  styleUrl: 'chart-doughnut.scss',
  shadow: true,
})
export class ChartDoughnut implements ComponentInterface {
  private svgElement?: SVGElement;

  @Prop({ reflect: true }) width: number = 0;
  @Prop({ reflect: true }) margin: number = 10;
  @Prop({ reflect: true }) showLabels: boolean = true;

  @Prop() data: any = [];

  @Prop() label: string;

  @Watch('width')
  @Watch('margin')
  @Watch('showLabels')
  @Watch('data')
  async handlePropChange(
    _newValue: string,
    _oldValue: string,
    _propName: string,
  ) {
    this.updateChart();
  }

  getRadius() {
    // The radius of the pieplot. Subtract a bit of margin and space for labels.
    return this.width / 2 - this.margin - 100;
  }

  getDoughnutArc(radius) {
    const d3 = window['d3'];
    return d3
      .arc()
      .innerRadius(radius * 0.72) // This is the size of the donut hole
      .outerRadius(radius);
  }

  // Another arc that won't be drawn. Just for labels positioning
  getLabelsArc() {
    const d3 = window['d3'];
    const radius = this.getRadius();
    return d3
      .arc()
      .innerRadius(radius + 10)
      .outerRadius(radius + 10);
  }

  getTotal() {
    return this.data.reduce((total, d) => {
      return total + d.value;
    }, 0);
  }

  updateTotal(
    currentNumber: number,
    endNumber: number,
    element: any,
    speed = 1,
  ) {
    speed = parseInt(speed + '');
    element.text(currentNumber);
    if (currentNumber != endNumber) {
      setTimeout(() => {
        if (Math.abs(currentNumber - endNumber) / speed < 1) {
          currentNumber = endNumber;
          element.text(currentNumber);
          return;
        }

        this.updateTotal(
          currentNumber < endNumber
            ? currentNumber + speed
            : currentNumber - speed,
          endNumber,
          element,
          speed,
        );
      }, 30); //Delay a bit before calling the function again.
    }
  }

  updateChart = debounce(() => {
    const d3 = window['d3'];
    const radius = this.getRadius();
    const pieData = getPieData(this.data);
    // set the color scale
    const colorScale = d3
      .scaleOrdinal()
      .domain(this.data.map(d => d.name))
      .range(chartColors);

    this.setSVGDimensions();

    const total = this.getTotal();
    d3.select(this.svgElement)
      .select('.title')
      .transition()
      .tween('text', function () {
        const selection = d3.select(this); // selection of node being transitioned
        const start = d3.select(this).text(); // start value prior to transition
        const end = total; // specified end value
        const interpolator = d3.interpolateNumber(start, end); // d3 interpolator

        return function (t) {
          selection.text(Math.round(interpolator(t)));
        }; // return value
      })
      .duration(500);

    const $chartContainer = d3
      .select(this.svgElement)
      .select('.chart-container');

    const doughnutArc = this.getDoughnutArc(radius);
    this.renderArcPaths(pieData, doughnutArc, colorScale);

    if (this.showLabels) {
      // Another arc that won't be drawn. Just for labels positioning
      const labelsArc = this.getLabelsArc();

      // Add the polylines between chart and labels:
      $chartContainer
        .selectAll('.item-polyline')
        .data(pieData)
        .join('polyline')
        .attr('class', 'item-polyline')
        .transition()
        .duration(500)
        .attr('points', function (d) {
          const posA = doughnutArc.centroid(d); // line insertion in the slice
          const posB = labelsArc.centroid(d); // line break: we use the other arc generator that has been built only for that
          const posC = labelsArc.centroid(d); // Label position = almost the same as posB
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
          posC[0] = radius * (midAngle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
          return [posA, posB, posC];
        });

      $chartContainer
        .selectAll('.item-label')
        .data(pieData)
        .join('text')
        .attr('class', 'item-label')
        .transition()
        .duration(500)
        .text(function (d) {
          return d.data.label;
        })
        .attr('transform', d => {
          const pos = labelsArc.centroid(d);
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          pos[0] = radius * (midAngle < Math.PI ? 1 : -1);
          return `translate(${pos})`;
        })
        .style('text-anchor', d => {
          const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          return midangle < Math.PI ? 'start' : 'end';
        });
    }
  }, 300);

  setSVGDimensions() {
    const d3 = window['d3'];
    const svg = d3.select(this.svgElement);
    svg.attr('width', this.width).attr('height', this.width);
    svg
      .select('.chart-container')
      //.transition()
      //.duration(500)
      .attr('transform', `translate(${this.width / 2},${this.width / 2})`);
  }

  renderArcPaths(pieData: any, doughnutArc: any, colorScale: any) {
    const d3 = window['d3'];

    const $arcContainer = d3.select(this.svgElement).select('.arc-container');

    const $arcPaths = $arcContainer
      .selectAll('.arc')
      .data(pieData)
      .join('path')
      .attr('class', 'arc')
      .on('mouseover', function (_e, d) {
        this.style.fill =
          convertToHex(d.data.hoverColor) ||
          convertToHex(d.data.color) ||
          colorScale(d.data.label).hoverColor;
      })
      .on('mouseout', function (_e, d) {
        this.style.fill =
          convertToHex(d.data.color) || colorScale(d.data.label).color;
      });

    $arcPaths
      .transition()
      .duration(500)
      .attr('d', doughnutArc)
      .attr('fill', d => {
        return convertToHex(d.data.color) || colorScale(d.data.label).color;
      });
  }

  async initializeChart() {
    if (!window['d3']) {
      await loadD3JS();
    }

    const d3 = window['d3'];
    const radius = this.getRadius();
    const pieData = getPieData(this.data);
    const colorScale = getColorScale(this.data);

    this.setSVGDimensions();

    const $chartContainer = d3
      .select(this.svgElement)
      .select('.chart-container');

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    const doughnutArc = this.getDoughnutArc(radius);
    this.renderArcPaths(pieData, doughnutArc, colorScale);

    d3.select(this.svgElement).select('.title').text(this.getTotal());

    if (this.showLabels) {
      const labelsArc = this.getLabelsArc();

      $chartContainer
        .selectAll('item-polyline')
        .data(pieData)
        .join('polyline')
        .attr('class', 'item-polyline')
        .attr('points', d => {
          const posA = doughnutArc.centroid(d); // line insertion in the slice
          const posB = labelsArc.centroid(d); // line break: we use the other doughtnutArc generator that has been built only for that
          const posC = labelsArc.centroid(d); // Label position = almost the same as posB
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
          posC[0] = radius * 1.1 * (midAngle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
          return [posA, posB, posC];
        });

      $chartContainer
        .selectAll('item-label')
        .data(pieData)
        .join('text')
        .text(function (d) {
          return d.data.label;
        })
        .attr('class', 'item-label')
        .attr('transform', d => {
          const pos = labelsArc.centroid(d);
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          pos[0] = radius * 1.15 * (midAngle < Math.PI ? 1 : -1);
          return `translate(${pos})`;
        })
        .style('text-anchor', d => {
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          return midAngle < Math.PI ? 'start' : 'end';
        });
    }
  }

  async componentDidLoad() {
    this.initializeChart();
  }

  render() {
    return (
      <Host>
        <div class={'chart'}>
          <svg ref={el => (this.svgElement = el)}>
            <g class={'chart-container'}>
              <g class={'arc-container'}></g>
              <text class="title" text-anchor="middle"></text>
              <text class="label" text-anchor="middle" y={16}>
                {this.label}
              </text>
            </g>
          </svg>
        </div>
      </Host>
    );
  }
}
