angular
    .module('wm.modal', [])
    .directive('wmModal',  function () {

    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        template: 
            '<div class="wm-modal">' +
                '<div class="modal-container" ng-class="containerClass" ng-style="{height: modalHeight, width: modalWidth}" ng-click="$event.stopPropagation()" ng-transclude>' +
                '</div>' +
            '</div>',
        scope: {
            modalHeight: '@',
            modalWidth: '@',
            containerClass: '@'
        }
    };
})

.service('$wmModal', ['$compile', '$document', '$rootScope', '$timeout', '$controller', '$q', function ($compile, $document, $rootScope, $timeout, $controller, $q) {

    var el, scope, closed, close, promises, that;

    that = this;

    promises = {};

    that.open = function(options) {

        options = angular.isObject(options) ? options : {};

        closed = false;

        promises.result = $q.defer();

        that.result = promises.result.promise;

        scope = $rootScope.$new();

        el = angular.element('<wm-modal></wm-modal>');

        angular.extend(scope, options.scope);

        $controller(
            options.controller, 
            angular.extend({
                $scope: scope,
                $wmModalInstance: that,
            }, options.locals)
        );

        el.attr({
            'modal-height': options.height,
            'modal-width': options.width,
            'container-class' : options.containerClass,
        });

        if (options.templateUrl) {

            var children = angular.element('<div></div>').attr({
                'ng-include': "'" + options.templateUrl + "'"
            });

            el.append(children);

        } else if (options.template) {

            el.append(options.template);
        }

        el = $compile(el)(scope);

        options.clickout && el.on('click', function() {
            that.cancel();
        });

        $document.find('body').append(el);

        return that;
    };

    close = function() {

        if (closed) return;

        el.addClass('closing');

        $timeout(function() {
            el.remove();
        }, 200);

        scope.$destroy();
        closed = true;
    };

    that.close = function() {
        close.call(that);
        promises.result.resolve();
        return that;
    }

    that.cancel = function() {

        close.call(that);
        promises.result.reject();
        return that;
    };

}]);
