'use strict';

angular
    .module('wm.modal', [])
    .directive('wmModal',  function () {

    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        template: 
            '<div class="wm-modal closing">' +
                '<div role="dialog" class="modal-container" ng-class="containerClass" ng-style="{height: modalHeight, width: modalWidth, \'z-index\' : zIndex}" ng-click="$event.stopPropagation()" ng-transclude>' +
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

        var el, that, close, scope, deffered;

        options = angular.isObject(options) ? options : {};

        that = this;

        that.closed = false;

        el = angular.element('<wm-modal></wm-modal>');        

        deffered = $q.defer();

        that.result = deffered.promise;

        that.scope = $rootScope.$new();

        // default actions in close event 

        that.$$close = function() {

            if (that.closed) return;

            el.addClass('closing');

            $timeout(function() {
                el.remove();
            }, 200);


            that.closed = true;

            that.scope.$destroy();
        };


        that.open = function () {
            
            that.scope.$modal = that;

            if (options.controller) {

                var locals, controller;

                locals = angular.extend({
                    $scope : that.scope,
                    $wmModalInstance : that
                }, options.locals);

                controller = $controller(options.controller, locals);

                if (angular.isString(options.controller) && options.controller.indexOf(' as ') >= 0) {                    
                    controller.$modal = that;
                }
                
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

            el = $compile(el)(that.scope);

            options.clickout && el.on('click', function(event) {
                that.cancel({event: event, type: 'backdrop'});
            });

            $document.find('body').append(el);

            $timeout(function () {
                el.removeClass('closing');
            });

            return that;
        };

        that.close = function(value) {

            that.$$close.call(that);

            deffered.resolve(value);

            return that;
        };

        that.cancel = function(value) {

            that.$$close.call(that);

            deffered.reject(value);

            return that;
        };

    };

    angular.element($window).bind('keyup', function (event) {

        if ((event.which || event.keyCode) === 27) {

            var modal = modals[modals.length - 1];

            modal && modal.cancel({event: event, type: 'esc'});
        }

    });


    return {

        open: function (options) {

            var that = this;

            var modal = new Modal(options);

            modal.$$zIndex = this.$$zIndex++;

            modal.open();

            modals.push(modal);

            modal.result['finally'](function () {
                modals.pop();
                --that.$$zIndex;
            })

            return modal;
        },

        $$zIndex: 1000
    }

}]);
