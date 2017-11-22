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

const defaultData = [
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

const alternativeModel = [
    ["organization_name","count"],
    [{
        value: 11,
        label: "Sandd"
    }, 1815],
    [{
        value: 24,
        label: "PostNL Holding B.V."
    }, 1578],
    [{
        value: 64,
        label: "PostNL"
    }, 1389],
    [{
        value: 94,
        label: "Kruidvat"
    }, 972],
    [{
        value: 46,
        label: "Albert Heijn"
    }, 738],
    [{
        value: 75,
        label: "JobBoost"
    }, 664],
    [{
        value: 34,
        label: "Deloitte"
    }, 595],
    [{
        value: 27,
        label: "LIDL Nederland"
    }, 495],
    [{
        value: 49,
        label: "Rabobank"
    }, 494],
    [{
        value: 74,
        label: "Jumbo Supermarkten"
    }, 476]
];

const notes = "You can optionally provide a URL or callback function for each entry in the list that will be executed on click.\nThe first list element for each row (the label to be shown) can be either a string or an object with keys 'value' and 'label'.";

stories.add('Default', withNotes(notes)(() => <BarTable data={ object('Data', defaultData) } />));
stories.add('Alternative data model', () => (<BarTable data={ object('Data', alternativeModel) } />));
