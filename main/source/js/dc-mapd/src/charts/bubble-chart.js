/******************************************************************************
 * OVERRIDE: dc.bubbleChart                                                   *
 * ***************************************************************************/
dc.bubbleChart = function (parent, chartGroup) {

/* OVERRIDE -----------------------------------------------------------------*/
    var _chart = dc.bubbleMixin(dc.capMixin(dc.coordinateGridMixin({})));
    var _popupHeader = [];
/* --------------------------------------------------------------------------*/
    
    var _elasticRadius = false;

    _chart.transitionDuration(750);

    var bubbleLocator = function (d) {
        return 'translate(' + (bubbleX(d)) + ',' + (bubbleY(d)) + ')';
    };

/* OVERRIDE -----------------------------------------------------------------*/
    _chart.setPopupHeader = function (_) {
        if (!arguments.length) {
            return _popupHeader;
        }
        _popupHeader = _;
        return _chart;
    };

    _chart.hideOverlappedLabels = function (){
        var labels = _chart.svg().selectAll('.node');

        var labelHeight = 10;
        var letterWidth = 5;

        labels
            .classed('hide-label', false)
            .each(function(d, i){

                var a = this;
                var aX = bubbleX(d);
                var aY = bubbleY(d);
                var aR = _chart.bubbleR(d);
                var aKey = d.key0;

                var overlapList = d.overlapList = [];

                labels.each(function(d, j){

                    var b = this;

                    var bX = bubbleX(d);
                    var bY = bubbleY(d);
                    var bR = _chart.bubbleR(d);
                    var bKey = d.key0;

                    if (a === b || Math.abs(aY - bY) > labelHeight ) { return;}
                    
                    var aXmin = aX - (aKey+'').length * letterWidth/2;
                    var aXmax = aX + (aKey+'').length * letterWidth/2;


                    var bXmin = bX - (bKey+'').length * letterWidth/2;
                    var bXmax = bX + (bKey+'').length * letterWidth/2;

                    var isOverlapped = aXmin >= bXmin && aXmin <= bXmax || aXmax >= bXmin && aXmax <= bXmax || aXmin <= bXmin && aXmax >= bXmax;

                    if (isOverlapped && i > j) {
                        overlapList.push(b);
                    }
                });
            });
        
        labels[0].reverse();
        
        labels.each(function(d) {
            if (d.overlapList.length === 0 || d3.select(this).classed('hide-label')) {
                return;
            } 
            for (var i = 0; i < d.overlapList.length ; i++) {
                d3.select(d.overlapList[i]).classed('hide-label', true);
            }
        });
        
    }

    _chart.showPopup = function(d, i) {
        var popup = _chart.popup();
        var formatNum = d3.format(".2s");

        var popupBox = popup.select('.chart-popup-box').html('')
            .classed('table-list', true);

        var popupTableWrap = popupBox.append('div')
            .attr('class', 'popup-table-wrap');

        var popupTable = popupTableWrap.append('table')
            .attr('class', 'popup-table');

        popupTable.append('tr')
            .html(function(){
                var str = '';
                for (var i = 0; i< _popupHeader.length; i++) {
                    str += '<th><div class="ellipse-text">'+_popupHeader[i]+'</div></th>';
                }
                return str;
            })
        
        popupTable.append('tr')
            .html('<td><div class="table-dim"><div class="table-legend" style="background:'+_chart.getColor(d)+'"></div><div class="table-dim-val">'+d.key0+'</div></div></td><td>'+formatNum(d.x)+'</td><td>'+formatNum(d.y)+'</td><td>'+formatNum(d.size)+'</td>');


        popup.classed('js-showPopup', true);

        positionPopup(d, this);
    }

    _chart.hidePopup = function() {
        _chart.popup().classed('js-showPopup', false);
    }

    function positionPopup(d, e) {

        var x = bubbleX(d) + _chart.margins().left;
        var y = bubbleY(d) + _chart.margins().top;


        var popup =_chart.popup()
            .attr('style', function(){
                var popupWidth = d3.select(this).select('.chart-popup-box').node().getBoundingClientRect().width/2;
                var offsetX = x - popupWidth < 0 ? popupWidth - x - 16 : (x + popupWidth > _chart.width() ? _chart.width() - (x + popupWidth) + 16 : 0);
                return 'transform:translate('+(x + offsetX) +'px,'+y+'px)';
            });

        popup.select('.chart-popup-box')
            .classed('align-center', true);

    }

/* --------------------------------------------------------------------------*/

    _chart.elasticRadius = function (elasticRadius) {
        if (!arguments.length) {
            return _elasticRadius;
        }
        _elasticRadius = elasticRadius;
        return _chart;
    };

    _chart.plotData = function () {
        if (_elasticRadius) {
            _chart.r().domain([_chart.rMin(), _chart.rMax()]);
        }
        _chart.r().range([_chart.MIN_RADIUS, _chart.xAxisLength() * _chart.maxBubbleRelativeSize()]);

        var bubbleG = _chart.chartBodyG().selectAll('g.' + _chart.BUBBLE_NODE_CLASS)

/* OVERRIDE -----------------------------------------------------------------*/
            .data(_chart.data(), function (d) { return d.key0; });
/* --------------------------------------------------------------------------*/

        renderNodes(bubbleG);

        updateNodes(bubbleG);

        removeNodes(bubbleG);

        _chart.fadeDeselectedArea();

    };

    function renderNodes (bubbleG) {
        var bubbleGEnter = bubbleG.enter().append('g');

        bubbleGEnter
            .attr('class', _chart.BUBBLE_NODE_CLASS)
            .attr('transform', bubbleLocator)
/* OVERRIDE -----------------------------------------------------------------*/
            .on('mouseenter', _chart.showPopup)
            .on('mouseleave', _chart.hidePopup)
/* --------------------------------------------------------------------------*/
            .append('circle').attr('class', function (d, i) {
                return _chart.BUBBLE_CLASS + ' _' + i;
            })
            .on('click', _chart.onClick)
            .attr('fill', _chart.getColor)
            .attr('r', 0);


        dc.transition(bubbleG, _chart.transitionDuration())
            .selectAll('circle.' + _chart.BUBBLE_CLASS)
            .attr('r', function (d) {
                return _chart.bubbleR(d);
            })
            .attr('opacity', function (d) {
                return (_chart.bubbleR(d) > 0) ? 1 : 0;
            });

        _chart._doRenderLabel(bubbleGEnter);

        //_chart._doRenderTitles(bubbleGEnter);
    }

    function updateNodes (bubbleG) {
        dc.transition(bubbleG, _chart.transitionDuration())
            .attr('transform', bubbleLocator)

/* OVERRIDE -----------------------------------------------------------------*/
            .select('circle.' + _chart.BUBBLE_CLASS)
/* --------------------------------------------------------------------------*/

            .attr('fill', _chart.getColor)
            .attr('r', function (d) {
                return _chart.bubbleR(d);
            })
            .attr('opacity', function (d) {
                return (_chart.bubbleR(d) > 0) ? 1 : 0;
            });

        _chart.doUpdateLabels(bubbleG);
        _chart.doUpdateTitles(bubbleG);

        
    }

    function removeNodes (bubbleG) {
        bubbleG.exit().remove();
    }

    function bubbleX (d) {
        var x = _chart.x()(_chart.keyAccessor()(d));
        if (isNaN(x)) {
            x = 0;
        }
        return x;
    }

    function bubbleY (d) {
        var y = _chart.y()(_chart.valueAccessor()(d));
        if (isNaN(y)) {
            y = 0;
        }
        return y;
    }

    _chart.renderBrush = function () {
        // override default x axis brush from parent chart
    };

    _chart.redrawBrush = function () {
        // override default x axis brush from parent chart
        _chart.fadeDeselectedArea();
    };

    return _chart.anchor(parent, chartGroup);
};
/******************************************************************************
 * END OVERRIDE: dc.bubbleChart                                               *
 * ***************************************************************************/
