/* *
 *
 *  (c) 2010-2021 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* *
 *
 *  Imports
 *
 * */
import SeriesRegistry from '../../Core/Series/SeriesRegistry.js';
var CandlestickSeries = SeriesRegistry.seriesTypes.candlestick;
/* *
 *
 *  Class
 *
 * */
var HollowCandlestickPoint = /** @class */ (function (_super) {
    __extends(HollowCandlestickPoint, _super);
    function HollowCandlestickPoint() {
        /* *
         *
         *  Properties
         *
         * */
        var _this = _super !== null && _super.apply(this, arguments) || this;
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
     * Update class name if needed.
     *
     * @function Highcharts.seriesTypes.hollowcandlestick#getClassName
     *
     * @return {string}
     *
     */
    HollowCandlestickPoint.prototype.getClassName = function () {
        var className = _super.prototype.getClassName.apply(this);
        var point = this, index = point.index, isBullish = point.series.hollowCandlestickData[index];
        if (isBullish === 'up') {
            className += '-bearish-up';
        }
        return className;
    };
    return HollowCandlestickPoint;
}(CandlestickSeries.prototype.pointClass));
/* *
 *
 *  Class Namespace
 *
 * */
/* *
 *
 *  Default Export
 *
 * */
export default HollowCandlestickPoint;
