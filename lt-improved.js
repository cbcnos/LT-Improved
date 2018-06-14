//panel item
var panelItem = null;
//mouse newComponent
var newComponent = null;
//mouse wire
var newWire = null;

// last component id
var id = 0;

function unselect() {
    if (panelItem) {
        panelItem.find("svg").css("border-style", "none");
        panelItem = null;
    }
    if (newComponent) {
        newComponent.remove();
        newComponent = null;
    }
    if (newWire) {
        newWire.remove();
        newWire = null;
    }
}

function getCanvasCorners() {
    let offset = $("#canvas").offset();
    return {
        top: offset.top,
        left: offset.left,
        bottom: offset.top + $("#canvas").height(),
        right: offset.left+ $("#canvas").width()
    }
}

let corners = getCanvasCorners();

//listen to canvas resize events
$(window).resize(function(){
    corners = getCanvasCorners();
    $("div[data-id]").each(function(){
        $(this).draggable('option', 'containment', getDragContainment($(this)));
    });
});
 

//pick the component
$(document).on("click", ".component", function(){
    // unselect any previous elements
    unselect();
    
    // select this element
    panelItem = $(this);
    panelItem.find("svg").css("border-style", "dashed");
    
    // create the new component
    newComponent = $(".model[data-type='" + panelItem.attr("data-type") + "']").clone().show();
    newComponent.attr('data-id', id++);
    newComponent.removeAttr("class");
    newComponent.css("position", "absolute");
    newComponent.css('top', corners.top + (corners.bottom-corners.top)/2-50 + 'px');
    newComponent.css('left', (corners.left-parseInt(newComponent.css('margin-left'))) + 'px');
    $("#canvas").append(newComponent);
});

$("#canvas").mousemove(function(e){
    //carry the component
    if (panelItem) {
        let X = e.pageX;
        let Y = e.pageY;
        if (    X >= corners.left && 
                Y >= corners.top && 
                X <= corners.right && 
                Y <= corners.bottom) {
            //console.log(e.pageX + ' ' + e.pageY,);
            newComponent.css('top', Math.min(Y, corners.bottom-newComponent.height()) + 'px');
            newComponent.css('left', Math.min(X-parseInt(newComponent.css('margin-left')), corners.right-newComponent.find('.bigComponent').width()-parseInt(newComponent.css('margin-left'))) + 'px');
        }
    }
    // move the wire edge
    else if (newWire) {
        if (newWire.data('points') === undefined) {
            newWire.data('points', [{X: e.pageX, Y: e.pageY}]);
        } else {
            let points = newWire.data('points');
            points[points.length-1].X = e.pageX;
            points[points.length-1].Y = e.pageY;
        }
        drawWire(newWire);
    }
});

// adjusts an component position to fit the grid
function fixPosition (fixing) {
    fixing.css('top', Math.round((parseInt(fixing.css('top')) - corners.top) / 15.0) * 15 + corners.top);
    fixing.css('left', Math.round((parseInt(fixing.css('left')) - corners.left) / 15.0) * 15 + corners.left);
}

// return the containment to drag an element
function getDragContainment(element) {
    return [corners.left-parseInt(element.css('margin-left')), 
            corners.top, 
            corners.right-element.find('.bigComponent').width()-parseInt(element.css('margin-left')), 
            corners.bottom-element.height()];
}

// enable the dragginb behavior for a component
function enableComponentDrag (element) {
    element.draggable({
        // containment: An array defining a bounding box in the form [ x1, y1, x2, y2 ]
        containment: getDragContainment(element),
        scroll: false,
        start: function() {
            $(this).find('.bigComponent').css('border-style', 'dashed');
            $(this).find('.squareDown').hide();
        },
        stop: function() {
            $(this).find('.bigComponent').css('border-style', 'none');
            $(this).find('.squareDown').show();
            fixPosition($(this));
        }
    });
}

