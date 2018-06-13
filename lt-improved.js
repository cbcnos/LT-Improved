//panel item
var selected = null;
//mouse component
var component = null;

// last component id
var id = 0;

function unselect() {
    if (selected) {
        selected.find("svg").css("border-style", "none");
        selected = null;
    }
    if (component) {
        component.remove();
        component = null;
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

//pick the component
$(document).on("click", ".component", function(){
    // unselect any previous elements
    unselect();
    
    // select this element
    selected = $(this);
    selected.find("svg").css("border-style", "dashed");
    
    // create the new component
    component = $(".model[data-type='" + selected.attr("data-type") + "']").clone().show();
    component.attr('data-id', id++);
    component.removeAttr("class");
    component.css("position", "absolute");
    component.css('top', corners.top + (corners.bottom-corners.top)/2-50 + 'px');
    component.css('left', (corners.left-parseInt(component.css('margin-left'))) + 'px');
    $("#canvas").append(component);
});

//carry the component
$("#canvas").mousemove(function(e){
    if (selected) {
        let X = e.pageX;
        let Y = e.pageY;
        if (    X >= corners.left && 
                Y >= corners.top && 
                X <= corners.right && 
                Y <= corners.bottom) {
            //console.log(e.pageX + ' ' + e.pageY,);
            component.css('top', Math.min(Y, corners.bottom-component.height()) + 'px');
            component.css('left', Math.min(X-parseInt(component.css('margin-left')), corners.right-component.width()+parseInt(component.css('margin-left'))) + 'px');
            //console.log("left: " + component.css('left') + "  offset: " + component.offset().left);
        }
    }
});

// adjusts an component position to fit the grid
function fixPosition (fixing) {
    fixing.css('top', Math.round((parseInt(fixing.css('top')) - corners.top) / 15.0) * 15 + corners.top);
    fixing.css('left', Math.round((parseInt(fixing.css('left')) - corners.left) / 15.0) * 15 + corners.left);
}

// enable the dragginb behavior for a component
function enableComponentDrag (element) {
    element.draggable({
        // containment: An array defining a bounding box in the form [ x1, y1, x2, y2 ]
        containment: [corners.left-parseInt(element.css('margin-left')), 
                        corners.top, 
                        corners.right-element.width()+parseInt(element.css('margin-left')), 
                        corners.bottom-element.height()],
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

//drop the component
$("#canvas").click(function(){
    if (selected && component) {
        
        // fix the position 
        fixPosition(component);
        
        // show the pole squares
        component.find(".squareUp").show();
        component.find(".squareDown").show();
        
        // configure the wire drawing on the poles
        component.find(".squareUp").mousedown(function(){
            $(this).parent().draggable("disable");
        }).mouseup(function(){
            $(this).parent().draggable("enable");
        });
        
        // allow the component to be dragged
        enableComponentDrag(component);
        
        component = null;
        unselect();
    }
});

//set ESC to unselect everything
$(document).keydown(function(e) {
    // escape key
    if (e.keyCode == 27) {
        unselect();
    }
});
