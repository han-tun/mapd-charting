/* ****************************************************************************
 * OVERRIDE: dc.heatMap                                                       *
 * ***************************************************************************/
dc.heatMap = function (parent, chartGroup) {

    var DEFAULT_BORDER_RADIUS = 6.75;

    var _chartBody;

    var _cols;
    var _rows;
    var _colOrdering = d3.ascending;
    var _rowOrdering = d3.ascending;
    var _colScale = d3.scale.ordinal();
    var _rowScale = d3.scale.ordinal();

    var _xBorderRadius = DEFAULT_BORDER_RADIUS;
    var _yBorderRadius = DEFAULT_BORDER_RADIUS;

/* OVERRIDE EXTEND ----------------------------------------------------------*/
    var _yLabel;
    var _xLabel;
    var _numFormat = d3.format(".2s");
/* --------------------------------------------------------------------------*/

    var _chart = dc.colorMixin(dc.marginMixin(dc.baseMixin({})));
    _chart._mandatoryAttributes(['group']);
    _chart.title(_chart.colorAccessor());

    var _colsLabel = function (d) {

        debugger;
/* OVERRIDE -----------------------------------------------------------------*/
        if(_xLabel.toLowerCase().indexOf('year')){
            return d;
        }
        return isNaN(d) ? d : (_numFormat(d).match(/[a-z]/i) ? _numFormat(d) : parseFloat(_numFormat(d)));
/* --------------------------------------------------------------------------*/

    };
    var _rowsLabel = function (d) {

/* OVERRIDE -----------------------------------------------------------------*/
        if(_yLabel.toLowerCase().indexOf('year')){
            return d;
        }
        return isNaN(d) ? d : (_numFormat(d).match(/[a-z]/i) ? _numFormat(d) : parseFloat(_numFormat(d)));
/* --------------------------------------------------------------------------*/

    };

    _chart.colsLabel = function (labelFunction) {
        if (!arguments.length) {
            return _colsLabel;
        }
        _colsLabel = labelFunction;
        return _chart;
    };

    _chart.rowsLabel = function (labelFunction) {
        if (!arguments.length) {
            return _rowsLabel;
        }
        _rowsLabel = labelFunction;
        return _chart;
    };


/* OVERRIDE EXTEND ----------------------------------------------------------*/
    _chart.setLabels = function (xLabel, yLabel) {
        _xLabel = xLabel;
        _yLabel = yLabel;
    }
/* --------------------------------------------------------------------------*/

/* OVERRIDE -----------------------------------------------------------------*/
    var _xAxisOnClick = function (d) {                                                     
        var dayOfWeek = INTERVAL_LABELS.DAY_OF_WEEK.indexOf(d);                        
        var month = INTERVAL_LABELS.MONTH.indexOf(d);                                  
        var hourOfDay = INTERVAL_LABELS.HOUR_OF_DAY.indexOf(d);                        

        if(dayOfWeek > -1) filterAxis(0, dayOfWeek);
        else if(month > -1) filterAxis(0, month);
        else if(hourOfDay > -1) filterAxis(0, hourOfDay);
        else filterAxis(0, d);
    };                                                                                 

    var _yAxisOnClick = function (d) {                                                 
        var dayOfWeek = INTERVAL_LABELS.DAY_OF_WEEK.indexOf(d);                        
        var month = INTERVAL_LABELS.MONTH.indexOf(d);                                  
        var hourOfDay = INTERVAL_LABELS.HOUR_OF_DAY.indexOf(d);                        

        if(dayOfWeek > -1) filterAxis(1, dayOfWeek);                                                
        else if(month > -1) filterAxis(1, month);                                                    
        else if(hourOfDay > -1) filterAxis(1, hourOfDay);                                                  
        else filterAxis(1, d);                                                          
    };    
/* --------------------------------------------------------------------------*/

    var _boxOnClick = function (d) {

/* OVERRIDE -----------------------------------------------------------------*/
        var filter = [d.key0, d.key1];
/* --------------------------------------------------------------------------*/

        dc.events.trigger(function () {
            _chart.filter(filter);
            _chart.redrawGroup();
        });
    };

    function filterAxis (axis, value) {
        var cellsOnAxis = _chart.selectAll('.box-group').filter(function (d) {

/* OVERRIDE -----------------------------------------------------------------*/
            var keyName = "key" + axis;
            return d[keyName] === value;
/* --------------------------------------------------------------------------*/

        });
        var unfilteredCellsOnAxis = cellsOnAxis.filter(function (d) {

/* OVERRIDE -----------------------------------------------------------------*/
            return !_chart.hasFilter([d.key0, d.key1]);
/* --------------------------------------------------------------------------*/

        });
        dc.events.trigger(function () {
            if (unfilteredCellsOnAxis.empty()) {
                cellsOnAxis.each(function (d) {

/* OVERRIDE -----------------------------------------------------------------*/
                    _chart.filter([d.key0, d.key1]);
/* --------------------------------------------------------------------------*/

                });
            } else {
                unfilteredCellsOnAxis.each(function (d) {

/* OVERRIDE -----------------------------------------------------------------*/
                    _chart.filter([d.key0, d.key1]);
/* --------------------------------------------------------------------------*/

                });
            }
            _chart.redrawGroup();
        });
    }

    dc.override(_chart, 'filter', function (filter) {
        if (!arguments.length) {
            return _chart._filter();
        }

        return _chart._filter(dc.filters.TwoDimensionalFilter(filter));
    });

/* OVERRIDE EXTEND ----------------------------------------------------------*/
    function uniq(d, i, a) {
        return !i || a[i - 1] !== d;
    }
/* --------------------------------------------------------------------------*/

    _chart.rows = function (rows) {
        if (!arguments.length) {
            return _rows;
        }
        _rows = rows;
        return _chart;
    };

    _chart.rowOrdering = function (_) {
        if (!arguments.length) {
            return _rowOrdering;
        }
        _rowOrdering = _;
        return _chart;
    };

    _chart.cols = function (cols) {
        if (!arguments.length) {
          return _cols;
        }
        _cols = cols;
        return _chart;
    };

    _chart.colOrdering = function (_) {
        if (!arguments.length) {
            return _colOrdering;
        }
        _colOrdering = _;
        return _chart;
    };

    _chart._doRender = function () {
        _chart.resetSvg();

/* OVERRIDE -----------------------------------------------------------------*/
        _chart.margins().bottom = _chart.margins().bottom;
/* --------------------------------------------------------------------------*/

        _chartBody = _chart.svg()
            .append('g')
            .attr('class', 'heatmap')
            .attr('transform', 'translate(' + _chart.margins().left + ',' + _chart.margins().top + ')');

/* OVERRIDE -----------------------------------------------------------------*/
        _chartBody.append('g')
            .attr('class', 'box-wrapper');
/* --------------------------------------------------------------------------*/

        return _chart._doRedraw();
    };

    _chart._doRedraw = function () {
        var data = _chart.data(),
            cols = _chart.cols(),
            rows = _chart.rows() || data.map(_chart.valueAccessor()),
            cols = _chart.cols() || data.map(_chart.keyAccessor());
        if (_rowOrdering) {
            rows = rows.sort(_rowOrdering);
        }
        if (_colOrdering) {
            cols = cols.sort(_colOrdering);
        }
        rows = _rowScale.domain(rows);
        cols = _colScale.domain(cols);

        var rowCount = rows.domain().length,
            colCount = cols.domain().length,
            boxWidth = Math.floor(_chart.effectiveWidth() / colCount),
            boxHeight = Math.floor(_chart.effectiveHeight() / rowCount);

        cols.rangeRoundBands([0, _chart.effectiveWidth()]);
        rows.rangeRoundBands([_chart.effectiveHeight(), 0]);

/* OVERRIDE -----------------------------------------------------------------*/
        var boxes = _chartBody.select('.box-wrapper')
          .selectAll('g.box-group')
          .data(_chart.data(), function (d, i) {
            return _chart.keyAccessor()(d, i) + '\0' + _chart.valueAccessor()(d, i);
           });
/* --------------------------------------------------------------------------*/

        var gEnter = boxes.enter().append('g')
            .attr('class', 'box-group');

        gEnter.append('rect')
            .attr('class', 'heat-box')
            .attr('fill', 'white')
            .on('click', _chart.boxOnClick());

/* OVERRIDE -----------------------------------------------------------------*/
        if (_chart.renderTitle()) {
            gEnter.append('title')
                .text(_chart.title());
        }
/* --------------------------------------------------------------------------*/

/* OVERRIDE -----------------------------------------------------------------*/
        dc.transition(boxes.select('rect'), _chart.transitionDuration())
/* --------------------------------------------------------------------------*/

            .attr('x', function (d, i) { return cols(_chart.keyAccessor()(d, i)); })
            .attr('y', function (d, i) { return rows(_chart.valueAccessor()(d, i)); })
            .attr('rx', _xBorderRadius)
            .attr('ry', _yBorderRadius)
            .attr('fill', _chart.getColor)
            .attr('width', boxWidth)
            .attr('height', boxHeight);

        boxes.exit().remove();

        var gCols = _chartBody.selectAll('g.cols');
        if (gCols.empty()) {
            gCols = _chartBody.append('g').attr('class', 'cols axis');
        }

/* OVERRIDE -----------------------------------------------------------------*/
        var maxDomainCharLength = function() {
            var maxChar = 0;
            cols.domain().forEach(function(d){
                maxChar = d.toString().length > maxChar ? d.toString().length : maxChar;
            });
            return maxChar;
        }
        var isRotateLabels = maxDomainCharLength() * 8 > boxWidth ? true : false;
/* --------------------------------------------------------------------------*/

        var gColsText = gCols.selectAll('text').data(cols.domain());
        gColsText.enter().append('text')
              .attr('x', function (d) { return cols(d) + boxWidth / 2; })
              .attr('y', _chart.effectiveHeight())
              .on('click', _chart.xAxisOnClick())
              .text(_chart.colsLabel())

/* OVERRIDE -----------------------------------------------------------------*/
              .style('text-anchor', function(d){
                    return isRotateLabels ? (isNaN(d) ?'start' : 'end'): 'middle';
              })
              .attr('dy', (isRotateLabels ? 3 : 12))
              .attr('dx', function(d){
                    return isRotateLabels ? (isNaN(d) ? 2: -4): 0;
              })
              .attr('transform', function(d){
                    return  isRotateLabels ? 'rotate(-90, '+ (cols(d) + boxWidth / 2) +', '+ _chart.effectiveHeight() +')' : null;
               });
/* OVERRIDE -----------------------------------------------------------------*/

        dc.transition(gColsText, _chart.transitionDuration())
               .text(_chart.colsLabel())
               .attr('x', function (d) { return cols(d) + boxWidth / 2; })

/* TODO ---------------------------------------------------------------------*/
// This did not exist when dc.mapd.js was written.
               .attr('y', _chart.effectiveHeight())
/* TODO ---------------------------------------------------------------------*/

/* OVERRIDE -----------------------------------------------------------------*/
               .style('text-anchor', function(d){
                    return isRotateLabels ? (isNaN(d) ?'start' : 'end'): 'middle';
               })
               .attr('dy', (isRotateLabels ? 3 : 12))
               .attr('dx', function(d){
                    return isRotateLabels ? (isNaN(d) ? 2: -4): 0;
               })
               .attr('transform', function(d){
                    return  isRotateLabels ? 'rotate(-90, '+ (cols(d) + boxWidth / 2) +', '+ _chart.effectiveHeight() +')' : null;
               });
/* --------------------------------------------------------------------------*/

        gColsText.exit().remove();
        var gRows = _chartBody.selectAll('g.rows');
        if (gRows.empty()) {
            gRows = _chartBody.append('g').attr('class', 'rows axis');
        }
        var gRowsText = gRows.selectAll('text').data(rows.domain());
        gRowsText.enter().append('text')
              .attr('dy', 6)
              .style('text-anchor', 'end')
              .attr('x', 0)
              .attr('dx', -2)
              .on('click', _chart.yAxisOnClick())
              .text(_chart.rowsLabel());
        dc.transition(gRowsText, _chart.transitionDuration())
              .text(_chart.rowsLabel())
              .attr('y', function (d) { return rows(d) + boxHeight / 2; });
        gRowsText.exit().remove();

        if (_chart.hasFilter()) {
            _chart.selectAll('g.box-group').each(function (d) {
                if (_chart.isSelectedNode(d)) {
                    _chart.highlightSelected(this);
                } else {
                    _chart.fadeDeselected(this);
                }
            });
        } else {
            _chart.selectAll('g.box-group').each(function () {
                _chart.resetHighlight(this);
            });
        }

/* OVERRIDE -----------------------------------------------------------------*/
        _chart.renderAxisLabels();
/* --------------------------------------------------------------------------*/

        return _chart;
    };

    _chart.boxOnClick = function (handler) {
        if (!arguments.length) {
            return _boxOnClick;
        }
        _boxOnClick = handler;
        return _chart;
    };

    _chart.xAxisOnClick = function (handler) {
        if (!arguments.length) {
            return _xAxisOnClick;
        }
        _xAxisOnClick = handler;
        return _chart;
    };

    _chart.yAxisOnClick = function (handler) {
        if (!arguments.length) {
            return _yAxisOnClick;
        }
        _yAxisOnClick = handler;
        return _chart;
    };

    _chart.xBorderRadius = function (xBorderRadius) {
        if (!arguments.length) {
            return _xBorderRadius;
        }
        _xBorderRadius = xBorderRadius;
        return _chart;
    };

/* OVERRIDE -----------------------------------------------------------------*/
    _chart.renderAxisLabels = function () {

        var yLabel = _chartBody.selectAll('text.y-axis-label');

        if (yLabel.empty()) {
            yLabel = _chartBody.append('text')
            .attr('class', 'y-axis-label')
            .text(_yLabel);
        }

        yLabel
            .attr('x', -(_chart.effectiveHeight()/2))
            .attr('y', -(_chart.margins().left - 12))
            .style('transform', 'rotate(-90deg)')
            .style('text-anchor', 'middle');

        var xLabel = _chartBody.selectAll('text.x-axis-label');

        if (xLabel.empty()) {
            xLabel = _chartBody.append('text')
            .attr('class', 'x-axis-label')
            .text(_xLabel);
        }

        xLabel
            .attr('x', (_chart.effectiveWidth()/2))
            .attr('y', (_chart.effectiveHeight() + _chart.margins().bottom - 6))
            .style('text-anchor', 'middle');
    };

/* --------------------------------------------------------------------------*/

    _chart.yBorderRadius = function (yBorderRadius) {
        if (!arguments.length) {
            return _yBorderRadius;
        }
        _yBorderRadius = yBorderRadius;
        return _chart;
    };

    _chart.isSelectedNode = function (d) {

/* OVERRIDE -----------------------------------------------------------------*/
        return _chart.hasFilter([d.key0, d.key1]);
/* --------------------------------------------------------------------------*/

    };

    return _chart.anchor(parent, chartGroup);
};
/* ****************************************************************************
 * END OVERRIDE: dc.heatMap                                                   *
 * ***************************************************************************/