// draw the received wire
function drawWire(wire) {
    
    // check if the wire has more than one point
    if (wire.data('points')===undefined && wire.data('destinyId')===undefined) {
        wire.attr('height', 0);
        wire.attr('width', 0);
        return;
    }
    
    // get the origin point
    let element = $("div[data-id='" + wire.data('originId') + "']");
    let origin = {X: parseInt(element.css('left')), Y: parseInt(element.css('top'))};
    if (!wire.data('originUp'))
        origin.Y += 91;
    
    // load the wire points
    let points = wire.data('points');
    
    // check if there is a destiny and update the last point
    if (wire.data('destinyId') !== undefined) {
        let element2 = $("div[data-id='" + wire.data('destinyId') + "']");
        points[points.length-1].X = parseInt(element2.css('left'));
        points[points.length-1].Y = parseInt(element2.css('top'));
        if (!wire.data('destinyUp'))
            points[points.length-1].Y += 91;
    }
    
    // find the lowest X and Y to set the div position
    let min = {X: origin.X, Y: origin.Y};
    let max = {X: origin.X, Y: origin.Y};
    points.forEach(function(point){
        // console.log(point);
        if (min.X > point.X)
            min.X = point.X;
        if (min.Y > point.Y)
            min.Y = point.Y;
        if (max.X < point.X)
            max.X = point.X;
        if (max.Y < point.Y)
            max.Y = point.Y;
    });
    // console.log('--------------');
    
    // set the div position
    wire.css('left', min.X);
    wire.css('top', min.Y);
    
    // set the div size
    wire.attr('height', max.Y - min.Y);
    wire.attr('width', max.X - min.X);  
    
    // create the svg path
    let vertical = true;
    let newPath = 'M' + (origin.X-min.X) + ' ' + (origin.Y-min.Y);
    points.forEach(function(point, index){
        let prev = (index == 0 ? origin : points[index-1]);
        newPath += ' L' + (prev.X-min.X) + ' ' + (point.Y-min.Y);
        newPath += ' L' + (point.X-min.X) + ' ' + (point.Y-min.Y);
    });
    
    //console.log(newPath);
    
    wire.find('path').attr('d', newPath);
    
    // add any extra points
    
}

$("#canvas").click(function(){
    //drop the component
    if (panelItem && newComponent) {
        
        // fix the position 
        fixPosition(newComponent);
        
        // show the pole squares
        newComponent.find(".squareUp").show();
        newComponent.find(".squareDown").show();
        
        // configure the wire drawing on the poles
        newComponent.find(".squareUp").mousedown(function(){
            if (!newWire) {
                newWire = $(".model[data-type='wire']").clone().show();
                newWire.attr('class', 'wire');
                newWire.data('originId', $(this).parent().data('id'));
                newWire.data('originUp', true);
                drawWire(newWire);
                $("#canvas").append(newWire);
            } else if (newWire.data('originId') != $(this).parent().data('id')) {
                newWire.data('destinyId', $(this).parent().data('id'));
                newWire.data('destinyUp', true);
                newWire.find('path').removeAttr('stroke-dasharray');
                drawWire(newWire);
                newWire = null;
            }
        }).mouseenter(function(){
            $(this).parent().draggable("disable");
        }).mouseleave(function(){
            $(this).parent().draggable("enable");
        });
        newComponent.find(".squareDown").mousedown(function(){
            if (!newWire) {
                newWire = $(".model[data-type='wire']").clone().show();
                newWire.attr('class', 'wire');
                newWire.data('originId', $(this).parent().data('id'));
                newWire.data('originUp', false);
                drawWire(newWire);
                $("#canvas").append(newWire);
            } else if (newWire.data('originId') != $(this).parent().data('id')) {
                newWire.data('destinyId', $(this).parent().data('id'));
                newWire.data('destinyUp', false);
                newWire.find('path').removeAttr('stroke-dasharray');
                drawWire(newWire);
                newWire = null;
            }
        }).mouseenter(function(){
            $(this).parent().draggable("disable");
        }).mouseleave(function(){
            $(this).parent().draggable("enable");
        });
        
        // allow the component to be dragged
        enableComponentDrag(newComponent);
        
        newComponent = null;
        unselect();
    }
    // add a point to the wire
    else if (newWire && newWire.data('points') !== undefined) {
        let points = newWire.data('points');
        points[points.length-1].X = Math.round((points[points.length-1].X - corners.left) / 15.0) * 15 + corners.left;
        points[points.length-1].Y = Math.round((points[points.length-1].Y - corners.top) / 15.0) * 15 + corners.top;
        points.push({X: 100, Y: 100});
        console.log('ueba');
    }
});

//set ESC to unselect everything
$(document).keydown(function(e) {
    // escape key
    if (e.keyCode == 27) {
        unselect();
    }
});
