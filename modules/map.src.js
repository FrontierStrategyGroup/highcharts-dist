/**
 * @license Highmaps JS v9.1.2 (2021-08-18)
 *
 * Highmaps as a plugin for Highcharts or Highcharts Stock.
 *
 * (c) 2011-2021 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
'use strict';
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/modules/map', ['highcharts'], function (Highcharts) {
            factory(Highcharts);
            factory.Highcharts = Highcharts;
            return factory;
        });
    } else {
        factory(typeof Highcharts !== 'undefined' ? Highcharts : undefined);
    }
}(function (Highcharts) {
    var _modules = Highcharts ? Highcharts._modules : {};
    function _registerModule(obj, path, args, fn) {
        if (!obj.hasOwnProperty(path)) {
            obj[path] = fn.apply(null, args);
        }
    }
    _registerModule(_modules, 'Core/Axis/MapAxis.js', [_modules['Core/Axis/Axis.js'], _modules['Core/Utilities.js']], function (Axis, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var addEvent = U.addEvent,
            pick = U.pick;
        /**
         * Map support for axes.
         * @private
         * @class
         */
        var MapAxisAdditions = /** @class */ (function () {
                /* *
                 *
                 *  Constructors
                 *
                 * */
                function MapAxisAdditions(axis) {
                    this.axis = axis;
            }
            return MapAxisAdditions;
        }());
        /**
         * Axis with map support.
         * @private
         * @class
         */
        var MapAxis = /** @class */ (function () {
                function MapAxis() {
                }
                /**
                 * Extends axes with map support.
                 * @private
                 *
                 * @param {Highcharts.Axis} AxisClass
                 * Axis class to extend.
                 */
                MapAxis.compose = function (AxisClass) {
                    AxisClass.keepProps.push('mapAxis');
                /* eslint-disable no-invalid-this */
                addEvent(AxisClass, 'init', function () {
                    var axis = this;
                    if (!axis.mapAxis) {
                        axis.mapAxis = new MapAxisAdditions(axis);
                    }
                });
                // Override to use the extreme coordinates from the SVG shape, not the
                // data values
                addEvent(AxisClass, 'getSeriesExtremes', function () {
                    if (!this.mapAxis) {
                        return;
                    }
                    var axis = this;
                    var xData = [];
                    // Remove the xData array and cache it locally so that the proceed
                    // method doesn't use it
                    if (axis.isXAxis) {
                        axis.series.forEach(function (series, i) {
                            if (series.useMapGeometry) {
                                xData[i] = series.xData;
                                series.xData = [];
                            }
                        });
                        axis.mapAxis.seriesXData = xData;
                    }
                });
                addEvent(AxisClass, 'afterGetSeriesExtremes', function () {
                    if (!this.mapAxis) {
                        return;
                    }
                    var axis = this;
                    var xData = axis.mapAxis.seriesXData || [];
                    var dataMin,
                        dataMax,
                        useMapGeometry;
                    // Run extremes logic for map and mapline
                    if (axis.isXAxis) {
                        dataMin = pick(axis.dataMin, Number.MAX_VALUE);
                        dataMax = pick(axis.dataMax, -Number.MAX_VALUE);
                        axis.series.forEach(function (series, i) {
                            if (series.useMapGeometry) {
                                dataMin = Math.min(dataMin, pick(series.minX, dataMin));
                                dataMax = Math.max(dataMax, pick(series.maxX, dataMax));
                                series.xData = xData[i]; // Reset xData array
                                useMapGeometry = true;
                            }
                        });
                        if (useMapGeometry) {
                            axis.dataMin = dataMin;
                            axis.dataMax = dataMax;
                        }
                        axis.mapAxis.seriesXData = void 0;
                    }
                });
                // Override axis translation to make sure the aspect ratio is always
                // kept
                addEvent(AxisClass, 'afterSetAxisTranslation', function () {
                    if (!this.mapAxis) {
                        return;
                    }
                    var axis = this;
                    var chart = axis.chart;
                    var plotRatio = chart.plotWidth / chart.plotHeight;
                    var xAxis = chart.xAxis[0];
                    var mapRatio,
                        adjustedAxisLength,
                        padAxis,
                        fixTo,
                        fixDiff,
                        preserveAspectRatio;
                    // Check for map-like series
                    if (axis.coll === 'yAxis' && typeof xAxis.transA !== 'undefined') {
                        axis.series.forEach(function (series) {
                            if (series.preserveAspectRatio) {
                                preserveAspectRatio = true;
                            }
                        });
                    }
                    // On Y axis, handle both
                    if (preserveAspectRatio) {
                        // Use the same translation for both axes
                        axis.transA = xAxis.transA = Math.min(axis.transA, xAxis.transA);
                        mapRatio = plotRatio / ((xAxis.max - xAxis.min) /
                            (axis.max - axis.min));
                        // What axis to pad to put the map in the middle
                        padAxis = mapRatio < 1 ? axis : xAxis;
                        // Pad it
                        adjustedAxisLength =
                            (padAxis.max - padAxis.min) * padAxis.transA;
                        padAxis.mapAxis.pixelPadding = padAxis.len - adjustedAxisLength;
                        padAxis.minPixelPadding = padAxis.mapAxis.pixelPadding / 2;
                        fixTo = padAxis.mapAxis.fixTo;
                        if (fixTo) {
                            fixDiff = fixTo[1] - padAxis.toValue(fixTo[0], true);
                            fixDiff *= padAxis.transA;
                            if (Math.abs(fixDiff) > padAxis.minPixelPadding ||
                                (padAxis.min === padAxis.dataMin &&
                                    padAxis.max === padAxis.dataMax)) { // zooming out again, keep within restricted area
                                fixDiff = 0;
                            }
                            padAxis.minPixelPadding -= fixDiff;
                        }
                    }
                });
                // Override Axis.render in order to delete the fixTo prop
                addEvent(AxisClass, 'render', function () {
                    var axis = this;
                    if (axis.mapAxis) {
                        axis.mapAxis.fixTo = void 0;
                    }
                });
                /* eslint-enable no-invalid-this */
            };
            return MapAxis;
        }());
        MapAxis.compose(Axis); // @todo move to factory functions

        return MapAxis;
    });
    _registerModule(_modules, 'Mixins/ColorSeries.js', [], function () {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        /**
         * Mixin for maps and heatmaps
         *
         * @private
         * @mixin Highcharts.colorPointMixin
         */
        var colorPointMixin = {
                /* eslint-disable valid-jsdoc */
                /**
                 * Set the visibility of a single point
                 * @private
                 * @function Highcharts.colorPointMixin.setVisible
                 * @param {boolean} visible
                 * @return {void}
                 */
                setVisible: function (vis) {
                    var point = this,
            method = vis ? 'show' : 'hide';
                point.visible = point.options.visible = Boolean(vis);
                // Show and hide associated elements
                ['graphic', 'dataLabel'].forEach(function (key) {
                    if (point[key]) {
                        point[key][method]();
                    }
                });
                this.series.buildKDTree(); // rebuild kdtree #13195
            }
            /* eslint-enable valid-jsdoc */
        };
        /**
         * @private
         * @mixin Highcharts.colorSeriesMixin
         */
        var colorSeriesMixin = {
                optionalAxis: 'colorAxis',
                /* eslint-disable valid-jsdoc */
                /**
                 * In choropleth maps,
            the color is a result of the value,
            so this needs
                 * translation too
                 * @private
                 * @function Highcharts.colorSeriesMixin.translateColors
                 * @return {void}
                 */
                translateColors: function () {
                    var series = this,
            points = this.data.length ? this.data : this.points,
            nullColor = this.options.nullColor,
            colorAxis = this.colorAxis,
            colorKey = this.colorKey;
                points.forEach(function (point) {
                    var value = point.getNestedProperty(colorKey),
                        color;
                    color = point.options.color ||
                        (point.isNull || point.value === null ?
                            nullColor :
                            (colorAxis && typeof value !== 'undefined') ?
                                colorAxis.toColor(value, point) :
                                point.color || series.color);
                    if (color && point.color !== color) {
                        point.color = color;
                        if (series.options.legendType === 'point' && point.legendItem) {
                            series.chart.legend.colorizeItem(point, point.visible);
                        }
                    }
                });
            }
            /* eslint-enable valid-jsdoc */
        };
        var exports = {
                colorPointMixin: colorPointMixin,
                colorSeriesMixin: colorSeriesMixin
            };

        return exports;
    });
    _registerModule(_modules, 'Core/Axis/Color/ColorAxisComposition.js', [_modules['Core/Color/Color.js'], _modules['Mixins/ColorSeries.js'], _modules['Core/Utilities.js']], function (Color, ColorSeriesMixins, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var color = Color.parse;
        var colorPointMixin = ColorSeriesMixins.colorPointMixin,
            colorSeriesMixin = ColorSeriesMixins.colorSeriesMixin;
        var addEvent = U.addEvent,
            extend = U.extend,
            merge = U.merge,
            pick = U.pick,
            splat = U.splat;
        /* *
         *
         *  Composition
         *
         * */
        var ColorAxisComposition;
        (function (ColorAxisComposition) {
            /* *
             *
             *  Constants
             *
             * */
            var composedClasses = [];
            /* *
             *
             *  Variables
             *
             * */
            var ColorAxisClass;
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            /**
             * @private
             */
            function compose(ColorAxisType, ChartClass, FxClass, LegendClass, SeriesClass) {
                if (!ColorAxisClass) {
                    ColorAxisClass = ColorAxisType;
                }
                if (composedClasses.indexOf(ChartClass) === -1) {
                    composedClasses.push(ChartClass);
                    var chartProto = ChartClass.prototype;
                    chartProto.collectionsWithUpdate.push('colorAxis');
                    chartProto.collectionsWithInit.colorAxis = [chartProto.addColorAxis];
                    addEvent(ChartClass, 'afterGetAxes', onChartAfterGetAxes);
                    wrapChartCreateAxis(ChartClass);
                }
                if (composedClasses.indexOf(FxClass) === -1) {
                    composedClasses.push(FxClass);
                    var fxProto = FxClass.prototype;
                    fxProto.fillSetter = wrapFxFillSetter;
                    fxProto.strokeSetter = wrapFxStrokeSetter;
                }
                if (composedClasses.indexOf(LegendClass) === -1) {
                    composedClasses.push(LegendClass);
                    addEvent(LegendClass, 'afterGetAllItems', onLegendAfterGetAllItems);
                    addEvent(LegendClass, 'afterColorizeItem', onLegendAfterColorizeItem);
                    addEvent(LegendClass, 'afterUpdate', onLegendAfterUpdate);
                }
                if (composedClasses.indexOf(SeriesClass) === -1) {
                    composedClasses.push(SeriesClass);
                    extend(SeriesClass.prototype, colorSeriesMixin);
                    extend(SeriesClass.prototype.pointClass.prototype, colorPointMixin);
                    addEvent(SeriesClass, 'afterTranslate', onSeriesAfterTranslate);
                    addEvent(SeriesClass, 'bindAxes', onSeriesBindAxes);
                }
            }
            ColorAxisComposition.compose = compose;
            /**
             * Extend the chart getAxes method to also get the color axis.
             * @private
             */
            function onChartAfterGetAxes() {
                var _this = this;
                var options = this.options;
                this.colorAxis = [];
                if (options.colorAxis) {
                    options.colorAxis = splat(options.colorAxis);
                    options.colorAxis.forEach(function (axisOptions, i) {
                        axisOptions.index = i;
                        new ColorAxisClass(_this, axisOptions); // eslint-disable-line no-new
                    });
                }
            }
            /**
             * Add the color axis. This also removes the axis' own series to prevent
             * them from showing up individually.
             * @private
             */
            function onLegendAfterGetAllItems(e) {
                var _this = this;
                var colorAxes = this.chart.colorAxis || [],
                    destroyItem = function (item) {
                        var i = e.allItems.indexOf(item);
                    if (i !== -1) {
                        // #15436
                        _this.destroyItem(e.allItems[i]);
                        e.allItems.splice(i, 1);
                    }
                };
                var colorAxisItems = [],
                    options,
                    i;
                colorAxes.forEach(function (colorAxis) {
                    options = colorAxis.options;
                    if (options && options.showInLegend) {
                        // Data classes
                        if (options.dataClasses && options.visible) {
                            colorAxisItems = colorAxisItems.concat(colorAxis.getDataClassLegendSymbols());
                            // Gradient legend
                        }
                        else if (options.visible) {
                            // Add this axis on top
                            colorAxisItems.push(colorAxis);
                        }
                        // If dataClasses are defined or showInLegend option is not set
                        // to true, do not add color axis' series to legend.
                        colorAxis.series.forEach(function (series) {
                            if (!series.options.showInLegend || options.dataClasses) {
                                if (series.options.legendType === 'point') {
                                    series.points.forEach(function (point) {
                                        destroyItem(point);
                                    });
                                }
                                else {
                                    destroyItem(series);
                                }
                            }
                        });
                    }
                });
                i = colorAxisItems.length;
                while (i--) {
                    e.allItems.unshift(colorAxisItems[i]);
                }
            }
            /**
             * @private
             */
            function onLegendAfterColorizeItem(e) {
                if (e.visible && e.item.legendColor) {
                    e.item.legendSymbol.attr({
                        fill: e.item.legendColor
                    });
                }
            }
            /**
             * Updates in the legend need to be reflected in the color axis. (#6888)
             * @private
             */
            function onLegendAfterUpdate() {
                var colorAxes = this.chart.colorAxis;
                if (colorAxes) {
                    colorAxes.forEach(function (colorAxis) {
                        colorAxis.update({}, arguments[2]);
                    });
                }
            }
            /**
             * Calculate and set colors for points.
             * @private
             */
            function onSeriesAfterTranslate() {
                if (this.chart.colorAxis &&
                    this.chart.colorAxis.length ||
                    this.colorAttribs) {
                    this.translateColors();
                }
            }
            /**
             * Add colorAxis to series axisTypes.
             * @private
             */
            function onSeriesBindAxes() {
                var axisTypes = this.axisTypes;
                if (!axisTypes) {
                    this.axisTypes = ['colorAxis'];
                }
                else if (axisTypes.indexOf('colorAxis') === -1) {
                    axisTypes.push('colorAxis');
                }
            }
            /**
             * @private
             */
            function wrapChartCreateAxis(ChartClass) {
                var superCreateAxis = ChartClass.prototype.createAxis;
                ChartClass.prototype.createAxis = function (type, options) {
                    if (type !== 'colorAxis') {
                        return superCreateAxis.apply(this, arguments);
                    }
                    var axis = new ColorAxisClass(this,
                        merge(options.axis, {
                            index: this[type].length,
                            isX: false
                        }));
                    this.isDirtyLegend = true;
                    // Clear before 'bindAxes' (#11924)
                    this.axes.forEach(function (axis) {
                        axis.series = [];
                    });
                    this.series.forEach(function (series) {
                        series.bindAxes();
                        series.isDirtyData = true;
                    });
                    if (pick(options.redraw, true)) {
                        this.redraw(options.animation);
                    }
                    return axis;
                };
            }
            /**
             * Handle animation of the color attributes directly.
             * @private
             */
            function wrapFxFillSetter() {
                this.elem.attr('fill', color(this.start).tweenTo(color(this.end), this.pos), void 0, true);
            }
            /**
             * Handle animation of the color attributes directly.
             * @private
             */
            function wrapFxStrokeSetter() {
                this.elem.attr('stroke', color(this.start).tweenTo(color(this.end), this.pos), void 0, true);
            }
        })(ColorAxisComposition || (ColorAxisComposition = {}));
        /* *
         *
         *  Default Export
         *
         * */

        return ColorAxisComposition;
    });
    _registerModule(_modules, 'Core/Axis/Color/ColorAxisDefaults.js', [_modules['Core/Color/Palette.js']], function (Palette) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        /* *
         *
         *  API Options
         *
         * */
        /**
         * A color axis for series. Visually, the color
         * axis will appear as a gradient or as separate items inside the
         * legend, depending on whether the axis is scalar or based on data
         * classes.
         *
         * For supported color formats, see the
         * [docs article about colors](https://www.highcharts.com/docs/chart-design-and-style/colors).
         *
         * A scalar color axis is represented by a gradient. The colors either
         * range between the [minColor](#colorAxis.minColor) and the
         * [maxColor](#colorAxis.maxColor), or for more fine grained control the
         * colors can be defined in [stops](#colorAxis.stops). Often times, the
         * color axis needs to be adjusted to get the right color spread for the
         * data. In addition to stops, consider using a logarithmic
         * [axis type](#colorAxis.type), or setting [min](#colorAxis.min) and
         * [max](#colorAxis.max) to avoid the colors being determined by
         * outliers.
         *
         * When [dataClasses](#colorAxis.dataClasses) are used, the ranges are
         * subdivided into separate classes like categories based on their
         * values. This can be used for ranges between two values, but also for
         * a true category. However, when your data is categorized, it may be as
         * convenient to add each category to a separate series.
         *
         * Color axis does not work with: `sankey`, `sunburst`, `dependencywheel`,
         * `networkgraph`, `wordcloud`, `venn`, `gauge` and `solidgauge` series
         * types.
         *
         * Since v7.2.0 `colorAxis` can also be an array of options objects.
         *
         * See [the Axis object](/class-reference/Highcharts.Axis) for
         * programmatic access to the axis.
         *
         * @sample       {highcharts} highcharts/coloraxis/custom-color-key
         *               Column chart with color axis
         * @sample       {highcharts} highcharts/coloraxis/horizontal-layout
         *               Horizontal layout
         * @sample       {highmaps} maps/coloraxis/dataclasscolor
         *               With data classes
         * @sample       {highmaps} maps/coloraxis/mincolor-maxcolor
         *               Min color and max color
         *
         * @extends      xAxis
         * @excluding    alignTicks, allowDecimals, alternateGridColor, breaks,
         *               categories, crosshair, dateTimeLabelFormats, height, left,
         *               lineWidth, linkedTo, maxZoom, minRange, minTickInterval,
         *               offset, opposite, pane, plotBands, plotLines,
         *               reversedStacks, showEmpty, title, top, width, zoomEnabled
         * @product      highcharts highstock highmaps
         * @type         {*|Array<*>}
         * @optionparent colorAxis
         */
        var colorAxisDefaults = {
                /**
                 * Whether to allow decimals on the color axis.
                 * @type      {boolean}
                 * @default   true
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.allowDecimals
                 */
                /**
                 * Determines how to set each data class' color if no individual
                 * color is set. The default value, `tween`, computes intermediate
                 * colors between `minColor` and `maxColor`. The other possible
                 * value, `category`, pulls colors from the global or chart specific
                 * [colors](#colors) array.
                 *
                 * @sample {highmaps} maps/coloraxis/dataclasscolor/
                 *         Category colors
                 *
                 * @type       {string}
                 * @default    tween
                 * @product    highcharts highstock highmaps
                 * @validvalue ["tween", "category"]
                 * @apioption  colorAxis.dataClassColor
                 */
                /**
                 * An array of data classes or ranges for the choropleth map. If
                 * none given, the color axis is scalar and values are distributed
                 * as a gradient between the minimum and maximum colors.
                 *
                 * @sample {highmaps} maps/demo/data-class-ranges/
                 *         Multiple ranges
                 *
                 * @sample {highmaps} maps/demo/data-class-two-ranges/
                 *         Two ranges
                 *
                 * @type      {Array<*>}
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.dataClasses
                 */
                /**
                 * The layout of the color axis. Can be `'horizontal'` or `'vertical'`.
                 * If none given, the color axis has the same layout as the legend.
                 *
                 * @sample highcharts/coloraxis/horizontal-layout/
                 *         Horizontal color axis layout with vertical legend
                 *
                 * @type      {string|undefined}
                 * @since     7.2.0
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.layout
                 */
                /**
                 * The color of each data class. If not set, the color is pulled
                 * from the global or chart-specific [colors](#colors) array. In
                 * styled mode, this option is ignored. Instead, use colors defined
                 * in CSS.
                 *
                 * @sample {highmaps} maps/demo/data-class-two-ranges/
                 *         Explicit colors
                 *
                 * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.dataClasses.color
                 */
                /**
                 * The start of the value range that the data class represents,
                 * relating to the point value.
                 *
                 * The range of each `dataClass` is closed in both ends, but can be
                 * overridden by the next `dataClass`.
                 *
                 * @type      {number}
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.dataClasses.from
                 */
                /**
                 * The name of the data class as it appears in the legend.
                 * If no name is given, it is automatically created based on the
                 * `from` and `to` values. For full programmatic control,
                 * [legend.labelFormatter](#legend.labelFormatter) can be used.
                 * In the formatter, `this.from` and `this.to` can be accessed.
                 *
                 * @sample {highmaps} maps/coloraxis/dataclasses-name/
                 *         Named data classes
                 *
                 * @sample {highmaps} maps/coloraxis/dataclasses-labelformatter/
                 *         Formatted data classes
                 *
                 * @type      {string}
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.dataClasses.name
                 */
                /**
                 * The end of the value range that the data class represents,
                 * relating to the point value.
                 *
                 * The range of each `dataClass` is closed in both ends, but can be
                 * overridden by the next `dataClass`.
                 *
                 * @type      {number}
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.dataClasses.to
                 */
                /** @ignore-option */
                lineWidth: 0,
                /**
                 * Padding of the min value relative to the length of the axis. A
                 * padding of 0.05 will make a 100px axis 5px longer.
                 *
                 * @product highcharts highstock highmaps
                 */
                minPadding: 0,
                /**
                 * The maximum value of the axis in terms of map point values. If
                 * `null`, the max value is automatically calculated. If the
                 * `endOnTick` option is true, the max value might be rounded up.
                 *
                 * @sample {highmaps} maps/coloraxis/gridlines/
                 *         Explicit min and max to reduce the effect of outliers
                 *
                 * @type      {number}
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.max
                 */
                /**
                 * The minimum value of the axis in terms of map point values. If
                 * `null`, the min value is automatically calculated. If the
                 * `startOnTick` option is true, the min value might be rounded
                 * down.
                 *
                 * @sample {highmaps} maps/coloraxis/gridlines/
                 *         Explicit min and max to reduce the effect of outliers
                 *
                 * @type      {number}
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.min
                 */
                /**
                 * Padding of the max value relative to the length of the axis. A
                 * padding of 0.05 will make a 100px axis 5px longer.
                 *
                 * @product highcharts highstock highmaps
                 */
                maxPadding: 0,
                /**
                 * Color of the grid lines extending from the axis across the
                 * gradient.
                 *
                 * @sample {highmaps} maps/coloraxis/gridlines/
                 *         Grid lines demonstrated
                 *
                 * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 * @default   #e6e6e6
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.gridLineColor
                 */
                /**
                 * The width of the grid lines extending from the axis across the
                 * gradient of a scalar color axis.
                 *
                 * @sample {highmaps} maps/coloraxis/gridlines/
                 *         Grid lines demonstrated
                 *
                 * @product highcharts highstock highmaps
                 */
                gridLineWidth: 1,
                /**
                 * The interval of the tick marks in axis units. When `null`, the
                 * tick interval is computed to approximately follow the
                 * `tickPixelInterval`.
                 *
                 * @type      {number}
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.tickInterval
                 */
                /**
                 * If [tickInterval](#colorAxis.tickInterval) is `null` this option
                 * sets the approximate pixel interval of the tick marks.
                 *
                 * @product highcharts highstock highmaps
                 */
                tickPixelInterval: 72,
                /**
                 * Whether to force the axis to start on a tick. Use this option
                 * with the `maxPadding` option to control the axis start.
                 *
                 * @product highcharts highstock highmaps
                 */
                startOnTick: true,
                /**
                 * Whether to force the axis to end on a tick. Use this option with
                 * the [maxPadding](#colorAxis.maxPadding) option to control the
                 * axis end.
                 *
                 * @product highcharts highstock highmaps
                 */
                endOnTick: true,
                /** @ignore */
                offset: 0,
                /**
                 * The triangular marker on a scalar color axis that points to the
                 * value of the hovered area. To disable the marker, set
                 * `marker: null`.
                 *
                 * @sample {highmaps} maps/coloraxis/marker/
                 *         Black marker
                 *
                 * @declare Highcharts.PointMarkerOptionsObject
                 * @product highcharts highstock highmaps
                 */
                marker: {
                    /**
                     * Animation for the marker as it moves between values. Set to
                     * `false` to disable animation. Defaults to `{ duration: 50 }`.
                     *
                     * @type    {boolean|Partial<Highcharts.AnimationOptionsObject>}
                     * @product highcharts highstock highmaps
                     */
                    animation: {
                        /** @internal */
                        duration: 50
                    },
                    /** @internal */
                    width: 0.01,
                    /**
                     * The color of the marker.
                     *
                     * @type    {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                     * @product highcharts highstock highmaps
                     */
                    color: Palette.neutralColor40
                },
                /**
                 * The axis labels show the number for each tick.
                 *
                 * For more live examples on label options, see [xAxis.labels in the
                 * Highcharts API.](/highcharts#xAxis.labels)
                 *
                 * @extends xAxis.labels
                 * @product highcharts highstock highmaps
                 */
                labels: {
                    /**
                     * How to handle overflowing labels on horizontal color axis. If set
                     * to `"allow"`, it will not be aligned at all. By default it
                     * `"justify"` labels inside the chart area. If there is room to
                     * move it, it will be aligned to the edge, else it will be removed.
                     *
                     * @validvalue ["allow", "justify"]
                     * @product    highcharts highstock highmaps
                     */
                    overflow: 'justify',
                    rotation: 0
                },
                /**
                 * The color to represent the minimum of the color axis. Unless
                 * [dataClasses](#colorAxis.dataClasses) or
                 * [stops](#colorAxis.stops) are set, the gradient starts at this
                 * value.
                 *
                 * If dataClasses are set, the color is based on minColor and
                 * maxColor unless a color is set for each data class, or the
                 * [dataClassColor](#colorAxis.dataClassColor) is set.
                 *
                 * @sample {highmaps} maps/coloraxis/mincolor-maxcolor/
                 *         Min and max colors on scalar (gradient) axis
                 * @sample {highmaps} maps/coloraxis/mincolor-maxcolor-dataclasses/
                 *         On data classes
                 *
                 * @type    {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 * @product highcharts highstock highmaps
                 */
                minColor: Palette.highlightColor10,
                /**
                 * The color to represent the maximum of the color axis. Unless
                 * [dataClasses](#colorAxis.dataClasses) or
                 * [stops](#colorAxis.stops) are set, the gradient ends at this
                 * value.
                 *
                 * If dataClasses are set, the color is based on minColor and
                 * maxColor unless a color is set for each data class, or the
                 * [dataClassColor](#colorAxis.dataClassColor) is set.
                 *
                 * @sample {highmaps} maps/coloraxis/mincolor-maxcolor/
                 *         Min and max colors on scalar (gradient) axis
                 * @sample {highmaps} maps/coloraxis/mincolor-maxcolor-dataclasses/
                 *         On data classes
                 *
                 * @type    {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 * @product highcharts highstock highmaps
                 */
                maxColor: Palette.highlightColor100,
                /**
                 * Color stops for the gradient of a scalar color axis. Use this in
                 * cases where a linear gradient between a `minColor` and `maxColor`
                 * is not sufficient. The stops is an array of tuples, where the
                 * first item is a float between 0 and 1 assigning the relative
                 * position in the gradient, and the second item is the color.
                 *
                 * @sample {highmaps} maps/demo/heatmap/
                 *         Heatmap with three color stops
                 *
                 * @type      {Array<Array<number,Highcharts.ColorString>>}
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.stops
                 */
                /**
                 * The pixel length of the main tick marks on the color axis.
                 */
                tickLength: 5,
                /**
                 * The type of interpolation to use for the color axis. Can be
                 * `linear` or `logarithmic`.
                 *
                 * @sample highcharts/coloraxis/logarithmic-with-emulate-negative-values/
                 *         Logarithmic color axis with extension to emulate negative
                 *         values
                 *
                 * @type      {Highcharts.ColorAxisTypeValue}
                 * @default   linear
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.type
                 */
                /**
                 * Whether to reverse the axis so that the highest number is closest
                 * to the origin. Defaults to `false` in a horizontal legend and
                 * `true` in a vertical legend, where the smallest value starts on
                 * top.
                 *
                 * @type      {boolean}
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.reversed
                 */
                /**
                 * @product   highcharts highstock highmaps
                 * @excluding afterBreaks, pointBreak, pointInBreak
                 * @apioption colorAxis.events
                 */
                /**
                 * Fires when the legend item belonging to the colorAxis is clicked.
                 * One parameter, `event`, is passed to the function.
                 *
                 * @type      {Function}
                 * @product   highcharts highstock highmaps
                 * @apioption colorAxis.events.legendItemClick
                 */
                /**
                 * Whether to display the colorAxis in the legend.
                 *
                 * @sample highcharts/coloraxis/hidden-coloraxis-with-3d-chart/
                 *         Hidden color axis with 3d chart
                 *
                 * @see [heatmap.showInLegend](#series.heatmap.showInLegend)
                 *
                 * @since   4.2.7
                 * @product highcharts highstock highmaps
                 */
                showInLegend: true
            };
        /* *
         *
         *  Default Export
         *
         * */

        return colorAxisDefaults;
    });
    _registerModule(_modules, 'Core/Axis/Color/ColorAxis.js', [_modules['Core/Axis/Axis.js'], _modules['Core/Color/Color.js'], _modules['Core/Axis/Color/ColorAxisComposition.js'], _modules['Core/Axis/Color/ColorAxisDefaults.js'], _modules['Core/Globals.js'], _modules['Core/Legend/LegendSymbol.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (Axis, Color, ColorAxisComposition, ColorAxisDefaults, H, LegendSymbol, SeriesRegistry, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
                var extendStatics = function (d,
            b) {
                    extendStatics = Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array && function (d,
            b) { d.__proto__ = b; }) ||
                        function (d,
            b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var color = Color.parse;
        var noop = H.noop;
        var Series = SeriesRegistry.series;
        var extend = U.extend,
            isNumber = U.isNumber,
            merge = U.merge,
            pick = U.pick;
        /* *
         *
         *  Class
         *
         * */
        /* eslint-disable no-invalid-this, valid-jsdoc */
        /**
         * The ColorAxis object for inclusion in gradient legends.
         *
         * @class
         * @name Highcharts.ColorAxis
         * @augments Highcharts.Axis
         *
         * @param {Highcharts.Chart} chart
         * The related chart of the color axis.
         *
         * @param {Highcharts.ColorAxisOptions} userOptions
         * The color axis options for initialization.
         */
        var ColorAxis = /** @class */ (function (_super) {
                __extends(ColorAxis, _super);
            /* *
             *
             *  Constructors
             *
             * */
            /**
             * @private
             */
            function ColorAxis(chart, userOptions) {
                var _this = _super.call(this,
                    chart,
                    userOptions) || this;
                _this.beforePadding = false; // Prevents unnecessary padding with `hc-more`
                _this.chart = void 0;
                _this.coll = 'colorAxis';
                _this.dataClasses = void 0;
                _this.legendItem = void 0;
                _this.legendItems = void 0;
                _this.name = ''; // Prevents 'undefined' in legend in IE8
                _this.options = void 0;
                _this.stops = void 0;
                _this.visible = true;
                _this.init(chart, userOptions);
                return _this;
            }
            /* *
             *
             *  Static Functions
             *
             * */
            ColorAxis.compose = function (ChartClass, FxClass, LegendClass, SeriesClass) {
                ColorAxisComposition.compose(ColorAxis, ChartClass, FxClass, LegendClass, SeriesClass);
            };
            /* *
             *
             *  Functions
             *
             * */
            /**
             * Initializes the color axis.
             *
             * @function Highcharts.ColorAxis#init
             *
             * @param {Highcharts.Chart} chart
             * The related chart of the color axis.
             *
             * @param {Highcharts.ColorAxisOptions} userOptions
             * The color axis options for initialization.
             */
            ColorAxis.prototype.init = function (chart, userOptions) {
                var axis = this;
                var legend = chart.options.legend || {},
                    horiz = userOptions.layout ?
                        userOptions.layout !== 'vertical' :
                        legend.layout !== 'vertical',
                    visible = userOptions.visible;
                var options = merge(ColorAxis.defaultColorAxisOptions,
                    userOptions, {
                        showEmpty: false,
                        title: null,
                        visible: legend.enabled && visible !== false
                    });
                axis.coll = 'colorAxis';
                axis.side = userOptions.side || horiz ? 2 : 1;
                axis.reversed = userOptions.reversed || !horiz;
                axis.opposite = !horiz;
                _super.prototype.init.call(this, chart, options);
                // #16053: Restore the actual userOptions.visible so the color axis
                // doesnt stay hidden forever when hiding and showing legend
                axis.userOptions.visible = visible;
                // Base init() pushes it to the xAxis array, now pop it again
                // chart[this.isXAxis ? 'xAxis' : 'yAxis'].pop();
                // Prepare data classes
                if (userOptions.dataClasses) {
                    axis.initDataClasses(userOptions);
                }
                axis.initStops();
                // Override original axis properties
                axis.horiz = horiz;
                axis.zoomEnabled = false;
            };
            /**
             * @private
             */
            ColorAxis.prototype.initDataClasses = function (userOptions) {
                var axis = this,
                    chart = axis.chart,
                    options = axis.options,
                    len = userOptions.dataClasses.length;
                var dataClasses,
                    colorCounter = 0,
                    colorCount = chart.options.chart.colorCount;
                axis.dataClasses = dataClasses = [];
                axis.legendItems = [];
                (userOptions.dataClasses || []).forEach(function (dataClass, i) {
                    var colors;
                    dataClass = merge(dataClass);
                    dataClasses.push(dataClass);
                    if (!chart.styledMode && dataClass.color) {
                        return;
                    }
                    if (options.dataClassColor === 'category') {
                        if (!chart.styledMode) {
                            colors = chart.options.colors;
                            colorCount = colors.length;
                            dataClass.color = colors[colorCounter];
                        }
                        dataClass.colorIndex = colorCounter;
                        // increase and loop back to zero
                        colorCounter++;
                        if (colorCounter === colorCount) {
                            colorCounter = 0;
                        }
                    }
                    else {
                        dataClass.color = color(options.minColor).tweenTo(color(options.maxColor), len < 2 ? 0.5 : i / (len - 1) // #3219
                        );
                    }
                });
            };
            /**
             * Returns true if the series has points at all.
             *
             * @function Highcharts.ColorAxis#hasData
             *
             * @return {boolean}
             * True, if the series has points, otherwise false.
             */
            ColorAxis.prototype.hasData = function () {
                return !!(this.tickPositions || []).length;
            };
            /**
             * Override so that ticks are not added in data class axes (#6914)
             * @private
             */
            ColorAxis.prototype.setTickPositions = function () {
                if (!this.dataClasses) {
                    return _super.prototype.setTickPositions.call(this);
                }
            };
            /**
             * @private
             */
            ColorAxis.prototype.initStops = function () {
                var axis = this;
                axis.stops = axis.options.stops || [
                    [0, axis.options.minColor],
                    [1, axis.options.maxColor]
                ];
                axis.stops.forEach(function (stop) {
                    stop.color = color(stop[1]);
                });
            };
            /**
             * Extend the setOptions method to process extreme colors and color stops.
             * @private
             */
            ColorAxis.prototype.setOptions = function (userOptions) {
                var axis = this;
                _super.prototype.setOptions.call(this, userOptions);
                axis.options.crosshair = axis.options.marker;
            };
            /**
             * @private
             */
            ColorAxis.prototype.setAxisSize = function () {
                var axis = this;
                var symbol = axis.legendSymbol;
                var chart = axis.chart;
                var legendOptions = chart.options.legend || {};
                var x,
                    y,
                    width,
                    height;
                if (symbol) {
                    this.left = x = symbol.attr('x');
                    this.top = y = symbol.attr('y');
                    this.width = width = symbol.attr('width');
                    this.height = height = symbol.attr('height');
                    this.right = chart.chartWidth - x - width;
                    this.bottom = chart.chartHeight - y - height;
                    this.len = this.horiz ? width : height;
                    this.pos = this.horiz ? x : y;
                }
                else {
                    // Fake length for disabled legend to avoid tick issues
                    // and such (#5205)
                    this.len = (this.horiz ?
                        legendOptions.symbolWidth :
                        legendOptions.symbolHeight) || ColorAxis.defaultLegendLength;
                }
            };
            /**
             * @private
             */
            ColorAxis.prototype.normalizedValue = function (value) {
                var axis = this;
                if (axis.logarithmic) {
                    value = axis.logarithmic.log2lin(value);
                }
                return 1 - ((axis.max - value) /
                    ((axis.max - axis.min) || 1));
            };
            /**
             * Translate from a value to a color.
             * @private
             */
            ColorAxis.prototype.toColor = function (value, point) {
                var axis = this;
                var dataClasses = axis.dataClasses;
                var stops = axis.stops;
                var pos,
                    from,
                    to,
                    color,
                    dataClass,
                    i;
                if (dataClasses) {
                    i = dataClasses.length;
                    while (i--) {
                        dataClass = dataClasses[i];
                        from = dataClass.from;
                        to = dataClass.to;
                        if ((typeof from === 'undefined' || value >= from) &&
                            (typeof to === 'undefined' || value <= to)) {
                            color = dataClass.color;
                            if (point) {
                                point.dataClass = i;
                                point.colorIndex = dataClass.colorIndex;
                            }
                            break;
                        }
                    }
                }
                else {
                    pos = axis.normalizedValue(value);
                    i = stops.length;
                    while (i--) {
                        if (pos > stops[i][0]) {
                            break;
                        }
                    }
                    from = stops[i] || stops[i + 1];
                    to = stops[i + 1] || from;
                    // The position within the gradient
                    pos = 1 - (to[0] - pos) / ((to[0] - from[0]) || 1);
                    color = from.color.tweenTo(to.color, pos);
                }
                return color;
            };
            /**
             * Override the getOffset method to add the whole axis groups inside the
             * legend.
             * @private
             */
            ColorAxis.prototype.getOffset = function () {
                var axis = this;
                var group = axis.legendGroup;
                var sideOffset = axis.chart.axisOffset[axis.side];
                if (group) {
                    // Hook for the getOffset method to add groups to this parent
                    // group
                    axis.axisParent = group;
                    // Call the base
                    _super.prototype.getOffset.call(this);
                    // First time only
                    if (!axis.added) {
                        axis.added = true;
                        axis.labelLeft = 0;
                        axis.labelRight = axis.width;
                    }
                    // Reset it to avoid color axis reserving space
                    axis.chart.axisOffset[axis.side] = sideOffset;
                }
            };
            /**
             * Create the color gradient.
             * @private
             */
            ColorAxis.prototype.setLegendColor = function () {
                var axis = this;
                var horiz = axis.horiz;
                var reversed = axis.reversed;
                var one = reversed ? 1 : 0;
                var zero = reversed ? 0 : 1;
                var grad = horiz ? [one, 0,
                    zero, 0] : [0,
                    zero, 0,
                    one]; // #3190
                    axis.legendColor = {
                        linearGradient: {
                            x1: grad[0],
                            y1: grad[1],
                            x2: grad[2],
                            y2: grad[3]
                        },
                        stops: axis.stops
                    };
            };
            /**
             * The color axis appears inside the legend and has its own legend symbol.
             * @private
             */
            ColorAxis.prototype.drawLegendSymbol = function (legend, item) {
                var axis = this;
                var padding = legend.padding;
                var legendOptions = legend.options;
                var horiz = axis.horiz;
                var width = pick(legendOptions.symbolWidth,
                    horiz ? ColorAxis.defaultLegendLength : 12);
                var height = pick(legendOptions.symbolHeight,
                    horiz ? 12 : ColorAxis.defaultLegendLength);
                var labelPadding = pick(legendOptions.labelPadding,
                    horiz ? 16 : 30);
                var itemDistance = pick(legendOptions.itemDistance, 10);
                this.setLegendColor();
                // Create the gradient
                item.legendSymbol = this.chart.renderer.rect(0, legend.baseline - 11, width, height).attr({
                    zIndex: 1
                }).add(item.legendGroup);
                // Set how much space this legend item takes up
                axis.legendItemWidth = width + padding + (horiz ? itemDistance : labelPadding);
                axis.legendItemHeight = height + padding + (horiz ? labelPadding : 0);
            };
            /**
             * Fool the legend.
             * @private
             */
            ColorAxis.prototype.setState = function (state) {
                this.series.forEach(function (series) {
                    series.setState(state);
                });
            };
            /**
             * @private
             */
            ColorAxis.prototype.setVisible = function () {
            };
            /**
             * @private
             */
            ColorAxis.prototype.getSeriesExtremes = function () {
                var axis = this;
                var series = axis.series;
                var colorValArray,
                    colorKey,
                    colorValIndex,
                    pointArrayMap,
                    calculatedExtremes,
                    cSeries,
                    i = series.length,
                    yData,
                    j;
                this.dataMin = Infinity;
                this.dataMax = -Infinity;
                while (i--) { // x, y, value, other
                    cSeries = series[i];
                    colorKey = cSeries.colorKey = pick(cSeries.options.colorKey, cSeries.colorKey, cSeries.pointValKey, cSeries.zoneAxis, 'y');
                    pointArrayMap = cSeries.pointArrayMap;
                    calculatedExtremes = cSeries[colorKey + 'Min'] &&
                        cSeries[colorKey + 'Max'];
                    if (cSeries[colorKey + 'Data']) {
                        colorValArray = cSeries[colorKey + 'Data'];
                    }
                    else {
                        if (!pointArrayMap) {
                            colorValArray = cSeries.yData;
                        }
                        else {
                            colorValArray = [];
                            colorValIndex = pointArrayMap.indexOf(colorKey);
                            yData = cSeries.yData;
                            if (colorValIndex >= 0 && yData) {
                                for (j = 0; j < yData.length; j++) {
                                    colorValArray.push(pick(yData[j][colorValIndex], yData[j]));
                                }
                            }
                        }
                    }
                    // If color key extremes are already calculated, use them.
                    if (calculatedExtremes) {
                        cSeries.minColorValue = cSeries[colorKey + 'Min'];
                        cSeries.maxColorValue = cSeries[colorKey + 'Max'];
                    }
                    else {
                        var cExtremes = Series.prototype.getExtremes.call(cSeries,
                            colorValArray);
                        cSeries.minColorValue = cExtremes.dataMin;
                        cSeries.maxColorValue = cExtremes.dataMax;
                    }
                    if (typeof cSeries.minColorValue !== 'undefined') {
                        this.dataMin =
                            Math.min(this.dataMin, cSeries.minColorValue);
                        this.dataMax =
                            Math.max(this.dataMax, cSeries.maxColorValue);
                    }
                    if (!calculatedExtremes) {
                        Series.prototype.applyExtremes.call(cSeries);
                    }
                }
            };
            /**
             * Internal function to draw a crosshair.
             *
             * @function Highcharts.ColorAxis#drawCrosshair
             *
             * @param {Highcharts.PointerEventObject} [e]
             *        The event arguments from the modified pointer event, extended with
             *        `chartX` and `chartY`
             *
             * @param {Highcharts.Point} [point]
             *        The Point object if the crosshair snaps to points.
             *
             * @fires Highcharts.ColorAxis#event:afterDrawCrosshair
             * @fires Highcharts.ColorAxis#event:drawCrosshair
             */
            ColorAxis.prototype.drawCrosshair = function (e, point) {
                var axis = this;
                var plotX = point && point.plotX;
                var plotY = point && point.plotY;
                var axisPos = axis.pos;
                var axisLen = axis.len;
                var crossPos;
                if (point) {
                    crossPos = axis.toPixels(point.getNestedProperty(point.series.colorKey));
                    if (crossPos < axisPos) {
                        crossPos = axisPos - 2;
                    }
                    else if (crossPos > axisPos + axisLen) {
                        crossPos = axisPos + axisLen + 2;
                    }
                    point.plotX = crossPos;
                    point.plotY = axis.len - crossPos;
                    _super.prototype.drawCrosshair.call(this, e, point);
                    point.plotX = plotX;
                    point.plotY = plotY;
                    if (axis.cross &&
                        !axis.cross.addedToColorAxis &&
                        axis.legendGroup) {
                        axis.cross
                            .addClass('highcharts-coloraxis-marker')
                            .add(axis.legendGroup);
                        axis.cross.addedToColorAxis = true;
                        if (!axis.chart.styledMode &&
                            typeof axis.crosshair === 'object') {
                            axis.cross.attr({
                                fill: axis.crosshair.color
                            });
                        }
                    }
                }
            };
            /**
             * @private
             */
            ColorAxis.prototype.getPlotLinePath = function (options) {
                var axis = this,
                    left = axis.left,
                    pos = options.translatedValue,
                    top = axis.top;
                // crosshairs only
                return isNumber(pos) ? // pos can be 0 (#3969)
                    (axis.horiz ? [
                        ['M', pos - 4, top - 6],
                        ['L', pos + 4, top - 6],
                        ['L', pos, top],
                        ['Z']
                    ] : [
                        ['M', left, pos],
                        ['L', left - 6, pos + 6],
                        ['L', left - 6, pos - 6],
                        ['Z']
                    ]) :
                    _super.prototype.getPlotLinePath.call(this, options);
            };
            /**
             * Updates a color axis instance with a new set of options. The options are
             * merged with the existing options, so only new or altered options need to
             * be specified.
             *
             * @function Highcharts.ColorAxis#update
             *
             * @param {Highcharts.ColorAxisOptions} newOptions
             * The new options that will be merged in with existing options on the color
             * axis.
             *
             * @param {boolean} [redraw]
             * Whether to redraw the chart after the color axis is altered. If doing
             * more operations on the chart, it is a good idea to set redraw to `false`
             * and call {@link Highcharts.Chart#redraw} after.
             */
            ColorAxis.prototype.update = function (newOptions, redraw) {
                var axis = this,
                    chart = axis.chart,
                    legend = chart.legend;
                this.series.forEach(function (series) {
                    // Needed for Axis.update when choropleth colors change
                    series.isDirtyData = true;
                });
                // When updating data classes, destroy old items and make sure new
                // ones are created (#3207)
                if (newOptions.dataClasses && legend.allItems || axis.dataClasses) {
                    axis.destroyItems();
                }
                _super.prototype.update.call(this, newOptions, redraw);
                if (axis.legendItem) {
                    axis.setLegendColor();
                    legend.colorizeItem(this, true);
                }
            };
            /**
             * Destroy color axis legend items.
             * @private
             */
            ColorAxis.prototype.destroyItems = function () {
                var axis = this;
                var chart = axis.chart;
                if (axis.legendItem) {
                    chart.legend.destroyItem(axis);
                }
                else if (axis.legendItems) {
                    axis.legendItems.forEach(function (item) {
                        chart.legend.destroyItem(item);
                    });
                }
                chart.isDirtyLegend = true;
            };
            //   Removing the whole axis (#14283)
            ColorAxis.prototype.destroy = function () {
                this.chart.isDirtyLegend = true;
                this.destroyItems();
                _super.prototype.destroy.apply(this, [].slice.call(arguments));
            };
            /**
             * Removes the color axis and the related legend item.
             *
             * @function Highcharts.ColorAxis#remove
             *
             * @param {boolean} [redraw=true]
             *        Whether to redraw the chart following the remove.
             */
            ColorAxis.prototype.remove = function (redraw) {
                this.destroyItems();
                _super.prototype.remove.call(this, redraw);
            };
            /**
             * Get the legend item symbols for data classes.
             * @private
             */
            ColorAxis.prototype.getDataClassLegendSymbols = function () {
                var axis = this;
                var chart = axis.chart;
                var legendItems = axis.legendItems;
                var legendOptions = chart.options.legend;
                var valueDecimals = legendOptions.valueDecimals;
                var valueSuffix = legendOptions.valueSuffix || '';
                var name;
                if (!legendItems.length) {
                    axis.dataClasses.forEach(function (dataClass, i) {
                        var from = dataClass.from,
                            to = dataClass.to,
                            numberFormatter = chart.numberFormatter;
                        var vis = true;
                        // Assemble the default name. This can be overridden
                        // by legend.options.labelFormatter
                        name = '';
                        if (typeof from === 'undefined') {
                            name = '< ';
                        }
                        else if (typeof to === 'undefined') {
                            name = '> ';
                        }
                        if (typeof from !== 'undefined') {
                            name += numberFormatter(from, valueDecimals) + valueSuffix;
                        }
                        if (typeof from !== 'undefined' && typeof to !== 'undefined') {
                            name += ' - ';
                        }
                        if (typeof to !== 'undefined') {
                            name += numberFormatter(to, valueDecimals) + valueSuffix;
                        }
                        // Add a mock object to the legend items
                        legendItems.push(extend({
                            chart: chart,
                            name: name,
                            options: {},
                            drawLegendSymbol: LegendSymbol.drawRectangle,
                            visible: true,
                            setState: noop,
                            isDataClass: true,
                            setVisible: function () {
                                vis = axis.visible = !vis;
                                axis.series.forEach(function (series) {
                                    series.points.forEach(function (point) {
                                        if (point.dataClass === i) {
                                            point.setVisible(vis);
                                        }
                                    });
                                });
                                chart.legend.colorizeItem(this, vis);
                            }
                        }, dataClass));
                    });
                }
                return legendItems;
            };
            /* *
             *
             *  Static Properties
             *
             * */
            ColorAxis.defaultColorAxisOptions = ColorAxisDefaults;
            ColorAxis.defaultLegendLength = 200;
            /**
             * @private
             */
            ColorAxis.keepProps = [
                'legendGroup',
                'legendItemHeight',
                'legendItemWidth',
                'legendItem',
                'legendSymbol'
            ];
            return ColorAxis;
        }(Axis));
        /* *
         *
         *  Registry
         *
         * */
        // Properties to preserve after destroy, for Axis.update (#5881, #6025).
        Array.prototype.push.apply(Axis.keepProps, ColorAxis.keepProps);
        /* *
         *
         *  Default Export
         *
         * */
        /* *
         *
         *  API Declarations
         *
         * */
        /**
         * Color axis types
         *
         * @typedef {"linear"|"logarithmic"} Highcharts.ColorAxisTypeValue
         */
        ''; // detach doclet above

        return ColorAxis;
    });
    _registerModule(_modules, 'Mixins/ColorMapSeries.js', [_modules['Core/Globals.js'], _modules['Core/Series/Point.js'], _modules['Core/Utilities.js']], function (H, Point, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var defined = U.defined,
            addEvent = U.addEvent;
        var noop = H.noop,
            seriesTypes = H.seriesTypes;
        // Move points to the top of the z-index order when hovered
        addEvent(Point, 'afterSetState', function (e) {
            var point = this; // eslint-disable-line no-invalid-this
                if (point.moveToTopOnHover && point.graphic) {
                    point.graphic.attr({
                        zIndex: e && e.state === 'hover' ? 1 : 0
                    });
            }
        });
        /**
         * Mixin for maps and heatmaps
         *
         * @private
         * @mixin Highcharts.colorMapPointMixin
         */
        var colorMapPointMixin = {
                dataLabelOnNull: true,
                moveToTopOnHover: true,
                /* eslint-disable valid-jsdoc */
                /**
                 * Color points have a value option that determines whether or not it is
                 * a null point
                 * @private
                 */
                isValid: function () {
                    // undefined is allowed
                    return (this.value !== null &&
                        this.value !== Infinity &&
                        this.value !== -Infinity);
            }
            /* eslint-enable valid-jsdoc */
        };
        /**
         * @private
         * @mixin Highcharts.colorMapSeriesMixin
         */
        var colorMapSeriesMixin = {
                pointArrayMap: ['value'],
                axisTypes: ['xAxis', 'yAxis', 'colorAxis'],
                trackerGroups: ['group', 'markerGroup', 'dataLabelsGroup'],
                getSymbol: noop,
                parallelArrays: ['x', 'y', 'value'],
                colorKey: 'value',
                pointAttribs: seriesTypes.column.prototype.pointAttribs,
                /* eslint-disable valid-jsdoc */
                /**
                 * Get the color attibutes to apply on the graphic
                 * @private
                 * @function Highcharts.colorMapSeriesMixin.colorAttribs
                 * @param {Highcharts.Point} point
                 * @return {Highcharts.SVGAttributes}
                 */
                colorAttribs: function (point) {
                    var ret = {};
                if (defined(point.color) &&
                    (!point.state || point.state === 'normal') // #15746
                ) {
                    ret[this.colorProp || 'fill'] = point.color;
                }
                return ret;
            }
        };
        var exports = {
                colorMapPointMixin: colorMapPointMixin,
                colorMapSeriesMixin: colorMapSeriesMixin
            };

        return exports;
    });
    _registerModule(_modules, 'Maps/MapNavigationOptionsDefault.js', [_modules['Core/DefaultOptions.js'], _modules['Core/Utilities.js']], function (D, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var extend = U.extend;
        /* *
         *
         *  Constants
         *
         * */
        /**
         * @product      highmaps
         * @optionparent mapNavigation
         */
        var defaultOptions = {
                /**
                 * General options for the map navigation buttons. Individual options
                 * can be given from the [mapNavigation.buttons](#mapNavigation.buttons)
                 * option set.
                 *
                 * @sample {highmaps} maps/mapnavigation/button-theme/
                 *         Theming the navigation buttons
                 */
                buttonOptions: {
                    /**
                     * What box to align the buttons to. Possible values are `plotBox`
                     * and `spacingBox`.
                     *
                     * @type {Highcharts.ButtonRelativeToValue}
                     */
                    alignTo: 'plotBox',
                    /**
                     * The alignment of the navigation buttons.
                     *
                     * @type {Highcharts.AlignValue}
                     */
                    align: 'left',
                    /**
                     * The vertical alignment of the buttons. Individual alignment can
                     * be adjusted by each button's `y` offset.
                     *
                     * @type {Highcharts.VerticalAlignValue}
                     */
                    verticalAlign: 'top',
                    /**
                     * The X offset of the buttons relative to its `align` setting.
                     */
                    x: 0,
                    /**
                     * The width of the map navigation buttons.
                     */
                    width: 18,
                    /**
                     * The pixel height of the map navigation buttons.
                     */
                    height: 18,
                    /**
                     * Padding for the navigation buttons.
                     *
                     * @since 5.0.0
                     */
                    padding: 5,
                    /**
                     * Text styles for the map navigation buttons.
                     *
                     * @type    {Highcharts.CSSObject}
                     * @default {"fontSize": "15px", "fontWeight": "bold"}
                     */
                    style: {
                        /** @ignore */
                        fontSize: '15px',
                        /** @ignore */
                        fontWeight: 'bold'
                    },
                    /**
                     * A configuration object for the button theme. The object accepts
                     * SVG properties like `stroke-width`, `stroke` and `fill`. Tri-state
                     * button styles are supported by the `states.hover` and `states.select`
                     * objects.
                     *
                     * @sample {highmaps} maps/mapnavigation/button-theme/
                     *         Themed navigation buttons
                     *
                     * @type    {Highcharts.SVGAttributes}
                     * @default {"stroke-width": 1, "text-align": "center"}
                     */
                    theme: {
                        /** @ignore */
                        'stroke-width': 1,
                        /** @ignore */
                        'text-align': 'center'
                    }
                },
                /**
                 * The individual buttons for the map navigation. This usually includes
                 * the zoom in and zoom out buttons. Properties for each button is
                 * inherited from
                 * [mapNavigation.buttonOptions](#mapNavigation.buttonOptions), while
                 * individual options can be overridden. But default, the `onclick`, `text`
                 * and `y` options are individual.
                 */
                buttons: {
                    /**
                     * Options for the zoom in button. Properties for the zoom in and zoom
                     * out buttons are inherited from
                     * [mapNavigation.buttonOptions](#mapNavigation.buttonOptions), while
                     * individual options can be overridden. By default, the `onclick`,
                     * `text` and `y` options are individual.
                     *
                     * @extends mapNavigation.buttonOptions
                     */
                    zoomIn: {
                        // eslint-disable-next-line valid-jsdoc
                        /**
                         * Click handler for the button.
                         *
                         * @type    {Function}
                         * @default function () { this.mapZoom(0.5); }
                         */
                        onclick: function () {
                            this.mapZoom(0.5);
                    },
                    /**
                     * The text for the button. The tooltip (title) is a language option
                     * given by [lang.zoomIn](#lang.zoomIn).
                     */
                    text: '+',
                    /**
                     * The position of the zoomIn button relative to the vertical
                     * alignment.
                     */
                    y: 0
                },
                /**
                 * Options for the zoom out button. Properties for the zoom in and
                 * zoom out buttons are inherited from
                 * [mapNavigation.buttonOptions](#mapNavigation.buttonOptions), while
                 * individual options can be overridden. By default, the `onclick`,
                 * `text` and `y` options are individual.
                 *
                 * @extends mapNavigation.buttonOptions
                 */
                zoomOut: {
                    // eslint-disable-next-line valid-jsdoc
                    /**
                     * Click handler for the button.
                     *
                     * @type    {Function}
                     * @default function () { this.mapZoom(2); }
                     */
                    onclick: function () {
                        this.mapZoom(2);
                    },
                    /**
                     * The text for the button. The tooltip (title) is a language option
                     * given by [lang.zoomOut](#lang.zoomIn).
                     */
                    text: '-',
                    /**
                     * The position of the zoomOut button relative to the vertical
                     * alignment.
                     */
                    y: 28
                }
            },
            /**
             * Whether to enable navigation buttons. By default it inherits the
             * [enabled](#mapNavigation.enabled) setting.
             *
             * @type      {boolean}
             * @apioption mapNavigation.enableButtons
             */
            /**
             * Whether to enable map navigation. The default is not to enable
             * navigation, as many choropleth maps are simple and don't need it.
             * Additionally, when touch zoom and mousewheel zoom is enabled, it breaks
             * the default behaviour of these interactions in the website, and the
             * implementer should be aware of this.
             *
             * Individual interactions can be enabled separately, namely buttons,
             * multitouch zoom, double click zoom, double click zoom to element and
             * mousewheel zoom.
             *
             * @type      {boolean}
             * @default   false
             * @apioption mapNavigation.enabled
             */
            /**
             * Enables zooming in on an area on double clicking in the map. By default
             * it inherits the [enabled](#mapNavigation.enabled) setting.
             *
             * @type      {boolean}
             * @apioption mapNavigation.enableDoubleClickZoom
             */
            /**
             * Whether to zoom in on an area when that area is double clicked.
             *
             * @sample {highmaps} maps/mapnavigation/doubleclickzoomto/
             *         Enable double click zoom to
             *
             * @type      {boolean}
             * @default   false
             * @apioption mapNavigation.enableDoubleClickZoomTo
             */
            /**
             * Enables zooming by mouse wheel. By default it inherits the [enabled](
             * #mapNavigation.enabled) setting.
             *
             * @type      {boolean}
             * @apioption mapNavigation.enableMouseWheelZoom
             */
            /**
             * Whether to enable multitouch zooming. Note that if the chart covers the
             * viewport, this prevents the user from using multitouch and touchdrag on
             * the web page, so you should make sure the user is not trapped inside the
             * chart. By default it inherits the [enabled](#mapNavigation.enabled)
             * setting.
             *
             * @type      {boolean}
             * @apioption mapNavigation.enableTouchZoom
             */
            /**
             * Sensitivity of mouse wheel or trackpad scrolling. 1 is no sensitivity,
             * while with 2, one mousewheel delta will zoom in 50%.
             *
             * @since 4.2.4
             */
            mouseWheelSensitivity: 1.1
            // enabled: false,
            // enableButtons: null, // inherit from enabled
            // enableTouchZoom: null, // inherit from enabled
            // enableDoubleClickZoom: null, // inherit from enabled
            // enableDoubleClickZoomTo: false
            // enableMouseWheelZoom: null, // inherit from enabled
        };
        /* *
         *
         *  Composition
         *
         * */
        // Add language
        extend(D.defaultOptions.lang, {
            zoomIn: 'Zoom in',
            zoomOut: 'Zoom out'
        });
        // Set the default map navigation options
        D.defaultOptions.mapNavigation = defaultOptions;
        /* *
         *
         *  Default Export
         *
         * */

        return defaultOptions;
    });
    _registerModule(_modules, 'Maps/MapNavigation.js', [_modules['Core/Chart/Chart.js'], _modules['Core/Globals.js'], _modules['Core/Utilities.js']], function (Chart, H, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var doc = H.doc;
        var addEvent = U.addEvent,
            extend = U.extend,
            merge = U.merge,
            objectEach = U.objectEach,
            pick = U.pick;
        /* eslint-disable no-invalid-this, valid-jsdoc */
        /**
         * @private
         */
        function stopEvent(e) {
            if (e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                e.cancelBubble = true;
            }
        }
        /**
         * The MapNavigation handles buttons for navigation in addition to mousewheel
         * and doubleclick handlers for chart zooming.
         *
         * @private
         * @class
         * @name MapNavigation
         *
         * @param {Highcharts.Chart} chart
         *        The Chart instance.
         */
        function MapNavigation(chart) {
            this.init(chart);
        }
        /**
         * Initialize function.
         *
         * @function MapNavigation#init
         *
         * @param {Highcharts.Chart} chart
         *        The Chart instance.
         *
         * @return {void}
         */
        MapNavigation.prototype.init = function (chart) {
            this.chart = chart;
            chart.mapNavButtons = [];
        };
        /**
         * Update the map navigation with new options. Calling this is the same as
         * calling `chart.update({ mapNavigation: {} })`.
         *
         * @function MapNavigation#update
         *
         * @param {Highcharts.MapNavigationOptions} [options]
         *        New options for the map navigation.
         *
         * @return {void}
         */
        MapNavigation.prototype.update = function (options) {
            var chart = this.chart,
                o = chart.options.mapNavigation,
                attr,
                states,
                hoverStates,
                selectStates,
                outerHandler = function (e) {
                    this.handler.call(chart,
                e);
                stopEvent(e); // Stop default click event (#4444)
            }, mapNavButtons = chart.mapNavButtons;
            // Merge in new options in case of update, and register back to chart
            // options.
            if (options) {
                o = chart.options.mapNavigation =
                    merge(chart.options.mapNavigation, options);
            }
            // Destroy buttons in case of dynamic update
            while (mapNavButtons.length) {
                mapNavButtons.pop().destroy();
            }
            if (pick(o.enableButtons, o.enabled) && !chart.renderer.forExport) {
                objectEach(o.buttons, function (buttonOptions, n) {
                    buttonOptions = merge(o.buttonOptions, buttonOptions);
                    // Presentational
                    if (!chart.styledMode && buttonOptions.theme) {
                        attr = buttonOptions.theme;
                        attr.style = merge(buttonOptions.theme.style, buttonOptions.style // #3203
                        );
                        states = attr.states;
                        hoverStates = states && states.hover;
                        selectStates = states && states.select;
                        delete attr.states;
                    }
                    var button = chart.renderer
                            .button(buttonOptions.text || '', 0, 0, outerHandler, attr, hoverStates, selectStates, void 0, n === 'zoomIn' ? 'topbutton' : 'bottombutton')
                            .addClass('highcharts-map-navigation highcharts-' + {
                            zoomIn: 'zoom-in',
                            zoomOut: 'zoom-out'
                        }[n])
                            .attr({
                            width: buttonOptions.width,
                            height: buttonOptions.height,
                            title: chart.options.lang[n],
                            padding: buttonOptions.padding,
                            zIndex: 5
                        })
                            .add();
                    button.handler = buttonOptions.onclick;
                    // Stop double click event (#4444)
                    addEvent(button.element, 'dblclick', stopEvent);
                    mapNavButtons.push(button);
                    extend(buttonOptions, {
                        width: button.width,
                        height: 2 * button.height
                    });
                    if (!chart.hasLoaded) {
                        // Align it after the plotBox is known (#12776)
                        var unbind_1 = addEvent(chart, 'load',
                            function () {
                                // #15406: Make sure button hasnt been destroyed
                                if (button.element) {
                                    button.align(buttonOptions,
                            false,
                            buttonOptions.alignTo);
                            }
                            unbind_1();
                        });
                    }
                    else {
                        button.align(buttonOptions, false, buttonOptions.alignTo);
                    }
                });
            }
            this.updateEvents(o);
        };
        /**
         * Update events, called internally from the update function. Add new event
         * handlers, or unbinds events if disabled.
         *
         * @function MapNavigation#updateEvents
         *
         * @param {Highcharts.MapNavigationOptions} options
         *        Options for map navigation.
         *
         * @return {void}
         */
        MapNavigation.prototype.updateEvents = function (options) {
            var chart = this.chart;
            // Add the double click event
            if (pick(options.enableDoubleClickZoom, options.enabled) ||
                options.enableDoubleClickZoomTo) {
                this.unbindDblClick = this.unbindDblClick || addEvent(chart.container, 'dblclick', function (e) {
                    chart.pointer.onContainerDblClick(e);
                });
            }
            else if (this.unbindDblClick) {
                // Unbind and set unbinder to undefined
                this.unbindDblClick = this.unbindDblClick();
            }
            // Add the mousewheel event
            if (pick(options.enableMouseWheelZoom, options.enabled)) {
                this.unbindMouseWheel = this.unbindMouseWheel || addEvent(chart.container, doc.onwheel !== void 0 ? 'wheel' : // Newer Firefox
                    doc.onmousewheel !== void 0 ? 'mousewheel' :
                        'DOMMouseScroll', function (e) {
                    // Prevent scrolling when the pointer is over the element
                    // with that class, for example anotation popup #12100.
                    if (!chart.pointer.inClass(e.target, 'highcharts-no-mousewheel')) {
                        chart.pointer.onContainerMouseWheel(e);
                        // Issue #5011, returning false from non-jQuery event does
                        // not prevent default
                        stopEvent(e);
                    }
                    return false;
                });
            }
            else if (this.unbindMouseWheel) {
                // Unbind and set unbinder to undefined
                this.unbindMouseWheel = this.unbindMouseWheel();
            }
        };
        // Add events to the Chart object itself
        extend(Chart.prototype, /** @lends Chart.prototype */ {
            /**
             * Fit an inner box to an outer. If the inner box overflows left or right,
             * align it to the sides of the outer. If it overflows both sides, fit it
             * within the outer. This is a pattern that occurs more places in
             * Highcharts, perhaps it should be elevated to a common utility function.
             *
             * @ignore
             * @function Highcharts.Chart#fitToBox
             *
             * @param {Highcharts.BBoxObject} inner
             *
             * @param {Highcharts.BBoxObject} outer
             *
             * @return {Highcharts.BBoxObject}
             *         The inner box
             */
            fitToBox: function (inner, outer) {
                [['x', 'width'], ['y', 'height']].forEach(function (dim) {
                    var pos = dim[0],
                        size = dim[1];
                    if (inner[pos] + inner[size] >
                        outer[pos] + outer[size]) { // right
                        // the general size is greater, fit fully to outer
                        if (inner[size] > outer[size]) {
                            inner[size] = outer[size];
                            inner[pos] = outer[pos];
                        }
                        else { // align right
                            inner[pos] = outer[pos] +
                                outer[size] - inner[size];
                        }
                    }
                    if (inner[size] > outer[size]) {
                        inner[size] = outer[size];
                    }
                    if (inner[pos] < outer[pos]) {
                        inner[pos] = outer[pos];
                    }
                });
                return inner;
            },
            /**
             * Highmaps only. Zoom in or out of the map. See also {@link Point#zoomTo}.
             * See {@link Chart#fromLatLonToPoint} for how to get the `centerX` and
             * `centerY` parameters for a geographic location.
             *
             * @function Highcharts.Chart#mapZoom
             *
             * @param {number} [howMuch]
             *        How much to zoom the map. Values less than 1 zooms in. 0.5 zooms
             *        in to half the current view. 2 zooms to twice the current view. If
             *        omitted, the zoom is reset.
             *
             * @param {number} [centerX]
             *        The X axis position to center around if available space.
             *
             * @param {number} [centerY]
             *        The Y axis position to center around if available space.
             *
             * @param {number} [mouseX]
             *        Fix the zoom to this position if possible. This is used for
             *        example in mousewheel events, where the area under the mouse
             *        should be fixed as we zoom in.
             *
             * @param {number} [mouseY]
             *        Fix the zoom to this position if possible.
             *
             * @return {void}
             */
            mapZoom: function (howMuch, centerXArg, centerYArg, mouseX, mouseY, animation) {
                var chart = this,
                    xAxis = chart.xAxis[0],
                    xRange = xAxis.max - xAxis.min,
                    centerX = pick(centerXArg,
                    xAxis.min + xRange / 2),
                    newXRange = xRange * howMuch,
                    yAxis = chart.yAxis[0],
                    yRange = yAxis.max - yAxis.min,
                    centerY = pick(centerYArg,
                    yAxis.min + yRange / 2),
                    newYRange = yRange * howMuch,
                    fixToX = mouseX ? ((mouseX - xAxis.pos) / xAxis.len) : 0.5,
                    fixToY = mouseY ? ((mouseY - yAxis.pos) / yAxis.len) : 0.5,
                    newXMin = centerX - newXRange * fixToX,
                    newYMin = centerY - newYRange * fixToY,
                    newExt = chart.fitToBox({
                        x: newXMin,
                        y: newYMin,
                        width: newXRange,
                        height: newYRange
                    }, {
                        x: xAxis.dataMin,
                        y: yAxis.dataMin,
                        width: xAxis.dataMax - xAxis.dataMin,
                        height: yAxis.dataMax - yAxis.dataMin
                    }),
                    zoomOut = (newExt.x <= xAxis.dataMin &&
                        newExt.width >=
                            xAxis.dataMax - xAxis.dataMin &&
                        newExt.y <= yAxis.dataMin &&
                        newExt.height >= yAxis.dataMax - yAxis.dataMin);
                // When mousewheel zooming, fix the point under the mouse
                if (mouseX && xAxis.mapAxis) {
                    xAxis.mapAxis.fixTo = [mouseX - xAxis.pos, centerXArg];
                }
                if (mouseY && yAxis.mapAxis) {
                    yAxis.mapAxis.fixTo = [mouseY - yAxis.pos, centerYArg];
                }
                // Zoom
                if (typeof howMuch !== 'undefined' && !zoomOut) {
                    xAxis.setExtremes(newExt.x, newExt.x + newExt.width, false);
                    yAxis.setExtremes(newExt.y, newExt.y + newExt.height, false);
                    // Reset zoom
                }
                else {
                    xAxis.setExtremes(void 0, void 0, false);
                    yAxis.setExtremes(void 0, void 0, false);
                }
                // Prevent zooming until this one is finished animating
                /*
                chart.holdMapZoom = true;
                setTimeout(function () {
                    chart.holdMapZoom = false;
                }, 200);
                */
                /*
                delay = animation ? animation.duration || 500 : 0;
                if (delay) {
                    chart.isMapZooming = true;
                    setTimeout(function () {
                        chart.isMapZooming = false;
                        if (chart.mapZoomQueue) {
                            chart.mapZoom.apply(chart, chart.mapZoomQueue);
                        }
                        chart.mapZoomQueue = null;
                    }, delay);
                }
                */
                chart.redraw(animation);
            }
        });
        // Extend the Chart.render method to add zooming and panning
        addEvent(Chart, 'beforeRender', function () {
            // Render the plus and minus buttons. Doing this before the shapes makes
            // getBBox much quicker, at least in Chrome.
            this.mapNavigation = new MapNavigation(this);
            this.mapNavigation.update();
        });
        H.MapNavigation = MapNavigation;

    });
    _registerModule(_modules, 'Maps/MapPointer.js', [_modules['Core/Pointer.js'], _modules['Core/Utilities.js']], function (Pointer, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var extend = U.extend,
            pick = U.pick,
            wrap = U.wrap;
        /* eslint-disable no-invalid-this */
        var totalWheelDelta = 0;
        var totalWheelDeltaTimer;
        // Extend the Pointer
        extend(Pointer.prototype, {
            // The event handler for the doubleclick event
            onContainerDblClick: function (e) {
                var chart = this.chart;
                e = this.normalize(e);
                if (chart.options.mapNavigation.enableDoubleClickZoomTo) {
                    if (chart.pointer.inClass(e.target, 'highcharts-tracker') &&
                        chart.hoverPoint) {
                        chart.hoverPoint.zoomTo();
                    }
                }
                else if (chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop)) {
                    chart.mapZoom(0.5, chart.xAxis[0].toValue(e.chartX), chart.yAxis[0].toValue(e.chartY), e.chartX, e.chartY);
                }
            },
            // The event handler for the mouse scroll event
            onContainerMouseWheel: function (e) {
                var chart = this.chart;
                e = this.normalize(e);
                // Firefox uses e.deltaY or e.detail, WebKit and IE uses wheelDelta
                var delta = e.deltaY || e.detail || -(e.wheelDelta / 120);
                // Wheel zooming on trackpads have different behaviours in Firefox vs
                // WebKit. In Firefox the delta increments in steps by 1, so it is not
                // distinguishable from true mouse wheel. Therefore we use this timer
                // to avoid trackpad zooming going too fast and out of control. In
                // WebKit however, the delta is < 1, so we simply disable animation in
                // the `chart.mapZoom` call below.
                if (Math.abs(delta) >= 1) {
                    totalWheelDelta += Math.abs(delta);
                    if (totalWheelDeltaTimer) {
                        clearTimeout(totalWheelDeltaTimer);
                    }
                    totalWheelDeltaTimer = setTimeout(function () {
                        totalWheelDelta = 0;
                    }, 50);
                }
                if (totalWheelDelta < 10 && chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop)) {
                    chart.mapZoom(Math.pow(chart.options.mapNavigation.mouseWheelSensitivity, delta), chart.xAxis[0].toValue(e.chartX), chart.yAxis[0].toValue(e.chartY), e.chartX, e.chartY, 
                    // Delta less than 1 indicates stepless/trackpad zooming, avoid
                    // animation delaying the zoom
                    Math.abs(delta) < 1 ? false : void 0);
                }
            }
        });
        // The pinchType is inferred from mapNavigation options.
        wrap(Pointer.prototype, 'zoomOption', function (proceed) {
            var mapNavigation = this.chart.options.mapNavigation;
            // Pinch status
            if (pick(mapNavigation.enableTouchZoom, mapNavigation.enabled)) {
                this.chart.options.chart.pinchType = 'xy';
            }
            proceed.apply(this, [].slice.call(arguments, 1));
        });
        // Extend the pinchTranslate method to preserve fixed ratio when zooming
        wrap(Pointer.prototype, 'pinchTranslate', function (proceed, pinchDown, touches, transform, selectionMarker, clip, lastValidTouch) {
            var xBigger;
            proceed.call(this, pinchDown, touches, transform, selectionMarker, clip, lastValidTouch);
            // Keep ratio
            if (this.chart.options.chart.type === 'map' && this.hasZoom) {
                xBigger = transform.scaleX > transform.scaleY;
                this.pinchTranslateDirection(!xBigger, pinchDown, touches, transform, selectionMarker, clip, lastValidTouch, xBigger ? transform.scaleX : transform.scaleY);
            }
        });

    });
    _registerModule(_modules, 'Maps/MapSymbols.js', [_modules['Core/Renderer/SVG/SVGRenderer.js']], function (SVGRenderer) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var symbols = SVGRenderer.prototype.symbols;
        /* *
         *
         *  Functions
         *
         * */
        /* eslint-disable require-jsdoc, valid-jsdoc */
        function bottomButton(x, y, w, h, options) {
            var r = (options && options.r) || 0;
            return selectiveRoundedRect(x - 1, y - 1, w, h, 0, 0, r, r);
        }
        /**
         * Create symbols for the zoom buttons
         * @private
         */
        function selectiveRoundedRect(x, y, w, h, rTopLeft, rTopRight, rBottomRight, rBottomLeft) {
            return [
                ['M', x + rTopLeft, y],
                // top side
                ['L', x + w - rTopRight, y],
                // top right corner
                ['C', x + w - rTopRight / 2, y, x + w, y + rTopRight / 2, x + w, y + rTopRight],
                // right side
                ['L', x + w, y + h - rBottomRight],
                // bottom right corner
                ['C', x + w, y + h - rBottomRight / 2, x + w - rBottomRight / 2, y + h, x + w - rBottomRight, y + h],
                // bottom side
                ['L', x + rBottomLeft, y + h],
                // bottom left corner
                ['C', x + rBottomLeft / 2, y + h, x, y + h - rBottomLeft / 2, x, y + h - rBottomLeft],
                // left side
                ['L', x, y + rTopLeft],
                // top left corner
                ['C', x, y + rTopLeft / 2, x + rTopLeft / 2, y, x + rTopLeft, y],
                ['Z']
            ];
        }
        function topButton(x, y, w, h, options) {
            var r = (options && options.r) || 0;
            return selectiveRoundedRect(x - 1, y - 1, w, h, r, r, 0, 0);
        }
        symbols.bottombutton = bottomButton;
        symbols.topbutton = topButton;
        /* *
         *
         *  Default Export
         *
         * */

        return symbols;
    });
    _registerModule(_modules, 'Core/Chart/MapChart.js', [_modules['Core/Chart/Chart.js'], _modules['Core/DefaultOptions.js'], _modules['Core/Renderer/SVG/SVGRenderer.js'], _modules['Core/Utilities.js']], function (Chart, D, SVGRenderer, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
                var extendStatics = function (d,
            b) {
                    extendStatics = Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array && function (d,
            b) { d.__proto__ = b; }) ||
                        function (d,
            b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var getOptions = D.getOptions;
        var merge = U.merge,
            pick = U.pick;
        /**
         * Map-optimized chart. Use {@link Highcharts.Chart|Chart} for common charts.
         *
         * @requires modules/map
         *
         * @class
         * @name Highcharts.MapChart
         * @extends Highcharts.Chart
         */
        var MapChart = /** @class */ (function (_super) {
                __extends(MapChart, _super);
            function MapChart() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /**
             * Initializes the chart. The constructor's arguments are passed on
             * directly.
             *
             * @function Highcharts.MapChart#init
             *
             * @param {Highcharts.Options} userOptions
             *        Custom options.
             *
             * @param {Function} [callback]
             *        Function to run when the chart has loaded and and all external
             *        images are loaded.
             *
             * @return {void}
             *
             * @fires Highcharts.MapChart#event:init
             * @fires Highcharts.MapChart#event:afterInit
             */
            MapChart.prototype.init = function (userOptions, callback) {
                var hiddenAxis = {
                        endOnTick: false,
                        visible: false,
                        minPadding: 0,
                        maxPadding: 0,
                        startOnTick: false
                    },
                    defaultCreditsOptions = getOptions().credits;
                /* For visual testing
                hiddenAxis.gridLineWidth = 1;
                hiddenAxis.gridZIndex = 10;
                hiddenAxis.tickPositions = undefined;
                // */
                var options = merge({
                        chart: {
                            panning: {
                                enabled: true,
                                type: 'xy'
                            },
                            type: 'map'
                        },
                        credits: {
                            mapText: pick(defaultCreditsOptions.mapText, ' \u00a9 <a href="{geojson.copyrightUrl}">' +
                                '{geojson.copyrightShort}</a>'),
                            mapTextFull: pick(defaultCreditsOptions.mapTextFull, '{geojson.copyright}')
                        },
                        tooltip: {
                            followTouchMove: false
                        },
                        xAxis: hiddenAxis,
                        yAxis: merge(hiddenAxis, { reversed: true })
                    },
                    userOptions, // user's options
                    {
                        chart: {
                            inverted: false,
                            alignTicks: false
                        }
                    });
                _super.prototype.init.call(this, options, callback);
            };
            return MapChart;
        }(Chart));
        /* eslint-disable valid-jsdoc */
        (function (MapChart) {
            /**
             * Contains all loaded map data for Highmaps.
             *
             * @requires modules/map
             *
             * @name Highcharts.maps
             * @type {Record<string,*>}
             */
            MapChart.maps = {};
            /**
             * The factory function for creating new map charts. Creates a new {@link
             * Highcharts.MapChart|MapChart} object with different default options than
             * the basic Chart.
             *
             * @requires modules/map
             *
             * @function Highcharts.mapChart
             *
             * @param {string|Highcharts.HTMLDOMElement} [renderTo]
             * The DOM element to render to, or its id.
             *
             * @param {Highcharts.Options} options
             * The chart options structure as described in the
             * [options reference](https://api.highcharts.com/highstock).
             *
             * @param {Highcharts.ChartCallbackFunction} [callback]
             * A function to execute when the chart object is finished loading and
             * rendering. In most cases the chart is built in one thread, but in
             * Internet Explorer version 8 or less the chart is sometimes initialized
             * before the document is ready, and in these cases the chart object will
             * not be finished synchronously. As a consequence, code that relies on the
             * newly built Chart object should always run in the callback. Defining a
             * [chart.events.load](https://api.highcharts.com/highstock/chart.events.load)
             * handler is equivalent.
             *
             * @return {Highcharts.MapChart}
             * The chart object.
             */
            function mapChart(a, b, c) {
                return new MapChart(a, b, c);
            }
            MapChart.mapChart = mapChart;
            /**
             * Utility for reading SVG paths directly.
             *
             * @requires modules/map
             *
             * @function Highcharts.splitPath
             *
             * @param {string|Array<string|number>} path
             *
             * @return {Highcharts.SVGPathArray}
             */
            function splitPath(path) {
                var arr;
                if (typeof path === 'string') {
                    path = path
                        // Move letters apart
                        .replace(/([A-Za-z])/g, ' $1 ')
                        // Trim
                        .replace(/^\s*/, '').replace(/\s*$/, '');
                    // Split on spaces and commas. The semicolon is bogus, designed to
                    // circumvent string replacement in the pre-v7 assembler that built
                    // specific styled mode files.
                    var split = path.split(/[ ,;]+/);
                    arr = split.map(function (item) {
                        if (!/[A-za-z]/.test(item)) {
                            return parseFloat(item);
                        }
                        return item;
                    });
                }
                else {
                    arr = path;
                }
                return SVGRenderer.prototype.pathToSegments(arr);
            }
            MapChart.splitPath = splitPath;
        })(MapChart || (MapChart = {}));
        /* *
         *
         *  Default Export
         *
         * */

        return MapChart;
    });
    _registerModule(_modules, 'Series/Map/MapPoint.js', [_modules['Mixins/ColorMapSeries.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (ColorMapMixin, SeriesRegistry, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
                var extendStatics = function (d,
            b) {
                    extendStatics = Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array && function (d,
            b) { d.__proto__ = b; }) ||
                        function (d,
            b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var colorMapPointMixin = ColorMapMixin.colorMapPointMixin;
        var ScatterSeries = SeriesRegistry.seriesTypes.scatter;
        var extend = U.extend;
        /* *
         *
         *  Class
         *
         * */
        var MapPoint = /** @class */ (function (_super) {
                __extends(MapPoint, _super);
            function MapPoint() {
                /* *
                 *
                 *  Properties
                 *
                 * */
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                _this.options = void 0;
                _this.path = void 0;
                _this.series = void 0;
                return _this;
                /* eslint-enable valid-jsdoc */
            }
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            /**
             * Extend the Point object to split paths.
             * @private
             */
            MapPoint.prototype.applyOptions = function (options, x) {
                var series = this.series,
                    point = _super.prototype.applyOptions.call(this,
                    options,
                    x),
                    joinBy = series.joinBy,
                    mapPoint;
                if (series.mapData && series.mapMap) {
                    var joinKey = joinBy[1];
                    var mapKey = _super.prototype.getNestedProperty.call(point,
                        joinKey);
                    mapPoint = typeof mapKey !== 'undefined' &&
                        series.mapMap[mapKey];
                    if (mapPoint) {
                        // This applies only to bubbles
                        if (series.xyFromShape) {
                            point.x = mapPoint._midX;
                            point.y = mapPoint._midY;
                        }
                        extend(point, mapPoint); // copy over properties
                    }
                    else {
                        point.value = point.value || null;
                    }
                }
                return point;
            };
            /**
             * Stop the fade-out
             * @private
             */
            MapPoint.prototype.onMouseOver = function (e) {
                U.clearTimeout(this.colorInterval);
                if (this.value !== null || this.series.options.nullInteraction) {
                    _super.prototype.onMouseOver.call(this, e);
                }
                else {
                    // #3401 Tooltip doesn't hide when hovering over null points
                    this.series.onMouseOut(e);
                }
            };
            /**
             * Highmaps only. Zoom in on the point using the global animation.
             *
             * @sample maps/members/point-zoomto/
             *         Zoom to points from butons
             *
             * @requires modules/map
             *
             * @function Highcharts.Point#zoomTo
             */
            MapPoint.prototype.zoomTo = function () {
                var point = this,
                    series = point.series;
                series.xAxis.setExtremes(point._minX, point._maxX, false);
                series.yAxis.setExtremes(point._minY, point._maxY, false);
                series.chart.redraw();
            };
            return MapPoint;
        }(ScatterSeries.prototype.pointClass));
        extend(MapPoint.prototype, {
            dataLabelOnNull: colorMapPointMixin.dataLabelOnNull,
            isValid: colorMapPointMixin.isValid,
            moveToTopOnHover: colorMapPointMixin.moveToTopOnHover
        });
        /* *
         *
         *  Default Export
         *
         * */

        return MapPoint;
    });
    _registerModule(_modules, 'Series/Map/MapSeries.js', [_modules['Mixins/ColorMapSeries.js'], _modules['Core/Globals.js'], _modules['Core/Legend/LegendSymbol.js'], _modules['Core/Chart/MapChart.js'], _modules['Series/Map/MapPoint.js'], _modules['Core/Color/Palette.js'], _modules['Core/Series/Series.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Renderer/SVG/SVGRenderer.js'], _modules['Core/Utilities.js']], function (ColorMapMixin, H, LegendSymbol, MapChart, MapPoint, palette, Series, SeriesRegistry, SVGRenderer, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
                var extendStatics = function (d,
            b) {
                    extendStatics = Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array && function (d,
            b) { d.__proto__ = b; }) ||
                        function (d,
            b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var colorMapSeriesMixin = ColorMapMixin.colorMapSeriesMixin;
        var noop = H.noop;
        var maps = MapChart.maps,
            splitPath = MapChart.splitPath;
        var 
            // indirect dependency to keep product size low
            _a = SeriesRegistry.seriesTypes,
            ColumnSeries = _a.column,
            ScatterSeries = _a.scatter;
        var extend = U.extend,
            fireEvent = U.fireEvent,
            getNestedProperty = U.getNestedProperty,
            isArray = U.isArray,
            isNumber = U.isNumber,
            merge = U.merge,
            objectEach = U.objectEach,
            pick = U.pick,
            splat = U.splat;
        /* *
         *
         *  Class
         *
         * */
        /**
         * @private
         * @class
         * @name Highcharts.seriesTypes.map
         *
         * @augments Highcharts.Series
         */
        var MapSeries = /** @class */ (function (_super) {
                __extends(MapSeries, _super);
            function MapSeries() {
                /* *
                 *
                 *  Static Properties
                 *
                 * */
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                /* *
                 *
                 *  Properties
                 *
                 * */
                _this.baseTrans = void 0;
                _this.chart = void 0;
                _this.data = void 0;
                _this.group = void 0;
                _this.joinBy = void 0;
                _this.options = void 0;
                _this.points = void 0;
                _this.transformGroup = void 0;
                return _this;
                /* eslint-enable valid-jsdoc */
            }
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            /**
             * The initial animation for the map series. By default, animation is
             * disabled. Animation of map shapes is not at all supported in VML
             * browsers.
             * @private
             */
            MapSeries.prototype.animate = function (init) {
                var chart = this.chart,
                    animation = this.options.animation,
                    group = this.group,
                    xAxis = this.xAxis,
                    yAxis = this.yAxis,
                    left = xAxis.pos,
                    top = yAxis.pos;
                if (chart.renderer.isSVG) {
                    if (animation === true) {
                        animation = {
                            duration: 1000
                        };
                    }
                    // Initialize the animation
                    if (init) {
                        // Scale down the group and place it in the center
                        group.attr({
                            translateX: left + xAxis.len / 2,
                            translateY: top + yAxis.len / 2,
                            scaleX: 0.001,
                            scaleY: 0.001
                        });
                        // Run the animation
                    }
                    else {
                        group.animate({
                            translateX: left,
                            translateY: top,
                            scaleX: 1,
                            scaleY: 1
                        }, animation);
                    }
                }
            };
            /**
             * Animate in the new series from the clicked point in the old series.
             * Depends on the drilldown.js module
             * @private
             */
            MapSeries.prototype.animateDrilldown = function (init) {
                var toBox = this.chart.plotBox,
                    level = this.chart.drilldownLevels[this.chart.drilldownLevels.length - 1],
                    fromBox = level.bBox,
                    animationOptions = this.chart.options.drilldown.animation,
                    scale;
                if (!init) {
                    scale = Math.min(fromBox.width / toBox.width, fromBox.height / toBox.height);
                    level.shapeArgs = {
                        scaleX: scale,
                        scaleY: scale,
                        translateX: fromBox.x,
                        translateY: fromBox.y
                    };
                    this.points.forEach(function (point) {
                        if (point.graphic) {
                            point.graphic
                                .attr(level.shapeArgs)
                                .animate({
                                scaleX: 1,
                                scaleY: 1,
                                translateX: 0,
                                translateY: 0
                            }, animationOptions);
                        }
                    });
                }
            };
            /**
             * When drilling up, pull out the individual point graphics from the lower
             * series and animate them into the origin point in the upper series.
             * @private
             */
            MapSeries.prototype.animateDrillupFrom = function (level) {
                ColumnSeries.prototype.animateDrillupFrom.call(this, level);
            };
            /**
             * When drilling up, keep the upper series invisible until the lower series
             * has moved into place.
             * @private
             */
            MapSeries.prototype.animateDrillupTo = function (init) {
                ColumnSeries.prototype.animateDrillupTo.call(this, init);
            };
            /**
             * Allow a quick redraw by just translating the area group. Used for zooming
             * and panning in capable browsers.
             * @private
             */
            MapSeries.prototype.doFullTranslate = function () {
                return (this.isDirtyData ||
                    this.chart.isResizing ||
                    this.chart.renderer.isVML ||
                    !this.baseTrans);
            };
            /**
             * Draw the data labels. Special for maps is the time that the data labels
             * are drawn (after points), and the clipping of the dataLabelsGroup.
             * @private
             */
            MapSeries.prototype.drawMapDataLabels = function () {
                Series.prototype.drawDataLabels.call(this);
                if (this.dataLabelsGroup) {
                    this.dataLabelsGroup.clip(this.chart.clipRect);
                }
            };
            /**
             * Use the drawPoints method of column, that is able to handle simple
             * shapeArgs. Extend it by assigning the tooltip position.
             * @private
             */
            MapSeries.prototype.drawPoints = function () {
                var series = this,
                    xAxis = series.xAxis,
                    yAxis = series.yAxis,
                    group = series.group,
                    chart = series.chart,
                    renderer = chart.renderer,
                    scaleX,
                    scaleY,
                    translateX,
                    translateY,
                    baseTrans = this.baseTrans,
                    transformGroup,
                    startTranslateX,
                    startTranslateY,
                    startScaleX,
                    startScaleY;
                // Set a group that handles transform during zooming and panning in
                // order to preserve clipping on series.group
                if (!series.transformGroup) {
                    series.transformGroup = renderer.g()
                        .attr({
                        scaleX: 1,
                        scaleY: 1
                    })
                        .add(group);
                    series.transformGroup.survive = true;
                }
                // Draw the shapes again
                if (series.doFullTranslate()) {
                    // Individual point actions.
                    if (chart.hasRendered && !chart.styledMode) {
                        series.points.forEach(function (point) {
                            // Restore state color on update/redraw (#3529)
                            if (point.shapeArgs) {
                                point.shapeArgs.fill = series.pointAttribs(point, point.state).fill;
                            }
                        });
                    }
                    // Draw them in transformGroup
                    series.group = series.transformGroup;
                    ColumnSeries.prototype.drawPoints.apply(series);
                    series.group = group; // Reset
                    // Add class names
                    series.points.forEach(function (point) {
                        if (point.graphic) {
                            var className = '';
                            if (point.name) {
                                className +=
                                    'highcharts-name-' +
                                        point.name.replace(/ /g, '-').toLowerCase();
                            }
                            if (point.properties &&
                                point.properties['hc-key']) {
                                className +=
                                    ' highcharts-key-' +
                                        point.properties['hc-key'].toLowerCase();
                            }
                            if (className) {
                                point.graphic.addClass(className);
                            }
                            // In styled mode, apply point colors by CSS
                            if (chart.styledMode) {
                                point.graphic.css(series.pointAttribs(point, point.selected && 'select' || void 0));
                            }
                        }
                    });
                    // Set the base for later scale-zooming. The originX and originY
                    // properties are the axis values in the plot area's upper left
                    // corner.
                    this.baseTrans = {
                        originX: (xAxis.min -
                            xAxis.minPixelPadding / xAxis.transA),
                        originY: (yAxis.min -
                            yAxis.minPixelPadding / yAxis.transA +
                            (yAxis.reversed ? 0 : yAxis.len / yAxis.transA)),
                        transAX: xAxis.transA,
                        transAY: yAxis.transA
                    };
                    // Reset transformation in case we're doing a full translate
                    // (#3789)
                    this.transformGroup.animate({
                        translateX: 0,
                        translateY: 0,
                        scaleX: 1,
                        scaleY: 1
                    });
                    // Just update the scale and transform for better performance
                }
                else {
                    scaleX = xAxis.transA / baseTrans.transAX;
                    scaleY = yAxis.transA / baseTrans.transAY;
                    translateX = xAxis.toPixels(baseTrans.originX, true);
                    translateY = yAxis.toPixels(baseTrans.originY, true);
                    // Handle rounding errors in normal view (#3789)
                    if (scaleX > 0.99 &&
                        scaleX < 1.01 &&
                        scaleY > 0.99 &&
                        scaleY < 1.01) {
                        scaleX = 1;
                        scaleY = 1;
                        translateX = Math.round(translateX);
                        translateY = Math.round(translateY);
                    }
                    /* Animate or move to the new zoom level. In order to prevent
                        flickering as the different transform components are set out
                        of sync (#5991), we run a fake animator attribute and set
                        scale and translation synchronously in the same step.

                        A possible improvement to the API would be to handle this in
                        the renderer or animation engine itself, to ensure that when
                        we are animating multiple properties, we make sure that each
                        step for each property is performed in the same step. Also,
                        for symbols and for transform properties, it should induce a
                        single updateTransform and symbolAttr call. */
                    transformGroup = this.transformGroup;
                    if (chart.renderer.globalAnimation) {
                        startTranslateX = transformGroup.attr('translateX');
                        startTranslateY = transformGroup.attr('translateY');
                        startScaleX = transformGroup.attr('scaleX');
                        startScaleY = transformGroup.attr('scaleY');
                        transformGroup
                            .attr({ animator: 0 })
                            .animate({
                            animator: 1
                        }, {
                            step: function (now, fx) {
                                transformGroup.attr({
                                    translateX: (startTranslateX +
                                        (translateX - startTranslateX) * fx.pos),
                                    translateY: (startTranslateY +
                                        (translateY - startTranslateY) * fx.pos),
                                    scaleX: (startScaleX +
                                        (scaleX - startScaleX) *
                                            fx.pos),
                                    scaleY: (startScaleY +
                                        (scaleY - startScaleY) * fx.pos)
                                });
                            }
                        });
                        // When dragging, animation is off.
                    }
                    else {
                        transformGroup.attr({
                            translateX: translateX,
                            translateY: translateY,
                            scaleX: scaleX,
                            scaleY: scaleY
                        });
                    }
                }
                /* Set the stroke-width directly on the group element so the
                    children inherit it. We need to use setAttribute directly,
                    because the stroke-widthSetter method expects a stroke color also
                    to be set. */
                if (!chart.styledMode) {
                    group.element.setAttribute('stroke-width', (pick(series.options[(series.pointAttrToOptions &&
                        series.pointAttrToOptions['stroke-width']) || 'borderWidth'], 1 // Styled mode
                    ) / (scaleX || 1)));
                }
                this.drawMapDataLabels();
            };
            /**
             * Get the bounding box of all paths in the map combined.
             * @private
             */
            MapSeries.prototype.getBox = function (paths) {
                var MAX_VALUE = Number.MAX_VALUE,
                    maxX = -MAX_VALUE,
                    minX = MAX_VALUE,
                    maxY = -MAX_VALUE,
                    minY = MAX_VALUE,
                    minRange = MAX_VALUE,
                    xAxis = this.xAxis,
                    yAxis = this.yAxis,
                    hasBox;
                // Find the bounding box
                (paths || []).forEach(function (point) {
                    if (point.path) {
                        if (typeof point.path === 'string') {
                            point.path = splitPath(point.path);
                            // Legacy one-dimensional array
                        }
                        else if (point.path[0] === 'M') {
                            point.path = SVGRenderer.prototype.pathToSegments(point.path);
                        }
                        var path = point.path || [],
                            pointMaxX_1 = -MAX_VALUE,
                            pointMinX_1 = MAX_VALUE,
                            pointMaxY_1 = -MAX_VALUE,
                            pointMinY_1 = MAX_VALUE,
                            properties = point.properties;
                        // The first time a map point is used, analyze its box
                        if (!point._foundBox) {
                            path.forEach(function (seg) {
                                var x = seg[seg.length - 2];
                                var y = seg[seg.length - 1];
                                if (typeof x === 'number' && typeof y === 'number') {
                                    pointMinX_1 = Math.min(pointMinX_1, x);
                                    pointMaxX_1 = Math.max(pointMaxX_1, x);
                                    pointMinY_1 = Math.min(pointMinY_1, y);
                                    pointMaxY_1 = Math.max(pointMaxY_1, y);
                                }
                            });
                            // Cache point bounding box for use to position data
                            // labels, bubbles etc
                            point._midX = (pointMinX_1 + (pointMaxX_1 - pointMinX_1) * pick(point.middleX, properties &&
                                properties['hc-middle-x'], 0.5));
                            point._midY = (pointMinY_1 + (pointMaxY_1 - pointMinY_1) * pick(point.middleY, properties &&
                                properties['hc-middle-y'], 0.5));
                            point._maxX = pointMaxX_1;
                            point._minX = pointMinX_1;
                            point._maxY = pointMaxY_1;
                            point._minY = pointMinY_1;
                            point.labelrank = pick(point.labelrank, (pointMaxX_1 - pointMinX_1) * (pointMaxY_1 - pointMinY_1));
                            point._foundBox = true;
                        }
                        maxX = Math.max(maxX, point._maxX);
                        minX = Math.min(minX, point._minX);
                        maxY = Math.max(maxY, point._maxY);
                        minY = Math.min(minY, point._minY);
                        minRange = Math.min(point._maxX - point._minX, point._maxY - point._minY, minRange);
                        hasBox = true;
                    }
                });
                // Set the box for the whole series
                if (hasBox) {
                    this.minY = Math.min(minY, pick(this.minY, MAX_VALUE));
                    this.maxY = Math.max(maxY, pick(this.maxY, -MAX_VALUE));
                    this.minX = Math.min(minX, pick(this.minX, MAX_VALUE));
                    this.maxX = Math.max(maxX, pick(this.maxX, -MAX_VALUE));
                    // If no minRange option is set, set the default minimum zooming
                    // range to 5 times the size of the smallest element
                    if (xAxis && typeof xAxis.options.minRange === 'undefined') {
                        xAxis.minRange = Math.min(5 * minRange, (this.maxX - this.minX) / 5, xAxis.minRange || MAX_VALUE);
                    }
                    if (yAxis && typeof yAxis.options.minRange === 'undefined') {
                        yAxis.minRange = Math.min(5 * minRange, (this.maxY - this.minY) / 5, yAxis.minRange || MAX_VALUE);
                    }
                }
            };
            MapSeries.prototype.getExtremes = function () {
                // Get the actual value extremes for colors
                var _a = Series.prototype.getExtremes
                        .call(this,
                    this.valueData),
                    dataMin = _a.dataMin,
                    dataMax = _a.dataMax;
                // Recalculate box on updated data
                if (this.chart.hasRendered && this.isDirtyData) {
                    this.getBox(this.options.data);
                }
                if (isNumber(dataMin)) {
                    this.valueMin = dataMin;
                }
                if (isNumber(dataMax)) {
                    this.valueMax = dataMax;
                }
                // Extremes for the mock Y axis
                return { dataMin: this.minY, dataMax: this.maxY };
            };
            /**
             * Define hasData function for non-cartesian series. Returns true if the
             * series has points at all.
             * @private
             */
            MapSeries.prototype.hasData = function () {
                return !!this.processedXData.length; // != 0
            };
            /**
             * Get presentational attributes. In the maps series this runs in both
             * styled and non-styled mode, because colors hold data when a colorAxis is
             * used.
             * @private
             */
            MapSeries.prototype.pointAttribs = function (point, state) {
                var attr = point.series.chart.styledMode ?
                        this.colorAttribs(point) :
                        ColumnSeries.prototype.pointAttribs.call(this,
                    point,
                    state);
                // Set the stroke-width on the group element and let all point
                // graphics inherit. That way we don't have to iterate over all
                // points to update the stroke-width on zooming.
                attr['stroke-width'] = pick(point.options[(this.pointAttrToOptions &&
                    this.pointAttrToOptions['stroke-width']) || 'borderWidth'], 'inherit');
                return attr;
            };
            /**
             * Override render to throw in an async call in IE8. Otherwise it chokes on
             * the US counties demo.
             * @private
             */
            MapSeries.prototype.render = function () {
                var series = this,
                    render = Series.prototype.render;
                // Give IE8 some time to breathe.
                if (series.chart.renderer.isVML && series.data.length > 3000) {
                    setTimeout(function () {
                        render.call(series);
                    });
                }
                else {
                    render.call(series);
                }
            };
            /**
             * Extend setData to join in mapData. If the allAreas option is true, all
             * areas from the mapData are used, and those that don't correspond to a
             * data value are given null values.
             * @private
             */
            MapSeries.prototype.setData = function (data, redraw, animation, updatePoints) {
                var options = this.options,
                    chartOptions = this.chart.options.chart,
                    globalMapData = chartOptions && chartOptions.map,
                    mapData = options.mapData,
                    joinBy = this.joinBy,
                    pointArrayMap = options.keys || this.pointArrayMap,
                    dataUsed = [],
                    mapMap = {},
                    mapPoint,
                    mapTransforms = this.chart.mapTransforms,
                    props,
                    i;
                // Collect mapData from chart options if not defined on series
                if (!mapData && globalMapData) {
                    mapData = typeof globalMapData === 'string' ?
                        maps[globalMapData] :
                        globalMapData;
                }
                // Pick up numeric values, add index
                // Convert Array point definitions to objects using pointArrayMap
                if (data) {
                    data.forEach(function (val, i) {
                        var ix = 0;
                        if (isNumber(val)) {
                            data[i] = {
                                value: val
                            };
                        }
                        else if (isArray(val)) {
                            data[i] = {};
                            // Automatically copy first item to hc-key if there is
                            // an extra leading string
                            if (!options.keys &&
                                val.length > pointArrayMap.length &&
                                typeof val[0] === 'string') {
                                data[i]['hc-key'] = val[0];
                                ++ix;
                            }
                            // Run through pointArrayMap and what's left of the
                            // point data array in parallel, copying over the values
                            for (var j = 0; j < pointArrayMap.length; ++j, ++ix) {
                                if (pointArrayMap[j] &&
                                    typeof val[ix] !== 'undefined') {
                                    if (pointArrayMap[j].indexOf('.') > 0) {
                                        MapPoint.prototype.setNestedProperty(data[i], val[ix], pointArrayMap[j]);
                                    }
                                    else {
                                        data[i][pointArrayMap[j]] =
                                            val[ix];
                                    }
                                }
                            }
                        }
                        if (joinBy && joinBy[0] === '_i') {
                            data[i]._i = i;
                        }
                    });
                }
                this.getBox(data);
                // Pick up transform definitions for chart
                this.chart.mapTransforms = mapTransforms =
                    chartOptions.mapTransforms ||
                        mapData && mapData['hc-transform'] ||
                        mapTransforms;
                // Cache cos/sin of transform rotation angle
                if (mapTransforms) {
                    objectEach(mapTransforms, function (transform) {
                        if (transform.rotation) {
                            transform.cosAngle = Math.cos(transform.rotation);
                            transform.sinAngle = Math.sin(transform.rotation);
                        }
                    });
                }
                if (mapData) {
                    if (mapData.type === 'FeatureCollection') {
                        this.mapTitle = mapData.title;
                        mapData = H.geojson(mapData, this.type, this);
                    }
                    this.mapData = mapData;
                    this.mapMap = {};
                    for (i = 0; i < mapData.length; i++) {
                        mapPoint = mapData[i];
                        props = mapPoint.properties;
                        mapPoint._i = i;
                        // Copy the property over to root for faster access
                        if (joinBy[0] && props && props[joinBy[0]]) {
                            mapPoint[joinBy[0]] = props[joinBy[0]];
                        }
                        mapMap[mapPoint[joinBy[0]]] = mapPoint;
                    }
                    this.mapMap = mapMap;
                    // Registered the point codes that actually hold data
                    if (data && joinBy[1]) {
                        var joinKey_1 = joinBy[1];
                        data.forEach(function (pointOptions) {
                            var mapKey = getNestedProperty(joinKey_1,
                                pointOptions);
                            if (mapMap[mapKey]) {
                                dataUsed.push(mapMap[mapKey]);
                            }
                        });
                    }
                    if (options.allAreas) {
                        this.getBox(mapData);
                        data = data || [];
                        // Registered the point codes that actually hold data
                        if (joinBy[1]) {
                            var joinKey_2 = joinBy[1];
                            data.forEach(function (pointOptions) {
                                dataUsed.push(getNestedProperty(joinKey_2, pointOptions));
                            });
                        }
                        // Add those map points that don't correspond to data, which
                        // will be drawn as null points
                        dataUsed = ('|' + dataUsed.map(function (point) {
                            return point && point[joinBy[0]];
                        }).join('|') + '|'); // Faster than array.indexOf
                        mapData.forEach(function (mapPoint) {
                            if (!joinBy[0] ||
                                dataUsed.indexOf('|' + mapPoint[joinBy[0]] + '|') === -1) {
                                data.push(merge(mapPoint, { value: null }));
                                // #5050 - adding all areas causes the update
                                // optimization of setData to kick in, even though
                                // the point order has changed
                                updatePoints = false;
                            }
                        });
                    }
                    else {
                        this.getBox(dataUsed); // Issue #4784
                    }
                }
                Series.prototype.setData.call(this, data, redraw, animation, updatePoints);
            };
            /**
             * Extend setOptions by picking up the joinBy option and applying it to a
             * series property.
             * @private
             */
            MapSeries.prototype.setOptions = function (itemOptions) {
                var options = Series.prototype.setOptions.call(this,
                    itemOptions),
                    joinBy = options.joinBy,
                    joinByNull = joinBy === null;
                if (joinByNull) {
                    joinBy = '_i';
                }
                joinBy = this.joinBy = splat(joinBy);
                if (!joinBy[1]) {
                    joinBy[1] = joinBy[0];
                }
                return options;
            };
            /**
             * Add the path option for data points. Find the max value for color
             * calculation.
             * @private
             */
            MapSeries.prototype.translate = function () {
                var series = this,
                    xAxis = series.xAxis,
                    yAxis = series.yAxis,
                    doFullTranslate = series.doFullTranslate();
                series.generatePoints();
                series.data.forEach(function (point) {
                    // Record the middle point (loosely based on centroid),
                    // determined by the middleX and middleY options.
                    if (isNumber(point._midX) && isNumber(point._midY)) {
                        point.plotX = xAxis.toPixels(point._midX, true);
                        point.plotY = yAxis.toPixels(point._midY, true);
                    }
                    if (doFullTranslate) {
                        point.shapeType = 'path';
                        point.shapeArgs = {
                            d: series.translatePath(point.path)
                        };
                    }
                });
                fireEvent(series, 'afterTranslate');
            };
            /**
             * Translate the path, so it automatically fits into the plot area box.
             * @private
             */
            MapSeries.prototype.translatePath = function (path) {
                var series = this,
                    xAxis = series.xAxis,
                    yAxis = series.yAxis,
                    xMin = xAxis.min,
                    xTransA = xAxis.transA,
                    xMinPixelPadding = xAxis.minPixelPadding,
                    yMin = yAxis.min,
                    yTransA = yAxis.transA,
                    yMinPixelPadding = yAxis.minPixelPadding,
                    ret = []; // Preserve the original
                    // Do the translation
                    if (path) {
                        path.forEach(function (seg) {
                            if (seg[0] === 'M') {
                                ret.push([
                                    'M',
                                    (seg[1] - (xMin || 0)) * xTransA + xMinPixelPadding,
                                    (seg[2] - (yMin || 0)) * yTransA + yMinPixelPadding
                                ]);
                        }
                        else if (seg[0] === 'L') {
                            ret.push([
                                'L',
                                (seg[1] - (xMin || 0)) * xTransA + xMinPixelPadding,
                                (seg[2] - (yMin || 0)) * yTransA + yMinPixelPadding
                            ]);
                        }
                        else if (seg[0] === 'C') {
                            ret.push([
                                'C',
                                (seg[1] - (xMin || 0)) * xTransA + xMinPixelPadding,
                                (seg[2] - (yMin || 0)) * yTransA + yMinPixelPadding,
                                (seg[3] - (xMin || 0)) * xTransA + xMinPixelPadding,
                                (seg[4] - (yMin || 0)) * yTransA + yMinPixelPadding,
                                (seg[5] - (xMin || 0)) * xTransA + xMinPixelPadding,
                                (seg[6] - (yMin || 0)) * yTransA + yMinPixelPadding
                            ]);
                        }
                        else if (seg[0] === 'Q') {
                            ret.push([
                                'Q',
                                (seg[1] - (xMin || 0)) * xTransA + xMinPixelPadding,
                                (seg[2] - (yMin || 0)) * yTransA + yMinPixelPadding,
                                (seg[3] - (xMin || 0)) * xTransA + xMinPixelPadding,
                                (seg[4] - (yMin || 0)) * yTransA + yMinPixelPadding
                            ]);
                        }
                        else if (seg[0] === 'Z') {
                            ret.push(['Z']);
                        }
                    });
                }
                return ret;
            };
            /**
             * The map series is used for basic choropleth maps, where each map area has
             * a color based on its value.
             *
             * @sample maps/demo/all-maps/
             *         Choropleth map
             *
             * @extends      plotOptions.scatter
             * @excluding    marker, cluster
             * @product      highmaps
             * @optionparent plotOptions.map
             */
            MapSeries.defaultOptions = merge(ScatterSeries.defaultOptions, {
                animation: false,
                dataLabels: {
                    crop: false,
                    formatter: function () {
                        var numberFormatter = this.series.chart.numberFormatter;
                        var value = this.point.value;
                        return isNumber(value) ? numberFormatter(value, -1) : '';
                    },
                    inside: true,
                    overflow: false,
                    padding: 0,
                    verticalAlign: 'middle'
                },
                /**
                 * @ignore-option
                 *
                 * @private
                 */
                marker: null,
                /**
                 * The color to apply to null points.
                 *
                 * In styled mode, the null point fill is set in the
                 * `.highcharts-null-point` class.
                 *
                 * @sample maps/demo/all-areas-as-null/
                 *         Null color
                 *
                 * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 *
                 * @private
                 */
                nullColor: palette.neutralColor3,
                /**
                 * Whether to allow pointer interaction like tooltips and mouse events
                 * on null points.
                 *
                 * @type      {boolean}
                 * @since     4.2.7
                 * @apioption plotOptions.map.nullInteraction
                 *
                 * @private
                 */
                stickyTracking: false,
                tooltip: {
                    followPointer: true,
                    pointFormat: '{point.name}: {point.value}<br/>'
                },
                /**
                 * @ignore-option
                 *
                 * @private
                 */
                turboThreshold: 0,
                /**
                 * Whether all areas of the map defined in `mapData` should be rendered.
                 * If `true`, areas which don't correspond to a data point, are rendered
                 * as `null` points. If `false`, those areas are skipped.
                 *
                 * @sample maps/plotoptions/series-allareas-false/
                 *         All areas set to false
                 *
                 * @type      {boolean}
                 * @default   true
                 * @product   highmaps
                 * @apioption plotOptions.series.allAreas
                 *
                 * @private
                 */
                allAreas: true,
                /**
                 * The border color of the map areas.
                 *
                 * In styled mode, the border stroke is given in the `.highcharts-point`
                 * class.
                 *
                 * @sample {highmaps} maps/plotoptions/series-border/
                 *         Borders demo
                 *
                 * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 * @default   #cccccc
                 * @product   highmaps
                 * @apioption plotOptions.series.borderColor
                 *
                 * @private
                 */
                borderColor: palette.neutralColor20,
                /**
                 * The border width of each map area.
                 *
                 * In styled mode, the border stroke width is given in the
                 * `.highcharts-point` class.
                 *
                 * @sample maps/plotoptions/series-border/
                 *         Borders demo
                 *
                 * @type      {number}
                 * @default   1
                 * @product   highmaps
                 * @apioption plotOptions.series.borderWidth
                 *
                 * @private
                 */
                borderWidth: 1,
                /**
                 * @type      {string}
                 * @default   value
                 * @apioption plotOptions.map.colorKey
                 */
                /**
                 * What property to join the `mapData` to the value data. For example,
                 * if joinBy is "code", the mapData items with a specific code is merged
                 * into the data with the same code. For maps loaded from GeoJSON, the
                 * keys may be held in each point's `properties` object.
                 *
                 * The joinBy option can also be an array of two values, where the first
                 * points to a key in the `mapData`, and the second points to another
                 * key in the `data`.
                 *
                 * When joinBy is `null`, the map items are joined by their position in
                 * the array, which performs much better in maps with many data points.
                 * This is the recommended option if you are printing more than a
                 * thousand data points and have a backend that can preprocess the data
                 * into a parallel array of the mapData.
                 *
                 * @sample maps/plotoptions/series-border/
                 *         Joined by "code"
                 * @sample maps/demo/geojson/
                 *         GeoJSON joined by an array
                 * @sample maps/series/joinby-null/
                 *         Simple data joined by null
                 *
                 * @type      {string|Array<string>}
                 * @default   hc-key
                 * @product   highmaps
                 * @apioption plotOptions.series.joinBy
                 *
                 * @private
                 */
                joinBy: 'hc-key',
                /**
                 * Define the z index of the series.
                 *
                 * @type      {number}
                 * @product   highmaps
                 * @apioption plotOptions.series.zIndex
                 */
                /**
                 * @apioption plotOptions.series.states
                 *
                 * @private
                 */
                states: {
                    /**
                     * @apioption plotOptions.series.states.hover
                     */
                    hover: {
                        /** @ignore-option */
                        halo: null,
                        /**
                         * The color of the shape in this state.
                         *
                         * @sample maps/plotoptions/series-states-hover/
                         *         Hover options
                         *
                         * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                         * @product   highmaps
                         * @apioption plotOptions.series.states.hover.color
                         */
                        /**
                         * The border color of the point in this state.
                         *
                         * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                         * @product   highmaps
                         * @apioption plotOptions.series.states.hover.borderColor
                         */
                        /**
                         * The border width of the point in this state
                         *
                         * @type      {number}
                         * @product   highmaps
                         * @apioption plotOptions.series.states.hover.borderWidth
                         */
                        /**
                         * The relative brightness of the point when hovered, relative
                         * to the normal point color.
                         *
                         * @type      {number}
                         * @product   highmaps
                         * @default   0.2
                         * @apioption plotOptions.series.states.hover.brightness
                         */
                        brightness: 0.2
                    },
                    /**
                     * @apioption plotOptions.series.states.normal
                     */
                    normal: {
                        /**
                         * @productdesc {highmaps}
                         * The animation adds some latency in order to reduce the effect
                         * of flickering when hovering in and out of for example an
                         * uneven coastline.
                         *
                         * @sample {highmaps} maps/plotoptions/series-states-animation-false/
                         *         No animation of fill color
                         *
                         * @apioption plotOptions.series.states.normal.animation
                         */
                        animation: true
                    },
                    /**
                     * @apioption plotOptions.series.states.select
                     */
                    select: {
                        /**
                         * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                         * @default   ${palette.neutralColor20}
                         * @product   highmaps
                         * @apioption plotOptions.series.states.select.color
                         */
                        color: palette.neutralColor20
                    },
                    inactive: {
                        opacity: 1
                    }
                }
            });
            return MapSeries;
        }(ScatterSeries));
        extend(MapSeries.prototype, {
            type: 'map',
            axisTypes: colorMapSeriesMixin.axisTypes,
            colorAttribs: colorMapSeriesMixin.colorAttribs,
            colorKey: colorMapSeriesMixin.colorKey,
            // When tooltip is not shared, this series (and derivatives) requires
            // direct touch/hover. KD-tree does not apply.
            directTouch: true,
            // We need the points' bounding boxes in order to draw the data labels,
            // so we skip it now and call it from drawPoints instead.
            drawDataLabels: noop,
            // No graph for the map series
            drawGraph: noop,
            drawLegendSymbol: LegendSymbol.drawRectangle,
            forceDL: true,
            getExtremesFromAll: true,
            getSymbol: colorMapSeriesMixin.getSymbol,
            parallelArrays: colorMapSeriesMixin.parallelArrays,
            pointArrayMap: colorMapSeriesMixin.pointArrayMap,
            pointClass: MapPoint,
            // X axis and Y axis must have same translation slope
            preserveAspectRatio: true,
            searchPoint: noop,
            trackerGroups: colorMapSeriesMixin.trackerGroups,
            // Get axis extremes from paths, not values
            useMapGeometry: true
        });
        SeriesRegistry.registerSeriesType('map', MapSeries);
        /* *
         *
         *  Default Export
         *
         * */
        /* *
         *
         *  API Options
         *
         * */
        /**
         * A map data object containing a `path` definition and optionally additional
         * properties to join in the data as per the `joinBy` option.
         *
         * @sample maps/demo/category-map/
         *         Map data and joinBy
         *
         * @type      {Array<Highcharts.SeriesMapDataOptions>|*}
         * @product   highmaps
         * @apioption series.mapData
         */
        /**
         * A `map` series. If the [type](#series.map.type) option is not specified, it
         * is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.map
         * @excluding dataParser, dataURL, marker
         * @product   highmaps
         * @apioption series.map
         */
        /**
         * An array of data points for the series. For the `map` series type, points can
         * be given in the following ways:
         *
         * 1. An array of numerical values. In this case, the numerical values will be
         *    interpreted as `value` options. Example:
         *    ```js
         *    data: [0, 5, 3, 5]
         *    ```
         *
         * 2. An array of arrays with 2 values. In this case, the values correspond to
         *    `[hc-key, value]`. Example:
         *    ```js
         *        data: [
         *            ['us-ny', 0],
         *            ['us-mi', 5],
         *            ['us-tx', 3],
         *            ['us-ak', 5]
         *        ]
         *    ```
         *
         * 3. An array of objects with named values. The following snippet shows only a
         *    few settings, see the complete options set below. If the total number of
         *    data points exceeds the series'
         *    [turboThreshold](#series.map.turboThreshold),
         *    this option is not available.
         *    ```js
         *        data: [{
         *            value: 6,
         *            name: "Point2",
         *            color: "#00FF00"
         *        }, {
         *            value: 6,
         *            name: "Point1",
         *            color: "#FF00FF"
         *        }]
         *    ```
         *
         * @type      {Array<number|Array<string,(number|null)>|null|*>}
         * @product   highmaps
         * @apioption series.map.data
         */
        /**
         * Individual color for the point. By default the color is either used
         * to denote the value, or pulled from the global `colors` array.
         *
         * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
         * @product   highmaps
         * @apioption series.map.data.color
         */
        /**
         * Individual data label for each point. The options are the same as
         * the ones for [plotOptions.series.dataLabels](
         * #plotOptions.series.dataLabels).
         *
         * @sample maps/series/data-datalabels/
         *         Disable data labels for individual areas
         *
         * @type      {Highcharts.DataLabelsOptions}
         * @product   highmaps
         * @apioption series.map.data.dataLabels
         */
        /**
         * The `id` of a series in the [drilldown.series](#drilldown.series)
         * array to use for a drilldown for this point.
         *
         * @sample maps/demo/map-drilldown/
         *         Basic drilldown
         *
         * @type      {string}
         * @product   highmaps
         * @apioption series.map.data.drilldown
         */
        /**
         * An id for the point. This can be used after render time to get a
         * pointer to the point object through `chart.get()`.
         *
         * @sample maps/series/data-id/
         *         Highlight a point by id
         *
         * @type      {string}
         * @product   highmaps
         * @apioption series.map.data.id
         */
        /**
         * When data labels are laid out on a map, Highmaps runs a simplified
         * algorithm to detect collision. When two labels collide, the one with
         * the lowest rank is hidden. By default the rank is computed from the
         * area.
         *
         * @type      {number}
         * @product   highmaps
         * @apioption series.map.data.labelrank
         */
        /**
         * The relative mid point of an area, used to place the data label.
         * Ranges from 0 to 1\. When `mapData` is used, middleX can be defined
         * there.
         *
         * @type      {number}
         * @default   0.5
         * @product   highmaps
         * @apioption series.map.data.middleX
         */
        /**
         * The relative mid point of an area, used to place the data label.
         * Ranges from 0 to 1\. When `mapData` is used, middleY can be defined
         * there.
         *
         * @type      {number}
         * @default   0.5
         * @product   highmaps
         * @apioption series.map.data.middleY
         */
        /**
         * The name of the point as shown in the legend, tooltip, dataLabel
         * etc.
         *
         * @sample maps/series/data-datalabels/
         *         Point names
         *
         * @type      {string}
         * @product   highmaps
         * @apioption series.map.data.name
         */
        /**
         * For map and mapline series types, the SVG path for the shape. For
         * compatibily with old IE, not all SVG path definitions are supported,
         * but M, L and C operators are safe.
         *
         * To achieve a better separation between the structure and the data,
         * it is recommended to use `mapData` to define that paths instead
         * of defining them on the data points themselves.
         *
         * @sample maps/series/data-path/
         *         Paths defined in data
         *
         * @type      {string}
         * @product   highmaps
         * @apioption series.map.data.path
         */
        /**
         * The numeric value of the data point.
         *
         * @type      {number|null}
         * @product   highmaps
         * @apioption series.map.data.value
         */
        /**
         * Individual point events
         *
         * @extends   plotOptions.series.point.events
         * @product   highmaps
         * @apioption series.map.data.events
         */
        ''; // adds doclets above to the transpiled file

        return MapSeries;
    });
    _registerModule(_modules, 'Series/MapLine/MapLineSeries.js', [_modules['Series/Map/MapSeries.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (MapSeries, SeriesRegistry, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
                var extendStatics = function (d,
            b) {
                    extendStatics = Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array && function (d,
            b) { d.__proto__ = b; }) ||
                        function (d,
            b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var Series = SeriesRegistry.series;
        var extend = U.extend,
            merge = U.merge;
        /* *
         *
         *  Class
         *
         * */
        /**
         * @private
         * @class
         * @name Highcharts.seriesTypes.mapline
         *
         * @augments Highcharts.Series
         */
        var MapLineSeries = /** @class */ (function (_super) {
                __extends(MapLineSeries, _super);
            function MapLineSeries() {
                /* *
                 *
                 *  Static Properties
                 *
                 * */
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                /* *
                 *
                 *  Properties
                 *
                 * */
                _this.data = void 0;
                _this.options = void 0;
                _this.points = void 0;
                return _this;
                /* eslint-enable valid-jsdoc */
            }
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            /**
             * Get presentational attributes
             *
             * @private
             * @function Highcharts.seriesTypes.mapline#pointAttribs
             * @param {Highcharts.Point} point
             * @param {string} state
             * @return {Highcharts.SVGAttributes}
             */
            MapLineSeries.prototype.pointAttribs = function (point, state) {
                var attr = MapSeries.prototype.pointAttribs.call(this,
                    point,
                    state);
                // The difference from a map series is that the stroke takes the
                // point color
                attr.fill = this.options.fillColor;
                return attr;
            };
            /**
             * A mapline series is a special case of the map series where the value
             * colors are applied to the strokes rather than the fills. It can also be
             * used for freeform drawing, like dividers, in the map.
             *
             * @sample maps/demo/mapline-mappoint/
             *         Mapline and map-point chart
             *
             * @extends      plotOptions.map
             * @product      highmaps
             * @optionparent plotOptions.mapline
             */
            MapLineSeries.defaultOptions = merge(MapSeries.defaultOptions, {
                /**
                 * The width of the map line.
                 */
                lineWidth: 1,
                /**
                 * Fill color for the map line shapes
                 *
                 * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 */
                fillColor: 'none'
            });
            return MapLineSeries;
        }(MapSeries));
        extend(MapLineSeries.prototype, {
            type: 'mapline',
            colorProp: 'stroke',
            drawLegendSymbol: Series.prototype.drawLegendSymbol,
            pointAttrToOptions: {
                'stroke': 'color',
                'stroke-width': 'lineWidth'
            }
        });
        SeriesRegistry.registerSeriesType('mapline', MapLineSeries);
        /* *
         *
         *  Default Export
         *
         * */
        /* *
         *
         *  API Options
         *
         * */
        /**
         * A `mapline` series. If the [type](#series.mapline.type) option is
         * not specified, it is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.mapline
         * @excluding dataParser, dataURL, marker
         * @product   highmaps
         * @apioption series.mapline
         */
        /**
         * An array of data points for the series. For the `mapline` series type,
         * points can be given in the following ways:
         *
         * 1.  An array of numerical values. In this case, the numerical values
         * will be interpreted as `value` options. Example:
         *
         *  ```js
         *  data: [0, 5, 3, 5]
         *  ```
         *
         * 2.  An array of arrays with 2 values. In this case, the values correspond
         * to `[hc-key, value]`. Example:
         *
         *  ```js
         *     data: [
         *         ['us-ny', 0],
         *         ['us-mi', 5],
         *         ['us-tx', 3],
         *         ['us-ak', 5]
         *     ]
         *  ```
         *
         * 3.  An array of objects with named values. The following snippet shows only a
         * few settings, see the complete options set below. If the total number of data
         * points exceeds the series' [turboThreshold](#series.map.turboThreshold),
         * this option is not available.
         *
         *  ```js
         *     data: [{
         *         value: 6,
         *         name: "Point2",
         *         color: "#00FF00"
         *     }, {
         *         value: 6,
         *         name: "Point1",
         *         color: "#FF00FF"
         *     }]
         *  ```
         *
         * @type      {Array<number|Array<string,(number|null)>|null|*>}
         * @product   highmaps
         * @apioption series.mapline.data
         */
        ''; // adds doclets above to transpiled file

        return MapLineSeries;
    });
    _registerModule(_modules, 'Series/MapPoint/MapPointPoint.js', [_modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (SeriesRegistry, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
                var extendStatics = function (d,
            b) {
                    extendStatics = Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array && function (d,
            b) { d.__proto__ = b; }) ||
                        function (d,
            b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var ScatterSeries = SeriesRegistry.seriesTypes.scatter;
        var merge = U.merge;
        /* *
         *
         *  Class
         *
         * */
        var MapPointPoint = /** @class */ (function (_super) {
                __extends(MapPointPoint, _super);
            function MapPointPoint() {
                /* *
                 *
                 *  Properties
                 *
                 * */
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                _this.options = void 0;
                _this.series = void 0;
                return _this;
                /* eslint-enable valid-jsdoc */
            }
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            MapPointPoint.prototype.applyOptions = function (options, x) {
                var mergedOptions = (typeof options.lat !== 'undefined' &&
                        typeof options.lon !== 'undefined' ?
                        merge(options,
                    this.series.chart.fromLatLonToPoint(options)) :
                        options);
                return _super.prototype.applyOptions.call(this, mergedOptions, x);
            };
            return MapPointPoint;
        }(ScatterSeries.prototype.pointClass));
        /* *
         *
         *  Default Export
         *
         * */

        return MapPointPoint;
    });
    _registerModule(_modules, 'Series/MapPoint/MapPointSeries.js', [_modules['Series/MapPoint/MapPointPoint.js'], _modules['Core/Color/Palette.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (MapPointPoint, palette, SeriesRegistry, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
                var extendStatics = function (d,
            b) {
                    extendStatics = Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array && function (d,
            b) { d.__proto__ = b; }) ||
                        function (d,
            b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var ScatterSeries = SeriesRegistry.seriesTypes.scatter;
        var extend = U.extend,
            merge = U.merge;
        /* *
         *
         *  Class
         *
         * */
        /**
         * @private
         * @class
         * @name Highcharts.seriesTypes.mappoint
         *
         * @augments Highcharts.Series
         */
        var MapPointSeries = /** @class */ (function (_super) {
                __extends(MapPointSeries, _super);
            function MapPointSeries() {
                /* *
                 *
                 *  Static Properties
                 *
                 * */
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                /* *
                 *
                 *  Properties
                 *
                 * */
                _this.data = void 0;
                _this.options = void 0;
                _this.points = void 0;
                return _this;
                /* eslint-enable valid-jsdoc */
            }
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            MapPointSeries.prototype.drawDataLabels = function () {
                _super.prototype.drawDataLabels.call(this);
                if (this.dataLabelsGroup) {
                    this.dataLabelsGroup.clip(this.chart.clipRect);
                }
            };
            /**
             * A mappoint series is a special form of scatter series where the points
             * can be laid out in map coordinates on top of a map.
             *
             * @sample maps/demo/mapline-mappoint/
             *         Map-line and map-point series.
             *
             * @extends      plotOptions.scatter
             * @product      highmaps
             * @optionparent plotOptions.mappoint
             */
            MapPointSeries.defaultOptions = merge(ScatterSeries.defaultOptions, {
                dataLabels: {
                    crop: false,
                    defer: false,
                    enabled: true,
                    formatter: function () {
                        return this.point.name;
                    },
                    overflow: false,
                    style: {
                        /** @internal */
                        color: palette.neutralColor100
                    }
                }
            });
            return MapPointSeries;
        }(ScatterSeries));
        extend(MapPointSeries.prototype, {
            type: 'mappoint',
            forceDL: true,
            pointClass: MapPointPoint
        });
        SeriesRegistry.registerSeriesType('mappoint', MapPointSeries);
        /* *
         *
         *  Default Export
         *
         * */
        /* *
         *
         *  API Options
         *
         * */
        /**
         * A `mappoint` series. If the [type](#series.mappoint.type) option
         * is not specified, it is inherited from [chart.type](#chart.type).
         *
         *
         * @extends   series,plotOptions.mappoint
         * @excluding dataParser, dataURL
         * @product   highmaps
         * @apioption series.mappoint
         */
        /**
         * An array of data points for the series. For the `mappoint` series
         * type, points can be given in the following ways:
         *
         * 1. An array of numerical values. In this case, the numerical values will be
         *    interpreted as `y` options. The `x` values will be automatically
         *    calculated, either starting at 0 and incremented by 1, or from
         *    `pointStart` and `pointInterval` given in the series options. If the axis
         *    has categories, these will be used. Example:
         *    ```js
         *    data: [0, 5, 3, 5]
         *    ```
         *
         * 2. An array of arrays with 2 values. In this case, the values correspond to
         *    `x,y`. If the first value is a string, it is applied as the name of the
         *    point, and the `x` value is inferred.
         *    ```js
         *        data: [
         *            [0, 1],
         *            [1, 8],
         *            [2, 7]
         *        ]
         *    ```
         *
         * 3. An array of objects with named values. The following snippet shows only a
         *    few settings, see the complete options set below. If the total number of
         *    data points exceeds the series'
         *    [turboThreshold](#series.mappoint.turboThreshold),
         *    this option is not available.
         *    ```js
         *        data: [{
         *            x: 1,
         *            y: 7,
         *            name: "Point2",
         *            color: "#00FF00"
         *        }, {
         *            x: 1,
         *            y: 4,
         *            name: "Point1",
         *            color: "#FF00FF"
         *        }]
         *    ```
         *
         * @type      {Array<number|Array<number,(number|null)>|null|*>}
         * @extends   series.map.data
         * @excluding labelrank, middleX, middleY, path, value
         * @product   highmaps
         * @apioption series.mappoint.data
         */
        /**
         * The latitude of the point. Must be combined with the `lon` option
         * to work. Overrides `x` and `y` values.
         *
         * @sample {highmaps} maps/demo/mappoint-latlon/
         *         Point position by lat/lon
         *
         * @type      {number}
         * @since     1.1.0
         * @product   highmaps
         * @apioption series.mappoint.data.lat
         */
        /**
         * The longitude of the point. Must be combined with the `lon` option
         * to work. Overrides `x` and `y` values.
         *
         * @sample {highmaps} maps/demo/mappoint-latlon/
         *         Point position by lat/lon
         *
         * @type      {number}
         * @since     1.1.0
         * @product   highmaps
         * @apioption series.mappoint.data.lon
         */
        /**
         * The x coordinate of the point in terms of the map path coordinates.
         *
         * @sample {highmaps} maps/demo/mapline-mappoint/
         *         Map point demo
         *
         * @type      {number}
         * @product   highmaps
         * @apioption series.mappoint.data.x
         */
        /**
         * The x coordinate of the point in terms of the map path coordinates.
         *
         * @sample {highmaps} maps/demo/mapline-mappoint/
         *         Map point demo
         *
         * @type      {number|null}
         * @product   highmaps
         * @apioption series.mappoint.data.y
         */
        ''; // adds doclets above to transpiled file

        return MapPointSeries;
    });
    _registerModule(_modules, 'Series/Bubble/BubbleLegendDefaults.js', [_modules['Core/Color/Palette.js']], function (Palette) {
        /* *
         *
         *  (c) 2010-2021 Highsoft AS
         *
         *  Author: Paweł Potaczek
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        /* *
         *
         *  Constants
         *
         * */
        /**
         * The bubble legend is an additional element in legend which
         * presents the scale of the bubble series. Individual bubble ranges
         * can be defined by user or calculated from series. In the case of
         * automatically calculated ranges, a 1px margin of error is
         * permitted.
         *
         * @since        7.0.0
         * @product      highcharts highstock highmaps
         * @requires     highcharts-more
         * @optionparent legend.bubbleLegend
         */
        var BubbleLegendDefaults = {
                /**
                 * The color of the ranges borders,
            can be also defined for an
                 * individual range.
                 *
                 * @sample highcharts/bubble-legend/similartoseries/
                 *         Similar look to the bubble series
                 * @sample highcharts/bubble-legend/bordercolor/
                 *         Individual bubble border color
                 *
                 * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 */
                borderColor: void 0,
                /**
                 * The width of the ranges borders in pixels,
            can be also
                 * defined for an individual range.
                 */
                borderWidth: 2,
                /**
                 * An additional class name to apply to the bubble legend'
                 * circle graphical elements. This option does not replace
                 * default class names of the graphical element.
                 *
                 * @sample {highcharts} highcharts/css/bubble-legend/
                 *         Styling by CSS
                 *
                 * @type {string}
                 */
                className: void 0,
                /**
                 * The main color of the bubble legend. Applies to ranges,
            if
                 * individual color is not defined.
                 *
                 * @sample highcharts/bubble-legend/similartoseries/
                 *         Similar look to the bubble series
                 * @sample highcharts/bubble-legend/color/
                 *         Individual bubble color
                 *
                 * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 */
                color: void 0,
                /**
                 * An additional class name to apply to the bubble legend's
                 * connector graphical elements. This option does not replace
                 * default class names of the graphical element.
                 *
                 * @sample {highcharts} highcharts/css/bubble-legend/
                 *         Styling by CSS
                 *
                 * @type {string}
                 */
                connectorClassName: void 0,
                /**
                 * The color of the connector,
            can be also defined
                 * for an individual range.
                 *
                 * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 */
                connectorColor: void 0,
                /**
                 * The length of the connectors in pixels. If labels are
                 * centered,
            the distance is reduced to 0.
                 *
                 * @sample highcharts/bubble-legend/connectorandlabels/
                 *         Increased connector length
                 */
                connectorDistance: 60,
                /**
                 * The width of the connectors in pixels.
                 *
                 * @sample highcharts/bubble-legend/connectorandlabels/
                 *         Increased connector width
                 */
                connectorWidth: 1,
                /**
                 * Enable or disable the bubble legend.
                 */
                enabled: false,
                /**
                 * Options for the bubble legend labels.
                 */
                labels: {
                    /**
                     * An additional class name to apply to the bubble legend
                     * label graphical elements. This option does not replace
                     * default class names of the graphical element.
                     *
                     * @sample {highcharts} highcharts/css/bubble-legend/
                     *         Styling by CSS
                     *
                     * @type {string}
                     */
                    className: void 0,
                    /**
                     * Whether to allow data labels to overlap.
                     */
                    allowOverlap: false,
                    /**
                     * A format string for the bubble legend labels. Available
                     * variables are the same as for `formatter`.
                     *
                     * @sample highcharts/bubble-legend/format/
                     *         Add a unit
                     *
                     * @type {string}
                     */
                    format: '',
                    /**
                     * Available `this` properties are:
                     *
                     * - `this.value`: The bubble value.
                     *
                     * - `this.radius`: The radius of the bubble range.
                     *
                     * - `this.center`: The center y position of the range.
                     *
                     * @type {Highcharts.FormatterCallbackFunction<Highcharts.BubbleLegendFormatterContextObject>}
                     */
                    formatter: void 0,
                    /**
                     * The alignment of the labels compared to the bubble
                     * legend. Can be one of `left`,
            `center` or `right`.
                     *
                     * @sample highcharts/bubble-legend/connectorandlabels/
                     *         Labels on left
                     *
                     * @type {Highcharts.AlignValue}
                     */
                    align: 'right',
                    /**
                     * CSS styles for the labels.
                     *
                     * @type {Highcharts.CSSObject}
                     */
                    style: {
                        /** @ignore-option */
                        fontSize: '10px',
                        /** @ignore-option */
                        color: Palette.neutralColor100
                    },
                    /**
                     * The x position offset of the label relative to the
                     * connector.
                     */
                    x: 0,
                    /**
                     * The y position offset of the label relative to the
                     * connector.
                     */
                    y: 0
                },
                /**
                 * Miximum bubble legend range size. If values for ranges are
                 * not specified,
            the `minSize` and the `maxSize` are calculated
                 * from bubble series.
                 */
                maxSize: 60,
                /**
                 * Minimum bubble legend range size. If values for ranges are
                 * not specified,
            the `minSize` and the `maxSize` are calculated
                 * from bubble series.
                 */
                minSize: 10,
                /**
                 * The position of the bubble legend in the legend.
                 * @sample highcharts/bubble-legend/connectorandlabels/
                 *         Bubble legend as last item in legend
                 */
                legendIndex: 0,
                /**
                 * Options for specific range. One range consists of bubble,
                 * label and connector.
                 *
                 * @sample highcharts/bubble-legend/ranges/
                 *         Manually defined ranges
                 * @sample highcharts/bubble-legend/autoranges/
                 *         Auto calculated ranges
                 *
                 * @type {Array<*>}
                 */
                ranges: {
                    /**
                     * Range size value,
            similar to bubble Z data.
                     * @type {number}
                     */
                    value: void 0,
                    /**
                     * The color of the border for individual range.
                     * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                     */
                    borderColor: void 0,
                    /**
                     * The color of the bubble for individual range.
                     * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                     */
                    color: void 0,
                    /**
                     * The color of the connector for individual range.
                     * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                     */
                    connectorColor: void 0
                },
                /**
                 * Whether the bubble legend range value should be represented
                 * by the area or the width of the bubble. The default,
            area,
                 * corresponds best to the human perception of the size of each
                 * bubble.
                 *
                 * @sample highcharts/bubble-legend/ranges/
                 *         Size by width
                 *
                 * @type {Highcharts.BubbleSizeByValue}
                 */
                sizeBy: 'area',
                /**
                 * When this is true,
            the absolute value of z determines the
                 * size of the bubble. This means that with the default
                 * zThreshold of 0,
            a bubble of value -1 will have the same size
                 * as a bubble of value 1,
            while a bubble of value 0 will have a
                 * smaller size according to minSize.
                 */
                sizeByAbsoluteValue: false,
                /**
                 * Define the visual z index of the bubble legend.
                 */
                zIndex: 1,
                /**
                 * Ranges with with lower value than zThreshold,
            are skipped.
                 */
                zThreshold: 0
            };
        /* *
         *
         *  Default Export
         *
         * */

        return BubbleLegendDefaults;
    });
    _registerModule(_modules, 'Series/Bubble/BubbleLegendItem.js', [_modules['Core/Color/Color.js'], _modules['Core/FormatUtilities.js'], _modules['Core/Globals.js'], _modules['Core/Utilities.js']], function (Color, F, H, U) {
        /* *
         *
         *  (c) 2010-2021 Highsoft AS
         *
         *  Author: Paweł Potaczek
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var color = Color.parse;
        var noop = H.noop;
        var arrayMax = U.arrayMax,
            arrayMin = U.arrayMin,
            isNumber = U.isNumber,
            merge = U.merge,
            pick = U.pick,
            stableSort = U.stableSort;
        /**
         * @interface Highcharts.BubbleLegendFormatterContextObject
         */ /**
        * The center y position of the range.
        * @name Highcharts.BubbleLegendFormatterContextObject#center
        * @type {number}
        */ /**
        * The radius of the bubble range.
        * @name Highcharts.BubbleLegendFormatterContextObject#radius
        * @type {number}
        */ /**
        * The bubble value.
        * @name Highcharts.BubbleLegendFormatterContextObject#value
        * @type {number}
        */
        ''; // detach doclets above
        /* *
         *
         *  Class
         *
         * */
        /* eslint-disable no-invalid-this, valid-jsdoc */
        /**
         * BubbleLegend class.
         *
         * @private
         * @class
         * @name Highcharts.BubbleLegend
         * @param {Highcharts.LegendBubbleLegendOptions} options
         * Options of BubbleLegendItem.
         *
         * @param {Highcharts.Legend} legend
         * Legend of item.
         */
        var BubbleLegendItem = /** @class */ (function () {
                function BubbleLegendItem(options, legend) {
                    this.chart = void 0;
                this.fontMetrics = void 0;
                this.legend = void 0;
                this.legendGroup = void 0;
                this.legendItem = void 0;
                this.legendItemHeight = void 0;
                this.legendItemWidth = void 0;
                this.legendSymbol = void 0;
                this.maxLabel = void 0;
                this.movementX = void 0;
                this.ranges = void 0;
                this.selected = void 0;
                this.visible = void 0;
                this.symbols = void 0;
                this.options = void 0;
                this.setState = noop;
                this.init(options, legend);
            }
            /**
             * Create basic bubbleLegend properties similar to item in legend.
             *
             * @private
             * @function Highcharts.BubbleLegend#init
             * @param {Highcharts.LegendBubbleLegendOptions} options
             *        Bubble legend options
             * @param {Highcharts.Legend} legend
             *        Legend
             * @return {void}
             */
            BubbleLegendItem.prototype.init = function (options, legend) {
                this.options = options;
                this.visible = true;
                this.chart = legend.chart;
                this.legend = legend;
            };
            /**
             * Depending on the position option, add bubbleLegend to legend items.
             *
             * @private
             * @function Highcharts.BubbleLegend#addToLegend
             * @param {Array<(Highcharts.Point|Highcharts.Series)>}
             *        All legend items
             * @return {void}
             */
            BubbleLegendItem.prototype.addToLegend = function (items) {
                // Insert bubbleLegend into legend items
                items.splice(this.options.legendIndex, 0, this);
            };
            /**
             * Calculate ranges, sizes and call the next steps of bubbleLegend
             * creation.
             *
             * @private
             * @function Highcharts.BubbleLegend#drawLegendSymbol
             * @param {Highcharts.Legend} legend
             *        Legend instance
             * @return {void}
             */
            BubbleLegendItem.prototype.drawLegendSymbol = function (legend) {
                var chart = this.chart,
                    options = this.options,
                    itemDistance = pick(legend.options.itemDistance, 20),
                    ranges = options.ranges,
                    connectorDistance = options.connectorDistance;
                var connectorSpace;
                // Predict label dimensions
                this.fontMetrics = chart.renderer.fontMetrics(options.labels.style.fontSize);
                // Do not create bubbleLegend now if ranges or ranges valeus are not
                // specified or if are empty array.
                if (!ranges || !ranges.length || !isNumber(ranges[0].value)) {
                    legend.options.bubbleLegend.autoRanges = true;
                    return;
                }
                // Sort ranges to right render order
                stableSort(ranges, function (a, b) {
                    return b.value - a.value;
                });
                this.ranges = ranges;
                this.setOptions();
                this.render();
                // Get max label size
                var maxLabel = this.getMaxLabelSize(),
                    radius = this.ranges[0].radius,
                    size = radius * 2;
                // Space for connectors and labels.
                connectorSpace =
                    connectorDistance - radius + maxLabel.width;
                connectorSpace = connectorSpace > 0 ? connectorSpace : 0;
                this.maxLabel = maxLabel;
                this.movementX = options.labels.align === 'left' ?
                    connectorSpace : 0;
                this.legendItemWidth = size + connectorSpace + itemDistance;
                this.legendItemHeight = size + this.fontMetrics.h / 2;
            };
            /**
             * Set style options for each bubbleLegend range.
             *
             * @private
             * @function Highcharts.BubbleLegend#setOptions
             * @return {void}
             */
            BubbleLegendItem.prototype.setOptions = function () {
                var ranges = this.ranges,
                    options = this.options,
                    series = this.chart.series[options.seriesIndex],
                    baseline = this.legend.baseline,
                    bubbleAttribs = {
                        zIndex: options.zIndex,
                        'stroke-width': options.borderWidth
                    },
                    connectorAttribs = {
                        zIndex: options.zIndex,
                        'stroke-width': options.connectorWidth
                    },
                    labelAttribs = {
                        align: (this.legend.options.rtl ||
                            options.labels.align === 'left') ? 'right' : 'left',
                        zIndex: options.zIndex
                    },
                    fillOpacity = series.options.marker.fillOpacity,
                    styledMode = this.chart.styledMode;
                // Allow to parts of styles be used individually for range
                ranges.forEach(function (range, i) {
                    if (!styledMode) {
                        bubbleAttribs.stroke = pick(range.borderColor, options.borderColor, series.color);
                        bubbleAttribs.fill = pick(range.color, options.color, fillOpacity !== 1 ?
                            color(series.color).setOpacity(fillOpacity)
                                .get('rgba') :
                            series.color);
                        connectorAttribs.stroke = pick(range.connectorColor, options.connectorColor, series.color);
                    }
                    // Set options needed for rendering each range
                    ranges[i].radius = this.getRangeRadius(range.value);
                    ranges[i] = merge(ranges[i], {
                        center: (ranges[0].radius - ranges[i].radius +
                            baseline)
                    });
                    if (!styledMode) {
                        merge(true, ranges[i], {
                            bubbleAttribs: merge(bubbleAttribs),
                            connectorAttribs: merge(connectorAttribs),
                            labelAttribs: labelAttribs
                        });
                    }
                }, this);
            };
            /**
             * Calculate radius for each bubble range,
             * used code from BubbleSeries.js 'getRadius' method.
             *
             * @private
             * @function Highcharts.BubbleLegend#getRangeRadius
             * @param {number} value
             *        Range value
             * @return {number|null}
             *         Radius for one range
             */
            BubbleLegendItem.prototype.getRangeRadius = function (value) {
                var options = this.options,
                    seriesIndex = this.options.seriesIndex,
                    bubbleSeries = this.chart.series[seriesIndex],
                    zMax = options.ranges[0].value,
                    zMin = options.ranges[options.ranges.length - 1].value,
                    minSize = options.minSize,
                    maxSize = options.maxSize;
                return bubbleSeries.getRadius.call(this, zMin, zMax, minSize, maxSize, value);
            };
            /**
             * Render the legendSymbol group.
             *
             * @private
             * @function Highcharts.BubbleLegend#render
             * @return {void}
             */
            BubbleLegendItem.prototype.render = function () {
                var renderer = this.chart.renderer,
                    zThreshold = this.options.zThreshold;
                if (!this.symbols) {
                    this.symbols = {
                        connectors: [],
                        bubbleItems: [],
                        labels: []
                    };
                }
                // Nesting SVG groups to enable handleOverflow
                this.legendSymbol = renderer.g('bubble-legend');
                this.legendItem = renderer.g('bubble-legend-item');
                // To enable default 'hideOverlappingLabels' method
                this.legendSymbol.translateX = 0;
                this.legendSymbol.translateY = 0;
                this.ranges.forEach(function (range) {
                    if (range.value >= zThreshold) {
                        this.renderRange(range);
                    }
                }, this);
                // To use handleOverflow method
                this.legendSymbol.add(this.legendItem);
                this.legendItem.add(this.legendGroup);
                this.hideOverlappingLabels();
            };
            /**
             * Render one range, consisting of bubble symbol, connector and label.
             *
             * @private
             * @function Highcharts.BubbleLegend#renderRange
             * @param {Highcharts.LegendBubbleLegendRangesOptions} range
             *        Range options
             * @return {void}
             */
            BubbleLegendItem.prototype.renderRange = function (range) {
                var mainRange = this.ranges[0],
                    legend = this.legend,
                    options = this.options,
                    labelsOptions = options.labels,
                    chart = this.chart,
                    bubbleSeries = chart.series[options.seriesIndex],
                    renderer = chart.renderer,
                    symbols = this.symbols,
                    labels = symbols.labels,
                    elementCenter = range.center,
                    absoluteRadius = Math.abs(range.radius),
                    connectorDistance = options.connectorDistance || 0,
                    labelsAlign = labelsOptions.align,
                    rtl = legend.options.rtl,
                    borderWidth = options.borderWidth,
                    connectorWidth = options.connectorWidth,
                    posX = mainRange.radius || 0,
                    posY = elementCenter - absoluteRadius -
                        borderWidth / 2 + connectorWidth / 2,
                    fontMetrics = this.fontMetrics,
                    labelMovement = fontMetrics.f / 2 -
                        (fontMetrics.h - fontMetrics.f) / 2,
                    crispMovement = (posY % 1 ? 1 : 0.5) -
                        (connectorWidth % 2 ? 0 : 0.5),
                    styledMode = renderer.styledMode;
                var connectorLength = rtl || labelsAlign === 'left' ?
                        -connectorDistance : connectorDistance;
                // Set options for centered labels
                if (labelsAlign === 'center') {
                    connectorLength = 0; // do not use connector
                    options.connectorDistance = 0;
                    range.labelAttribs.align = 'center';
                }
                var labelY = posY + options.labels.y,
                    labelX = posX + connectorLength + options.labels.x;
                // Render bubble symbol
                symbols.bubbleItems.push(renderer
                    .circle(posX, elementCenter + crispMovement, absoluteRadius)
                    .attr(styledMode ? {} : range.bubbleAttribs)
                    .addClass((styledMode ?
                    'highcharts-color-' +
                        bubbleSeries.colorIndex + ' ' :
                    '') +
                    'highcharts-bubble-legend-symbol ' +
                    (options.className || '')).add(this.legendSymbol));
                // Render connector
                symbols.connectors.push(renderer
                    .path(renderer.crispLine([
                    ['M', posX, posY],
                    ['L', posX + connectorLength, posY]
                ], options.connectorWidth))
                    .attr((styledMode ? {} : range.connectorAttribs))
                    .addClass((styledMode ?
                    'highcharts-color-' +
                        this.options.seriesIndex + ' ' : '') +
                    'highcharts-bubble-legend-connectors ' +
                    (options.connectorClassName || '')).add(this.legendSymbol));
                // Render label
                var label = renderer
                        .text(this.formatLabel(range),
                    labelX,
                    labelY + labelMovement)
                        .attr((styledMode ? {} : range.labelAttribs))
                        .css(styledMode ? {} : labelsOptions.style)
                        .addClass('highcharts-bubble-legend-labels ' +
                        (options.labels.className || '')).add(this.legendSymbol);
                labels.push(label);
                // To enable default 'hideOverlappingLabels' method
                label.placed = true;
                label.alignAttr = {
                    x: labelX,
                    y: labelY + labelMovement
                };
            };
            /**
             * Get the label which takes up the most space.
             *
             * @private
             * @function Highcharts.BubbleLegend#getMaxLabelSize
             * @return {Highcharts.BBoxObject}
             */
            BubbleLegendItem.prototype.getMaxLabelSize = function () {
                var labels = this.symbols.labels;
                var maxLabel,
                    labelSize;
                labels.forEach(function (label) {
                    labelSize = label.getBBox(true);
                    if (maxLabel) {
                        maxLabel = labelSize.width > maxLabel.width ?
                            labelSize : maxLabel;
                    }
                    else {
                        maxLabel = labelSize;
                    }
                });
                return maxLabel || {};
            };
            /**
             * Get formatted label for range.
             *
             * @private
             * @function Highcharts.BubbleLegend#formatLabel
             * @param {Highcharts.LegendBubbleLegendRangesOptions} range
             *        Range options
             * @return {string}
             *         Range label text
             */
            BubbleLegendItem.prototype.formatLabel = function (range) {
                var options = this.options,
                    formatter = options.labels.formatter,
                    format = options.labels.format;
                var numberFormatter = this.chart.numberFormatter;
                return format ? F.format(format, range) :
                    formatter ? formatter.call(range) :
                        numberFormatter(range.value, 1);
            };
            /**
             * By using default chart 'hideOverlappingLabels' method, hide or show
             * labels and connectors.
             *
             * @private
             * @function Highcharts.BubbleLegend#hideOverlappingLabels
             * @return {void}
             */
            BubbleLegendItem.prototype.hideOverlappingLabels = function () {
                var chart = this.chart,
                    allowOverlap = this.options.labels.allowOverlap,
                    symbols = this.symbols;
                if (!allowOverlap && symbols) {
                    chart.hideOverlappingLabels(symbols.labels);
                    // Hide or show connectors
                    symbols.labels.forEach(function (label, index) {
                        if (!label.newOpacity) {
                            symbols.connectors[index].hide();
                        }
                        else if (label.newOpacity !== label.oldOpacity) {
                            symbols.connectors[index].show();
                        }
                    });
                }
            };
            /**
             * Calculate ranges from created series.
             *
             * @private
             * @function Highcharts.BubbleLegend#getRanges
             * @return {Array<Highcharts.LegendBubbleLegendRangesOptions>}
             *         Array of range objects
             */
            BubbleLegendItem.prototype.getRanges = function () {
                var bubbleLegend = this.legend.bubbleLegend,
                    series = bubbleLegend.chart.series,
                    rangesOptions = bubbleLegend.options.ranges;
                var ranges,
                    zData,
                    minZ = Number.MAX_VALUE,
                    maxZ = -Number.MAX_VALUE;
                series.forEach(function (s) {
                    // Find the min and max Z, like in bubble series
                    if (s.isBubble && !s.ignoreSeries) {
                        zData = s.zData.filter(isNumber);
                        if (zData.length) {
                            minZ = pick(s.options.zMin, Math.min(minZ, Math.max(arrayMin(zData), s.options.displayNegative === false ?
                                s.options.zThreshold :
                                -Number.MAX_VALUE)));
                            maxZ = pick(s.options.zMax, Math.max(maxZ, arrayMax(zData)));
                        }
                    }
                });
                // Set values for ranges
                if (minZ === maxZ) {
                    // Only one range if min and max values are the same.
                    ranges = [{ value: maxZ }];
                }
                else {
                    ranges = [
                        { value: minZ },
                        { value: (minZ + maxZ) / 2 },
                        { value: maxZ, autoRanges: true }
                    ];
                }
                // Prevent reverse order of ranges after redraw
                if (rangesOptions.length && rangesOptions[0].radius) {
                    ranges.reverse();
                }
                // Merge ranges values with user options
                ranges.forEach(function (range, i) {
                    if (rangesOptions && rangesOptions[i]) {
                        ranges[i] = merge(rangesOptions[i], range);
                    }
                });
                return ranges;
            };
            /**
             * Calculate bubble legend sizes from rendered series.
             *
             * @private
             * @function Highcharts.BubbleLegend#predictBubbleSizes
             * @return {Array<number,number>}
             *         Calculated min and max bubble sizes
             */
            BubbleLegendItem.prototype.predictBubbleSizes = function () {
                var chart = this.chart,
                    fontMetrics = this.fontMetrics,
                    legendOptions = chart.legend.options,
                    floating = legendOptions.floating,
                    horizontal = legendOptions.layout === 'horizontal',
                    lastLineHeight = horizontal ? chart.legend.lastLineHeight : 0,
                    plotSizeX = chart.plotSizeX,
                    plotSizeY = chart.plotSizeY,
                    bubbleSeries = chart.series[this.options.seriesIndex],
                    minSize = Math.ceil(bubbleSeries.minPxSize),
                    maxPxSize = Math.ceil(bubbleSeries.maxPxSize),
                    plotSize = Math.min(plotSizeY,
                    plotSizeX);
                var calculatedSize,
                    maxSize = bubbleSeries.options.maxSize;
                // Calculate prediceted max size of bubble
                if (floating || !(/%$/.test(maxSize))) {
                    calculatedSize = maxPxSize;
                }
                else {
                    maxSize = parseFloat(maxSize);
                    calculatedSize = ((plotSize + lastLineHeight -
                        fontMetrics.h / 2) * maxSize / 100) / (maxSize / 100 + 1);
                    // Get maxPxSize from bubble series if calculated bubble legend
                    // size will not affect to bubbles series.
                    if ((horizontal && plotSizeY - calculatedSize >=
                        plotSizeX) || (!horizontal && plotSizeX -
                        calculatedSize >= plotSizeY)) {
                        calculatedSize = maxPxSize;
                    }
                }
                return [minSize, Math.ceil(calculatedSize)];
            };
            /**
             * Correct ranges with calculated sizes.
             *
             * @private
             * @function Highcharts.BubbleLegend#updateRanges
             * @param {number} min
             * @param {number} max
             * @return {void}
             */
            BubbleLegendItem.prototype.updateRanges = function (min, max) {
                var bubbleLegendOptions = this.legend.options.bubbleLegend;
                bubbleLegendOptions.minSize = min;
                bubbleLegendOptions.maxSize = max;
                bubbleLegendOptions.ranges = this.getRanges();
            };
            /**
             * Because of the possibility of creating another legend line, predicted
             * bubble legend sizes may differ by a few pixels, so it is necessary to
             * correct them.
             *
             * @private
             * @function Highcharts.BubbleLegend#correctSizes
             * @return {void}
             */
            BubbleLegendItem.prototype.correctSizes = function () {
                var legend = this.legend,
                    chart = this.chart,
                    bubbleSeries = chart.series[this.options.seriesIndex],
                    bubbleSeriesSize = bubbleSeries.maxPxSize,
                    bubbleLegendSize = this.options.maxSize;
                if (Math.abs(Math.ceil(bubbleSeriesSize) - bubbleLegendSize) >
                    1) {
                    this.updateRanges(this.options.minSize, bubbleSeries.maxPxSize);
                    legend.render();
                }
            };
            return BubbleLegendItem;
        }());
        /* *
         *
         *  Default Export
         *
         * */

        return BubbleLegendItem;
    });
    _registerModule(_modules, 'Series/Bubble/BubbleLegendComposition.js', [_modules['Series/Bubble/BubbleLegendDefaults.js'], _modules['Series/Bubble/BubbleLegendItem.js'], _modules['Core/DefaultOptions.js'], _modules['Core/Utilities.js']], function (BubbleLegendDefaults, BubbleLegendItem, D, U) {
        /* *
         *
         *  (c) 2010-2021 Highsoft AS
         *
         *  Author: Paweł Potaczek
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var setOptions = D.setOptions;
        var addEvent = U.addEvent,
            objectEach = U.objectEach,
            wrap = U.wrap;
        /* *
         *
         *  Namespace
         *
         * */
        var BubbleLegendComposition;
        (function (BubbleLegendComposition) {
            /* *
             *
             *  Constants
             *
             * */
            var composedClasses = [];
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            /**
             * If ranges are not specified, determine ranges from rendered bubble series
             * and render legend again.
             */
            function chartDrawChartBox(proceed, options, callback) {
                var chart = this,
                    legend = chart.legend,
                    bubbleSeries = getVisibleBubbleSeriesIndex(chart) >= 0;
                var bubbleLegendOptions,
                    bubbleSizes;
                if (legend && legend.options.enabled && legend.bubbleLegend &&
                    legend.options.bubbleLegend.autoRanges && bubbleSeries) {
                    bubbleLegendOptions = legend.bubbleLegend.options;
                    bubbleSizes = legend.bubbleLegend.predictBubbleSizes();
                    legend.bubbleLegend.updateRanges(bubbleSizes[0], bubbleSizes[1]);
                    // Disable animation on init
                    if (!bubbleLegendOptions.placed) {
                        legend.group.placed = false;
                        legend.allItems.forEach(function (item) {
                            item.legendGroup.translateY = null;
                        });
                    }
                    // Create legend with bubbleLegend
                    legend.render();
                    chart.getMargins();
                    chart.axes.forEach(function (axis) {
                        if (axis.visible) { // #11448
                            axis.render();
                        }
                        if (!bubbleLegendOptions.placed) {
                            axis.setScale();
                            axis.updateNames();
                            // Disable axis animation on init
                            objectEach(axis.ticks, function (tick) {
                                tick.isNew = true;
                                tick.isNewLabel = true;
                            });
                        }
                    });
                    bubbleLegendOptions.placed = true;
                    // After recalculate axes, calculate margins again.
                    chart.getMargins();
                    // Call default 'drawChartBox' method.
                    proceed.call(chart, options, callback);
                    // Check bubble legend sizes and correct them if necessary.
                    legend.bubbleLegend.correctSizes();
                    // Correct items positions with different dimensions in legend.
                    retranslateItems(legend, getLinesHeights(legend));
                }
                else {
                    proceed.call(chart, options, callback);
                    // Allow color change on static bubble legend after click on legend
                    if (legend && legend.options.enabled && legend.bubbleLegend) {
                        legend.render();
                        retranslateItems(legend, getLinesHeights(legend));
                    }
                }
            }
            /**
             * Compose classes for use with Bubble series.
             * @private
             *
             * @param {Highcharts.Chart} ChartClass
             * Core chart class to use with Bubble series.
             *
             * @param {Highcharts.Legend} LegendClass
             * Core legend class to use with Bubble series.
             *
             * @param {Highcharts.Series} SeriesClass
             * Core series class to use with Bubble series.
             */
            function compose(ChartClass, LegendClass, SeriesClass) {
                if (composedClasses.indexOf(ChartClass) === -1) {
                    composedClasses.push(ChartClass);
                    setOptions({
                        // Set default bubble legend options
                        legend: {
                            bubbleLegend: BubbleLegendDefaults
                        }
                    });
                    wrap(ChartClass.prototype, 'drawChartBox', chartDrawChartBox);
                }
                if (composedClasses.indexOf(LegendClass) === -1) {
                    composedClasses.push(LegendClass);
                    addEvent(LegendClass, 'afterGetAllItems', onLegendAfterGetAllItems);
                }
                if (composedClasses.indexOf(SeriesClass) === -1) {
                    composedClasses.push(SeriesClass);
                    addEvent(SeriesClass, 'legendItemClick', onSeriesLegendItemClick);
                }
            }
            BubbleLegendComposition.compose = compose;
            /**
             * Check if there is at least one visible bubble series.
             *
             * @private
             * @function getVisibleBubbleSeriesIndex
             * @param {Highcharts.Chart} chart
             * Chart to check.
             * @return {number}
             * First visible bubble series index
             */
            function getVisibleBubbleSeriesIndex(chart) {
                var series = chart.series;
                var i = 0;
                while (i < series.length) {
                    if (series[i] &&
                        series[i].isBubble &&
                        series[i].visible &&
                        series[i].zData.length) {
                        return i;
                    }
                    i++;
                }
                return -1;
            }
            /**
             * Calculate height for each row in legend.
             *
             * @private
             * @function getLinesHeights
             *
             * @param {Highcharts.Legend} legend
             * Legend to calculate from.
             *
             * @return {Array<Highcharts.Dictionary<number>>}
             * Informations about line height and items amount
             */
            function getLinesHeights(legend) {
                var items = legend.allItems,
                    lines = [],
                    length = items.length;
                var lastLine,
                    i = 0,
                    j = 0;
                for (i = 0; i < length; i++) {
                    if (items[i].legendItemHeight) {
                        // for bubbleLegend
                        items[i].itemHeight = items[i].legendItemHeight;
                    }
                    if ( // Line break
                    items[i] === items[length - 1] ||
                        items[i + 1] &&
                            items[i]._legendItemPos[1] !==
                                items[i + 1]._legendItemPos[1]) {
                        lines.push({ height: 0 });
                        lastLine = lines[lines.length - 1];
                        // Find the highest item in line
                        for (j; j <= i; j++) {
                            if (items[j].itemHeight > lastLine.height) {
                                lastLine.height = items[j].itemHeight;
                            }
                        }
                        lastLine.step = i;
                    }
                }
                return lines;
            }
            /**
             * Start the bubble legend creation process.
             */
            function onLegendAfterGetAllItems(e) {
                var legend = this,
                    bubbleLegend = legend.bubbleLegend,
                    legendOptions = legend.options,
                    options = legendOptions.bubbleLegend,
                    bubbleSeriesIndex = getVisibleBubbleSeriesIndex(legend.chart);
                // Remove unnecessary element
                if (bubbleLegend && bubbleLegend.ranges && bubbleLegend.ranges.length) {
                    // Allow change the way of calculating ranges in update
                    if (options.ranges.length) {
                        options.autoRanges =
                            !!options.ranges[0].autoRanges;
                    }
                    // Update bubbleLegend dimensions in each redraw
                    legend.destroyItem(bubbleLegend);
                }
                // Create bubble legend
                if (bubbleSeriesIndex >= 0 &&
                    legendOptions.enabled &&
                    options.enabled) {
                    options.seriesIndex = bubbleSeriesIndex;
                    legend.bubbleLegend = new BubbleLegendItem(options, legend);
                    legend.bubbleLegend.addToLegend(e.allItems);
                }
            }
            /**
             * Toggle bubble legend depending on the visible status of bubble series.
             */
            function onSeriesLegendItemClick() {
                var series = this,
                    chart = series.chart,
                    visible = series.visible,
                    legend = series.chart.legend;
                var status;
                if (legend && legend.bubbleLegend) {
                    // Temporary correct 'visible' property
                    series.visible = !visible;
                    // Save future status for getRanges method
                    series.ignoreSeries = visible;
                    // Check if at lest one bubble series is visible
                    status = getVisibleBubbleSeriesIndex(chart) >= 0;
                    // Hide bubble legend if all bubble series are disabled
                    if (legend.bubbleLegend.visible !== status) {
                        // Show or hide bubble legend
                        legend.update({
                            bubbleLegend: { enabled: status }
                        });
                        legend.bubbleLegend.visible = status; // Restore default status
                    }
                    series.visible = visible;
                }
            }
            /**
             * Correct legend items translation in case of different elements heights.
             *
             * @private
             * @function Highcharts.Legend#retranslateItems
             *
             * @param {Highcharts.Legend} legend
             * Legend to translate in.
             *
             * @param {Array<Highcharts.Dictionary<number>>} lines
             * Informations about line height and items amount
             */
            function retranslateItems(legend, lines) {
                var items = legend.allItems,
                    rtl = legend.options.rtl;
                var orgTranslateX,
                    orgTranslateY,
                    movementX,
                    actualLine = 0;
                items.forEach(function (item, index) {
                    orgTranslateX = item.legendGroup.translateX;
                    orgTranslateY = item._legendItemPos[1];
                    movementX = item.movementX;
                    if (movementX || (rtl && item.ranges)) {
                        movementX = rtl ?
                            orgTranslateX - item.options.maxSize / 2 :
                            orgTranslateX + movementX;
                        item.legendGroup.attr({ translateX: movementX });
                    }
                    if (index > lines[actualLine].step) {
                        actualLine++;
                    }
                    item.legendGroup.attr({
                        translateY: Math.round(orgTranslateY + lines[actualLine].height / 2)
                    });
                    item._legendItemPos[1] = orgTranslateY +
                        lines[actualLine].height / 2;
                });
            }
            /* eslint-disable valid-jsdoc */
        })(BubbleLegendComposition || (BubbleLegendComposition = {}));
        /* *
         *
         *  Default Export
         *
         * */

        return BubbleLegendComposition;
    });
    _registerModule(_modules, 'Series/Bubble/BubblePoint.js', [_modules['Core/Series/Point.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (Point, SeriesRegistry, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
                var extendStatics = function (d,
            b) {
                    extendStatics = Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array && function (d,
            b) { d.__proto__ = b; }) ||
                        function (d,
            b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var ScatterPoint = SeriesRegistry.seriesTypes.scatter.prototype.pointClass;
        var extend = U.extend;
        /* *
         *
         *  Class
         *
         * */
        var BubblePoint = /** @class */ (function (_super) {
                __extends(BubblePoint, _super);
            function BubblePoint() {
                /* *
                 *
                 *  Properties
                 *
                 * */
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                _this.options = void 0;
                _this.series = void 0;
                return _this;
                /* eslint-enable valid-jsdoc */
            }
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            /**
             * @private
             */
            BubblePoint.prototype.haloPath = function (size) {
                return Point.prototype.haloPath.call(this, 
                // #6067
                size === 0 ? 0 : (this.marker ? this.marker.radius || 0 : 0) + size);
            };
            return BubblePoint;
        }(ScatterPoint));
        extend(BubblePoint.prototype, {
            ttBelow: false
        });
        /* *
         *
         *  Default Export
         *
         * */

        return BubblePoint;
    });
    _registerModule(_modules, 'Series/Bubble/BubbleSeries.js', [_modules['Core/Axis/Axis.js'], _modules['Series/Bubble/BubbleLegendComposition.js'], _modules['Series/Bubble/BubblePoint.js'], _modules['Core/Color/Color.js'], _modules['Core/Globals.js'], _modules['Core/Series/Series.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (Axis, BubbleLegendComposition, BubblePoint, Color, H, Series, SeriesRegistry, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
                var extendStatics = function (d,
            b) {
                    extendStatics = Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array && function (d,
            b) { d.__proto__ = b; }) ||
                        function (d,
            b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var color = Color.parse;
        var noop = H.noop;
        var _a = SeriesRegistry.seriesTypes,
            ColumnSeries = _a.column,
            ScatterSeries = _a.scatter;
        var arrayMax = U.arrayMax,
            arrayMin = U.arrayMin,
            clamp = U.clamp,
            extend = U.extend,
            isNumber = U.isNumber,
            merge = U.merge,
            pick = U.pick,
            pInt = U.pInt;
        /* *
         *
         *  Class
         *
         * */
        var BubbleSeries = /** @class */ (function (_super) {
                __extends(BubbleSeries, _super);
            function BubbleSeries() {
                /* *
                 *
                 *  Static Properties
                 *
                 * */
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                /* *
                 *
                 *  Properties
                 *
                 * */
                _this.data = void 0;
                _this.maxPxSize = void 0;
                _this.minPxSize = void 0;
                _this.options = void 0;
                _this.points = void 0;
                _this.radii = void 0;
                _this.yData = void 0;
                _this.zData = void 0;
                return _this;
                /* eslint-enable valid-jsdoc */
            }
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            /**
             * Perform animation on the bubbles
             * @private
             */
            BubbleSeries.prototype.animate = function (init) {
                if (!init &&
                    this.points.length < this.options.animationLimit // #8099
                ) {
                    this.points.forEach(function (point) {
                        var graphic = point.graphic;
                        if (graphic && graphic.width) { // URL symbols don't have width
                            // Start values
                            if (!this.hasRendered) {
                                graphic.attr({
                                    x: point.plotX,
                                    y: point.plotY,
                                    width: 1,
                                    height: 1
                                });
                            }
                            // Run animation
                            graphic.animate(this.markerAttribs(point), this.options.animation);
                        }
                    }, this);
                }
            };
            /**
             * Get the radius for each point based on the minSize, maxSize and each
             * point's Z value. This must be done prior to Series.translate because
             * the axis needs to add padding in accordance with the point sizes.
             * @private
             */
            BubbleSeries.prototype.getRadii = function (zMin, zMax, series) {
                var len,
                    i,
                    zData = this.zData,
                    yData = this.yData,
                    minSize = series.minPxSize,
                    maxSize = series.maxPxSize,
                    radii = [],
                    value;
                // Set the shape type and arguments to be picked up in drawPoints
                for (i = 0, len = zData.length; i < len; i++) {
                    value = zData[i];
                    // Separate method to get individual radius for bubbleLegend
                    radii.push(this.getRadius(zMin, zMax, minSize, maxSize, value, yData[i]));
                }
                this.radii = radii;
            };
            /**
             * Get the individual radius for one point.
             * @private
             */
            BubbleSeries.prototype.getRadius = function (zMin, zMax, minSize, maxSize, value, yValue) {
                var options = this.options,
                    sizeByArea = options.sizeBy !== 'width',
                    zThreshold = options.zThreshold,
                    zRange = zMax - zMin,
                    pos = 0.5;
                // #8608 - bubble should be visible when z is undefined
                if (yValue === null || value === null) {
                    return null;
                }
                if (isNumber(value)) {
                    // When sizing by threshold, the absolute value of z determines
                    // the size of the bubble.
                    if (options.sizeByAbsoluteValue) {
                        value = Math.abs(value - zThreshold);
                        zMax = zRange = Math.max(zMax - zThreshold, Math.abs(zMin - zThreshold));
                        zMin = 0;
                    }
                    // Issue #4419 - if value is less than zMin, push a radius that's
                    // always smaller than the minimum size
                    if (value < zMin) {
                        return minSize / 2 - 1;
                    }
                    // Relative size, a number between 0 and 1
                    if (zRange > 0) {
                        pos = (value - zMin) / zRange;
                    }
                }
                if (sizeByArea && pos >= 0) {
                    pos = Math.sqrt(pos);
                }
                return Math.ceil(minSize + pos * (maxSize - minSize)) / 2;
            };
            /**
             * Define hasData function for non-cartesian series.
             * Returns true if the series has points at all.
             * @private
             */
            BubbleSeries.prototype.hasData = function () {
                return !!this.processedXData.length; // != 0
            };
            /**
             * @private
             */
            BubbleSeries.prototype.pointAttribs = function (point, state) {
                var markerOptions = this.options.marker,
                    fillOpacity = markerOptions.fillOpacity,
                    attr = Series.prototype.pointAttribs.call(this,
                    point,
                    state);
                if (fillOpacity !== 1) {
                    attr.fill = color(attr.fill)
                        .setOpacity(fillOpacity)
                        .get('rgba');
                }
                return attr;
            };
            /**
             * Extend the base translate method to handle bubble size
             * @private
             */
            BubbleSeries.prototype.translate = function () {
                var i,
                    data = this.data,
                    point,
                    radius,
                    radii = this.radii;
                // Run the parent method
                _super.prototype.translate.call(this);
                // Set the shape type and arguments to be picked up in drawPoints
                i = data.length;
                while (i--) {
                    point = data[i];
                    radius = radii ? radii[i] : 0; // #1737
                    if (isNumber(radius) && radius >= this.minPxSize / 2) {
                        // Shape arguments
                        point.marker = extend(point.marker, {
                            radius: radius,
                            width: 2 * radius,
                            height: 2 * radius
                        });
                        // Alignment box for the data label
                        point.dlBox = {
                            x: point.plotX - radius,
                            y: point.plotY - radius,
                            width: 2 * radius,
                            height: 2 * radius
                        };
                    }
                    else { // below zThreshold
                        // #1691
                        point.shapeArgs = point.plotY = point.dlBox = void 0;
                    }
                }
            };
            BubbleSeries.compose = BubbleLegendComposition.compose;
            /**
             * A bubble series is a three dimensional series type where each point
             * renders an X, Y and Z value. Each points is drawn as a bubble where the
             * position along the X and Y axes mark the X and Y values, and the size of
             * the bubble relates to the Z value.
             *
             * @sample {highcharts} highcharts/demo/bubble/
             *         Bubble chart
             *
             * @extends      plotOptions.scatter
             * @excluding    cluster
             * @product      highcharts highstock
             * @requires     highcharts-more
             * @optionparent plotOptions.bubble
             */
            BubbleSeries.defaultOptions = merge(ScatterSeries.defaultOptions, {
                dataLabels: {
                    formatter: function () {
                        var numberFormatter = this.series.chart.numberFormatter;
                        var z = this.point.z;
                        return isNumber(z) ? numberFormatter(z, -1) : '';
                    },
                    inside: true,
                    verticalAlign: 'middle'
                },
                /**
                 * If there are more points in the series than the `animationLimit`, the
                 * animation won't run. Animation affects overall performance and
                 * doesn't work well with heavy data series.
                 *
                 * @since 6.1.0
                 */
                animationLimit: 250,
                /**
                 * Whether to display negative sized bubbles. The threshold is given
                 * by the [zThreshold](#plotOptions.bubble.zThreshold) option, and negative
                 * bubbles can be visualized by setting
                 * [negativeColor](#plotOptions.bubble.negativeColor).
                 *
                 * @sample {highcharts} highcharts/plotoptions/bubble-negative/
                 *         Negative bubbles
                 *
                 * @type      {boolean}
                 * @default   true
                 * @since     3.0
                 * @apioption plotOptions.bubble.displayNegative
                 */
                /**
                 * @extends   plotOptions.series.marker
                 * @excluding enabled, enabledThreshold, height, radius, width
                 */
                marker: {
                    lineColor: null,
                    lineWidth: 1,
                    /**
                     * The fill opacity of the bubble markers.
                     */
                    fillOpacity: 0.5,
                    /**
                     * In bubble charts, the radius is overridden and determined based
                     * on the point's data value.
                     *
                     * @ignore-option
                     */
                    radius: null,
                    states: {
                        hover: {
                            radiusPlus: 0
                        }
                    },
                    /**
                     * A predefined shape or symbol for the marker. Possible values are
                     * "circle", "square", "diamond", "triangle" and "triangle-down".
                     *
                     * Additionally, the URL to a graphic can be given on the form
                     * `url(graphic.png)`. Note that for the image to be applied to
                     * exported charts, its URL needs to be accessible by the export
                     * server.
                     *
                     * Custom callbacks for symbol path generation can also be added to
                     * `Highcharts.SVGRenderer.prototype.symbols`. The callback is then
                     * used by its method name, as shown in the demo.
                     *
                     * @sample {highcharts} highcharts/plotoptions/bubble-symbol/
                     *         Bubble chart with various symbols
                     * @sample {highcharts} highcharts/plotoptions/series-marker-symbol/
                     *         General chart with predefined, graphic and custom markers
                     *
                     * @type  {Highcharts.SymbolKeyValue|string}
                     * @since 5.0.11
                     */
                    symbol: 'circle'
                },
                /**
                 * Minimum bubble size. Bubbles will automatically size between the
                 * `minSize` and `maxSize` to reflect the `z` value of each bubble.
                 * Can be either pixels (when no unit is given), or a percentage of
                 * the smallest one of the plot width and height.
                 *
                 * @sample {highcharts} highcharts/plotoptions/bubble-size/
                 *         Bubble size
                 *
                 * @type    {number|string}
                 * @since   3.0
                 * @product highcharts highstock
                 */
                minSize: 8,
                /**
                 * Maximum bubble size. Bubbles will automatically size between the
                 * `minSize` and `maxSize` to reflect the `z` value of each bubble.
                 * Can be either pixels (when no unit is given), or a percentage of
                 * the smallest one of the plot width and height.
                 *
                 * @sample {highcharts} highcharts/plotoptions/bubble-size/
                 *         Bubble size
                 *
                 * @type    {number|string}
                 * @since   3.0
                 * @product highcharts highstock
                 */
                maxSize: '20%',
                /**
                 * When a point's Z value is below the
                 * [zThreshold](#plotOptions.bubble.zThreshold)
                 * setting, this color is used.
                 *
                 * @sample {highcharts} highcharts/plotoptions/bubble-negative/
                 *         Negative bubbles
                 *
                 * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 * @since     3.0
                 * @product   highcharts
                 * @apioption plotOptions.bubble.negativeColor
                 */
                /**
                 * Whether the bubble's value should be represented by the area or the
                 * width of the bubble. The default, `area`, corresponds best to the
                 * human perception of the size of each bubble.
                 *
                 * @sample {highcharts} highcharts/plotoptions/bubble-sizeby/
                 *         Comparison of area and size
                 *
                 * @type       {Highcharts.BubbleSizeByValue}
                 * @default    area
                 * @since      3.0.7
                 * @apioption  plotOptions.bubble.sizeBy
                 */
                /**
                 * When this is true, the absolute value of z determines the size of
                 * the bubble. This means that with the default `zThreshold` of 0, a
                 * bubble of value -1 will have the same size as a bubble of value 1,
                 * while a bubble of value 0 will have a smaller size according to
                 * `minSize`.
                 *
                 * @sample    {highcharts} highcharts/plotoptions/bubble-sizebyabsolutevalue/
                 *            Size by absolute value, various thresholds
                 *
                 * @type      {boolean}
                 * @default   false
                 * @since     4.1.9
                 * @product   highcharts
                 * @apioption plotOptions.bubble.sizeByAbsoluteValue
                 */
                /**
                 * When this is true, the series will not cause the Y axis to cross
                 * the zero plane (or [threshold](#plotOptions.series.threshold) option)
                 * unless the data actually crosses the plane.
                 *
                 * For example, if `softThreshold` is `false`, a series of 0, 1, 2,
                 * 3 will make the Y axis show negative values according to the
                 * `minPadding` option. If `softThreshold` is `true`, the Y axis starts
                 * at 0.
                 *
                 * @since   4.1.9
                 * @product highcharts
                 */
                softThreshold: false,
                states: {
                    hover: {
                        halo: {
                            size: 5
                        }
                    }
                },
                tooltip: {
                    pointFormat: '({point.x}, {point.y}), Size: {point.z}'
                },
                turboThreshold: 0,
                /**
                 * The minimum for the Z value range. Defaults to the highest Z value
                 * in the data.
                 *
                 * @see [zMin](#plotOptions.bubble.zMin)
                 *
                 * @sample {highcharts} highcharts/plotoptions/bubble-zmin-zmax/
                 *         Z has a possible range of 0-100
                 *
                 * @type      {number}
                 * @since     4.0.3
                 * @product   highcharts
                 * @apioption plotOptions.bubble.zMax
                 */
                /**
                 * @default   z
                 * @apioption plotOptions.bubble.colorKey
                 */
                /**
                 * The minimum for the Z value range. Defaults to the lowest Z value
                 * in the data.
                 *
                 * @see [zMax](#plotOptions.bubble.zMax)
                 *
                 * @sample {highcharts} highcharts/plotoptions/bubble-zmin-zmax/
                 *         Z has a possible range of 0-100
                 *
                 * @type      {number}
                 * @since     4.0.3
                 * @product   highcharts
                 * @apioption plotOptions.bubble.zMin
                 */
                /**
                 * When [displayNegative](#plotOptions.bubble.displayNegative) is `false`,
                 * bubbles with lower Z values are skipped. When `displayNegative`
                 * is `true` and a [negativeColor](#plotOptions.bubble.negativeColor)
                 * is given, points with lower Z is colored.
                 *
                 * @sample {highcharts} highcharts/plotoptions/bubble-negative/
                 *         Negative bubbles
                 *
                 * @since   3.0
                 * @product highcharts
                 */
                zThreshold: 0,
                zoneAxis: 'z'
            });
            return BubbleSeries;
        }(ScatterSeries));
        extend(BubbleSeries.prototype, {
            alignDataLabel: ColumnSeries.prototype.alignDataLabel,
            applyZones: noop,
            bubblePadding: true,
            buildKDTree: noop,
            directTouch: true,
            isBubble: true,
            pointArrayMap: ['y', 'z'],
            pointClass: BubblePoint,
            parallelArrays: ['x', 'y', 'z'],
            trackerGroups: ['group', 'dataLabelsGroup'],
            specialGroup: 'group',
            zoneAxis: 'z'
        });
        /* *
         *
         *  Axis ?
         *
         * */
        // Add logic to pad each axis with the amount of pixels necessary to avoid the
        // bubbles to overflow.
        Axis.prototype.beforePadding = function () {
            var axis = this,
                axisLength = this.len,
                chart = this.chart,
                pxMin = 0,
                pxMax = axisLength,
                isXAxis = this.isXAxis,
                dataKey = isXAxis ? 'xData' : 'yData',
                min = this.min,
                extremes = {},
                smallestSize = Math.min(chart.plotWidth,
                chart.plotHeight),
                zMin = Number.MAX_VALUE,
                zMax = -Number.MAX_VALUE,
                range = this.max - min,
                transA = axisLength / range,
                activeSeries = [];
            // Handle padding on the second pass, or on redraw
            this.series.forEach(function (series) {
                var seriesOptions = series.options,
                    zData;
                if (series.bubblePadding &&
                    (series.visible || !chart.options.chart.ignoreHiddenSeries)) {
                    // Correction for #1673
                    axis.allowZoomOutside = true;
                    // Cache it
                    activeSeries.push(series);
                    if (isXAxis) { // because X axis is evaluated first
                        // For each series, translate the size extremes to pixel values
                        ['minSize', 'maxSize'].forEach(function (prop) {
                            var length = seriesOptions[prop],
                                isPercent = /%$/.test(length);
                            length = pInt(length);
                            extremes[prop] = isPercent ?
                                smallestSize * length / 100 :
                                length;
                        });
                        series.minPxSize = extremes.minSize;
                        // Prioritize min size if conflict to make sure bubbles are
                        // always visible. #5873
                        series.maxPxSize = Math.max(extremes.maxSize, extremes.minSize);
                        // Find the min and max Z
                        zData = series.zData.filter(isNumber);
                        if (zData.length) { // #1735
                            zMin = pick(seriesOptions.zMin, clamp(arrayMin(zData), seriesOptions.displayNegative === false ?
                                seriesOptions.zThreshold :
                                -Number.MAX_VALUE, zMin));
                            zMax = pick(seriesOptions.zMax, Math.max(zMax, arrayMax(zData)));
                        }
                    }
                }
            });
            activeSeries.forEach(function (series) {
                var data = series[dataKey],
                    i = data.length,
                    radius;
                if (isXAxis) {
                    series.getRadii(zMin, zMax, series);
                }
                if (range > 0) {
                    while (i--) {
                        if (isNumber(data[i]) &&
                            axis.dataMin <= data[i] &&
                            data[i] <= axis.max) {
                            radius = series.radii ? series.radii[i] : 0;
                            pxMin = Math.min(((data[i] - min) * transA) - radius, pxMin);
                            pxMax = Math.max(((data[i] - min) * transA) + radius, pxMax);
                        }
                    }
                }
            });
            // Apply the padding to the min and max properties
            if (activeSeries.length && range > 0 && !this.logarithmic) {
                pxMax -= axisLength;
                transA *= (axisLength +
                    Math.max(0, pxMin) - // #8901
                    Math.min(pxMax, axisLength)) / axisLength;
                [
                    ['min', 'userMin', pxMin],
                    ['max', 'userMax', pxMax]
                ].forEach(function (keys) {
                    if (typeof pick(axis.options[keys[0]], axis[keys[1]]) === 'undefined') {
                        axis[keys[0]] += keys[2] / transA;
                    }
                });
            }
            /* eslint-enable valid-jsdoc */
        };
        SeriesRegistry.registerSeriesType('bubble', BubbleSeries);
        /* *
         *
         *  Default Export
         *
         * */
        /* *
         *
         *  API Declarations
         *
         * */
        /**
         * @typedef {"area"|"width"} Highcharts.BubbleSizeByValue
         */
        ''; // detach doclets above
        /* *
         *
         *  API Options
         *
         * */
        /**
         * A `bubble` series. If the [type](#series.bubble.type) option is
         * not specified, it is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.bubble
         * @excluding dataParser, dataURL, stack
         * @product   highcharts highstock
         * @requires  highcharts-more
         * @apioption series.bubble
         */
        /**
         * An array of data points for the series. For the `bubble` series type,
         * points can be given in the following ways:
         *
         * 1. An array of arrays with 3 or 2 values. In this case, the values correspond
         *    to `x,y,z`. If the first value is a string, it is applied as the name of
         *    the point, and the `x` value is inferred. The `x` value can also be
         *    omitted, in which case the inner arrays should be of length 2\. Then the
         *    `x` value is automatically calculated, either starting at 0 and
         *    incremented by 1, or from `pointStart` and `pointInterval` given in the
         *    series options.
         *    ```js
         *    data: [
         *        [0, 1, 2],
         *        [1, 5, 5],
         *        [2, 0, 2]
         *    ]
         *    ```
         *
         * 2. An array of objects with named values. The following snippet shows only a
         *    few settings, see the complete options set below. If the total number of
         *    data points exceeds the series'
         *    [turboThreshold](#series.bubble.turboThreshold), this option is not
         *    available.
         *    ```js
         *    data: [{
         *        x: 1,
         *        y: 1,
         *        z: 1,
         *        name: "Point2",
         *        color: "#00FF00"
         *    }, {
         *        x: 1,
         *        y: 5,
         *        z: 4,
         *        name: "Point1",
         *        color: "#FF00FF"
         *    }]
         *    ```
         *
         * @sample {highcharts} highcharts/series/data-array-of-arrays/
         *         Arrays of numeric x and y
         * @sample {highcharts} highcharts/series/data-array-of-arrays-datetime/
         *         Arrays of datetime x and y
         * @sample {highcharts} highcharts/series/data-array-of-name-value/
         *         Arrays of point.name and y
         * @sample {highcharts} highcharts/series/data-array-of-objects/
         *         Config objects
         *
         * @type      {Array<Array<(number|string),number>|Array<(number|string),number,number>|*>}
         * @extends   series.line.data
         * @product   highcharts
         * @apioption series.bubble.data
         */
        /**
         * @extends     series.line.data.marker
         * @excluding   enabledThreshold, height, radius, width
         * @product     highcharts
         * @apioption   series.bubble.data.marker
         */
        /**
         * The size value for each bubble. The bubbles' diameters are computed
         * based on the `z`, and controlled by series options like `minSize`,
         * `maxSize`, `sizeBy`, `zMin` and `zMax`.
         *
         * @type      {number|null}
         * @product   highcharts
         * @apioption series.bubble.data.z
         */
        /**
         * @excluding enabled, enabledThreshold, height, radius, width
         * @apioption series.bubble.marker
         */
        ''; // adds doclets above to transpiled file

        return BubbleSeries;
    });
    _registerModule(_modules, 'Series/MapBubble/MapBubblePoint.js', [_modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (SeriesRegistry, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
                var extendStatics = function (d,
            b) {
                    extendStatics = Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array && function (d,
            b) { d.__proto__ = b; }) ||
                        function (d,
            b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var _a = SeriesRegistry.seriesTypes,
            BubbleSeries = _a.bubble,
            MapSeries = _a.map;
        var extend = U.extend,
            merge = U.merge;
        /* *
         *
         *  Class
         *
         * */
        var MapBubblePoint = /** @class */ (function (_super) {
                __extends(MapBubblePoint, _super);
            function MapBubblePoint() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            /**
             * @private
             */
            MapBubblePoint.prototype.applyOptions = function (options, x) {
                var point;
                if (options &&
                    typeof options.lat !== 'undefined' &&
                    typeof options.lon !== 'undefined') {
                    point = _super.prototype.applyOptions.call(this, merge(options, this.series.chart.fromLatLonToPoint(options)), x);
                }
                else {
                    point = MapSeries.prototype.pointClass.prototype
                        .applyOptions.call(this, options, x);
                }
                return point;
            };
            /**
             * @private
             */
            MapBubblePoint.prototype.isValid = function () {
                return typeof this.z === 'number';
            };
            return MapBubblePoint;
        }(BubbleSeries.prototype.pointClass));
        extend(MapBubblePoint.prototype, {
            ttBelow: false
        });
        /* *
         *
         *  Default Export
         *
         * */

        return MapBubblePoint;
    });
    _registerModule(_modules, 'Series/MapBubble/MapBubbleSeries.js', [_modules['Series/Bubble/BubbleSeries.js'], _modules['Series/MapBubble/MapBubblePoint.js'], _modules['Series/Map/MapSeries.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (BubbleSeries, MapBubblePoint, MapSeries, SeriesRegistry, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
                var extendStatics = function (d,
            b) {
                    extendStatics = Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array && function (d,
            b) { d.__proto__ = b; }) ||
                        function (d,
            b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var extend = U.extend,
            merge = U.merge;
        /* *
         *
         *  Class
         *
         * */
        /**
         * @private
         * @class
         * @name Highcharts.seriesTypes.mapbubble
         *
         * @augments Highcharts.Series
         */
        var MapBubbleSeries = /** @class */ (function (_super) {
                __extends(MapBubbleSeries, _super);
            function MapBubbleSeries() {
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                /* *
                 *
                 *  Properties
                 *
                 * */
                _this.data = void 0;
                _this.options = void 0;
                _this.points = void 0;
                return _this;
            }
            /* *
             *
             *  Static Properties
             *
             * */
            MapBubbleSeries.compose = BubbleSeries.compose;
            /**
             * A map bubble series is a bubble series laid out on top of a map
             * series, where each bubble is tied to a specific map area.
             *
             * @sample maps/demo/map-bubble/
             *         Map bubble chart
             *
             * @extends      plotOptions.bubble
             * @product      highmaps
             * @optionparent plotOptions.mapbubble
             */
            MapBubbleSeries.defaultOptions = merge(BubbleSeries.defaultOptions, {
                /**
                 * The main color of the series. This color affects both the fill
                 * and the stroke of the bubble. For enhanced control, use `marker`
                 * options.
                 *
                 * @sample {highmaps} maps/plotoptions/mapbubble-color/
                 *         Pink bubbles
                 *
                 * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 * @apioption plotOptions.mapbubble.color
                 */
                /**
                 * Whether to display negative sized bubbles. The threshold is
                 * given by the [zThreshold](#plotOptions.mapbubble.zThreshold)
                 * option, and negative bubbles can be visualized by setting
                 * [negativeColor](#plotOptions.bubble.negativeColor).
                 *
                 * @type      {boolean}
                 * @default   true
                 * @apioption plotOptions.mapbubble.displayNegative
                 */
                /**
                 * @sample {highmaps} maps/demo/map-bubble/
                 *         Bubble size
                 *
                 * @apioption plotOptions.mapbubble.maxSize
                 */
                /**
                 * @sample {highmaps} maps/demo/map-bubble/
                 *         Bubble size
                 *
                 * @apioption plotOptions.mapbubble.minSize
                 */
                /**
                 * When a point's Z value is below the
                 * [zThreshold](#plotOptions.mapbubble.zThreshold) setting, this
                 * color is used.
                 *
                 * @sample {highmaps} maps/plotoptions/mapbubble-negativecolor/
                 *         Negative color below a threshold
                 *
                 * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 * @apioption plotOptions.mapbubble.negativeColor
                 */
                /**
                 * Whether the bubble's value should be represented by the area or
                 * the width of the bubble. The default, `area`, corresponds best to
                 * the human perception of the size of each bubble.
                 *
                 * @type       {Highcharts.BubbleSizeByValue}
                 * @default    area
                 * @apioption  plotOptions.mapbubble.sizeBy
                 */
                /**
                 * When this is true, the absolute value of z determines the size
                 * of the bubble. This means that with the default `zThreshold` of
                 * 0, a bubble of value -1 will have the same size as a bubble of
                 * value 1, while a bubble of value 0 will have a smaller size
                 * according to `minSize`.
                 *
                 * @sample {highmaps} highcharts/plotoptions/bubble-sizebyabsolutevalue/
                 *         Size by absolute value, various thresholds
                 *
                 * @type      {boolean}
                 * @default   false
                 * @since     1.1.9
                 * @apioption plotOptions.mapbubble.sizeByAbsoluteValue
                 */
                /**
                 * The minimum for the Z value range. Defaults to the highest Z
                 * value in the data.
                 *
                 * @see [zMax](#plotOptions.mapbubble.zMin)
                 *
                 * @sample {highmaps} highcharts/plotoptions/bubble-zmin-zmax/
                 *         Z has a possible range of 0-100
                 *
                 * @type      {number}
                 * @since     1.0.3
                 * @apioption plotOptions.mapbubble.zMax
                 */
                /**
                 * The minimum for the Z value range. Defaults to the lowest Z value
                 * in the data.
                 *
                 * @see [zMax](#plotOptions.mapbubble.zMax)
                 *
                 * @sample {highmaps} highcharts/plotoptions/bubble-zmin-zmax/
                 *         Z has a possible range of 0-100
                 *
                 * @type      {number}
                 * @since     1.0.3
                 * @apioption plotOptions.mapbubble.zMin
                 */
                /**
                 * When [displayNegative](#plotOptions.mapbubble.displayNegative)
                 * is `false`, bubbles with lower Z values are skipped. When
                 * `displayNegative` is `true` and a
                 * [negativeColor](#plotOptions.mapbubble.negativeColor) is given,
                 * points with lower Z is colored.
                 *
                 * @sample {highmaps} maps/plotoptions/mapbubble-negativecolor/
                 *         Negative color below a threshold
                 *
                 * @type      {number}
                 * @default   0
                 * @apioption plotOptions.mapbubble.zThreshold
                 */
                animationLimit: 500,
                tooltip: {
                    pointFormat: '{point.name}: {point.z}'
                }
            });
            return MapBubbleSeries;
        }(BubbleSeries));
        extend(MapBubbleSeries.prototype, {
            type: 'mapbubble',
            getBox: MapSeries.prototype.getBox,
            // If one single value is passed, it is interpreted as z
            pointArrayMap: ['z'],
            pointClass: MapBubblePoint,
            setData: MapSeries.prototype.setData,
            setOptions: MapSeries.prototype.setOptions,
            xyFromShape: true
        });
        SeriesRegistry.registerSeriesType('mapbubble', MapBubbleSeries);
        /* *
         *
         *  Default Export
         *
         * */
        /* *
         *
         *  API Options
         *
         * */
        /**
         * A `mapbubble` series. If the [type](#series.mapbubble.type) option
         * is not specified, it is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.mapbubble
         * @excluding dataParser, dataURL
         * @product   highmaps
         * @apioption series.mapbubble
         */
        /**
         * An array of data points for the series. For the `mapbubble` series
         * type, points can be given in the following ways:
         *
         * 1. An array of numerical values. In this case, the numerical values
         *    will be interpreted as `z` options. Example:
         *
         *    ```js
         *    data: [0, 5, 3, 5]
         *    ```
         *
         * 2. An array of objects with named values. The following snippet shows only a
         *    few settings, see the complete options set below. If the total number of
         *    data points exceeds the series'
         *    [turboThreshold](#series.mapbubble.turboThreshold),
         *    this option is not available.
         *
         *    ```js
         *        data: [{
         *            z: 9,
         *            name: "Point2",
         *            color: "#00FF00"
         *        }, {
         *            z: 10,
         *            name: "Point1",
         *            color: "#FF00FF"
         *        }]
         *    ```
         *
         * @type      {Array<number|null|*>}
         * @extends   series.mappoint.data
         * @excluding labelrank, middleX, middleY, path, value, x, y, lat, lon
         * @product   highmaps
         * @apioption series.mapbubble.data
         */
        /**
         * While the `x` and `y` values of the bubble are determined by the
         * underlying map, the `z` indicates the actual value that gives the
         * size of the bubble.
         *
         * @sample {highmaps} maps/demo/map-bubble/
         *         Bubble
         *
         * @type      {number|null}
         * @product   highmaps
         * @apioption series.mapbubble.data.z
         */
        /**
         * @excluding enabled, enabledThreshold, height, radius, width
         * @apioption series.mapbubble.marker
         */
        ''; // adds doclets above to transpiled file

        return MapBubbleSeries;
    });
    _registerModule(_modules, 'Series/Heatmap/HeatmapPoint.js', [_modules['Mixins/ColorMapSeries.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (ColorMapMixin, SeriesRegistry, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
                var extendStatics = function (d,
            b) {
                    extendStatics = Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array && function (d,
            b) { d.__proto__ = b; }) ||
                        function (d,
            b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var colorMapPointMixin = ColorMapMixin.colorMapPointMixin;
        var ScatterPoint = SeriesRegistry.seriesTypes.scatter.prototype.pointClass;
        var clamp = U.clamp,
            extend = U.extend,
            pick = U.pick;
        /* *
         *
         *  Class
         *
         * */
        var HeatmapPoint = /** @class */ (function (_super) {
                __extends(HeatmapPoint, _super);
            function HeatmapPoint() {
                /* *
                 *
                 *  Properties
                 *
                 * */
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                _this.options = void 0;
                _this.series = void 0;
                _this.value = void 0;
                _this.x = void 0;
                _this.y = void 0;
                return _this;
                /* eslint-enable valid-jsdoc */
            }
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            /**
             * @private
             */
            HeatmapPoint.prototype.applyOptions = function (options, x) {
                var point = _super.prototype.applyOptions.call(this,
                    options,
                    x);
                point.formatPrefix = point.isNull || point.value === null ? 'null' : 'point';
                return point;
            };
            HeatmapPoint.prototype.getCellAttributes = function () {
                var point = this,
                    series = point.series,
                    seriesOptions = series.options,
                    xPad = (seriesOptions.colsize || 1) / 2,
                    yPad = (seriesOptions.rowsize || 1) / 2,
                    xAxis = series.xAxis,
                    yAxis = series.yAxis,
                    markerOptions = point.options.marker || series.options.marker,
                    pointPlacement = series.pointPlacementToXValue(), // #7860
                    pointPadding = pick(point.pointPadding,
                    seriesOptions.pointPadding, 0),
                    cellAttr = {
                        x1: clamp(Math.round(xAxis.len -
                            (xAxis.translate(point.x - xPad,
                    false,
                    true,
                    false,
                    true, -pointPlacement) || 0)), -xAxis.len, 2 * xAxis.len),
                        x2: clamp(Math.round(xAxis.len -
                            (xAxis.translate(point.x + xPad,
                    false,
                    true,
                    false,
                    true, -pointPlacement) || 0)), -xAxis.len, 2 * xAxis.len),
                        y1: clamp(Math.round((yAxis.translate(point.y - yPad,
                    false,
                    true,
                    false,
                    true) || 0)), -yAxis.len, 2 * yAxis.len),
                        y2: clamp(Math.round((yAxis.translate(point.y + yPad,
                    false,
                    true,
                    false,
                    true) || 0)), -yAxis.len, 2 * yAxis.len)
                    };
                // Handle marker's fixed width, and height values including border
                // and pointPadding while calculating cell attributes.
                [['width', 'x'], ['height', 'y']].forEach(function (dimension) {
                    var prop = dimension[0],
                        direction = dimension[1];
                    var start = direction + '1', end = direction + '2';
                    var side = Math.abs(cellAttr[start] - cellAttr[end]),
                        borderWidth = markerOptions &&
                            markerOptions.lineWidth || 0,
                        plotPos = Math.abs(cellAttr[start] + cellAttr[end]) / 2;
                    if (markerOptions[prop] &&
                        markerOptions[prop] < side) {
                        cellAttr[start] = plotPos - (markerOptions[prop] / 2) -
                            (borderWidth / 2);
                        cellAttr[end] = plotPos + (markerOptions[prop] / 2) +
                            (borderWidth / 2);
                    }
                    // Handle pointPadding
                    if (pointPadding) {
                        if (direction === 'y') {
                            start = end;
                            end = direction + '1';
                        }
                        cellAttr[start] += pointPadding;
                        cellAttr[end] -= pointPadding;
                    }
                });
                return cellAttr;
            };
            /**
             * @private
             */
            HeatmapPoint.prototype.haloPath = function (size) {
                if (!size) {
                    return [];
                }
                var rect = this.shapeArgs;
                return [
                    'M',
                    rect.x - size,
                    rect.y - size,
                    'L',
                    rect.x - size,
                    rect.y + rect.height + size,
                    rect.x + rect.width + size,
                    rect.y + rect.height + size,
                    rect.x + rect.width + size,
                    rect.y - size,
                    'Z'
                ];
            };
            /**
             * Color points have a value option that determines whether or not it is
             * a null point
             * @private
             */
            HeatmapPoint.prototype.isValid = function () {
                // undefined is allowed
                return (this.value !== Infinity &&
                    this.value !== -Infinity);
            };
            return HeatmapPoint;
        }(ScatterPoint));
        extend(HeatmapPoint.prototype, {
            dataLabelOnNull: colorMapPointMixin.dataLabelOnNull,
            moveToTopOnHover: colorMapPointMixin.moveToTopOnHover
        });
        /* *
         *
         *  Default Export
         *
         * */

        return HeatmapPoint;
    });
    _registerModule(_modules, 'Series/Heatmap/HeatmapSeries.js', [_modules['Core/Color/Color.js'], _modules['Mixins/ColorMapSeries.js'], _modules['Series/Heatmap/HeatmapPoint.js'], _modules['Core/Legend/LegendSymbol.js'], _modules['Core/Color/Palette.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Renderer/SVG/SVGRenderer.js'], _modules['Core/Utilities.js']], function (Color, ColorMapMixin, HeatmapPoint, LegendSymbol, palette, SeriesRegistry, SVGRenderer, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
                var extendStatics = function (d,
            b) {
                    extendStatics = Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array && function (d,
            b) { d.__proto__ = b; }) ||
                        function (d,
            b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var colorMapSeriesMixin = ColorMapMixin.colorMapSeriesMixin;
        var Series = SeriesRegistry.series,
            _a = SeriesRegistry.seriesTypes,
            ColumnSeries = _a.column,
            ScatterSeries = _a.scatter;
        var symbols = SVGRenderer.prototype.symbols;
        var extend = U.extend,
            fireEvent = U.fireEvent,
            isNumber = U.isNumber,
            merge = U.merge,
            pick = U.pick;
        /* *
         *
         *  Class
         *
         * */
        /**
         * @private
         * @class
         * @name Highcharts.seriesTypes.heatmap
         *
         * @augments Highcharts.Series
         */
        var HeatmapSeries = /** @class */ (function (_super) {
                __extends(HeatmapSeries, _super);
            function HeatmapSeries() {
                /* *
                 *
                 *  Static Properties
                 *
                 * */
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                /* *
                 *
                 *  Properties
                 *
                 * */
                _this.colorAxis = void 0;
                _this.data = void 0;
                _this.options = void 0;
                _this.points = void 0;
                _this.valueMax = NaN;
                _this.valueMin = NaN;
                return _this;
                /* eslint-enable valid-jsdoc */
            }
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            /**
             * @private
             */
            HeatmapSeries.prototype.drawPoints = function () {
                var _this = this;
                // In styled mode, use CSS, otherwise the fill used in the style
                // sheet will take precedence over the fill attribute.
                var seriesMarkerOptions = this.options.marker || {};
                if (seriesMarkerOptions.enabled || this._hasPointMarkers) {
                    Series.prototype.drawPoints.call(this);
                    this.points.forEach(function (point) {
                        if (point.graphic) {
                            point.graphic[_this.chart.styledMode ? 'css' : 'animate'](_this.colorAttribs(point));
                            if (_this.options.borderRadius) {
                                point.graphic.attr({
                                    r: _this.options.borderRadius
                                });
                            }
                            if (point.value === null) { // #15708
                                point.graphic.addClass('highcharts-null-point');
                            }
                        }
                    });
                }
            };
            /**
             * @private
             */
            HeatmapSeries.prototype.getExtremes = function () {
                // Get the extremes from the value data
                var _a = Series.prototype.getExtremes
                        .call(this,
                    this.valueData),
                    dataMin = _a.dataMin,
                    dataMax = _a.dataMax;
                if (isNumber(dataMin)) {
                    this.valueMin = dataMin;
                }
                if (isNumber(dataMax)) {
                    this.valueMax = dataMax;
                }
                // Get the extremes from the y data
                return Series.prototype.getExtremes.call(this);
            };
            /**
             * Override to also allow null points, used when building the k-d-tree for
             * tooltips in boost mode.
             * @private
             */
            HeatmapSeries.prototype.getValidPoints = function (points, insideOnly) {
                return Series.prototype.getValidPoints.call(this, points, insideOnly, true);
            };
            /**
             * Define hasData function for non-cartesian series. Returns true if the
             * series has points at all.
             * @private
             */
            HeatmapSeries.prototype.hasData = function () {
                return !!this.processedXData.length; // != 0
            };
            /**
             * Override the init method to add point ranges on both axes.
             * @private
             */
            HeatmapSeries.prototype.init = function () {
                var options;
                Series.prototype.init.apply(this, arguments);
                options = this.options;
                // #3758, prevent resetting in setData
                options.pointRange = pick(options.pointRange, options.colsize || 1);
                // general point range
                this.yAxis.axisPointRange = options.rowsize || 1;
                // Bind new symbol names
                symbols.ellipse = symbols.circle;
            };
            /**
             * @private
             */
            HeatmapSeries.prototype.markerAttribs = function (point, state) {
                var pointMarkerOptions = point.marker || {},
                    seriesMarkerOptions = this.options.marker || {},
                    seriesStateOptions,
                    pointStateOptions,
                    shapeArgs = point.shapeArgs || {},
                    hasImage = point.hasImage,
                    attribs = {};
                if (hasImage) {
                    return {
                        x: point.plotX,
                        y: point.plotY
                    };
                }
                // Setting width and height attributes on image does not affect
                // on its dimensions.
                if (state) {
                    seriesStateOptions = seriesMarkerOptions.states[state] || {};
                    pointStateOptions = pointMarkerOptions.states &&
                        pointMarkerOptions.states[state] || {};
                    [['width', 'x'], ['height', 'y']].forEach(function (dimension) {
                        // Set new width and height basing on state options.
                        attribs[dimension[0]] = (pointStateOptions[dimension[0]] ||
                            seriesStateOptions[dimension[0]] ||
                            shapeArgs[dimension[0]]) + (pointStateOptions[dimension[0] + 'Plus'] ||
                            seriesStateOptions[dimension[0] + 'Plus'] || 0);
                        // Align marker by a new size.
                        attribs[dimension[1]] =
                            shapeArgs[dimension[1]] +
                                (shapeArgs[dimension[0]] -
                                    attribs[dimension[0]]) / 2;
                    });
                }
                return state ? attribs : shapeArgs;
            };
            /**
             * @private
             */
            HeatmapSeries.prototype.pointAttribs = function (point, state) {
                var series = this,
                    attr = Series.prototype.pointAttribs.call(series,
                    point,
                    state),
                    seriesOptions = series.options || {},
                    plotOptions = series.chart.options.plotOptions || {},
                    seriesPlotOptions = plotOptions.series || {},
                    heatmapPlotOptions = plotOptions.heatmap || {},
                    stateOptions,
                    brightness, 
                    // Get old properties in order to keep backward compatibility
                    borderColor = (point && point.options.borderColor) ||
                        seriesOptions.borderColor ||
                        heatmapPlotOptions.borderColor ||
                        seriesPlotOptions.borderColor,
                    borderWidth = (point && point.options.borderWidth) ||
                        seriesOptions.borderWidth ||
                        heatmapPlotOptions.borderWidth ||
                        seriesPlotOptions.borderWidth ||
                        attr['stroke-width'];
                // Apply lineColor, or set it to default series color.
                attr.stroke = ((point && point.marker && point.marker.lineColor) ||
                    (seriesOptions.marker && seriesOptions.marker.lineColor) ||
                    borderColor ||
                    this.color);
                // Apply old borderWidth property if exists.
                attr['stroke-width'] = borderWidth;
                if (state) {
                    stateOptions =
                        merge(seriesOptions.states[state], seriesOptions.marker &&
                            seriesOptions.marker.states[state], point &&
                            point.options.states &&
                            point.options.states[state] || {});
                    brightness = stateOptions.brightness;
                    attr.fill =
                        stateOptions.color ||
                            Color.parse(attr.fill).brighten(brightness || 0).get();
                    attr.stroke = stateOptions.lineColor;
                }
                return attr;
            };
            /**
             * @private
             */
            HeatmapSeries.prototype.setClip = function (animation) {
                var series = this,
                    chart = series.chart;
                Series.prototype.setClip.apply(series, arguments);
                if (series.options.clip !== false || animation) {
                    series.markerGroup
                        .clip((animation || series.clipBox) && series.sharedClipKey ?
                        chart.sharedClips[series.sharedClipKey] :
                        chart.clipRect);
                }
            };
            /**
             * @private
             */
            HeatmapSeries.prototype.translate = function () {
                var series = this, options = series.options, symbol = options.marker && options.marker.symbol || 'rect', shape = symbols[symbol] ? symbol : 'rect', hasRegularShape = ['circle', 'square'].indexOf(shape) !== -1;
                series.generatePoints();
                series.points.forEach(function (point) {
                    var pointAttr,
                        sizeDiff,
                        hasImage,
                        cellAttr = point.getCellAttributes(),
                        shapeArgs = {};
                    shapeArgs.x = Math.min(cellAttr.x1, cellAttr.x2);
                    shapeArgs.y = Math.min(cellAttr.y1, cellAttr.y2);
                    shapeArgs.width = Math.max(Math.abs(cellAttr.x2 - cellAttr.x1), 0);
                    shapeArgs.height = Math.max(Math.abs(cellAttr.y2 - cellAttr.y1), 0);
                    hasImage = point.hasImage =
                        (point.marker && point.marker.symbol || symbol || '')
                            .indexOf('url') === 0;
                    // If marker shape is regular (symetric), find shorter
                    // cell's side.
                    if (hasRegularShape) {
                        sizeDiff = Math.abs(shapeArgs.width - shapeArgs.height);
                        shapeArgs.x = Math.min(cellAttr.x1, cellAttr.x2) +
                            (shapeArgs.width < shapeArgs.height ? 0 : sizeDiff / 2);
                        shapeArgs.y = Math.min(cellAttr.y1, cellAttr.y2) +
                            (shapeArgs.width < shapeArgs.height ? sizeDiff / 2 : 0);
                        shapeArgs.width = shapeArgs.height =
                            Math.min(shapeArgs.width, shapeArgs.height);
                    }
                    pointAttr = {
                        plotX: (cellAttr.x1 + cellAttr.x2) / 2,
                        plotY: (cellAttr.y1 + cellAttr.y2) / 2,
                        clientX: (cellAttr.x1 + cellAttr.x2) / 2,
                        shapeType: 'path',
                        shapeArgs: merge(true, shapeArgs, {
                            d: symbols[shape](shapeArgs.x, shapeArgs.y, shapeArgs.width, shapeArgs.height)
                        })
                    };
                    if (hasImage) {
                        point.marker = {
                            width: shapeArgs.width,
                            height: shapeArgs.height
                        };
                    }
                    extend(point, pointAttr);
                });
                fireEvent(series, 'afterTranslate');
            };
            /**
             * A heatmap is a graphical representation of data where the individual
             * values contained in a matrix are represented as colors.
             *
             * @productdesc {highcharts}
             * Requires `modules/heatmap`.
             *
             * @sample highcharts/demo/heatmap/
             *         Simple heatmap
             * @sample highcharts/demo/heatmap-canvas/
             *         Heavy heatmap
             *
             * @extends      plotOptions.scatter
             * @excluding    animationLimit, connectEnds, connectNulls, cropThreshold,
             *               dashStyle, findNearestPointBy, getExtremesFromAll, jitter,
             *               linecap, lineWidth, pointInterval, pointIntervalUnit,
             *               pointRange, pointStart, shadow, softThreshold, stacking,
             *               step, threshold, cluster
             * @product      highcharts highmaps
             * @optionparent plotOptions.heatmap
             */
            HeatmapSeries.defaultOptions = merge(ScatterSeries.defaultOptions, {
                /**
                 * Animation is disabled by default on the heatmap series.
                 */
                animation: false,
                /**
                 * The border radius for each heatmap item.
                 */
                borderRadius: 0,
                /**
                 * The border width for each heatmap item.
                 */
                borderWidth: 0,
                /**
                 * Padding between the points in the heatmap.
                 *
                 * @type      {number}
                 * @default   0
                 * @since     6.0
                 * @apioption plotOptions.heatmap.pointPadding
                 */
                /**
                 * @default   value
                 * @apioption plotOptions.heatmap.colorKey
                 */
                /**
                 * The main color of the series. In heat maps this color is rarely used,
                 * as we mostly use the color to denote the value of each point. Unless
                 * options are set in the [colorAxis](#colorAxis), the default value
                 * is pulled from the [options.colors](#colors) array.
                 *
                 * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 * @since     4.0
                 * @product   highcharts
                 * @apioption plotOptions.heatmap.color
                 */
                /**
                 * The column size - how many X axis units each column in the heatmap
                 * should span.
                 *
                 * @sample {highcharts} maps/demo/heatmap/
                 *         One day
                 * @sample {highmaps} maps/demo/heatmap/
                 *         One day
                 *
                 * @type      {number}
                 * @default   1
                 * @since     4.0
                 * @product   highcharts highmaps
                 * @apioption plotOptions.heatmap.colsize
                 */
                /**
                 * The row size - how many Y axis units each heatmap row should span.
                 *
                 * @sample {highcharts} maps/demo/heatmap/
                 *         1 by default
                 * @sample {highmaps} maps/demo/heatmap/
                 *         1 by default
                 *
                 * @type      {number}
                 * @default   1
                 * @since     4.0
                 * @product   highcharts highmaps
                 * @apioption plotOptions.heatmap.rowsize
                 */
                /**
                 * The color applied to null points. In styled mode, a general CSS class
                 * is applied instead.
                 *
                 * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 */
                nullColor: palette.neutralColor3,
                dataLabels: {
                    formatter: function () {
                        var numberFormatter = this.series.chart.numberFormatter;
                        var value = this.point.value;
                        return isNumber(value) ? numberFormatter(value, -1) : '';
                    },
                    inside: true,
                    verticalAlign: 'middle',
                    crop: false,
                    overflow: false,
                    padding: 0 // #3837
                },
                /**
                 * @excluding radius, enabledThreshold
                 * @since     8.1
                 */
                marker: {
                    /**
                     * A predefined shape or symbol for the marker. When undefined, the
                     * symbol is pulled from options.symbols. Other possible values are
                     * `'circle'`, `'square'`,`'diamond'`, `'triangle'`,
                     * `'triangle-down'`, `'rect'`, and `'ellipse'`.
                     *
                     * Additionally, the URL to a graphic can be given on this form:
                     * `'url(graphic.png)'`. Note that for the image to be applied to
                     * exported charts, its URL needs to be accessible by the export
                     * server.
                     *
                     * Custom callbacks for symbol path generation can also be added to
                     * `Highcharts.SVGRenderer.prototype.symbols`. The callback is then
                     * used by its method name, as shown in the demo.
                     *
                     * @sample {highcharts} highcharts/plotoptions/series-marker-symbol/
                     *         Predefined, graphic and custom markers
                     * @sample {highstock} highcharts/plotoptions/series-marker-symbol/
                     *         Predefined, graphic and custom markers
                     */
                    symbol: 'rect',
                    /** @ignore-option */
                    radius: 0,
                    lineColor: void 0,
                    states: {
                        /**
                         * @excluding radius, radiusPlus
                         */
                        hover: {
                            /**
                             * Set the marker's fixed width on hover state.
                             *
                             * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-width
                             *         70px fixed marker's width and height on hover
                             *
                             * @type      {number|undefined}
                             * @default   undefined
                             * @product   highcharts highmaps
                             * @apioption plotOptions.heatmap.marker.states.hover.width
                             */
                            /**
                             * Set the marker's fixed height on hover state.
                             *
                             * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-width
                             *         70px fixed marker's width and height on hover
                             *
                             * @type      {number|undefined}
                             * @default   undefined
                             * @product   highcharts highmaps
                             * @apioption plotOptions.heatmap.marker.states.hover.height
                             */
                            /**
                             * The number of pixels to increase the width of the
                             * selected point.
                             *
                             * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-widthplus
                             *         20px greater width and height on hover
                             *
                             * @type      {number|undefined}
                             * @default   undefined
                             * @product   highcharts highmaps
                             * @apioption plotOptions.heatmap.marker.states.hover.widthPlus
                             */
                            /**
                             * The number of pixels to increase the height of the
                             * selected point.
                             *
                             * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-widthplus
                            *          20px greater width and height on hover
                             *
                             * @type      {number|undefined}
                             * @default   undefined
                             * @product   highcharts highmaps
                             * @apioption plotOptions.heatmap.marker.states.hover.heightPlus
                             */
                            /**
                             * The additional line width for a hovered point.
                             *
                             * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-linewidthplus
                             *         5 pixels wider lineWidth on hover
                             * @sample {highmaps} maps/plotoptions/heatmap-marker-states-hover-linewidthplus
                             *         5 pixels wider lineWidth on hover
                             */
                            lineWidthPlus: 0
                        },
                        /**
                         * @excluding radius
                         */
                        select: {
                        /**
                         * Set the marker's fixed width on select state.
                         *
                         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-width
                         *         70px fixed marker's width and height on hover
                         *
                         * @type      {number|undefined}
                         * @default   undefined
                         * @product   highcharts highmaps
                         * @apioption plotOptions.heatmap.marker.states.select.width
                         */
                        /**
                         * Set the marker's fixed height on select state.
                         *
                         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-width
                         *         70px fixed marker's width and height on hover
                         *
                         * @type      {number|undefined}
                         * @default   undefined
                         * @product   highcharts highmaps
                         * @apioption plotOptions.heatmap.marker.states.select.height
                         */
                        /**
                         * The number of pixels to increase the width of the
                         * selected point.
                         *
                         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-widthplus
                         *         20px greater width and height on hover
                         *
                         * @type      {number|undefined}
                         * @default   undefined
                         * @product   highcharts highmaps
                         * @apioption plotOptions.heatmap.marker.states.select.widthPlus
                         */
                        /**
                         * The number of pixels to increase the height of the
                         * selected point.
                         *
                         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-widthplus
                         *         20px greater width and height on hover
                         *
                         * @type      {number|undefined}
                         * @default   undefined
                         * @product   highcharts highmaps
                         * @apioption plotOptions.heatmap.marker.states.select.heightPlus
                         */
                        }
                    }
                },
                clip: true,
                /** @ignore-option */
                pointRange: null,
                tooltip: {
                    pointFormat: '{point.x}, {point.y}: {point.value}<br/>'
                },
                states: {
                    hover: {
                        /** @ignore-option */
                        halo: false,
                        /**
                         * How much to brighten the point on interaction. Requires the
                         * main color to be defined in hex or rgb(a) format.
                         *
                         * In styled mode, the hover brightening is by default replaced
                         * with a fill-opacity set in the `.highcharts-point:hover`
                         * rule.
                         */
                        brightness: 0.2
                    }
                }
            });
            return HeatmapSeries;
        }(ScatterSeries));
        extend(HeatmapSeries.prototype, {
            /**
             * @private
             */
            alignDataLabel: ColumnSeries.prototype.alignDataLabel,
            axisTypes: colorMapSeriesMixin.axisTypes,
            colorAttribs: colorMapSeriesMixin.colorAttribs,
            colorKey: colorMapSeriesMixin.colorKey,
            directTouch: true,
            /**
             * @private
             */
            drawLegendSymbol: LegendSymbol.drawRectangle,
            getExtremesFromAll: true,
            getSymbol: Series.prototype.getSymbol,
            parallelArrays: colorMapSeriesMixin.parallelArrays,
            pointArrayMap: ['y', 'value'],
            pointClass: HeatmapPoint,
            trackerGroups: colorMapSeriesMixin.trackerGroups
        });
        SeriesRegistry.registerSeriesType('heatmap', HeatmapSeries);
        /* *
         *
         *  Default Export
         *
         * */
        /* *
         *
         *  API Declarations
         *
         * */
        /**
         * Heatmap series only. Padding between the points in the heatmap.
         * @name Highcharts.Point#pointPadding
         * @type {number|undefined}
         */
        /**
         * Heatmap series only. The value of the point, resulting in a color
         * controled by options as set in the colorAxis configuration.
         * @name Highcharts.Point#value
         * @type {number|null|undefined}
         */
        /* *
         * @interface Highcharts.PointOptionsObject in parts/Point.ts
         */ /**
        * Heatmap series only. Point padding for a single point.
        * @name Highcharts.PointOptionsObject#pointPadding
        * @type {number|undefined}
        */ /**
        * Heatmap series only. The value of the point, resulting in a color controled
        * by options as set in the colorAxis configuration.
        * @name Highcharts.PointOptionsObject#value
        * @type {number|null|undefined}
        */
        ''; // detach doclets above
        /* *
         *
         *  API Options
         *
         * */
        /**
         * A `heatmap` series. If the [type](#series.heatmap.type) option is
         * not specified, it is inherited from [chart.type](#chart.type).
         *
         * @productdesc {highcharts}
         * Requires `modules/heatmap`.
         *
         * @extends   series,plotOptions.heatmap
         * @excluding cropThreshold, dataParser, dataURL, pointRange, stack,
         * @product   highcharts highmaps
         * @apioption series.heatmap
         */
        /**
         * An array of data points for the series. For the `heatmap` series
         * type, points can be given in the following ways:
         *
         * 1.  An array of arrays with 3 or 2 values. In this case, the values
         * correspond to `x,y,value`. If the first value is a string, it is
         * applied as the name of the point, and the `x` value is inferred.
         * The `x` value can also be omitted, in which case the inner arrays
         * should be of length 2\. Then the `x` value is automatically calculated,
         * either starting at 0 and incremented by 1, or from `pointStart`
         * and `pointInterval` given in the series options.
         *
         *  ```js
         *     data: [
         *         [0, 9, 7],
         *         [1, 10, 4],
         *         [2, 6, 3]
         *     ]
         *  ```
         *
         * 2.  An array of objects with named values. The following snippet shows only a
         * few settings, see the complete options set below. If the total number of data
         * points exceeds the series' [turboThreshold](#series.heatmap.turboThreshold),
         * this option is not available.
         *
         *  ```js
         *     data: [{
         *         x: 1,
         *         y: 3,
         *         value: 10,
         *         name: "Point2",
         *         color: "#00FF00"
         *     }, {
         *         x: 1,
         *         y: 7,
         *         value: 10,
         *         name: "Point1",
         *         color: "#FF00FF"
         *     }]
         *  ```
         *
         * @sample {highcharts} highcharts/chart/reflow-true/
         *         Numerical values
         * @sample {highcharts} highcharts/series/data-array-of-arrays/
         *         Arrays of numeric x and y
         * @sample {highcharts} highcharts/series/data-array-of-arrays-datetime/
         *         Arrays of datetime x and y
         * @sample {highcharts} highcharts/series/data-array-of-name-value/
         *         Arrays of point.name and y
         * @sample {highcharts} highcharts/series/data-array-of-objects/
         *         Config objects
         *
         * @type      {Array<Array<number>|*>}
         * @extends   series.line.data
         * @product   highcharts highmaps
         * @apioption series.heatmap.data
         */
        /**
         * The color of the point. In heat maps the point color is rarely set
         * explicitly, as we use the color to denote the `value`. Options for
         * this are set in the [colorAxis](#colorAxis) configuration.
         *
         * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
         * @product   highcharts highmaps
         * @apioption series.heatmap.data.color
         */
        /**
         * The value of the point, resulting in a color controled by options
         * as set in the [colorAxis](#colorAxis) configuration.
         *
         * @type      {number}
         * @product   highcharts highmaps
         * @apioption series.heatmap.data.value
         */
        /**
         * The x value of the point. For datetime axes,
         * the X value is the timestamp in milliseconds since 1970.
         *
         * @type      {number}
         * @product   highcharts highmaps
         * @apioption series.heatmap.data.x
         */
        /**
         * The y value of the point.
         *
         * @type      {number}
         * @product   highcharts highmaps
         * @apioption series.heatmap.data.y
         */
        /**
         * Point padding for a single point.
         *
         * @sample maps/plotoptions/tilemap-pointpadding
         *         Point padding on tiles
         *
         * @type      {number}
         * @product   highcharts highmaps
         * @apioption series.heatmap.data.pointPadding
         */
        /**
         * @excluding radius, enabledThreshold
         * @product   highcharts highmaps
         * @since     8.1
         * @apioption series.heatmap.data.marker
         */
        /**
         * @excluding radius, enabledThreshold
         * @product   highcharts highmaps
         * @since     8.1
         * @apioption series.heatmap.marker
         */
        /**
         * @excluding radius, radiusPlus
         * @product   highcharts highmaps
         * @apioption series.heatmap.marker.states.hover
         */
        /**
         * @excluding radius
         * @product   highcharts highmaps
         * @apioption series.heatmap.marker.states.select
         */
        /**
         * @excluding radius, radiusPlus
         * @product   highcharts highmaps
         * @apioption series.heatmap.data.marker.states.hover
         */
        /**
         * @excluding radius
         * @product   highcharts highmaps
         * @apioption series.heatmap.data.marker.states.select
         */
        /**
        * Set the marker's fixed width on hover state.
        *
        * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-linewidthplus
        *         5 pixels wider lineWidth on hover
        *
        * @type      {number|undefined}
        * @default   0
        * @product   highcharts highmaps
        * @apioption series.heatmap.marker.states.hover.lineWidthPlus
        */
        /**
        * Set the marker's fixed width on hover state.
        *
        * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-width
        *         70px fixed marker's width and height on hover
        *
        * @type      {number|undefined}
        * @default   undefined
        * @product   highcharts highmaps
        * @apioption series.heatmap.marker.states.hover.width
        */
        /**
         * Set the marker's fixed height on hover state.
         *
         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-width
         *         70px fixed marker's width and height on hover
         *
         * @type      {number|undefined}
         * @default   undefined
         * @product   highcharts highmaps
         * @apioption series.heatmap.marker.states.hover.height
         */
        /**
        * The number of pixels to increase the width of the
        * hovered point.
        *
        * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-widthplus
        *         One day
        *
        * @type      {number|undefined}
        * @default   undefined
        * @product   highcharts highmaps
        * @apioption series.heatmap.marker.states.hover.widthPlus
        */
        /**
         * The number of pixels to increase the height of the
         * hovered point.
         *
         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-widthplus
         *         One day
         *
         * @type      {number|undefined}
         * @default   undefined
         * @product   highcharts highmaps
         * @apioption series.heatmap.marker.states.hover.heightPlus
         */
        /**
         * The number of pixels to increase the width of the
         * hovered point.
         *
         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-widthplus
         *         One day
         *
         * @type      {number|undefined}
         * @default   undefined
         * @product   highcharts highmaps
         * @apioption series.heatmap.marker.states.select.widthPlus
         */
        /**
         * The number of pixels to increase the height of the
         * hovered point.
         *
         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-widthplus
         *         One day
         *
         * @type      {number|undefined}
         * @default   undefined
         * @product   highcharts highmaps
         * @apioption series.heatmap.marker.states.select.heightPlus
         */
        /**
        * Set the marker's fixed width on hover state.
        *
        * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-linewidthplus
        *         5 pixels wider lineWidth on hover
        *
        * @type      {number|undefined}
        * @default   0
        * @product   highcharts highmaps
        * @apioption series.heatmap.data.marker.states.hover.lineWidthPlus
        */
        /**
         * Set the marker's fixed width on hover state.
         *
         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-width
         *         70px fixed marker's width and height on hover
         *
         * @type      {number|undefined}
         * @default   undefined
         * @product   highcharts highmaps
         * @apioption series.heatmap.data.marker.states.hover.width
         */
        /**
         * Set the marker's fixed height on hover state.
         *
         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-width
         *         70px fixed marker's width and height on hover
         *
         * @type      {number|undefined}
         * @default   undefined
         * @product   highcharts highmaps
         * @apioption series.heatmap.data.marker.states.hover.height
         */
        /**
         * The number of pixels to increase the width of the
         * hovered point.
         *
         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-widthplus
         *         One day
         *
         * @type      {number|undefined}
         * @default   undefined
         * @product   highcharts highstock
         * @apioption series.heatmap.data.marker.states.hover.widthPlus
         */
        /**
         * The number of pixels to increase the height of the
         * hovered point.
         *
         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-widthplus
         *         One day
         *
         * @type      {number|undefined}
         * @default   undefined
         * @product   highcharts highstock
         * @apioption series.heatmap.data.marker.states.hover.heightPlus
         */
        /**
        * Set the marker's fixed width on select state.
        *
        * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-width
        *         70px fixed marker's width and height on hover
        *
        * @type      {number|undefined}
        * @default   undefined
        * @product   highcharts highmaps
        * @apioption series.heatmap.data.marker.states.select.width
        */
        /**
         * Set the marker's fixed height on select state.
         *
         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-width
         *         70px fixed marker's width and height on hover
         *
         * @type      {number|undefined}
         * @default   undefined
         * @product   highcharts highmaps
         * @apioption series.heatmap.data.marker.states.select.height
         */
        /**
         * The number of pixels to increase the width of the
         * hovered point.
         *
         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-widthplus
         *         One day
         *
         * @type      {number|undefined}
         * @default   undefined
         * @product   highcharts highstock
         * @apioption series.heatmap.data.marker.states.select.widthPlus
         */
        /**
         * The number of pixels to increase the height of the
         * hovered point.
         *
         * @sample {highcharts} maps/plotoptions/heatmap-marker-states-hover-widthplus
         *         One day
         *
         * @type      {number|undefined}
         * @default   undefined
         * @product   highcharts highstock
         * @apioption series.heatmap.data.marker.states.select.heightPlus
         */
        ''; // adds doclets above to transpiled file

        return HeatmapSeries;
    });
    _registerModule(_modules, 'Extensions/GeoJSON.js', [_modules['Core/Chart/Chart.js'], _modules['Core/FormatUtilities.js'], _modules['Core/Globals.js'], _modules['Core/Utilities.js']], function (Chart, F, H, U) {
        /* *
         *
         *  (c) 2010-2021 Torstein Honsi
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var format = F.format;
        var win = H.win;
        var error = U.error,
            extend = U.extend,
            merge = U.merge,
            wrap = U.wrap;
        /**
         * Represents the loose structure of a geographic JSON file.
         *
         * @interface Highcharts.GeoJSON
         */ /**
        * Full copyright note of the geographic data.
        * @name Highcharts.GeoJSON#copyright
        * @type {string|undefined}
        */ /**
        * Short copyright note of the geographic data suitable for watermarks.
        * @name Highcharts.GeoJSON#copyrightShort
        * @type {string|undefined}
        */ /**
        * Additional meta information based on the coordinate reference system.
        * @name Highcharts.GeoJSON#crs
        * @type {Highcharts.Dictionary<any>|undefined}
        */ /**
        * Data sets of geographic features.
        * @name Highcharts.GeoJSON#features
        * @type {Array<Highcharts.GeoJSONFeature>}
        */ /**
        * Map projections and transformations to be used when calculating between
        * lat/lon and chart values. Required for lat/lon support on maps. Allows
        * resizing, rotating, and moving portions of a map within its projected
        * coordinate system while still retaining lat/lon support. If using lat/lon
        * on a portion of the map that does not match a `hitZone`, the definition with
        * the key `default` is used.
        * @name Highcharts.GeoJSON#hc-transform
        * @type {Highcharts.Dictionary<Highcharts.GeoJSONTranslation>|undefined}
        */ /**
        * Title of the geographic data.
        * @name Highcharts.GeoJSON#title
        * @type {string|undefined}
        */ /**
        * Type of the geographic data. Type of an optimized map collection is
        * `FeatureCollection`.
        * @name Highcharts.GeoJSON#type
        * @type {string|undefined}
        */ /**
        * Version of the geographic data.
        * @name Highcharts.GeoJSON#version
        * @type {string|undefined}
        */
        /**
         * Data set of a geographic feature.
         * @interface Highcharts.GeoJSONFeature
         * @extends Highcharts.Dictionary<*>
         */ /**
        * Data type of the geographic feature.
        * @name Highcharts.GeoJSONFeature#type
        * @type {string}
        */
        /**
         * Describes the map projection and transformations applied to a portion of
         * a map.
         * @interface Highcharts.GeoJSONTranslation
         */ /**
        * The coordinate reference system used to generate this portion of the map.
        * @name Highcharts.GeoJSONTranslation#crs
        * @type {string}
        */ /**
        * Define the portion of the map that this defintion applies to. Defined as a
        * GeoJSON polygon feature object, with `type` and `coordinates` properties.
        * @name Highcharts.GeoJSONTranslation#hitZone
        * @type {Highcharts.Dictionary<*>|undefined}
        */ /**
        * Property for internal use for maps generated by Highsoft.
        * @name Highcharts.GeoJSONTranslation#jsonmarginX
        * @type {number|undefined}
        */ /**
        * Property for internal use for maps generated by Highsoft.
        * @name Highcharts.GeoJSONTranslation#jsonmarginY
        * @type {number|undefined}
        */ /**
        * Property for internal use for maps generated by Highsoft.
        * @name Highcharts.GeoJSONTranslation#jsonres
        * @type {number|undefined}
        */ /**
        * Specifies clockwise rotation of the coordinates after the projection, but
        * before scaling and panning. Defined in radians, relative to the coordinate
        * system origin.
        * @name Highcharts.GeoJSONTranslation#rotation
        * @type {number|undefined}
        */ /**
        * The scaling factor applied to the projected coordinates.
        * @name Highcharts.GeoJSONTranslation#scale
        * @type {number|undefined}
        */ /**
        * Property for internal use for maps generated by Highsoft.
        * @name Highcharts.GeoJSONTranslation#xoffset
        * @type {number|undefined}
        */ /**
        * X offset of projected coordinates after scaling.
        * @name Highcharts.GeoJSONTranslation#xpan
        * @type {number|undefined}
        */ /**
        * Property for internal use for maps generated by Highsoft.
        * @name Highcharts.GeoJSONTranslation#yoffset
        * @type {number|undefined}
        */ /**
        * Y offset of projected coordinates after scaling.
        * @name Highcharts.GeoJSONTranslation#ypan
        * @type {number|undefined}
        */
        /**
         * Result object of a map transformation.
         *
         * @interface Highcharts.MapCoordinateObject
         */ /**
        * X coordinate on the map.
        * @name Highcharts.MapCoordinateObject#x
        * @type {number}
        */ /**
        * Y coordinate on the map.
        * @name Highcharts.MapCoordinateObject#y
        * @type {number|null}
        */
        /**
         * A latitude/longitude object.
         *
         * @interface Highcharts.MapLatLonObject
         */ /**
        * The latitude.
        * @name Highcharts.MapLatLonObject#lat
        * @type {number}
        */ /**
        * The longitude.
        * @name Highcharts.MapLatLonObject#lon
        * @type {number}
        */
        ''; // detach doclets above
        /* eslint-disable no-invalid-this, valid-jsdoc */
        /**
         * Test for point in polygon. Polygon defined as array of [x,y] points.
         * @private
         */
        function pointInPolygon(point, polygon) {
            var i,
                j,
                rel1,
                rel2,
                c = false,
                x = point.x,
                y = point.y;
            for (i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                rel1 = polygon[i][1] > y;
                rel2 = polygon[j][1] > y;
                if (rel1 !== rel2 &&
                    (x < (polygon[j][0] -
                        polygon[i][0]) * (y - polygon[i][1]) /
                        (polygon[j][1] - polygon[i][1]) +
                        polygon[i][0])) {
                    c = !c;
                }
            }
            return c;
        }
        /**
         * Highmaps only. Get point from latitude and longitude using specified
         * transform definition.
         *
         * @requires modules/map
         *
         * @sample maps/series/latlon-transform/
         *         Use specific transformation for lat/lon
         *
         * @function Highcharts.Chart#transformFromLatLon
         *
         * @param {Highcharts.MapLatLonObject} latLon
         *        A latitude/longitude object.
         *
         * @param {*} transform
         *        The transform definition to use as explained in the
         *        {@link https://www.highcharts.com/docs/maps/latlon|documentation}.
         *
         * @return {Highcharts.MapCoordinateObject}
         *         An object with `x` and `y` properties.
         */
        Chart.prototype.transformFromLatLon = function (latLon, transform) {
            /**
             * Allows to manually load the proj4 library from Highcharts options
             * instead of the `window`.
             * In case of loading the library from a `script` tag,
             * this option is not needed, it will be loaded from there by default.
             *
             * @type       {function}
             * @product    highmaps
             * @apioption  chart.proj4
             */
            var proj4 = (this.userOptions.chart &&
                    this.userOptions.chart.proj4 ||
                    win.proj4);
            if (!proj4) {
                error(21, false, this);
                return {
                    x: 0,
                    y: null
                };
            }
            var projected = proj4(transform.crs,
                [latLon.lon,
                latLon.lat]),
                cosAngle = transform.cosAngle ||
                    (transform.rotation && Math.cos(transform.rotation)),
                sinAngle = transform.sinAngle ||
                    (transform.rotation && Math.sin(transform.rotation)),
                rotated = transform.rotation ? [
                    projected[0] * cosAngle + projected[1] * sinAngle,
                    -projected[0] * sinAngle + projected[1] * cosAngle
                ] : projected;
            return {
                x: ((rotated[0] - (transform.xoffset || 0)) * (transform.scale || 1) +
                    (transform.xpan || 0)) * (transform.jsonres || 1) +
                    (transform.jsonmarginX || 0),
                y: (((transform.yoffset || 0) - rotated[1]) * (transform.scale || 1) +
                    (transform.ypan || 0)) * (transform.jsonres || 1) -
                    (transform.jsonmarginY || 0)
            };
        };
        /**
         * Highmaps only. Get latLon from point using specified transform definition.
         * The method returns an object with the numeric properties `lat` and `lon`.
         *
         * @requires modules/map
         *
         * @sample maps/series/latlon-transform/
         *         Use specific transformation for lat/lon
         *
         * @function Highcharts.Chart#transformToLatLon
         *
         * @param {Highcharts.Point|Highcharts.MapCoordinateObject} point
         *        A `Point` instance, or any object containing the properties `x` and
         *        `y` with numeric values.
         *
         * @param {*} transform
         *        The transform definition to use as explained in the
         *        {@link https://www.highcharts.com/docs/maps/latlon|documentation}.
         *
         * @return {Highcharts.MapLatLonObject|undefined}
         *         An object with `lat` and `lon` properties.
         */
        Chart.prototype.transformToLatLon = function (point, transform) {
            if (typeof win.proj4 === 'undefined') {
                error(21, false, this);
                return;
            }
            var normalized = {
                    x: ((point.x -
                        (transform.jsonmarginX || 0)) / (transform.jsonres || 1) -
                        (transform.xpan || 0)) / (transform.scale || 1) +
                        (transform.xoffset || 0),
                    y: ((-point.y - (transform.jsonmarginY || 0)) / (transform.jsonres || 1) +
                        (transform.ypan || 0)) / (transform.scale || 1) +
                        (transform.yoffset || 0)
                },
                cosAngle = transform.cosAngle ||
                    (transform.rotation && Math.cos(transform.rotation)),
                sinAngle = transform.sinAngle ||
                    (transform.rotation && Math.sin(transform.rotation)), 
                // Note: Inverted sinAngle to reverse rotation direction
                projected = win.proj4(transform.crs, 'WGS84',
                transform.rotation ? {
                    x: normalized.x * cosAngle + normalized.y * -sinAngle,
                    y: normalized.x * sinAngle + normalized.y * cosAngle
                } : normalized);
            return { lat: projected.y, lon: projected.x };
        };
        /**
         * Highmaps only. Calculate latitude/longitude values for a point. Returns an
         * object with the numeric properties `lat` and `lon`.
         *
         * @requires modules/map
         *
         * @sample maps/demo/latlon-advanced/
         *         Advanced lat/lon demo
         *
         * @function Highcharts.Chart#fromPointToLatLon
         *
         * @param {Highcharts.Point|Highcharts.MapCoordinateObject} point
         *        A `Point` instance or anything containing `x` and `y` properties with
         *        numeric values.
         *
         * @return {Highcharts.MapLatLonObject|undefined}
         *         An object with `lat` and `lon` properties.
         */
        Chart.prototype.fromPointToLatLon = function (point) {
            var transforms = this.mapTransforms,
                transform;
            if (!transforms) {
                error(22, false, this);
                return;
            }
            for (transform in transforms) {
                if (Object.hasOwnProperty.call(transforms, transform) &&
                    transforms[transform].hitZone &&
                    pointInPolygon({ x: point.x, y: -point.y }, transforms[transform].hitZone.coordinates[0])) {
                    return this.transformToLatLon(point, transforms[transform]);
                }
            }
            return this.transformToLatLon(point, transforms['default'] // eslint-disable-line dot-notation
            );
        };
        /**
         * Highmaps only. Get chart coordinates from latitude/longitude. Returns an
         * object with x and y values corresponding to the `xAxis` and `yAxis`.
         *
         * @requires modules/map
         *
         * @sample maps/series/latlon-to-point/
         *         Find a point from lat/lon
         *
         * @function Highcharts.Chart#fromLatLonToPoint
         *
         * @param {Highcharts.MapLatLonObject} latLon
         *        Coordinates.
         *
         * @return {Highcharts.MapCoordinateObject}
         *         X and Y coordinates in terms of chart axis values.
         */
        Chart.prototype.fromLatLonToPoint = function (latLon) {
            var transforms = this.mapTransforms,
                transform,
                coords;
            if (!transforms) {
                error(22, false, this);
                return {
                    x: 0,
                    y: null
                };
            }
            for (transform in transforms) {
                if (Object.hasOwnProperty.call(transforms, transform) &&
                    transforms[transform].hitZone) {
                    coords = this.transformFromLatLon(latLon, transforms[transform]);
                    if (pointInPolygon({ x: coords.x, y: -coords.y }, transforms[transform].hitZone.coordinates[0])) {
                        return coords;
                    }
                }
            }
            return this.transformFromLatLon(latLon, transforms['default'] // eslint-disable-line dot-notation
            );
        };
        /**
         * Highmaps only. Restructure a GeoJSON object in preparation to be read
         * directly by the
         * {@link https://api.highcharts.com/highmaps/plotOptions.series.mapData|series.mapData}
         * option. The GeoJSON will be broken down to fit a specific Highcharts type,
         * either `map`, `mapline` or `mappoint`. Meta data in GeoJSON's properties
         * object will be copied directly over to {@link Point.properties} in Highmaps.
         *
         * @requires modules/map
         *
         * @sample maps/demo/geojson/
         *         Simple areas
         * @sample maps/demo/geojson-multiple-types/
         *         Multiple types
         *
         * @function Highcharts.geojson
         *
         * @param {Highcharts.GeoJSON} geojson
         *        The GeoJSON structure to parse, represented as a JavaScript object
         *        rather than a JSON string.
         *
         * @param {string} [hType=map]
         *        The Highmaps series type to prepare for. Setting "map" will return
         *        GeoJSON polygons and multipolygons. Setting "mapline" will return
         *        GeoJSON linestrings and multilinestrings. Setting "mappoint" will
         *        return GeoJSON points and multipoints.
         *
         * @return {Array<*>}
         *         An object ready for the `mapData` option.
         */
        H.geojson = function (geojson, hType, series) {
            var mapData = [],
                path = [],
                polygonToPath = function (polygon) {
                    polygon.forEach(function (point,
                i) {
                        if (i === 0) {
                            path.push(['M',
                point[0], -point[1]]);
                    }
                    else {
                        path.push(['L', point[0], -point[1]]);
                    }
                });
            };
            hType = hType || 'map';
            geojson.features.forEach(function (feature) {
                var geometry = feature.geometry,
                    type = geometry.type,
                    coordinates = geometry.coordinates,
                    properties = feature.properties,
                    point;
                path = [];
                if (hType === 'map' || hType === 'mapbubble') {
                    if (type === 'Polygon') {
                        coordinates.forEach(polygonToPath);
                        path.push(['Z']);
                    }
                    else if (type === 'MultiPolygon') {
                        coordinates.forEach(function (items) {
                            items.forEach(polygonToPath);
                        });
                        path.push(['Z']);
                    }
                    if (path.length) {
                        point = { path: path };
                    }
                }
                else if (hType === 'mapline') {
                    if (type === 'LineString') {
                        polygonToPath(coordinates);
                    }
                    else if (type === 'MultiLineString') {
                        coordinates.forEach(polygonToPath);
                    }
                    if (path.length) {
                        point = { path: path };
                    }
                }
                else if (hType === 'mappoint') {
                    if (type === 'Point') {
                        point = {
                            x: coordinates[0],
                            y: -coordinates[1]
                        };
                    }
                }
                if (point) {
                    mapData.push(extend(point, {
                        name: properties.name || properties.NAME,
                        /**
                         * In Highmaps, when data is loaded from GeoJSON, the GeoJSON
                         * item's properies are copied over here.
                         *
                         * @requires modules/map
                         * @name Highcharts.Point#properties
                         * @type {*}
                         */
                        properties: properties
                    }));
                }
            });
            // Create a credits text that includes map source, to be picked up in
            // Chart.addCredits
            if (series && geojson.copyrightShort) {
                series.chart.mapCredits = format(series.chart.options.credits.mapText, { geojson: geojson });
                series.chart.mapCreditsFull = format(series.chart.options.credits.mapTextFull, { geojson: geojson });
            }
            return mapData;
        };
        // Override addCredits to include map source by default
        wrap(Chart.prototype, 'addCredits', function (proceed, credits) {
            credits = merge(true, this.options.credits, credits);
            // Disable credits link if map credits enabled. This to allow for in-text
            // anchors.
            if (this.mapCredits) {
                credits.href = null;
            }
            proceed.call(this, credits);
            // Add full map credits to hover
            if (this.credits && this.mapCreditsFull) {
                this.credits.attr({
                    title: this.mapCreditsFull
                });
            }
        });

    });
    _registerModule(_modules, 'masters/modules/map.src.js', [_modules['Core/Globals.js'], _modules['Core/Axis/Color/ColorAxis.js'], _modules['Series/MapBubble/MapBubbleSeries.js'], _modules['Core/Chart/MapChart.js']], function (Highcharts, ColorAxis, MapBubbleSeries, MapChart) {

        var G = Highcharts;
        G.ColorAxis = ColorAxis;
        G.MapChart = MapChart;
        G.mapChart = G.Map = MapChart.mapChart;
        G.maps = MapChart.maps;
        ColorAxis.compose(G.Chart, G.Fx, G.Legend, G.Series);
        MapBubbleSeries.compose(G.Chart, G.Legend, G.Series);

    });
}));