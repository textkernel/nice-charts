'use strict';

import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

class PieChart extends React.Component {

    constructor(props) {
        super(props);
        this.cRefs = {};
        this.format = d3.format(',d');
        this.percent = d3.format('.1%');

        this.state = {
            svg: null,
            data: props.data || [],
            labels: props.labels || null,
            margin: Object.assign({}, {
                top: 25,
                right: 10,
                bottom: 10,
                left: 10
            }, props.margin),
            max: this.props.data.slice(1).reduce((result, item) => {
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
        if (Object.is(props, this.props)) {
            return false;
        }
        this.setState({
            data: props.data || [],
            margin: Object.assign({}, this.state.margin, props.margin),
            max: props.data.slice(1).reduce((result, item) => {
                if (!isNaN(item[1]) && item[1] > result) {
                    result = item[1];
                }
                return result;
            }, 0)
        }, function(){
            this.drawChart(true);
        });
    },

    width() {
        return this.props.width - this.state.margin.left - this.state.margin.right;
    }

    height() {
        return this.props.height - this.state.margin.top - this.state.margin.bottom;
    }

    total() {
        return this.state.data.slice(1).reduce((result, item) => {
            if (!isNaN(item[1])) {
                result = result + item[1];
            }
            return result;
        }, 0);
    }

    radius() {
        const cols = this.props.cols ? this.props.cols : 1;
        return (Math.min(this.width(), this.height()) + ((cols - 2) * 50)) / 2;
    }

    color() {
        return d3.scaleOrdinal(d3.schemeCategory20);
    }

    arc(){
        return d3
            .arc()
            .innerRadius(this.radius() * 0.6)
            .outerRadius(this.radius());
    }

    arcTween(d) {
        var arc = this.arc();
        var i = d3.interpolate(this._current, d);
        this._current = i(0);
        return t => arc(i(t));
    }

    _getLabel(d) {
        if (d[0] && typeof d[0] == 'object' && 'label' in d[0]) {
            return d[0].label;
        }
        return d[0];
    }

    _setLabel(d, val) {
        if (d[0] && typeof d[0] == 'object' && 'label' in d[0]) {
            d[0].label = val;
        } else {
            d[0] = val;
        }
        return d;
    }

    render() {
        return <div className="nc-chart" ref={n => this.cRefs["PieChart"] = n}>
            <canvas width={300 * this.state.cols} height={(300 * this.state.cols) / this.state.cols}></canvas>
            &nbsp;
        </div>
    }

}

export default PieChart;
