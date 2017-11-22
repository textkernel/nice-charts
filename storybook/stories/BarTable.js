import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobsOptions, object } from '@storybook/addon-knobs';
import { withNotes } from '@storybook/addon-notes'
import { BarTable } from 'nice-charts';

const stories = storiesOf('BarTable', module);

stories.addDecorator(withKnobsOptions({
    debounce: { wait: 100 },
    timestamps: true
}));

const defaultValue = [
    ["organization_name","count"],
    ["Sandd", 1815, 'https://www.sandd.nl/'],
    ["PostNL Holding B.V.",1578],
    ["PostNL",1389],
    ["Kruidvat",972],
    ["Albert Heijn",738],
    ["JobBoost",664],
    ["Deloitte",595],
    ["LIDL Nederland",495],
    ["Rabobank",494],
    ["Jumbo Supermarkten",476]
];

const notes = "You can optionally provide a URL or callback function for each entry in the list that will be executed on click";

stories.add('Default', withNotes(notes)(() => <BarTable data={ object('Data', defaultValue) } />));
