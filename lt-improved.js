//panel item
var panelItem = null;
//mouse newComponent
var newComponent = null;
//selected component after it's first insertion
var selectedComponent = null;
//mouse wire
var newWire = null;

// last component id
var id = 0;

function unselect() {
    if(panelItem) {
        panelItem.find("svg").css("border-style", "none");
        panelItem = null;
    }
    if(newComponent) {
        newComponent.remove();
        newComponent = null;
    }
    if(selectedComponent){
        selectedComponent.find('.bigComponent').css('border-style', 'none');
        selectedComponent = null;
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

//carry the component
$("#canvas").mousemove(function(e){
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
function enableComponentDrag(element) {
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

// enable the selection behavior for a component
function enableComponentSelection(element) {
    element[0].addEventListener('click', function(){
        selectedComponent = $(this);
        selectedComponent.find('.bigComponent').css('border-style', 'dashed');

    }, true);
}

function drawWire(wire) {
    //console.log(wire.find('path').attr('d'));
    
    // add the origin point
    let element = $("div[data-id='" + wire.data('originId') + "']");
    //let newPath = "M" + element.css('left') + ' ' + element.css('top');
    let newPath = "M" + 0 + ' ' + element.css('top');
    
    //console.log(element.attr('data-type'));
    
    points.push([, element.css('top')]);
    
    // add any extra points
    
}

//drop the component
$("#canvas")[0].addEventListener('click', function(){
    if (panelItem && newComponent) {
        
        // fix the position 
        fixPosition(newComponent);
        
        // show the pole squares
        newComponent.find(".squareUp").show();
        newComponent.find(".squareDown").show();
        
        // configure the wire drawing on the poles
        newComponent.find(".squareUp").mousedown(function(){
            $(this).parent().draggable("disable");
            /*newWire = $(".model[data-type='wire']").clone().show();
            newWire.attr('class', 'wire');
            newWire.data('originId', $(this).parent().data('id'));
            newWire.data('originUp', true);
            drawWire(newWire);
            $("#canvas").append(newWire);*/
        }).mouseup(function(){
            $(this).parent().draggable("enable");
        });
        
        // allow the component to be dragged
        enableComponentDrag(newComponent);

        // allow the component to be selected
        enableComponentSelection(newComponent);
        
        newComponent = null;
        unselect();
    }
    if(selectedComponent){
        unselect();
    }
}, true);

//set ESC to unselect everything
$(document).keydown(function(e) {
    // escape key
    if (e.keyCode == 27) {
        unselect();
    }
});
