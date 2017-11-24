import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobsOptions, object } from '@storybook/addon-knobs';
import { BarChart } from 'nice-charts';

const stories = storiesOf('BarChart', module);

stories.addDecorator(withKnobsOptions({
    debounce: { wait: 100 },
    timestamps: true
}));

const defaultValue = [["salary__buckets_15000_100000_5000","count"],["Java", 137316],["Python", 187234],["PHP", 111751],["Javascript", 95972],["C++", 93529],["Go", 50447],["Perl", 69837]];

stories.add('Default', () => (
    <BarChart
        ticks={ object('Ticks', {
            angle: -45 
        }) }
        margin={ object('Margins', {
            left: 75,
            top: 25
        }) }
        data={ object('Data', defaultValue) } />
));
