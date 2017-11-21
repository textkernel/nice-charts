import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobsOptions, object } from '@storybook/addon-knobs';
import { Histogram } from 'nice-charts';

const stories = storiesOf('Histogram', module);

stories.addDecorator(withKnobsOptions({
    debounce: { wait: 500 },
    timestamps: true
}));

const defaultValue = [["salary__buckets_15000_100000_5000","count"],[15000,187234],[20000,137316],[25000,111751],[30000,95972],[35000,93529],[40000,69837],[45000,50447],[50000,40301],[55000,24935],[60000,26386],[65000,15441],[70000,16125],[75000,9890],[80000,10189],[85000,4504],[90000,8155],[95000,2870]];

stories.add('Default', () => (
    <Histogram
        ticks={ object('Ticks', { 
            prefix: '€',
            angle: -45 
        }) }
        margin={ object('Margins', {
            left: 75,
            top: 25
        }) }
        data={ object('Data', defaultValue) } />
));
