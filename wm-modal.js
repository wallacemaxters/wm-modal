angular
    .module('wm.modal', [])
    .directive('wmModal',  function () {

    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        template: 
            '<div class="wm-modal">' +
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

        var el, that, close, scope, promises;

        options = angular.isObject(options) ? options : {};

        that = this;

        that.closed = false;

        that.options = angular.isObject(options) ? options : {};

        el = angular.element('<wm-modal></wm-modal>');        

        promises = {
            result: $q.defer()
        };

        that.result = promises.result.promise;

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

            scope = angular.extend($rootScope.$new(), options.scope);

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
                'z-index' : that.zIndex,
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
