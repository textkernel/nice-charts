'use strict';

import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import d3tip from 'd3-tip';
import styles from '../styles/styles.css';
import _ from 'lodash';

const curveFunctions = [
    'curveCatmullRom',
    'curveLinear',
    'curveStep',
    'curveStepBefore',
    'curveStepAfter',
    'curveBasis',
    'curveCardinal',
    'curveMonotoneX'
];

const dataTotal = (data, fromIndex = 1) => {
    if (!data.length || data.length < fromIndex) {
        return data;
    }
    return data.slice(fromIndex, data.length).reduce((result, item) => {
        if (!isNaN(item[1])) {
            result = result + item[1];
        }
        return result;
    }, 0);
};

const dataMax = (data, fromIndex = 1) => {
    if (!data.length || data.length < fromIndex) {

    }

    return data.slice(fromIndex, data.length).reduce((result, item) => {
        if (!isNaN(item[1]) && item[1] > result) {
            result = item[1];
        }
        return result;
    }, 0);
};

const defaultMargin = {
    top: 5,
    right: 20,
    bottom: 75,
    left: 55
};

const defaultTicks = {
    angle: -65,
    format: '%B'
};

const defaultDateTimeFormat = '%Y-%m-%d';

const defaultPointSize = 3;

class LineChart extends React.Component {

    constructor(props) {
        super(props);
        this.cRefs = {};
        this.xChart = null;
        this.yChart = null;

        this.state = {
            svg: null,
            data: props.data || [],
            total: dataTotal(props.data),
            ticks: Object.assign({}, defaultTicks, this.props.ticks),
            dateTimeFormat: this.props.dateTimeFormat || defaultDateTimeFormat,
            pointSize: Math.max(this.props.pointSize || defaultPointSize, 0),
            max: dataMax(props.data),
            margin: Object.assign({}, defaultMargin, props.margin)
        };
    }

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate(prevProps) {
        if (_.isEqual(this.props, prevProps)) {
            return false;
        }
        this.setState({
            data: this.props.data || [],
            total: dataTotal(this.props.data),
            ticks: Object.assign({}, defaultTicks, this.props.ticks),
            dateTimeFormat: this.props.dateTimeFormat || defaultDateTimeFormat,
            pointSize: Math.max(this.props.pointSize || defaultPointSize, 0),
            max: dataMax(this.props.data),
            margin: Object.assign({}, defaultMargin, this.props.margin)
        }, this.updateChart);
    }

    curveFunction() {
        let curveFunction = curveFunctions[0];
        if (!this.props.curveFunction || curveFunctions.indexOf(this.props.curveFunction) === -1) {
            return curveFunction;
        }
        return this.props.curveFunction;
    }

    axes() {
        return {
            x: this.state.data[0][0],
            y: this.state.data[0][1]
        };
    }

    width() {
        return this.props.width - this.state.margin.left - this.state.margin.right;
    }

    height() {
        return this.props.height - this.state.margin.top - this.state.margin.bottom;
    }

    setChartDomain(data) {
        const max = d3.max(data, d => d[1]);

        this.xChart.domain(
            d3.extent(data, d => this._getLabel(d))
        );

        this.yChart.domain([
            0,
            Math.max(Math.round(max + (max / 15)))
        ]);
    }

    gridlinesY(y) {
        return d3.axisLeft(y)
            .ticks(5)
            .scale(y);
    }

    valueLine(isTimeScale) {
        const curveFunction = this.curveFunction();
        return d3.line()
            .curve(d3[curveFunction])
            .x(d => {
                let x = this.xChart(this._getLabel(d));
                if (!isTimeScale) {
                    x += this.xChart.bandwidth() / 2;
                }
                return x;
            })
            .y(d => this.yChart(d[1]));
    }

    getArea(isTimeScale) {
        const curveFunction = this.curveFunction();
        return d3.area()
            .curve(d3[curveFunction])
            .x(d => {
                let x = this.xChart(this._getLabel(d));
                if (!isTimeScale) {
                    x += this.xChart.bandwidth() / 2;
                } 
                return x;
            })
            .y0(this.height())
            .y1(d => this.yChart(d[1]));
    }

