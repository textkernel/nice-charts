import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobsOptions, object, number, text } from '@storybook/addon-knobs';
import { PieChart } from 'nice-charts';

const stories = storiesOf('PieChart', module);

stories.addDecorator(withKnobsOptions({
    debounce: { wait: 100 },
    timestamps: true
}));

const defaultValue = [["education_level","count"],[{"value":9,"label":"MBO"},143368],[{"value":11,"label":"HBO"},94928],[{"value":12,"label":"HBO\/WO"},39007],[{"value":2,"label":"VMBO"},38491],[{"value":10,"label":"MBO\/HBO"},35105],[{"value":13,"label":"WO"},26719],[{"value":3,"label":"VMBO\/MBO"},8905],[{"value":4,"label":"MAVO\/VMBO"},5178],[{"value":1,"label":"Elementair"},2596],[{"value":5,"label":"MAVO\/HAVO"},2400],[{"value":7,"label":"HAVO\/VWO"},1611],[{"value":14,"label":"Post_WO"},1317],[{"value":6,"label":"HAVO"},1064],[{"value":8,"label":"VWO"},271]];

stories.add('Default', () => (
    <PieChart
        width={ number('Width', 300) }
        height={ number('Height', 200) }
        margin={ object('Margins', {
            x: 100,
            y: 15
        }) }
        icon={ text('Icon classnames', 'fa fa-graduation-cap') }
        innerRadius={ number('Inner radius', 0.6) }
        data={ object('Data', defaultValue) } />
));
