import React from 'react';
import Histogram from './Histogram';

class BarChart extends React.Component {
    render() {
        const props = Object.assign({}, this.props, {
            nonLinear: true
        });
        return <Histogram {...props} />
    }
}

export default BarChart;