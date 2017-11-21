'use strict';

import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import d3tip from 'd3-tip';
import styles from '../styles/styles.css';

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
            max: dataMax(props.data)
        };
    }

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate(prevProps) {
        if (Object.is(prevProps.data, this.props.data)) {
            return false;
        }
        this.setState({
            data: this.props.data || [],
            total: dataTotal(this.props.data),
            max: dataMax(this.props.data)
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
        return this.props.width - this.props.margin.left - this.props.margin.right;
    }

    height() {
        return this.props.height - this.props.margin.top - this.props.margin.bottom;
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
            .attr('class', 'mi-bar-tip')
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
        const ticksMax = this.props.ticks.max;

        if (isTimeScale) {
            axisBottom.tickFormat(d3.timeFormat(this.props.ticks.format));
            if (ticksMax && !isNaN(ticksMax)) {
                axisBottom.ticks(ticksMax);
            } else {
                if (this.state.data.length < 10) {
                    axisBottom.ticks(d3.timeMonth);
                }
            }
        }

        svg.append('g')
            .attr('class', 'mi-axis-x')
            .attr('transform', `translate(0, ${this.height()})`)
            .call(axisBottom)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', () => `rotate(${this.props.ticks.angle || -65})`);
    }

    updateAxisX(svg, isTimeScale) {
        let axisBottom = d3.axisBottom(this.xChart);
        const ticksMax = this.props.ticks.max;

        if (isTimeScale) {
            axisBottom.tickFormat(d3.timeFormat(this.props.ticks.format));
            if (ticksMax && !isNaN(ticksMax)) {
                axisBottom.ticks(ticksMax);
            } else {
                if (this.state.data.length < 10) {
                    axisBottom.ticks(d3.timeMonth);
                }
            }
        }

        svg.select('.mi-axis-x')
            .call(axisBottom)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', () => `rotate(${this.props.ticks.angle || -65})`);
    }

    drawAxisY(svg) {
        let axisLeft = d3.axisLeft(this.yChart).ticks(5);

        svg.append('g')
            .attr('class', 'mi-axis-y')
            .call(axisLeft)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('class', 'mi-axis-label')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text(this.axes().y);
    }

    updateAxisY(svg) {
        let axisLeft = d3.axisLeft(this.yChart).ticks(5);

        svg.select('.mi-axis-y')
            .transition()
            .duration(1000)
            .call(axisLeft);
    }

    drawGrid(svg) {
        svg.append('g')         
            .attr('class', 'mi-grid')
            .call(
                this.gridlinesY(this.yChart)
                    .tickSize(-this.width())
                    .tickFormat("")
            );
    }

    updateGrid(svg) {
        svg.select('.mi-grid')
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
            parseDate = d3.timeParse('%Y-%m-%d'),
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
            .attr('viewBox',`0 0 ${this.width() + this.props.margin.left + this.props.margin.right} ${this.height() + this.props.margin.top + this.props.margin.bottom}`)
            .attr('preserveAspectRatio','xMinYMin meet')
            .attr('class', 'mi-chart-svg mi-chart-line')
            .append('g')
            .attr('transform', `translate(${this.props.margin.left}, ${this.props.margin.top})`);

        this.setChartDomain(data);

        if (this.props.area) {
            let area = this.getArea(useTimeScale);
            svg.append("path")
                .data([data])
                .attr("class", "mi-area")
                .attr("d", area);
        }

        // Draw grid
        this.drawGrid(svg);

        const vl = this.valueLine(useTimeScale);

        // Draw line
        let path = svg.append("path")
            .attr('class', 'mi-line')
            .attr('d', vl(data))
            .attr('stroke', 'steelblue')
            .attr('stroke-width', '2')
            .attr('fill', 'none');

        svg.selectAll('dot')
            .data(data)
            .enter().append("circle")
            .attr('class', 'mi-line-dot')
            .attr('r', 3)
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

        if (this.props.animate) {
            var l = path.node().getTotalLength();
            path
                .attr('stroke-dasharray', `${l} ${l}`)
                .attr('stroke-dashoffset', l)
                .transition()
                .duration(1500)
                .ease(d3.easeCubicOut)
                .attr('stroke-dashoffset', 0);
        } else {
            path
                .attr('stroke-dasharray', `${l} ${l}`)
                .attr('stroke-dashoffset', 0);
        }

        svg.call(tip);
        this.drawAxisX(svg, useTimeScale);
        this.drawAxisY(svg);
        this.setState({
            svg: svg
        });
    }

    updateChart() {
        let parseDate = d3.timeParse('%Y-%m-%d'),
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
        let path = svg.select('.mi-line');

        path
            .attr('d', vl(data))
            .transition()
            .duration(500)
            .attr('stroke-dasharray', () => {
                const l = path.node().getTotalLength();
                return `${l} ${l}`;
            });

        if (this.props.area) {
            area = this.getArea(useTimeScale);
            svg.select('.mi-area')
                .data([data])
                .attr("d", area);
        }

        let dot = svg.selectAll('.mi-line-dot')
            .data(data);

        dot
            .attr('r', 3)
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
            .attr('class', 'mi-line-dot')
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
            .attr('r', 3);

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
            svg: svg
        });
    }

    render() {
        return <div className="nc-chart" ref={n => this.cRefs["LineChart"] = n}>
            <canvas width={ this.props.width } height={ this.props.height }></canvas>
            &nbsp;
        </div>
    }

}


LineChart.propTypes = {
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
    width: PropTypes.number,
    height: PropTypes.number
};

LineChart.defaultProps = {
    margin: {
        top: 5,
        right: 20,
        bottom: 75,
        left: 55
    },
    ticks: {
        angle: -65,
        format: '%B'
    },
    width: 600,
    height: 300
};

export default LineChart;
