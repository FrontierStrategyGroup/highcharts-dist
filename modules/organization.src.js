/**
 * @license Highcharts JS v9.1.2 (2021-08-18)
 * Organization chart series type
 *
 * (c) 2019-2021 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
'use strict';
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/modules/organization', ['highcharts', 'highcharts/modules/sankey'], function (Highcharts) {
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
    _registerModule(_modules, 'Series/Organization/OrganizationPoint.js', [_modules['Core/Series/SeriesRegistry.js']], function (SeriesRegistry) {
        /* *
         *
         *  Organization chart module
         *
         *  (c) 2018-2021 Torstein Honsi
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
        var SankeyPoint = SeriesRegistry.seriesTypes.sankey.prototype.pointClass;
        /* *
         *
         *  Class
         *
         * */
        var OrganizationPoint = /** @class */ (function (_super) {
                __extends(OrganizationPoint, _super);
            function OrganizationPoint() {
                /* *
                 *
                 *  Properties
                 *
                 * */
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                _this.fromNode = void 0;
                _this.linksFrom = void 0;
                _this.linksTo = void 0;
                _this.options = void 0;
                _this.series = void 0;
                _this.toNode = void 0;
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
             * All nodes in an org chart are equal width.
             * @private
             */
            OrganizationPoint.prototype.getSum = function () {
                return 1;
            };
            return OrganizationPoint;
        }(SankeyPoint));
        /* *
         *
         *  Default Export
         *
         * */

        return OrganizationPoint;
    });
    _registerModule(_modules, 'Series/Organization/OrganizationSeries.js', [_modules['Series/Organization/OrganizationPoint.js'], _modules['Core/Color/Palette.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (OrganizationPoint, palette, SeriesRegistry, U) {
        /* *
         *
         *  Organization chart module
         *
         *  (c) 2018-2021 Torstein Honsi
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
        var SankeySeries = SeriesRegistry.seriesTypes.sankey;
        var css = U.css,
            extend = U.extend,
            merge = U.merge,
            pick = U.pick,
            wrap = U.wrap;
        /* *
         *
         *  Class
         *
         * */
        /**
         * @private
         * @class
         * @name Highcharts.seriesTypes.organization
         *
         * @augments Highcharts.seriesTypes.sankey
         */
        var OrganizationSeries = /** @class */ (function (_super) {
                __extends(OrganizationSeries, _super);
            function OrganizationSeries() {
                /* *
                 *
                 *  Static Properties
                 *
                 * */
                var _this = _super !== null && _super.apply(this,
                    arguments) || this;
                /* eslint-enable valid-jsdoc */
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
             *  Static Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            /**
             * General function to apply corner radius to a path - can be lifted to
             * renderer or utilities if we need it elsewhere.
             * @private
             */
            OrganizationSeries.curvedPath = function (path, r) {
                var d = [];
                for (var i = 0; i < path.length; i++) {
                    var x = path[i][1];
                    var y = path[i][2];
                    if (typeof x === 'number' && typeof y === 'number') {
                        // moveTo
                        if (i === 0) {
                            d.push(['M', x, y]);
                        }
                        else if (i === path.length - 1) {
                            d.push(['L', x, y]);
                            // curveTo
                        }
                        else if (r) {
                            var prevSeg = path[i - 1];
                            var nextSeg = path[i + 1];
                            if (prevSeg && nextSeg) {
                                var x1 = prevSeg[1],
                                    y1 = prevSeg[2],
                                    x2 = nextSeg[1],
                                    y2 = nextSeg[2];
                                // Only apply to breaks
                                if (typeof x1 === 'number' &&
                                    typeof x2 === 'number' &&
                                    typeof y1 === 'number' &&
                                    typeof y2 === 'number' &&
                                    x1 !== x2 &&
                                    y1 !== y2) {
                                    var directionX = x1 < x2 ? 1 : -1,
                                        directionY = y1 < y2 ? 1 : -1;
                                    d.push([
                                        'L',
                                        x - directionX * Math.min(Math.abs(x - x1), r),
                                        y - directionY * Math.min(Math.abs(y - y1), r)
                                    ], [
                                        'C',
                                        x,
                                        y,
                                        x,
                                        y,
                                        x + directionX * Math.min(Math.abs(x - x2), r),
                                        y + directionY * Math.min(Math.abs(y - y2), r)
                                    ]);
                                }
                            }
                            // lineTo
                        }
                        else {
                            d.push(['L', x, y]);
                        }
                    }
                }
                return d;
            };
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            OrganizationSeries.prototype.alignDataLabel = function (point, dataLabel, options) {
                // Align the data label to the point graphic
                if (options.useHTML) {
                    var width_1 = point.shapeArgs.width,
                        height_1 = point.shapeArgs.height,
                        padjust = (this.options.borderWidth +
                            2 * this.options.dataLabels.padding);
                    if (this.chart.inverted) {
                        width_1 = height_1;
                        height_1 = point.shapeArgs.width;
                    }
                    height_1 -= padjust;
                    width_1 -= padjust;
                    // Set the size of the surrounding div emulating `g`
                    var text = dataLabel.text;
                    if (text) {
                        css(text.element.parentNode, {
                            width: width_1 + 'px',
                            height: height_1 + 'px'
                        });
                        // Set properties for the span emulating `text`
                        css(text.element, {
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden'
                        });
                    }
                    // The getBBox function is used in `alignDataLabel` to align
                    // inside the box
                    dataLabel.getBBox = function () {
                        return {
                            width: width_1,
                            height: height_1
                        };
                    };
                    // Overwrite dataLabel dimensions (#13100).
                    dataLabel.width = width_1;
                    dataLabel.height = height_1;
                }
                _super.prototype.alignDataLabel.apply(this, arguments);
            };
            OrganizationSeries.prototype.createNode = function (id) {
                var node = _super.prototype.createNode.call(this,
                    id);
                // All nodes in an org chart are equal width
                node.getSum = function () {
                    return 1;
                };
                return node;
            };
            OrganizationSeries.prototype.createNodeColumn = function () {
                var column = _super.prototype.createNodeColumn.call(this);
                // Wrap the offset function so that the hanging node's children are
                // aligned to their parent
                wrap(column, 'offset', function (proceed, node, factor) {
                    var offset = proceed.call(this,
                        node,
                        factor); // eslint-disable-line no-invalid-this
                        // Modify the default output if the parent's layout is 'hanging'
                        if (node.hangsFrom) {
                            return {
                                absoluteTop: node.hangsFrom.nodeY
                            };
                    }
                    return offset;
                });
                return column;
            };
            OrganizationSeries.prototype.pointAttribs = function (point, state) {
                var series = this, attribs = SankeySeries.prototype.pointAttribs.call(series, point, state), level = point.isNode ? point.level : point.fromNode.level, levelOptions = series.mapOptionsToLevel[level || 0] || {}, options = point.options, stateOptions = (levelOptions.states && levelOptions.states[state]) || {}, values = ['borderRadius', 'linkColor', 'linkLineWidth']
                        .reduce(function (obj, key) {
                        obj[key] = pick(stateOptions[key], options[key], levelOptions[key], series.options[key]);
                    return obj;
                }, {});
                if (!point.isNode) {
                    attribs.stroke = values.linkColor;
                    attribs['stroke-width'] = values.linkLineWidth;
                    delete attribs.fill;
                }
                else {
                    if (values.borderRadius) {
                        attribs.r = values.borderRadius;
                    }
                }
                return attribs;
            };
            OrganizationSeries.prototype.translateLink = function (point) {
                var fromNode = point.fromNode,
                    toNode = point.toNode,
                    crisp = Math.round(this.options.linkLineWidth) % 2 / 2,
                    x1 = Math.floor(fromNode.shapeArgs.x +
                        fromNode.shapeArgs.width) + crisp,
                    y1 = Math.floor(fromNode.shapeArgs.y +
                        fromNode.shapeArgs.height / 2) + crisp,
                    x2 = Math.floor(toNode.shapeArgs.x) + crisp,
                    y2 = Math.floor(toNode.shapeArgs.y +
                        toNode.shapeArgs.height / 2) + crisp,
                    xMiddle,
                    hangingIndent = this.options.hangingIndent,
                    toOffset = toNode.options.offset,
                    percentOffset = /%$/.test(toOffset) && parseInt(toOffset, 10),
                    inverted = this.chart.inverted;
                if (inverted) {
                    x1 -= fromNode.shapeArgs.width;
                    x2 += toNode.shapeArgs.width;
                }
                xMiddle = Math.floor(x2 +
                    (inverted ? 1 : -1) *
                        (this.colDistance - this.nodeWidth) / 2) + crisp;
                // Put the link on the side of the node when an offset is given. HR
                // node in the main demo.
                if (percentOffset &&
                    (percentOffset >= 50 || percentOffset <= -50)) {
                    xMiddle = x2 = Math.floor(x2 + (inverted ? -0.5 : 0.5) *
                        toNode.shapeArgs.width) + crisp;
                    y2 = toNode.shapeArgs.y;
                    if (percentOffset > 0) {
                        y2 += toNode.shapeArgs.height;
                    }
                }
                if (toNode.hangsFrom === fromNode) {
                    if (this.chart.inverted) {
                        y1 = Math.floor(fromNode.shapeArgs.y +
                            fromNode.shapeArgs.height -
                            hangingIndent / 2) + crisp;
                        y2 = (toNode.shapeArgs.y +
                            toNode.shapeArgs.height);
                    }
                    else {
                        y1 = Math.floor(fromNode.shapeArgs.y +
                            hangingIndent / 2) + crisp;
                    }
                    xMiddle = x2 = Math.floor(toNode.shapeArgs.x +
                        toNode.shapeArgs.width / 2) + crisp;
                }
                point.plotY = 1;
                point.shapeType = 'path';
                point.shapeArgs = {
                    d: OrganizationSeries.curvedPath([
                        ['M', x1, y1],
                        ['L', xMiddle, y1],
                        ['L', xMiddle, y2],
                        ['L', x2, y2]
                    ], this.options.linkRadius)
                };
            };
            OrganizationSeries.prototype.translateNode = function (node, column) {
                SankeySeries.prototype.translateNode.call(this, node, column);
                if (node.hangsFrom) {
                    node.shapeArgs.height -=
                        this.options.hangingIndent;
                    if (!this.chart.inverted) {
                        node.shapeArgs.y += this.options.hangingIndent;
                    }
                }
                node.nodeHeight = this.chart.inverted ?
                    node.shapeArgs.width :
                    node.shapeArgs.height;
            };
            /**
             * An organization chart is a diagram that shows the structure of an
             * organization and the relationships and relative ranks of its parts and
             * positions.
             *
             * @sample       highcharts/demo/organization-chart/
             *               Organization chart
             * @sample       highcharts/series-organization/horizontal/
             *               Horizontal organization chart
             * @sample       highcharts/series-organization/borderless
             *               Borderless design
             * @sample       highcharts/series-organization/center-layout
             *               Centered layout
             *
             * @extends      plotOptions.sankey
             * @excluding    allowPointSelect, curveFactor, dataSorting
             * @since        7.1.0
             * @product      highcharts
             * @requires     modules/organization
             * @optionparent plotOptions.organization
             */
            OrganizationSeries.defaultOptions = merge(SankeySeries.defaultOptions, {
                /**
                 * The border color of the node cards.
                 *
                 * @type {Highcharts.ColorString}
                 * @private
                 */
                borderColor: palette.neutralColor60,
                /**
                 * The border radius of the node cards.
                 *
                 * @private
                 */
                borderRadius: 3,
                /**
                 * Radius for the rounded corners of the links between nodes.
                 *
                 * @sample   highcharts/series-organization/link-options
                 *           Square links
                 *
                 * @private
                 */
                linkRadius: 10,
                borderWidth: 1,
                /**
                 * @declare Highcharts.SeriesOrganizationDataLabelsOptionsObject
                 *
                 * @private
                 */
                dataLabels: {
                    /* eslint-disable valid-jsdoc */
                    /**
                     * A callback for defining the format for _nodes_ in the
                     * organization chart. The `nodeFormat` option takes precedence
                     * over `nodeFormatter`.
                     *
                     * In an organization chart, the `nodeFormatter` is a quite complex
                     * function of the available options, striving for a good default
                     * layout of cards with or without images. In organization chart,
                     * the data labels come with `useHTML` set to true, meaning they
                     * will be rendered as true HTML above the SVG.
                     *
                     * @sample highcharts/series-organization/datalabels-nodeformatter
                     *         Modify the default label format output
                     *
                     * @type  {Highcharts.SeriesSankeyDataLabelsFormatterCallbackFunction}
                     * @since 6.0.2
                     */
                    nodeFormatter: function () {
                        var outerStyle = {
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                'flex-direction': 'row',
                                'align-items': 'center',
                                'justify-content': 'center'
                            },
                            imageStyle = {
                                'max-height': '100%',
                                'border-radius': '50%'
                            },
                            innerStyle = {
                                width: '100%',
                                padding: 0,
                                'text-align': 'center',
                                'white-space': 'normal'
                            },
                            nameStyle = {
                                margin: 0
                            },
                            titleStyle = {
                                margin: 0
                            },
                            descriptionStyle = {
                                opacity: 0.75,
                                margin: '5px'
                            };
                        // eslint-disable-next-line valid-jsdoc
                        /**
                         * @private
                         */
                        function styleAttr(style) {
                            return Object.keys(style).reduce(function (str, key) {
                                return str + key + ':' + style[key] + ';';
                            }, 'style="') + '"';
                        }
                        if (this.point.image) {
                            imageStyle['max-width'] = '30%';
                            innerStyle.width = '70%';
                        }
                        // PhantomJS doesn't support flex, roll back to absolute
                        // positioning
                        if (this.series.chart.renderer.forExport) {
                            outerStyle.display = 'block';
                            innerStyle.position = 'absolute';
                            innerStyle.left = this.point.image ? '30%' : 0;
                            innerStyle.top = 0;
                        }
                        var html = '<div ' + styleAttr(outerStyle) + '>';
                        if (this.point.image) {
                            html += '<img src="' + this.point.image + '" ' +
                                styleAttr(imageStyle) + '>';
                        }
                        html += '<div ' + styleAttr(innerStyle) + '>';
                        if (this.point.name) {
                            html += '<h4 ' + styleAttr(nameStyle) + '>' +
                                this.point.name + '</h4>';
                        }
                        if (this.point.title) {
                            html += '<p ' + styleAttr(titleStyle) + '>' +
                                (this.point.title || '') + '</p>';
                        }
                        if (this.point.description) {
                            html += '<p ' + styleAttr(descriptionStyle) + '>' +
                                this.point.description + '</p>';
                        }
                        html += '</div>' +
                            '</div>';
                        return html;
                    },
                    /* eslint-enable valid-jsdoc */
                    style: {
                        /** @internal */
                        fontWeight: 'normal',
                        /** @internal */
                        fontSize: '13px'
                    },
                    useHTML: true
                },
                /**
                 * The indentation in pixels of hanging nodes, nodes which parent has
                 * [layout](#series.organization.nodes.layout) set to `hanging`.
                 *
                 * @private
                 */
                hangingIndent: 20,
                /**
                 * The color of the links between nodes.
                 *
                 * @type {Highcharts.ColorString}
                 * @private
                 */
                linkColor: palette.neutralColor60,
                /**
                 * The line width of the links connecting nodes, in pixels.
                 *
                 * @sample   highcharts/series-organization/link-options
                 *           Square links
                 *
                 * @private
                 */
                linkLineWidth: 1,
                /**
                 * In a horizontal chart, the width of the nodes in pixels. Node that
                 * most organization charts are vertical, so the name of this option
                 * is counterintuitive.
                 *
                 * @private
                 */
                nodeWidth: 50,
                tooltip: {
                    nodeFormat: '{point.name}<br>{point.title}<br>{point.description}'
                }
            });
            return OrganizationSeries;
        }(SankeySeries));
        extend(OrganizationSeries.prototype, {
            pointClass: OrganizationPoint
        });
        SeriesRegistry.registerSeriesType('organization', OrganizationSeries);
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
         * Layout value for the child nodes in an organization chart. If `hanging`, this
         * node's children will hang below their parent, allowing a tighter packing of
         * nodes in the diagram.
         *
         * @typedef {"normal"|"hanging"} Highcharts.SeriesOrganizationNodesLayoutValue
         */
        ''; // detach doclets above
        /* *
         *
         *  API Options
         *
         * */
        /**
         * An `organization` series. If the [type](#series.organization.type) option is
         * not specified, it is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.organization
         * @exclude   dataSorting, boostThreshold, boostBlending
         * @product   highcharts
         * @requires  modules/sankey
         * @requires  modules/organization
         * @apioption series.organization
         */
        /**
         * @type      {Highcharts.SeriesOrganizationDataLabelsOptionsObject|Array<Highcharts.SeriesOrganizationDataLabelsOptionsObject>}
         * @product   highcharts
         * @apioption series.organization.data.dataLabels
         */
        /**
         * A collection of options for the individual nodes. The nodes in an org chart
         * are auto-generated instances of `Highcharts.Point`, but options can be
         * applied here and linked by the `id`.
         *
         * @extends   series.sankey.nodes
         * @type      {Array<*>}
         * @product   highcharts
         * @apioption series.organization.nodes
         */
        /**
         * Individual data label for each node. The options are the same as
         * the ones for [series.organization.dataLabels](#series.organization.dataLabels).
         *
         * @type    {Highcharts.SeriesOrganizationDataLabelsOptionsObject|Array<Highcharts.SeriesOrganizationDataLabelsOptionsObject>}
         *
         * @apioption series.organization.nodes.dataLabels
         */
        /**
         * The job description for the node card, will be inserted by the default
         * `dataLabel.nodeFormatter`.
         *
         * @sample highcharts/demo/organization-chart
         *         Org chart with job descriptions
         *
         * @type      {string}
         * @product   highcharts
         * @apioption series.organization.nodes.description
         */
        /**
         * An image for the node card, will be inserted by the default
         * `dataLabel.nodeFormatter`.
         *
         * @sample highcharts/demo/organization-chart
         *         Org chart with images
         *
         * @type      {string}
         * @product   highcharts
         * @apioption series.organization.nodes.image
         */
        /**
         * Layout for the node's children. If `hanging`, this node's children will hang
         * below their parent, allowing a tighter packing of nodes in the diagram.
         *
         * @sample highcharts/demo/organization-chart
         *         Hanging layout
         *
         * @type      {Highcharts.SeriesOrganizationNodesLayoutValue}
         * @default   normal
         * @product   highcharts
         * @apioption series.organization.nodes.layout
         */
        /**
         * The job title for the node card, will be inserted by the default
         * `dataLabel.nodeFormatter`.
         *
         * @sample highcharts/demo/organization-chart
         *         Org chart with job titles
         *
         * @type      {string}
         * @product   highcharts
         * @apioption series.organization.nodes.title
         */
        /**
         * An array of data points for the series. For the `organization` series
         * type, points can be given in the following way:
         *
         * An array of objects with named values. The following snippet shows only a
         * few settings, see the complete options set below. If the total number of data
         * points exceeds the series' [turboThreshold](#series.area.turboThreshold),
         * this option is not available.
         *
         *  ```js
         *     data: [{
         *         from: 'Category1',
         *         to: 'Category2',
         *         weight: 2
         *     }, {
         *         from: 'Category1',
         *         to: 'Category3',
         *         weight: 5
         *     }]
         *  ```
         *
         * @type      {Array<*>}
         * @extends   series.sankey.data
         * @product   highcharts
         * @apioption series.organization.data
         */
        ''; // adds doclets above to transpiled file

        return OrganizationSeries;
    });
    _registerModule(_modules, 'masters/modules/organization.src.js', [], function () {


    });
}));