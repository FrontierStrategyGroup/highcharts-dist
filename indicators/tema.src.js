/**
 * @license Highstock JS v9.1.2 (2021-08-18)
 *
 * Indicator series type for Highcharts Stock
 *
 * (c) 2010-2021 Rafal Sebestjanski
 *
 * License: www.highcharts.com/license
 */
'use strict';
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/indicators/tema', ['highcharts', 'highcharts/modules/stock'], function (Highcharts) {
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
    _registerModule(_modules, 'Mixins/IndicatorRequired.js', [_modules['Core/Utilities.js']], function (U) {
        /**
         *
         *  (c) 2010-2021 Daniel Studencki
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var error = U.error;
        /* eslint-disable no-invalid-this, valid-jsdoc */
        var requiredIndicatorMixin = {
                /**
                 * Check whether given indicator is loaded,
            else throw error.
                 * @private
                 * @param {Highcharts.Indicator} indicator
                 *        Indicator constructor function.
                 * @param {string} requiredIndicator
                 *        Required indicator type.
                 * @param {string} type
                 *        Type of indicator where function was called (parent).
                 * @param {Highcharts.IndicatorCallbackFunction} callback
                 *        Callback which is triggered if the given indicator is loaded.
                 *        Takes indicator as an argument.
                 * @param {string} errMessage
                 *        Error message that will be logged in console.
                 * @return {boolean}
                 *         Returns false when there is no required indicator loaded.
                 */
                isParentLoaded: function (indicator,
            requiredIndicator,
            type,
            callback,
            errMessage) {
                    if (indicator) {
                        return callback ? callback(indicator) : true;
                }
                error(errMessage || this.generateMessage(type, requiredIndicator));
                return false;
            },
            /**
             * @private
             * @param {string} indicatorType
             *        Indicator type
             * @param {string} required
             *        Required indicator
             * @return {string}
             *         Error message
             */
            generateMessage: function (indicatorType, required) {
                return 'Error: "' + indicatorType +
                    '" indicator type requires "' + required +
                    '" indicator loaded before. Please read docs: ' +
                    'https://api.highcharts.com/highstock/plotOptions.' +
                    indicatorType;
            }
        };

        return requiredIndicatorMixin;
    });
    _registerModule(_modules, 'Stock/Indicators/TEMA/TEMAIndicator.js', [_modules['Mixins/IndicatorRequired.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (RequiredIndicatorMixin, SeriesRegistry, U) {
        /* *
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
        var EMAIndicator = SeriesRegistry.seriesTypes.ema;
        var correctFloat = U.correctFloat,
            isArray = U.isArray,
            merge = U.merge;
        /**
         * The TEMA series type.
         *
         * @private
         * @class
         * @name Highcharts.seriesTypes.tema
         *
         * @augments Highcharts.Series
         */
        var TEMAIndicator = /** @class */ (function (_super) {
                __extends(TEMAIndicator, _super);
            function TEMAIndicator() {
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                _this.EMApercent = void 0;
                _this.data = void 0;
                _this.options = void 0;
                _this.points = void 0;
                return _this;
            }
            TEMAIndicator.prototype.init = function () {
                var args = arguments,
                    ctx = this;
                RequiredIndicatorMixin.isParentLoaded(EMAIndicator, 'ema', ctx.type, function (indicator) {
                    indicator.prototype.init.apply(ctx, args);
                    return;
                });
            };
            TEMAIndicator.prototype.getEMA = function (yVal, prevEMA, SMA, index, i, xVal) {
                return EMAIndicator.prototype.calculateEma(xVal || [], yVal, typeof i === 'undefined' ? 1 : i, this.EMApercent, prevEMA, typeof index === 'undefined' ? -1 : index, SMA);
            };
            TEMAIndicator.prototype.getTemaPoint = function (xVal, tripledPeriod, EMAlevels, i) {
                var TEMAPoint = [
                        xVal[i - 3],
                        correctFloat(3 * EMAlevels.level1 -
                            3 * EMAlevels.level2 + EMAlevels.level3)
                    ];
                return TEMAPoint;
            };
            TEMAIndicator.prototype.getValues = function (series, params) {
                var period = params.period,
                    doubledPeriod = 2 * period,
                    tripledPeriod = 3 * period,
                    xVal = series.xData,
                    yVal = series.yData,
                    yValLen = yVal ? yVal.length : 0,
                    index = -1,
                    accumulatePeriodPoints = 0,
                    SMA = 0,
                    TEMA = [],
                    xDataTema = [],
                    yDataTema = [], 
                    // EMA of previous point
                    prevEMA,
                    prevEMAlevel2, 
                    // EMA values array
                    EMAvalues = [],
                    EMAlevel2values = [],
                    i,
                    TEMAPoint, 
                    // This object contains all EMA EMAlevels calculated like below
                    // EMA = level1
                    // EMA(EMA) = level2,
                    // EMA(EMA(EMA)) = level3,
                    EMAlevels = {};
                this.EMApercent = (2 / (period + 1));
                // Check period, if bigger than EMA points length, skip
                if (yValLen < 3 * period - 2) {
                    return;
                }
                // Switch index for OHLC / Candlestick / Arearange
                if (isArray(yVal[0])) {
                    index = params.index ? params.index : 0;
                }
                // Accumulate first N-points
                accumulatePeriodPoints =
                    EMAIndicator.prototype.accumulatePeriodPoints(period, index, yVal);
                // first point
                SMA = accumulatePeriodPoints / period;
                accumulatePeriodPoints = 0;
                // Calculate value one-by-one for each period in visible data
                for (i = period; i < yValLen + 3; i++) {
                    if (i < yValLen + 1) {
                        EMAlevels.level1 = this.getEMA(yVal, prevEMA, SMA, index, i)[1];
                        EMAvalues.push(EMAlevels.level1);
                    }
                    prevEMA = EMAlevels.level1;
                    // Summing first period points for ema(ema)
                    if (i < doubledPeriod) {
                        accumulatePeriodPoints += EMAlevels.level1;
                    }
                    else {
                        // Calculate dema
                        // First dema point
                        if (i === doubledPeriod) {
                            SMA = accumulatePeriodPoints / period;
                            accumulatePeriodPoints = 0;
                        }
                        EMAlevels.level1 = EMAvalues[i - period - 1];
                        EMAlevels.level2 = this.getEMA([EMAlevels.level1], prevEMAlevel2, SMA)[1];
                        EMAlevel2values.push(EMAlevels.level2);
                        prevEMAlevel2 = EMAlevels.level2;
                        // Summing first period points for ema(ema(ema))
                        if (i < tripledPeriod) {
                            accumulatePeriodPoints += EMAlevels.level2;
                        }
                        else {
                            // Calculate tema
                            // First tema point
                            if (i === tripledPeriod) {
                                SMA = accumulatePeriodPoints / period;
                            }
                            if (i === yValLen + 1) {
                                // Calculate the last ema and emaEMA points
                                EMAlevels.level1 = EMAvalues[i - period - 1];
                                EMAlevels.level2 = this.getEMA([EMAlevels.level1], prevEMAlevel2, SMA)[1];
                                EMAlevel2values.push(EMAlevels.level2);
                            }
                            EMAlevels.level1 = EMAvalues[i - period - 2];
                            EMAlevels.level2 = EMAlevel2values[i - 2 * period - 1];
                            EMAlevels.level3 = this.getEMA([EMAlevels.level2], EMAlevels.prevLevel3, SMA)[1];
                            TEMAPoint = this.getTemaPoint(xVal, tripledPeriod, EMAlevels, i);
                            // Make sure that point exists (for TRIX oscillator)
                            if (TEMAPoint) {
                                TEMA.push(TEMAPoint);
                                xDataTema.push(TEMAPoint[0]);
                                yDataTema.push(TEMAPoint[1]);
                            }
                            EMAlevels.prevLevel3 = EMAlevels.level3;
                        }
                    }
                }
                return {
                    values: TEMA,
                    xData: xDataTema,
                    yData: yDataTema
                };
            };
            /**
             * Triple exponential moving average (TEMA) indicator. This series requires
             * `linkedTo` option to be set and should be loaded after the
             * `stock/indicators/indicators.js` and `stock/indicators/ema.js`.
             *
             * @sample {highstock} stock/indicators/tema
             *         TEMA indicator
             *
             * @extends      plotOptions.ema
             * @since        7.0.0
             * @product      highstock
             * @excluding    allAreas, colorAxis, compare, compareBase, joinBy, keys,
             *               navigatorOptions, pointInterval, pointIntervalUnit,
             *               pointPlacement, pointRange, pointStart, showInNavigator,
             *               stacking
             * @requires     stock/indicators/indicators
             * @requires     stock/indicators/ema
             * @requires     stock/indicators/tema
             * @optionparent plotOptions.tema
             */
            TEMAIndicator.defaultOptions = merge(EMAIndicator.defaultOptions);
            return TEMAIndicator;
        }(EMAIndicator));
        SeriesRegistry.registerSeriesType('tema', TEMAIndicator);
        /* *
         *
         *  Default Export
         *
         * */
        /**
         * A `TEMA` series. If the [type](#series.tema.type) option is not
         * specified, it is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.tema
         * @since     7.0.0
         * @product   highstock
         * @excluding allAreas, colorAxis, compare, compareBase, dataParser, dataURL,
         *            joinBy, keys, navigatorOptions, pointInterval, pointIntervalUnit,
         *            pointPlacement, pointRange, pointStart, showInNavigator, stacking
         * @requires  stock/indicators/indicators
         * @requires  stock/indicators/ema
         * @requires  stock/indicators/tema
         * @apioption series.tema
         */
        ''; // to include the above in the js output

        return TEMAIndicator;
    });
    _registerModule(_modules, 'masters/indicators/tema.src.js', [], function () {


    });
}));