/**
 * @license Highcharts JS v9.1.2 (2021-08-18)
 * @module highcharts/modules/data
 * @requires highcharts
 *
 * Data module
 *
 * (c) 2012-2021 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
'use strict';
import Highcharts from '../../Core/Globals.js';
import HttpUtilities from '../../Core/HttpUtilities.js';
var G = Highcharts;
G.HttpUtilities = HttpUtilities;
G.ajax = HttpUtilities.ajax;
G.getJSON = HttpUtilities.getJSON;
G.post = HttpUtilities.post;
import '../../Extensions/Data.js';
