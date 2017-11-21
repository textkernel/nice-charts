'use strict';

import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

const margin = { top: 5, right: 0, bottom: 0, left: 0 };

class Counter extends React.Component {

    constructor(props) {
        super(props);
        this.cRefs = {};
        this.width = () => (600 - margin.left - margin.right);
        this.height = () => (300 - margin.top - margin.bottom);
        this.format = d3.format(',d');
        this.svg = null;

        this.state = {
            value: Math.round(props.value)
        };
    }

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate(prevProps) {
        if (this.props.value == prevProps.value) {
            return false;
        }
        this.setState({
            value: Math.round(this.props.value)
        }, this.updateChart);
    }

    textTween(finalValue = 0) {
        const them = this;
        return () => {
            let that = d3.select(this),
                currentValue = that.attr('data-value') || that.text().replace(/\D+/g, ""),
                i = d3.interpolateNumber(currentValue, finalValue);
            return t => that.text(them.format(i(t)));
        };
    }

    drawChart() {
        const target = this.cRefs.Counter;
        const actualValue = this.state.value;
        const counterValue = this.format(actualValue);

        this.svg = d3.select(target).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox',`0 0 290 80`)
            .attr('preserveAspectRatio','xMinYMin meet')
            .attr('class', 'nc-chart-svg nc-chart-counter');

        this.svg
            .append('text')
            .attr('class', 'nc-counter-value')
            .attr('data-value', actualValue)
            .text(counterValue)
            .attr('x', '50%')
            .attr('y', '50%')
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', this.props.anchor || 'middle');
    }

    updateChart() {
        console.log ('updatechart');
        const actualValue = this.state.value;

        this.svg
            .selectAll('.nc-counter-value')
            .transition()
            .duration(() => {
                let val = parseInt(
                    d3.select(this).attr('data-value')
                );
                let diff = Math.abs(val - actualValue);
                return Math.max(500, Math.log(diff) * 100);
            })
            .attr('data-value', actualValue)
            .tween('text', this.textTween(actualValue));
    }

    render() {
        return <div className="nc-chart" ref={n => this.cRefs['Counter'] = n} data-value={ this.state.value }>
            <canvas width="400" height="100"></canvas>
            &nbsp;
        </div>
    }

}

Counter.propTypes = {
    value: PropTypes.number,
    anchor: PropTypes.string
};

export default Counter;