    getTipRenderer(axes, isTimeScale) {
        const format = d3.format(',d');
        return d3tip()
            .attr('class', 'nc-bar-tip')
            .offset([-10, 0])
            .html(d => {
                let value = d[1],
                    label = this._getLabel(d);
                if (isTimeScale) {
                    const timeFormat = d3.timeFormat('%x');
                    label = timeFormat(this._getLabel(d));
                }
                return `<strong>${label}</strong><span>${value}</span>`;
            });
    }

    drawAxisX(svg, isTimeScale) {
        let axisBottom = d3.axisBottom(this.xChart);
        const ticksMax = this.state.ticks.max;

        if (isTimeScale) {
            axisBottom.tickFormat(d3.timeFormat(this.state.ticks.format));
            if (ticksMax && !isNaN(ticksMax)) {
                axisBottom.ticks(ticksMax);
            } else {
                if (this.state.data.length < 10) {
                    axisBottom.ticks(d3.timeMonth);
                }
            }
        }

        svg.append('g')
            .attr('class', 'nc-axis-x')
            .attr('transform', `translate(0, ${this.height()})`)
            .call(axisBottom)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', () => `rotate(${this.state.ticks.angle || -65})`);
    }

    updateAxisX(svg, isTimeScale) {
        let axisBottom = d3.axisBottom(this.xChart);
        const ticksMax = this.state.ticks.max;

        if (isTimeScale) {
            axisBottom.tickFormat(d3.timeFormat(this.state.ticks.format));
            if (ticksMax && !isNaN(ticksMax)) {
                axisBottom.ticks(ticksMax);
            } else {
                if (this.state.data.length < 10) {
                    axisBottom.ticks(d3.timeMonth);
                }
            }
        }

        svg.select('.nc-axis-x')
            .call(axisBottom)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', () => `rotate(${this.state.ticks.angle || -65})`);
    }

    drawAxisY(svg) {
        let axisLeft = d3.axisLeft(this.yChart).ticks(5);

        svg.append('g')
            .attr('class', 'nc-axis-y')
            .call(axisLeft)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('class', 'nc-axis-label')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text(this.axes().y);
    }

    updateAxisY(svg) {
        let axisLeft = d3.axisLeft(this.yChart).ticks(5);

        svg.select('.nc-axis-y')
            .transition()
            .duration(1000)
            .call(axisLeft);
    }

    drawGrid(svg) {
        svg.append('g')         
            .attr('class', 'nc-grid')
            .call(
                this.gridlinesY(this.yChart)
                    .tickSize(-this.width())
                    .tickFormat("")
            );
    }

    updateGrid(svg) {
        svg.select('.nc-grid')
            .transition()
            .duration(1000)
            .call(
                this.gridlinesY(this.yChart)
                    .tickSize(-this.width())
                    .tickFormat("")
            );
    }

    _getLabel(d) {
        if (typeof d[0] == 'object' && 'label' in d[0]) {
            return d[0].label;
        }
        return d[0];
    }

    drawChart() {
        let target = this.cRefs.LineChart,
            parseDate = d3.timeParse(this.state.dateTimeFormat || '%Y-%m-%d'),
            data = this.state.data.slice(1),
            svg = this.state.svg;

        var dates = data.reduce((result, v) => {
            const date = parseDate(this._getLabel(v));
            if (date) {
                result.push([
                    date,
                    v[1]
                ]);
            }
            return result;
        }, []);

        const useTimeScale = dates.length === data.length;

        let tip = this.getTipRenderer(
            this.axes(),
            useTimeScale
        );

        if (useTimeScale) {
            // Use time scale
            data = dates;
            this.xChart = d3.scaleTime().range([0, this.width()]);
        } else {
            this.xChart = d3.scaleBand().range([0, this.width()]);
        }

        this.yChart = d3.scaleLinear().range([
            this.height(),
            0
        ]);

        svg = d3.select(target).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox',`0 0 ${this.width() + this.state.margin.left + this.state.margin.right} ${this.height() + this.state.margin.top + this.state.margin.bottom}`)
            .attr('preserveAspectRatio','xMinYMin meet')
            .attr('class', 'nc-chart-svg nc-chart-line')
            .append('g')
            .attr('transform', `translate(${this.state.margin.left}, ${this.state.margin.top})`);

        this.setChartDomain(data);

        if (this.props.area) {
            let area = this.getArea(useTimeScale);
            svg.append("path")
                .data([data])
                .attr("class", "nc-area")
                .attr("d", area);
        }

        // Draw grid
        this.drawGrid(svg);

        const vl = this.valueLine(useTimeScale);

        // Draw line
        let path = svg.append("path")
            .attr('class', 'nc-line')
            .attr('d', vl(data))
            .attr('stroke', 'steelblue')
            .attr('stroke-width', '2')
            .attr('fill', 'none');

        svg.selectAll('dot')
            .data(data)
            .enter().append("circle")
            .attr('class', 'nc-line-dot')
            .attr('r', this.state.pointSize)
            .attr('cx', d => { 
                let x = this.xChart(this._getLabel(d));
                if (!useTimeScale) {
                    x += this.xChart.bandwidth() / 2;
                }
                return x;
            })
            .attr('cy', d => this.yChart(d[1]))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        let l = path.node().getTotalLength();

        path
            .attr('stroke-dasharray', `${l} ${l}`)
            .attr('stroke-dashoffset', l)
            .transition()
            .duration(1500)
            .ease(d3.easeCubicOut)
            .attr('stroke-dashoffset', 0);

        svg.call(tip);
        this.drawAxisX(svg, useTimeScale);
        this.drawAxisY(svg);
        this.setState({
            svg
        });
    }

