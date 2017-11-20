'use strict';

import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

const truncate = (string, { length = 25, omission = '...' }) => {
    if (string.length <= length) {
        return string;
    }
    return `${string.slice(0, length + 1)}${omission}`;
};

class BarTable extends React.Component {

    constructor(props) {
        super(props);
        this.cRefs = {};
        this.xChart = null;
        this.yChart = null;

        this.state = {
            svg: null,
            data: props.data || [],
            labels: Object.assign({}, {
                maxLength: 40
            }, props.labels),
            margin: Object.assign({}, {
                top: 5,
                right: 20,
                bottom: 75,
                left: 55
            }, props.margin),
            barMargin: props.barMargin,
            aspectRatioMultiplier: props.aspectRatioMultiplier
        };
    }

    componentDidMount() {
        this.drawChart();
    }

    componentWillReceiveProps(props) {
        if (Object.is(props, this.props)) {
            return false;
        }
        this.setState({
            data: props.data,
            margin: Object.assign({}, this.state.margin, props.margin),
            labels: Object.assign({}, this.state.labels, props.labels),
            barMargin: props.barMagin || 3,
            aspectRatioMultiplier: props.aspectRatioMultiplier || 1.363636364
        }, function(){
            this.drawChart(true);
        });
    }

    width(){
        return this.props.width - this.state.margin.left - this.state.margin.right;
    }

    height(){
        return this.props.height - this.state.margin.top - this.state.margin.bottom;
    }

    barHeight() {
        const bars = this.state.data.length - 1;
        return (this.height() - (bars * this.state.barMargin)) / bars;
    }

    setChartDomain(data) {
        this.xChart.domain([
            0,
            d3.max(data, d => d[1])
        ])
        this.yChart.domain(
            data.map(d => this._getLabel(d))
        ).padding(this.props.padding);
    }

    _getLabel(d) {
        if (d[0] && typeof d[0] == 'object' && 'label' in d[0]) {
            return d[0].label;
        }
        return d[0];
    }

    drawChart(update) {

        let format = d3.format(',d'),
            target = this.cRefs.BarTable,
            data = this.state.data.slice(1),
            svg = this.state.svg;

        data.sort((a, b) => (a[1] - b[1]));
        
        this.yChart = d3.scaleBand().range([
            this.height(),
            0
        ]);

        if (!update) {
            this.xChart = d3.scaleLinear().range([
                0,
                this.width()
            ]);
            svg = d3.select(target).append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox',`0 0 ${this.width() + this.state.margin.left + this.state.margin.right} ${this.height() + this.state.margin.top + this.state.margin.bottom}`)
                .attr('preserveAspectRatio','xMinYMin meet')
                .attr('class', 'nc-chart-svg nc-chart-bar')
                .append('g')
                .attr('transform', `translate(${this.state.margin.left}, ${this.state.margin.top})`);
        }

        this.setChartDomain(data);

        let barGroup = svg.selectAll('g')
            .data(data, d => this._getLabel(d));

        if (update) {
            d3.select(target).select('svg')
                .attr('viewBox',`0 0 ${this.width() + this.state.margin.left + this.state.margin.right} ${this.height() + this.state.margin.top + this.state.margin.bottom}`);

            barGroup
                .transition()
                .duration(500)
                .attr('y', d => this.yChart(this._getLabel(d)))
                .attr('height', this.barHeight());

            barGroup.select('.nc-bar')
                .transition()
                .duration(500)
                .attr('y', d => this.yChart(this._getLabel(d)))
                .attr('height', this.barHeight())
                .attr('width', d => this.xChart(d[1]));

            barGroup.select('.nc-bar-backdrop')
                .transition()
                .duration(500)
                .attr('y', d => this.yChart(this._getLabel(d)))
                .attr('height', this.barHeight());

            barGroup.select('.nc-bar-table-label')
                .transition()
                .duration(500)
                .attr('y', d => (this.yChart(this._getLabel(d)) + (this.barHeight() / 2)))
                .text(d => {
                    if (this.state.labels.maxLength) {
                        return truncate(this._getLabel(d), {
                            length: this.state.labels.maxLength,
                            omission: '...'
                        });
                    }
                    return this._getLabel(d);
                });

            barGroup.select('.nc-bar-table-value')
                .transition()
                .duration(500)
                .attr('y', d => (this.yChart(this._getLabel(d)) + (this.barHeight() / 2)))
                .text(d => format(d[1]));
        }
    
        let newGroup = barGroup.enter()
                .append('g')
                .attr('class', 'nc-bar-group')
                .attr('x', 0)
                .attr('height', this.barHeight())
                .attr('y', d => this.yChart(this._getLabel(d)))
                .attr('width', this.width() - this.state.margin.left - this.state.margin.right);

        newGroup.append('rect')
            .attr('class', 'nc-bar-backdrop')
            .attr('x', 0)
            .attr('height', this.barHeight())
            .attr('y', d => this.yChart(this._getLabel(d)))
            .attr('width', this.width() - this.state.margin.left - this.state.margin.right)
            .attr('fill', '#EEE');

        newGroup.append('rect')
            .attr('class', 'nc-bar table')
            .attr('x', 0)
            .attr('height', this.barHeight())
            .attr('y', d => this.yChart(this._getLabel(d)))
            .attr('width', 0)
            .transition()
            .duration(1000)
            .attr('width', d => this.xChart(d[1]));

        newGroup.append('text')
            .attr('class', 'nc-bar-table-label')
            .attr('y', d => (this.yChart(this._getLabel(d)) + (this.barHeight() / 2)))
            .attr('dy', '.35em')
            .attr('text-anchor', 'start')
            .text(d => {
                if (this.state.labels.maxLength) {
                    return truncate(this._getLabel(d), {
                        length: this.state.labels.maxLength,
                        omission: '...'
                    });
                }
                return this._getLabel(d);
            })
            .attr('x', 5);

        newGroup.append('text')
            .attr('class', 'nc-bar-table-value')
            .attr('y', d => (this.yChart(this._getLabel(d)) + (this.barHeight() / 2)))
            .attr('x', this.width() - this.state.margin.left - this.state.margin.right - 5)
            .attr('dy', '.35em')
            .attr('text-anchor', 'end')
            .text(d => format(d[1]));

        if (update) {
            barGroup
                .exit()
                .transition()
                .duration(500)
                .attr('y', this.yChart(0))
                .attr('height', (this.height() / 10) - this.yChart(0))
                .style('fill-opacity', 1e-6)
                .remove();
        }
        this.setState({
            svg: svg
        });
    }

    render() {
        return <div className="nc-chart" ref={n => this.cRefs["BarTable"] = n}>
            <canvas width={ this.width() } height={ this.height() }></canvas>
            &nbsp;
        </div>
    }

}

BarTable.propTypes = {
    data: PropTypes.array,
    labels: PropTypes.shape({
        maxLength: PropTypes.number
    }),
    margin: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number
    }),
    height: PropTypes.number,
    padding: PropTypes.number,
    barMargin: PropTypes.number,
    aspectRatioMultiplier: PropTypes.number
};

BarTable.defaultProps = {
    width: 600,
    height: 300,
    padding: 0.1,
    barMargin: 3,
    aspectRatioMultiplier: 1.363636364
};

export default BarTable;
