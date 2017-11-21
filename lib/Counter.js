'use strict';

import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import styles from '../styles/styles.css';

const defaultMargin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
};

class Counter extends React.Component {

    constructor(props) {
        super(props);
        this.cRefs = {};
        this.format = d3.format(',d');

        this.state = {
            svg: null,
            value: Math.round(props.value),
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
            value: Math.round(this.props.value),
            margin: Object.assign({}, defaultMargin, this.props.margin)
        }, this.updateChart);
    }

    textTween(finalValue = 0) {
        const them = this;
        return function() {
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

        let svg = d3.select(target).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox',`0 0 ${ this.props.width - this.state.margin.left - this.state.margin.right } ${ this.props.height - this.state.margin.top - this.state.margin.bottom }`)
            .attr('preserveAspectRatio','xMinYMin meet')
            .attr('class', 'nc-chart-svg nc-chart-counter');

        svg
            .append('text')
            .attr('class', 'nc-counter-value')
            .attr('data-value', actualValue)
            .text(counterValue)
            .attr('x', '50%')
            .attr('y', '50%')
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', this.props.anchor || 'middle');

        this.setState({
            svg
        });
    }

    updateChart() {
        let svg = this.state.svg;
        const actualValue = this.state.value;

        svg
            .selectAll('.nc-counter-value')
            .transition()
            .duration(function(){
                const val = parseInt(d3.select(this).attr('data-value'));
                const diff = Math.abs(val - actualValue);
                return Math.max(500, Math.log(diff) * 100);
            })
            .attr('data-value', actualValue)
            .tween('text', this.textTween(actualValue));

        this.setState({
            svg
        });
    }

    render() {
        return <div className="nc-chart" ref={n => this.cRefs['Counter'] = n} data-value={ this.state.value }>
            <canvas width={ this.props.width } height={ this.props.height }></canvas>
            &nbsp;
        </div>
    }

}

Counter.propTypes = {
    value: PropTypes.number.isRequired,
    anchor: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    margin: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number
    })
};

Counter.defaultProps = {
    value: 0,
    width: 600,
    height: 300,
    margin: defaultMargin
};

export default Counter;