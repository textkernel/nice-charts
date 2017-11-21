'use strict';

import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import d3tip from 'd3-tip';

class Histogram extends React.Component {

    constructor(props) {
        super(props);
        this.cRefs = {};
        this.xChart = null;
        this.yChart = null;

        this.state = {
            svg: null,
            data: props.data || [],
            margin: Object.assign({}, {
                top: 5,
                right: 20,
                bottom: 75,
                left: 55
            }, props.margin),
            ticks: Object.assign({}, {
                angle: -65,
                prefix: null
            }, props.ticks),
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

    componentWillReceiveProps(props) {
        if (Object.is(props.data, this.props.data)) {
            return false;
        }
        this.setState({
            data: props.data,
            margin: Object.assign({}, this.state.margin, props.margin),
            ticks: Object.assign({}, this.state.ticks, props.ticks)
        }, this.updateChart);
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
        this.xChart.domain([
            d3.min(data, d => d[0]), 
            d3.max(data, d => d[0]) + step
        ]);
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

    getTipRenderer(axes, step) {
        const format = d3.format(',d');
        
        return d3tip()
            .attr('class', 'nc-bar-tip')
            .offset([-10, 0])
            .html(d => {
                let values = {
                    from: format(d[0]),
                    to: format(d[0] + step)
                };
                if (this.state.ticks.prefix) {
                    Object.keys(values).map(k => {
                        values[k] = `${this.state.ticks.prefix}${values[k]}`;
                    });
                }
                let label = `${values.from} - ${values.to}`;
                return `<strong>${label}</strong><span>${format(d[1])}</span>`;
            });
    }

    drawAxisX(svg) {
        let axisBottom = d3.axisBottom(this.xChart);
        const format = d3.format(',d');

        if (this.state.ticks.prefix) {
            axisBottom.tickFormat(d => `${this.state.ticks.prefix}${format(d)}`);
        } else {
            axisBottom.tickFormat(d => `${format(d)}`);
        }
        svg.append('g')
            .attr('class', 'nc-axis-x')
            .attr('transform', `translate(0, ${this.height()})`)
            .call(
                axisBottom
            )
            .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', () => {
                    let deg = -65;
                    if (this.state.ticks.angle) {
                        deg = this.state.ticks.angle;
                    }
                    return `rotate(${deg})`;
                });
        return svg;
    }

    updateAxisX(svg) {
        let axisBottom = d3.axisBottom(this.xChart);
        const format = d3.format(',d');

        if (this.state.ticks.prefix) {
            axisBottom.tickFormat(d => `${this.state.ticks.prefix}${format(d)}`);
        } else {
            axisBottom.tickFormat(d => `${format(d)}`);
        }
        svg.select('.nc-axis-x')
            .call(
                axisBottom 
            )
            .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', () => {
                    let deg = -65;
                    if (this.state.ticks.angle) {
                        deg = this.state.ticks.angle;
                    }
                    return `rotate(${deg})`;
                });
        return svg;
    }

    drawAxisY(svg) {
        let axisLeft = d3.axisLeft(this.yChart).ticks(5);
        svg.append('g')
            .attr('class', 'nc-axis-y')
            .call(axisLeft);
        return svg;
    }

    updateAxisY(svg) {
        let axisLeft = d3.axisLeft(this.yChart).ticks(5);
        svg.select('.nc-axis-y')
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
                step
            ),
            svg = this.state.svg,
            binWidth = parseFloat(this.width() / data.length) - 1;

        this.xChart = d3.scaleLinear().range([
            0, 
            this.width()
        ]);
        this.yChart = d3.scaleLinear().range([
            this.height(),
            0
        ]);

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
            .attr('y', this.props.animate ? this.height() : d => this.yChart(d[1]))
            .attr('width', binWidth)
            .attr('height', this.props.animate ? 0 : d => (this.height() - this.yChart(d[1])))
            .attr('class', 'nc-bar histogram')
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)

        if (this.props.animate) {
            g.selectAll('.nc-bar')
                .transition()
                .duration(1000)
                .delay((d, i) => {
                    return i * 10;
                })
                .attr('y', d => this.yChart(d[1]))
                .attr('height', d => (this.height() - this.yChart(d[1])));
        }
        svg = this.drawAxisX(svg);
        svg = this.drawAxisY(svg);

        this.setState({
            svg: svg
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
            svg: svg
        });
    }

    render() {
        return <div className="nc-chart" ref={n => this.cRefs["Histogram"] = n}>
            <canvas width={ this.props.width } height={ this.props.height }></canvas>
            &nbsp;
        </div>
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
    ticks: PropTypes.shape({
        angle: PropTypes.number,
        prefix: PropTypes.string
    }),
    width: PropTypes.number,
    height: PropTypes.number
};

Histogram.defaultProps = {
    width: 600,
    height: 300
};

export default Histogram;
