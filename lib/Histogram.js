'use strict';

import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import d3tip from 'd3-tip';
import styles from '../styles/styles.css';
import _ from 'lodash';

const scales = [
    'scaleBand',
    'scaleLinear'
];

const defaultProps = {
    width: 600,
    height: 300,
    margin: {
        top: 0,
        right: 0,
        bottom: 75,
        left: 50
    },
    xAxis: {
        ticks: {
            angle: -65,
            prefix: null,
            specifier: ',d',
            fontSize: ''
        }
    },
    yAxis: {
        ticks: {
            prefix: null,
            specifier: ',d',
            fontSize: ''
        }
    },
    nonLinear: false
};

class Histogram extends React.Component {

    constructor(props) {
        super(props);
        this.cRefs = {};
        this.xChart = null;
        this.yChart = null;

        this.state = {
            svg: null,
            data: props.data || [],
            margin: Object.assign({}, defaultProps.margin, props.margin),
            xAxis: _.merge({}, defaultProps.xAxis, props.xAxis),
            yAxis: _.merge({}, defaultProps.yAxis, props.yAxis),
            total: props.data.slice(1, props.data.length).reduce((result, item) => {
                if (!isNaN(item[1])) {
                    result = result + item[1];
                }
                return result;
            }, 0),
            max: props.data.slice(1, props.data.length).reduce((result, item) => {
                if (!isNaN(item[1]) && item[1] > result) {
                    result = item[1];
                }
                return result;
            }, 0)
        };
    }

    componentDidMount() {
        this.drawChart();
    }

    componentWillReceiveProps(nextProps) {
        const { props } = this;
        if (_.isEqual(props, nextProps)) {
            return false;
        }
        this.setState({
            data: props.data,
            margin: Object.assign({}, this.state.margin, props.margin),
            xAxis: _.merge({}, defaultProps.xAxis, props.xAxis),
            yAxis: _.merge({}, defaultProps.yAxis, props.yAxis),
        }, () => {
            if (nextProps.nonLinear !== props.nonLinear) {
                this.drawChart();
                return false;
            }
            this.updateChart();
        });
    }

    axes() {
        return {
            x: this.state.data[0][0],
            y: this.state.data[0][1]
        };
    }

    width(){
        return this.props.width - this.state.margin.left - this.state.margin.right;
    }

    height(){
        return this.props.height - this.state.margin.top - this.state.margin.bottom;
    }

    color(){
        return d3.scaleOrdinal(d3.schemeCategory20c);
    }

    setChartDomain(data, step) {
        if (!this.props.nonLinear) {
            this.xChart.domain([
                d3.min(data, d => d[0]), 
                d3.max(data, d => d[0]) + step
            ]);
        } else {
            this.xChart.domain(data.map(d => String(d[0])));
        }

        this.yChart.domain([
            0,
            d3.max(data, d => d[1])
        ]);
    }

    gridlinesY(y) {
        return d3.axisLeft(y)
            .ticks(5)
            .scale(y);
    }

    getTipRenderer(axes, step, nonLinear) {
        const { xAxis } = this.state;
        const format = d3.format(xAxis.ticks.specifier);
        
        return d3tip()
            .attr('class', 'nc-bar-tip')
            .offset([-10, 0])
            .html(d => {
                if (nonLinear) {
                    return `<strong>${ d[0] }</strong><span>${ format(d[1]) }</span>`;
                }
                let values = {
                    from: format(d[0]),
                    to: format(d[0] + step)
                };
                if (xAxis.ticks.prefix) {
                    Object.keys(values).map(k => {
                        values[k] = `${ xAxis.ticks.prefix }${ values[k] }`;
                    });
                }
                let label = `${ values.from } - ${ values.to }`;
                return `<strong>${ label }</strong><span>${ format(d[1]) }</span>`;
            });
    }

