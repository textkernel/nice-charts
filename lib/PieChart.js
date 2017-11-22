'use strict';

import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import utils from'./utils';
import styles from '../styles/styles.css';
import _ from 'lodash';

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

    componentDidUpdate(prevProps) {
        if (_.isEqual(this.props, prevProps)) {
            return false;
        }
        this.setState({
            data: this.props.data || [],
            max: this.props.data.slice(1).reduce((result, item) => {
                if (!isNaN(item[1]) && item[1] > result) {
                    result = item[1];
                }
                return result;
            }, 0)
        }, () => {
            this.drawChart(true);
        });
    }

    width(withMargins = false) {
        let width = this.props.width;
        if (!withMargins) {
            width -= this.props.margin.x;
        }
        return width;
    }

    height(withMargins = false) {
        let height = this.props.height;
        if (!withMargins) {
            height -= this.props.margin.y / 2;
        }
        return height;
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
        return (Math.min(this.width(), this.height()) - this.props.margin.x) / ((this.props.margin.y / 100) + 1);
    }

    color() {
        return d3.scaleOrdinal(d3.schemeCategory20);
    }

    arc() {
        const innerRadius = Math.min(Math.max(this.props.innerRadius || 0, 0), 0.99); // Should be 0 < r < 0.99
        return d3
            .arc()
            .innerRadius(this.radius() * innerRadius)
            .outerRadius(this.radius());
    }

    arcTween(d) {
        const arc = this.arc();
        const i = d3.interpolate(this._current, d);
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

    drawChart(update) {

        let target = this.cRefs.PieChart,
            data = this.state.data.slice(1),
            svg = this.state.svg,
            color = this.color(),
            arc = this.arc(),
            icon = false,
            tooltip = false,
            timer = null;

        if (this.state.labels) {
            data = data.reduce((result, d) => {
                let label = this._getLabel(d);
                if (label in this.state.labels) {
                    d = this._setLabel(
                        d,
                        this.state.labels[label]
                    );
                }
                result.push(d);
                return result;
            }, []);
        }

        if (!update) {
            tooltip = d3.select(target)
                .append('div')
                .attr('class', 'nc-tooltip');

            tooltip.append('div')
                .attr('class', 'nc-tooltip-label');

            tooltip.append('div')
                .attr('class', 'nc-tooltip-value');

            if (this.props.icon) {
                icon = d3.select(target)
                    .append('div')
                    .attr('class', 'nc-pie-icon-container');

                icon
                    .append('i')
                    .attr('class', ['nc-pie-icon', this.props.icon].join(' '));
            }

            svg = d3
                .select(target)
                .append('svg')
                .attr('class', 'nc-chart-svg nc-chart-pie')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox',`0 0 ${this.width(true)} ${this.height(true)}`)
                .attr('preserveAspectRatio','xMinYMin meet')
                .append('g')
                .attr('transform', `translate(${this.width(true) / 2}, ${this.height(true) / 2})`);
        } else {
            tooltip = d3.select(target).select('.nc-tooltip');
            icon = d3.select(target).select('.nc-pie-icon-container');
        }

        let pie = d3.pie()
            .value(d => d[1])
            .sort(null);

        let group = svg.selectAll('g');
        let data1 = pie(data);

        group = group.data(data1, d => this._getLabel(d));

        group
            .select('path')
            .attr('fill', d => color(this._getLabel(d.data)))
            .transition()
            .duration(1000)
            .attrTween('d', d => this.arcTween(d));

        group
            .select('.nc-pie-label.inside')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .text(d => {
                let text = '';
                if ((d.value / this.total()) * 100 > 5) {
                    text = this.format(d.value);
                    if (this.props.percentages) {
                        text = this.percent(d.value / this.total());
                    }
                }
                return text;
            });

        group
            .select('.nc-pie-label.outside')
            .text(d => {
                let text = '';
                if ((d.value / this.total()) * 100 > 5) {
                    text = utils.truncate(this._getLabel(d.data), {
                        length: 26,
                        omission: '...'
                    });
                }
                return text;
            })
            .attr('x', d => {
                const a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
                d.cx = Math.cos(a) * (this.radius() + 45);
                return d.x = Math.cos(a) * (this.radius() + 10);
            })
            .attr('y', d => {
                const a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
                const c = arc.centroid(d);

                d.cy = Math.sin(a) * (this.radius() + 45);
                let y = Math.sin(a) * (this.radius() + 10);
                if (y > c[1]) {
                    y = y + 10;
                }
                return d.y = y;
            })
            .attr('text-anchor', function(d) {
                const c = arc.centroid(d);
                const bb = this.getBBox();

                let anchor = 'middle';
                if (bb.x < c[0]) {
                    anchor = 'end';
                } else if (bb.x > c[0]) {
                    anchor = 'start';
                }
                return anchor;
            })
            .each(function(d) {
                const bb = this.getBBox();
                d.sx = d.x - bb.width / 2 - 2;
                d.ox = d.x - bb.width / 2 + 2;
                d.sy = d.oy = d.y + 5;
            });

        let newGroup = group.enter()
            .append('g')
            .attr('class', 'nc-pie-slice');

        let newSlice = newGroup
            .append('path')
            .attr('class', 'nc-pie-slice-path');

        newSlice
            .attr('fill', d => color(this._getLabel(d.data)))
            .transition()
            .duration(1000)
            .attrTween('d', (d) => this.arcTween(d));

        let appendLabels = (newGroup, icon, tooltip) => {
            newGroup
                .append('text')
                .attr('transform', d => `translate(${arc.centroid(d)})`)
                .attr('dy', '.4em')
                .attr('text-anchor', 'middle')
                .attr('class', 'nc-pie-label inside')
                .text(d => {
                    let text = '';
                    if ((d.value / this.total()) * 100 > 5) {
                        text = this.format(d.value);
                        if (this.props.percentages) {
                            text = this.percent(d.value / this.total());
                        }
                    }
                    return text;
                });
            newGroup
                .append('text')
                .attr('class', 'nc-pie-label outside')
                .text(d => {
                    let text = '';
                    if ((d.value / this.total()) * 100 > 5) {
                        text = utils.truncate(this._getLabel(d.data), {
                            length: 26,
                            omission: '...'
                        });
                    }
                    return text;
                })
                .attr('x', d => {
                    const a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
                    d.cx = Math.cos(a) * (this.radius() + 45);
                    return d.x = Math.cos(a) * (this.radius() + 10);
                })
                .attr('y', d => {
                    const a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
                    const c = arc.centroid(d);

                    d.cy = Math.sin(a) * (this.radius() + 45);
                    let y = Math.sin(a) * (this.radius() + 10);
                    if (y > c[1]) {
                        y = y + 10;
                    }
                    return d.y = y;
                })
                .attr('text-anchor', function(d) {
                    const c = arc.centroid(d);
                    const bb = this.getBBox();

                    let anchor = 'middle';
                    if (bb.x < c[0]) {
                        anchor = 'end';
                    } else if (bb.x > c[0]) {
                        anchor = 'start';
                    }
                    return anchor;
                })
                .each(function(d){
                    const bb = this.getBBox();
                    d.sx = d.x - bb.width / 2 - 2;
                    d.ox = d.x - bb.width / 2 + 2;
                    d.sy = d.oy = d.y + 5;
                });

        newGroup
            .on('mouseover', d => {
                clearTimeout(timer);
                let value = this.format(d.data[1]);
                tooltip.select('.nc-tooltip-label').html(this._getLabel(d.data));
                tooltip.select('.nc-tooltip-value').html(value);
                if (icon) {
                    icon.attr('class', 'nc-pie-icon-container nc-pie-icon-hidden');
                }
                tooltip.style('display', 'block');
            })
            .on('mouseout', () => {
                timer = setTimeout(() => {
                    if (icon) {
                        icon.attr('class', 'nc-pie-icon-container');
                    }
                    tooltip.style('display', 'none');
                }, 500);
            });
        }

        setTimeout(appendLabels.bind(null, newGroup, icon, tooltip), 1000);

        let exitGroup = group.exit();

        exitGroup
            .select('path')
            .transition()
            .duration(1000)
            .attrTween('d', d => {
                const i = d3.interpolate(this._current, d);
                this._current = i(0);
                return t => arc(i(t));
            })
            .remove();

        exitGroup
            .selectAll('text')
            .remove();

        exitGroup.remove();

        this.setState({
            svg: svg
        });
    }

    render() {
        return <div className="nc-chart" ref={n => this.cRefs["PieChart"] = n}>
            <canvas width={ this.props.width } height={ this.props.height }></canvas>
            &nbsp;
        </div>;
    }

}

PieChart.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    margin: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number
    }),
    innerRadius: PropTypes.number,
    icon: PropTypes.string
};

PieChart.defaultProps = {
    width: 300,
    height: 200,
    margin: {
        x: 100,
        y: 15
    },
    innerRadius: 0.6
};

export default PieChart;
