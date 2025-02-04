/**
 * @license Highcharts JS v9.1.2 (2021-08-18)
 * @module highcharts/highcharts-3d
 * @requires highcharts
 *
 * 3D features for Highcharts JS
 *
 * License: www.highcharts.com/license
 */
'use strict';
import Highcharts from '../Core/Globals.js';
import '../Extensions/Math3D.js';
import SVGRenderer3D from '../Core/Renderer/SVG/SVGRenderer3D.js';
import Chart3D from '../Core/Chart/Chart3D.js';
import ZAxis from '../Core/Axis/ZAxis.js';
import Axis3D from '../Core/Axis/Axis3D.js';
import '../Core/Axis/Tick3D.js';
import '../Core/Series/Series3D.js';
import '../Series/Column3D/Column3DComposition.js';
import '../Series/Pie3D/Pie3DComposition.js';
import '../Series/Scatter3D/Scatter3DSeries.js';
import '../Series/Area3DSeries.js';
var G = Highcharts;
// Compositions
SVGRenderer3D.compose(G.SVGRenderer);
Chart3D.compose(G.Chart, G.Fx);
ZAxis.ZChartComposition.compose(G.Chart);
Axis3D.compose(G.Axis);