    drawAxisX(svg) {
        let axisBottom = d3.axisBottom(this.xChart);
        const { xAxis } = this.state;
        const format = d3.format(xAxis.ticks.specifier);

        if (!this.props.nonLinear) {
            if (xAxis.ticks.prefix) {
                axisBottom.tickFormat(d => `${ xAxis.ticks.prefix }${ format(d) }`);
            } else {
                axisBottom.tickFormat(d => `${ format(d) }`);
            }
        }
        svg.append('g')
            .attr('class', 'nc-axis-x')
            .style('font-size', xAxis.ticks.fontSize)
            .attr('transform', `translate(0, ${ this.height() })`)
            .call(
                axisBottom
            )
            .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', () => {
                    let deg = xAxis.ticks.angle || -65;
                    return `rotate(${ deg })`;
                });
        return svg;
    }

    updateAxisX(svg) {
        let axisBottom = d3.axisBottom(this.xChart);
        const { xAxis } = this.state;
        const format = d3.format(xAxis.ticks.specifier);

        if (!this.props.nonLinear) {
            if (xAxis.ticks.prefix) {
                axisBottom.tickFormat(d => `${ xAxis.ticks.prefix }${ format(d) }`);
            } else {
                axisBottom.tickFormat(d => `${ format(d) }`);
            }
        }
        svg.select('.nc-axis-x')
            .style('font-size', xAxis.ticks.fontSize)
            .call(
                axisBottom 
            )
            .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', () => {
                    let deg = xAxis.ticks.angle || -65;
                    return `rotate(${ deg })`;
                });
        return svg;
    }

    drawAxisY(svg) {
        const { yAxis } = this.state;
        let axisLeft = d3.axisLeft(this.yChart).ticks(5);
        const format = d3.format(yAxis.ticks.specifier);

        if (yAxis.ticks.prefix) {
            axisLeft.tickFormat(d => `${ yAxis.ticks.prefix }${ format(d) }`);
        } else {
            axisLeft.tickFormat(d => `${ format(d) }`);
        }

        svg.append('g')
            .attr('class', 'nc-axis-y')
            .style('font-size', yAxis.ticks.fontSize)
            .call(axisLeft);
        return svg;
    }

    updateAxisY(svg) {
        const { yAxis } = this.state;
        let axisLeft = d3.axisLeft(this.yChart).ticks(5);
        const format = d3.format(yAxis.ticks.specifier);

        if (yAxis.ticks.prefix) {
            axisLeft.tickFormat(d => `${ yAxis.ticks.prefix }${ format(d) }`);
        } else {
            axisLeft.tickFormat(d => `${ format(d) }`);
        }

        svg.select('.nc-axis-y')
            .style('font-size', yAxis.ticks.fontSize)
            .transition()
            .duration(1000)
            .call(axisLeft);
        return svg;
    }

    drawGrid(svg) {
        svg.append('g')         
            .attr('class', 'nc-grid')
            .call(
                this.gridlinesY(this.yChart)
                .tickSize(-this.width())
                .tickFormat("")
            );
        return svg;
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
        return svg;
    }

    _getLabel(d) {
        if (d[0] && typeof d[0] == 'object' && 'label' in d[0]) {
            return d[0].label;
        }
        return d[0];
    }

    drawChart() {
        let target = this.cRefs.Histogram,
            data = this.state.data.slice(1),
            step = data[1][0] - data[0][0],
            tip = this.getTipRenderer(
                this.axes(), 
                step,
                this.props.nonLinear
            ),
            svg = this.state.svg,
            binWidth = parseFloat(this.width() / data.length) - 1;

        const xRange = [
            0, 
            this.width()
        ];
        const yRange = [
            this.height(),
            0
        ];
        if (!this.props.nonLinear) {
            this.xChart = d3.scaleLinear().range(xRange);
        } else {
            this.xChart = d3.scaleBand().range(xRange);
        }

        this.yChart = d3.scaleLinear().range(yRange);

        svg = d3.select(target).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox',`0 0 ${this.width() + this.state.margin.left + this.state.margin.right} ${this.height() + this.state.margin.top + this.state.margin.bottom}`)
            .attr('preserveAspectRatio','xMinYMin meet')
            .attr('class', 'nc-chart-svg nc-chart-bar')
            .append('g')
            .attr('transform', `translate(${this.state.margin.left}, ${this.state.margin.top})`);

        svg.call(tip);
        this.setChartDomain(data, step);
        svg = this.drawGrid(svg);

        var g = svg.append('g')
            .attr('class', 'nc-bar-wrapper')
            .selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'nc-bar-group')
            .attr('transform', d => `translate(${this.xChart(d[0])}, 0)`);

        g
            .append('rect')
            .attr('y', this.height())
            .attr('width', binWidth)
            .attr('height', 0)
            .attr('class', 'nc-bar histogram')
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)

        g.selectAll('.nc-bar')
            .transition()
            .duration(1000)
            .delay((d, i) => {
                return i * 10;
            })
            .attr('y', d => this.yChart(d[1]))
            .attr('height', d => (this.height() - this.yChart(d[1])));

        svg = this.drawAxisX(svg);
        svg = this.drawAxisY(svg);

        this.setState({
            svg
        });
    }

    updateChart() {
        let data = this.state.data.slice(1),
            step = data[1][0] - data[0][0],
            binWidth = parseFloat(this.width() / data.length) - 1,
            svg = this.state.svg;
        
        this.setChartDomain(data, step);
        let barGroup = svg.selectAll('.nc-bar-group');

        barGroup
            .data(data)
            .attr('transform', d => `translate(${this.xChart(d[0])}, 0)`)
            .select('rect')
            .attr('width', binWidth)
            .transition()
            .duration(1000)
            .delay((d, i) => {
                return i * 10;
            })
            .attr('y', d => this.yChart(d[1]))
            .attr('height', d => this.height() - this.yChart(d[1]));

        barGroup
            .exit()
            .select('rect')
            .transition()
            .duration(500)
            .attr('x', this.xChart(0))
            .attr('width', 0)
            .style('fill-opacity', 1e-6)
            .remove();

        svg = this.updateAxisY(svg);
        svg = this.updateAxisX(svg);
        svg = this.updateGrid(svg);

        this.setState({
            svg
        });
    }

    render() {
        return <div className="nc-chart" ref={n => this.cRefs["Histogram"] = n}>
            <canvas width={ this.props.width } height={ this.props.height }></canvas>
            &nbsp;
        </div>;
    }

}

Histogram.propTypes = {
    data: PropTypes.array,
    margin: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number
    }),
    xAxis: PropTypes.shape({
        ticks: PropTypes.shape({
            angle: PropTypes.number,
            prefix: PropTypes.string,
            specifier: PropTypes.string,
            fontSize: PropTypes.string
        })
    }),
    yAxis: PropTypes.shape({
        ticks: PropTypes.shape({
            prefix: PropTypes.string,
            specifier: PropTypes.string,
            fontSize: PropTypes.string
        })
    }),
    nonLinear: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number
};

Histogram.defaultProps = defaultProps;

export default Histogram;
