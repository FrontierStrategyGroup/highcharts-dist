/**
 * @license Highstock JS v9.1.2 (2021-08-18)
 *
 * Indicator series type for Highcharts Stock
 *
 * (c) 2010-2021 Wojciech Chmiel
 *
 * License: www.highcharts.com/license
 */
'use strict';
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/indicators/ppo', ['highcharts', 'highcharts/modules/stock'], function (Highcharts) {
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
    _registerModule(_modules, 'Stock/Indicators/PPO/PPOIndicator.js', [_modules['Mixins/IndicatorRequired.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (RequiredIndicatorMixin, SeriesRegistry, U) {
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
            extend = U.extend,
            merge = U.merge,
            error = U.error;
        /* *
         *
         *  Class
         *
         * */
        /**
         * The PPO series type.
         *
         * @private
         * @class
         * @name Highcharts.seriesTypes.ppo
         *
         * @augments Highcharts.Series
         */
        var PPOIndicator = /** @class */ (function (_super) {
                __extends(PPOIndicator, _super);
            function PPOIndicator() {
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                /* *
                *
                *   Properties
                *
                * */
                _this.data = void 0;
                _this.options = void 0;
                _this.points = void 0;
                return _this;
            }
            /* *
             *
             *  Functions
             *
             * */
            PPOIndicator.prototype.init = function () {
                var args = arguments,
                    ctx = this;
                RequiredIndicatorMixin.isParentLoaded(EMAIndicator, 'ema', ctx.type, function (indicator) {
                    indicator.prototype.init.apply(ctx, args);
                    return;
                });
            };
            PPOIndicator.prototype.getValues = function (series, params) {
                var periods = params.periods,
                    index = params.index, 
                    // 0- date, 1- Percentage Price Oscillator
                    PPO = [],
                    xData = [],
                    yData = [],
                    periodsOffset, 
                    // Shorter Period EMA
                    SPE, 
                    // Longer Period EMA
                    LPE,
                    oscillator,
                    i;
                // Check if periods are correct
                if (periods.length !== 2 || periods[1] <= periods[0]) {
                    error('Error: "PPO requires two periods. Notice, first period ' +
                        'should be lower than the second one."');
                    return;
                }
                SPE = EMAIndicator.prototype.getValues.call(this, series, {
                    index: index,
                    period: periods[0]
                });
                LPE = EMAIndicator.prototype.getValues.call(this, series, {
                    index: index,
                    period: periods[1]
                });
                // Check if ema is calculated properly, if not skip
                if (!SPE || !LPE) {
                    return;
                }
                periodsOffset = periods[1] - periods[0];
                for (i = 0; i < LPE.yData.length; i++) {
                    oscillator = correctFloat((SPE.yData[i + periodsOffset] -
                        LPE.yData[i]) /
                        LPE.yData[i] *
                        100);
                    PPO.push([LPE.xData[i], oscillator]);
                    xData.push(LPE.xData[i]);
                    yData.push(oscillator);
                }
                return {
                    values: PPO,
                    xData: xData,
                    yData: yData
                };
            };
            /**
             * Percentage Price Oscillator. This series requires the
             * `linkedTo` option to be set and should be loaded after the
             * `stock/indicators/indicators.js` and `stock/indicators/ema.js`.
             *
             * @sample {highstock} stock/indicators/ppo
             *         Percentage Price Oscillator
             *
             * @extends      plotOptions.ema
             * @since        7.0.0
             * @product      highstock
             * @excluding    allAreas, colorAxis, joinBy, keys, navigatorOptions,
             *               pointInterval, pointIntervalUnit, pointPlacement,
             *               pointRange, pointStart, showInNavigator, stacking
             * @requires     stock/indicators/indicators
             * @requires     stock/indicators/ema
             * @requires     stock/indicators/ppo
             * @optionparent plotOptions.ppo
             */
            PPOIndicator.defaultOptions = merge(EMAIndicator.defaultOptions, {
                /**
                 * Paramters used in calculation of Percentage Price Oscillator series
                 * points.
                 *
                 * @excluding period
                 */
                params: {
                    period: void 0,
                    /**
                     * Periods for Percentage Price Oscillator calculations.
                     *
                     * @type    {Array<number>}
                     * @default [12, 26]
                     */
                    periods: [12, 26]
                }
            });
            return PPOIndicator;
        }(EMAIndicator));
        extend(PPOIndicator.prototype, {
            nameBase: 'PPO',
            nameComponents: ['periods']
        });
        SeriesRegistry.registerSeriesType('ppo', PPOIndicator);
        /* *
         *
         *  Default Export
         *
         * */
        /**
         * A `Percentage Price Oscillator` series. If the [type](#series.ppo.type)
         * option is not specified, it is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.ppo
         * @since     7.0.0
         * @product   highstock
         * @excluding allAreas, colorAxis, dataParser, dataURL, joinBy, keys,
         *            navigatorOptions, pointInterval, pointIntervalUnit,
         *            pointPlacement, pointRange, pointStart, showInNavigator, stacking
         * @requires  stock/indicators/indicators
         * @requires  stock/indicators/ema
         * @requires  stock/indicators/ppo
         * @apioption series.ppo
         */
        ''; // to include the above in the js output

        return PPOIndicator;
    });
    _registerModule(_modules, 'masters/indicators/ppo.src.js', [], function () {


    });
}));