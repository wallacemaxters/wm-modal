#WM Modal

The WM Modal library is a simple service to use modal in angular.

Example:

```javascript
angular

.module('app', ['wm.modal'])

.controller('AppController', function ($scope, $wmModal) {

    $scope.open = function () {

        $wmModal.open({
            clickout: true,
            controller: 'ModalController',
            locals: {
                $id: 1,
            },
            templateUrl: 'modal.html',
            containerClass: $scope.containerClass,
        }).result.then(function () {
            console.log('ok')
        }, function () {
            console.log('not ok')
        })
    };

})

.controller('ModalController', function ($scope, $wmModalInstance, $wmModal, $id) {
    $scope.modal = $wmModalInstance;
})
```



#Options

`clickout` - determines if modal is closed on click out.

`locals` - defines the values acessible via Dependency Injection in modal controller

`scope` - define extra values for `$scope` of modal

`templateUrl` - defines the template of modal. The classes of modal is `.modal-header`, `.modal-body` and `.modal-footer`.

`containerClass` - defines a custom class for `.modal-container` (the default modal container)

`template` - define a template as string

`modalHeight` - define a modal height

`modalWidth` - define a modal width

`controller` - define a controller for modal. 



See an [Example](https://rawgit.com/wallacemaxters/wm-modal/master/index.html).