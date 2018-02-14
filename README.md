# Nice! Charts

Nice! Charts is a collection of D3 charts in the form of React components.

## Usage
1. Import the desired chart component from the library
```js
import Histogram from 'nice-charts'
```
2. Include the chart in your page
```jsx
<Histogram data={[ ... ]} />
```

## Charts
The following charts are available in this library

### Histogram
Prop|Type|Default
|:----|:----|:----
data|array|n/a
xAxis.ticks.angle|number|-65
xAxis.ticks.fontSize|string|n/a
xAxis.ticks.prefix|string|n/a
xAxis.ticks.specifier|string|,d
yAxis.ticks.fontSize|string|n/a
yAxis.ticks.prefix|string|n/a
yAxis.ticks.specifier|string|,d
margin.top|number|0
margin.right|number|0
margin.bottom|number|50
margin.left|number|75
width|number|600
height|number|300

### BarChart
Prop|Type|Default
|:----|:----|:----
data|array|n/a
xAxis.ticks.angle|number|-65
xAxis.ticks.fontSize|string|n/a
xAxis.ticks.prefix|string|n/a
xAxis.ticks.specifier|string|,d
yAxis.ticks.fontSize|string|n/a
yAxis.ticks.prefix|string|n/a
yAxis.ticks.specifier|string|,d
margin.top|number|0
margin.right|number|0
margin.bottom|number|50
margin.left|number|75
width|number|600
height|number|300

### BarTable
Prop|Type|Default
|:----|:----|:----
data|array|n/a
margin.top|number|0
margin.right|number|0
margin.bottom|number|50
margin.left|number|75
padding|number|0.1
barMargin|number|3
labels.maxLength|number|n/a
width|number|600
height|number|300

### Counter
Prop|Type|Default
|:----|:----|:----
value|number|0
anchor|string|middle
margin.top|number|0
margin.right|number|0
margin.bottom|number|50
margin.left|number|75
width|number|600
height|number|300

### LineChart
Prop|Type|Default
|:----|:----|:----
data|array|n/a
area|boolean|false
curveFunction|string|curveCatmullRom
margin.top|number|0
margin.right|number|0
margin.bottom|number|50
margin.left|number|75
ticks.angle|number|-65
ticks.format|string|n/a
ticks.count|number|n/a
dateTimeFormat|string|%Y-%m-%d
pointSize|number|3
width|number|600
height|number|300

### PieChart
Prop|Type|Default
|:----|:----|:----
data|array|n/a
margin.x|number|0
margin.y|number|0
icon|string|n/a
innerRadius|number|0.6
width|number|300
height|number|200
