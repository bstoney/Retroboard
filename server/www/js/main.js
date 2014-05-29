var retroboardApp = angular.module('retroboardApp', ['ngCookies']);

retroboardApp.directive('rbNote', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            if (!scope.updateUi) {
                scope.updateUi = function () {
                    element.animate(scope.note.location);
                }
            }
            if (!scope.note.location) {
                scope.setLocation(makeNewPosition(element));
            }
            else {
                element.animate(scope.note.location);
            }

            element.draggable({ containment: "window" })
                .on("dragstart",function (event, ui) {
                    scope.bringToFront();
                }).on("dragstop", function (event, ui) {
                    scope.setLocation(ui.helper.position());
                });
        }
    }
});

retroboardApp.directive('rbGroup', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.category.bounds = {
                left: element.offset().left,
                top: element.offset().top,
                width: element.outerWidth(),
                height: element.outerHeight()
            }
        }
    }
});

retroboardApp.directive('rbButton', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var options = {};
            if (attrs.buttonIcon) {
                options.icons = {primary: attrs.buttonIcon};
                options.text = false;
            }
            element.button(options).disableSelection();
        }
    }
});

retroboardApp.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.on("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

$(function () {
    $('body').disableSelection();
});

function makeNewPosition(newFeedbackNote) {
    // Get viewport dimensions (remove the dimension of the div)
    var h = $("#feedbackSection").height() - newFeedbackNote.height();
    var w = $("#feedbackSection").width() - newFeedbackNote.width();

    var nh = Math.floor(Math.random() * h);
    var nw = Math.floor(Math.random() * w);

    return {top: nh, left: nw};
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}
