import { configure } from '@storybook/react';
import { setDefaults } from '@storybook/addon-info';

setDefaults({
    header: true
});

function loadStories() {
	require('./stories/index.js');
}

configure(loadStories, module);