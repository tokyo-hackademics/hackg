(function (module) {
    'use strict';

    module.controller('loginController', function ($scope, fbRef) {

        $scope.isLogIn = function () {
            return $scope.authData !== null;
        };

        function authDataCallback(authData) {
            $scope.authData = authData;
            //console.log("authDataCallback() is called", $scope.authData);
            if (authData) {
                $scope.loginStatusMessage = "ログインしています！ uid is " + authData.uid + "";
            } else {
                $scope.loginStatusMessage = "ログインしていません";

            }
            console.log($scope.loginStatusMessage)
        }

        $scope.logOut = function () {
            fbRef.unauth();
        };

        $scope.logIn = function () {
            //console.log($scope.loginInfo);
            //var error;
            //var authData;
            fbRef.authWithPassword($scope.loginInfo, function (error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                } else {
                    console.log("Authenticated successfully with payload:", authData);
                    window.setTimeout(fbRef.onAuth(authDataCallback), 2000)
                    location.href = 'page-sample.html';
                }

            })
        };

        //fbRef.onAuth(authDataCallback);
        var authData = fbRef.getAuth();
        authDataCallback(authData)
    })
}(hackgModule));  // モジュール変数を引数に設定

(function (module) {
    'use strict';
    module.controller('sampleController', function ($scope, fbRef) {
        var authData = fbRef.getAuth();
        $scope.taskList = [];
        if (authData !== null) {
            console.log(authData);
            console.log(getName(authData));
            var fbTasks = fbRef.child("sample/user/" + authData.uid + "/tasks");

            fbTasks.on('child_added', function (dataSnapshot) {
                console.log(dataSnapshot.val());
                $scope.taskList.push(dataSnapshot.val());
                $scope.$apply();
            });
        }
        $scope.addTask = function () {
            console.log("debug1");
            var newTask = $scope.newTask;
            fbTasks.push(newTask);
            console.log("debug2");
            $scope.newTask = {};
            console.log("debug3");
        };

    })
}(hackgModule));  // モジュール変数を引数に設定