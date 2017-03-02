angular
    .module('wm.modal', [])
    .directive('wmModal',  function () {

    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        template: 
            '<div class="wm-modal closing">' +
                '<div class="modal-container" ng-class="containerClass" ng-style="{height: modalHeight, width: modalWidth, \'z-index\' : zIndex}" ng-click="$event.stopPropagation()" ng-transclude>' +
                '</div>' +
            '</div>',
        scope: {
            modalHeight: '@',
            modalWidth: '@',
            containerClass: '@',
            zIndex: '@'
        }
    };
})

.service('$wmModal', ['$compile', '$document', '$rootScope', '$timeout', '$controller', '$q', '$window', function ($compile, $document, $rootScope, $timeout, $controller, $q, $window) {

    var modals = [];

    var Modal = function (options) {

        var el, that, close, scope, promises, extend;

        options = angular.isObject(options) ? options : {};

        that = this;

        that.closed = false;

        el = angular.element('<wm-modal></wm-modal>');        

        promises = {
            result: $q.defer()
        };

        that.result = promises.result.promise;

        extend = angular.extend;

        // default actions in close event 

        close = function() {

            if (that.closed) return;

            el.addClass('closing');

            $timeout(function() {
                el.remove();
            }, 200);

            scope.$destroy();

            that.closed = true;
        };


        that.open = function () {

            // Creates a new scope

            scope = extend($rootScope.$new(), options.scope);

            if (options.controller) {

                var locals, controller;

                // Make aditional injections for controller

                locals = extend({$scope: scope, $wmModalInstance: that}, options.locals);

                controller = $controller(options.controller, locals);

                // import values for controller if "as" is present in controller name.

                angular.isString(options.controller) && options.controller.indexOf(' as ') >= 0 && extend(controller, options.scope);
                
            }

            el.attr({
                'container-class' : options.containerClass,
                'modal-height'    : options.height,
                'modal-width'     : options.width,
                'z-index'         : that.zIndex,
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

            $timeout(function () {
                el.removeClass('closing');
            });

            return that;
        };

        that.close = function() {
            close.call(that);
            promises.result.resolve();
            return that;
        };

        that.cancel = function() {
            close.call(that);
            promises.result.reject();
            return that;
        };

    };

    angular.element($window).bind('keyup', function (event) {

        if (event.which === 27) {

            var modal = modals[modals.length - 1];

            modal && modal.cancel();
        }

    });


    return {

        open: function (options) {

            var that = this;

            var modal = new Modal(options);

            modal.zIndex = this.zIndex++;

            modal.open();

            modals.push(modal);

            modal.result['finally'](function () {
                modals.pop();
                --this.zIndex;
            })

            return modal;
        },

        zIndex: 1000
    }

}]);
