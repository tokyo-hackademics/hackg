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
                    location.href = 'user-setting.html';
                }

            })
        };

        var fbClasses = fbRef.child("classes");
        fbClasses.once("value", function (data) {
            $scope.classHash = data.val();
            $scope.classUids = Object.keys($scope.classHash);
            //console.log("keys: ", Object.keys($scope.classHash));
            //$scope.classKeys = data.val();
            console.log(data.val());
            $scope.$apply();
        });

        //fbRef.onAuth(authDataCallback);
        var authData = fbRef.getAuth();
        authDataCallback(authData)
    })
}(hackgModule));  // モジュール変数を引数に設定

(function (module) {
    'use strict';
    module.controller('sampleController', function ($scope, fbRef) {
        var authData = fbRef.getAuth();
        $scope.allData = fbRef.val();
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

(function (module) {
    'use strict';
    module.controller('userSettingController', function ($scope, fbRef) {
        var authData = fbRef.getAuth();
        if (authData !== null) {
            console.log(authData);
            console.log(getName(authData));
            var fbUser = fbRef.child("users/" + authData.uid);
        }

        $scope.setName = function () {
            var newName = $scope.newName;
            fbUser.child("name").set(newName);
            console.log("New name registered: ", newName)
        };

        $scope.setNameYomi = function () {
            var newNameYomi = $scope.newNameYomi;
            fbUser.child("nameYomi").set(newNameYomi);
            console.log("New nameYomi registered: ", newNameYomi)
        };

        $scope.setClass = function () {
            var newClassUid = $scope.selectedClass;
            fbUser.child("class").set(newClassUid);
            console.log("New class set: ", newClassUid)
        };

        $scope.setIsTeacher = function () {
            var newIsTeacher = $scope.isTeacher;
            fbUser.child("isTeacher").set(newIsTeacher);
            console.log("isTeacher set: ", newIsTeacher)
        };

    })
}(hackgModule));

(function (module) {
    'use strict';
    module.controller('adminController', function ($scope, fbRef) {

        $scope.setClassName = function () {
            var newUid = getNewUid("class");
            fbClasses.child(newUid).set({name: $scope.newClassName});
            console.log("new class registered: ", $scope.newClassName)
        };
    })
}(hackgModule));  // モジュール変数を引数に設定