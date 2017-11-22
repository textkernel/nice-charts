import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, object, select, number } from '@storybook/addon-knobs';
import { LineChart } from 'nice-charts';

const stories = storiesOf('LineChart', module);

stories.addDecorator(withKnobs);

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

const defaultData = [["date__week","count"],["2016-11-21",40519],["2016-11-28",47344],["2016-12-05",39911],["2016-12-12",35896],["2016-12-19",40689],["2016-12-26",23309],["2017-01-02",43046],["2017-01-09",44005],["2017-01-16",46902],["2017-01-23",43389],["2017-01-30",51978],["2017-02-06",51330],["2017-02-13",42355],["2017-02-20",42335],["2017-02-27",42337],["2017-03-06",41122],["2017-03-13",46466],["2017-03-20",45234],["2017-03-27",48134],["2017-04-03",49477],["2017-04-10",51776],["2017-04-17",46159],["2017-04-24",43999],["2017-05-01",51750],["2017-05-08",48421],["2017-05-15",50193],["2017-05-22",40036],["2017-05-29",50203],["2017-06-05",43465],["2017-06-12",49127],["2017-06-19",59174],["2017-06-26",54318],["2017-07-03",55676],["2017-07-10",53146],["2017-07-17",43499],["2017-07-24",43120],["2017-07-31",44241],["2017-08-07",46622],["2017-08-14",38661],["2017-08-21",45951],["2017-08-28",44957],["2017-09-04",44478],["2017-09-11",53324],["2017-09-18",47390],["2017-09-25",47656],["2017-10-02",53052],["2017-10-09",49341],["2017-10-16",48410],["2017-10-23",45250],["2017-10-30",57830],["2017-11-06",51777],["2017-11-13",56241],["2017-11-20",9218]];

stories.add('Default', () => (
    <LineChart
        area={ true }
        pointSize={ number('Point size', 3) }
        curveFunction={ select('Curve function', curveFunctions, 'curveCatmullRom') }
        ticks={ object('Ticks', {
            angle: -45,
            format: '%B'
        }) }
        margin={ object('Margins', { top: 25 }) }
        data={ object('Data', defaultData) } />
));
