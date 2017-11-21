import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobsOptions, object } from '@storybook/addon-knobs';
import { BarTable } from 'nice-charts';

const stories = storiesOf('BarTable', module);

stories.addDecorator(withKnobsOptions({
    debounce: { wait: 500 },
    timestamps: true
}));

const defaultValue = [["organization_name","count"],["Sandd",1815],["PostNL Holding B.V.",1578],["PostNL",1389],["Kruidvat",972],["Albert Heijn",738],["JobBoost",664],["Deloitte",595],["LIDL Nederland",495],["Rabobank",494],["Jumbo Supermarkten",476]];

stories.add('Default', () => (
    <BarTable data={ object('Data', defaultValue) } />
));
