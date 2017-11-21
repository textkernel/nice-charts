import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobsOptions, number } from '@storybook/addon-knobs';
import { Counter } from 'nice-charts';

const stories = storiesOf('Counter', module);

stories.addDecorator(withKnobsOptions({
    debounce: { wait: 500 },
    timestamps: true
}));

stories.add('Default', () => (
	<Counter value={ number('Value', 32198) } />
));
