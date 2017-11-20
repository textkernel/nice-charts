import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number } from '@storybook/addon-knobs';
import { Counter } from 'nice-charts';

const stories = storiesOf('Counter', module);

stories.addDecorator(withKnobs);

stories.add('Default', () => (
	<Counter value={ number('Value', 32198) } />
));