    updateChart() {
        let parseDate = d3.timeParse(this.state.dateTimeFormat || '%Y-%m-%d'),
            data = this.state.data.slice(1),
            svg = this.state.svg;

        let dates = data.reduce((result, v) => {
            const date = parseDate(this._getLabel(v));
            if (date) {
                result.push([
                    date,
                    v[1]
                ]);
            }
            return result;
        }, []);

        const useTimeScale = dates.length === data.length;

        let tip = this.getTipRenderer(
            this.axes(),
            useTimeScale
        );

        if (useTimeScale) {
            // Use time scale
            data = dates;
            this.xChart = d3.scaleTime().rangeRound([
                0,
                this.width()
            ]);
        } else {
            this.xChart = d3.scaleBand().range([
                0,
                this.width()
            ]);
        }

        svg.call(tip);
        this.setChartDomain(data);

        const vl = this.valueLine(useTimeScale);
        let path = svg.select('.nc-line');

        path
            .attr('d', vl(data))
            .transition()
            .duration(500)
            .attr('stroke-dasharray', () => {
                const l = path.node().getTotalLength();
                return `${l} ${l}`;
            });

        if (this.props.area) {
            let area = this.getArea(useTimeScale);
            svg.select('.nc-area')
                .data([data])
                .attr("d", area);
        }

        let dot = svg.selectAll('.nc-line-dot')
            .data(data);

        dot
            .attr('r', this.state.pointSize)
            .attr('cx', d => { 
                let x = this.xChart(this._getLabel(d));
                if (!useTimeScale) {
                    x += this.xChart.bandwidth() / 2;
                }
                return x;
            })
            .attr('cy', d => this.yChart(d[1]));

        dot
            .enter()
            .append("circle")
            .attr('class', 'nc-line-dot')
            .attr('r', 0)
            .attr('cx', d => { 
                let x = this.xChart(this._getLabel(d));
                if (!useTimeScale) {
                    x += this.xChart.bandwidth() / 2;
                }
                return x;
            })
            .attr('cy', d => this.yChart(d[1]))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .transition()
            .duration(250)
            .attr('r', this.state.pointSize);

        dot
            .exit()
            .transition()
            .duration(250)
            .attr('r', 0)
            .remove();

        this.updateGrid(svg);
        this.updateAxisX(svg, useTimeScale);
        this.updateAxisY(svg);
        this.setState({
            svg
        });
    }

    render() {
        return <div className="nc-chart" ref={n => this.cRefs["LineChart"] = n}>
            <canvas width={ this.props.width } height={ this.props.height }></canvas>
            &nbsp;
        </div>;
    }

}


LineChart.propTypes = {
    area: PropTypes.bool,
    curveFunction: PropTypes.string,
    data: PropTypes.array.isRequired,
    margin: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number
    }),
    ticks: PropTypes.shape({
        angle: PropTypes.number,
        format: PropTypes.string,
        max: PropTypes.number
    }),
    dateTimeFormat: PropTypes.string,
    pointSize: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number
};

LineChart.defaultProps = {
    area: false,
    margin: defaultMargin,
    ticks: defaultTicks,
    dateTimeFormat: defaultDateTimeFormat,
    pointSize: defaultPointSize,
    width: 600,
    height: 300
};

export default LineChart;
