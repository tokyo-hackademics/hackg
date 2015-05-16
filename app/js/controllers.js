(function (module) {
    'use strict';

    module.controller('loginController', function ($scope, fbRef) {

        $scope.isTeacher = false;

        $scope.isLogIn = function () {
            return $scope.authData !== null;
        };

        var isTeacherLogIn = function () {
            if ($scope.authData == null) return;
            var fbUser = fbRef.child("users/" + authData.uid);
            fbUser.once('value', function (data) {
                console.log("TeacherLogIn: " + data.val()['isTeacher']);
                $scope.isTeacher = data.val()['isTeacher'];
                $scope.$apply();
            });
        };

        function authDataCallback(authData) {
            $scope.authData = authData;
            //console.log("authDataCallback() is called", $scope.authData);
            if (authData) {
                $scope.loginStatusMessage = "ログインしています！ uid is " + authData.uid + "";
            } else {
                $scope.loginStatusMessage = "ログインしていません";

            }
            console.log($scope.loginStatusMessage);

            isTeacherLogIn();

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

        var getParam = getUrlVars();
        $scope.classUid = getParam.class;
        console.log("$scope.classUid", $scope.classUid);

        var fbClasses = fbRef.child("classes");
        fbClasses.once("value", function (data) {
            $scope.classHash = data.val();
            $scope.classUids = Object.keys($scope.classHash);
            $scope.currentClassName=$scope.classHash[$scope.classUid]["name"];
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
        $scope.taskList = [];
        if (authData !== null) {
            console.log(authData);
            console.log(getName(authData));
            var fbTasks = fbRef.child("users/" + authData.uid + "/tasks");

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

(function (module) {
    'use strict';
    module.controller('teacherPageController', function ($scope, fbRef) {
        var authData = fbRef.getAuth();
        $scope.taskList = [];
        $scope.taskStatusList = [];

        if (authData !== null) {
            console.log(authData);
            console.log(getName(authData));
            var fbUser = fbRef.child("users/" + authData.uid);
            var fbMandatoryTasks = fbRef.child("mandatoryTasks/");

            fbUser.on('child_added', function (dataSnapshot) {
                console.log(dataSnapshot.val());
                $scope.taskList.push(dataSnapshot.val());
                $scope.$apply();
            });
        }
        $scope.addTask = function () {
            console.log("debug1" + $scope.deadline);
            var newTask = $scope.newTask;
            //Dateオブジェクトが取得できなかった場合はundefineを代入（Safar対策）
            if (typeof($scope.deadline) === typeof(Date()) ) {
                newTask.deadline = $scope.deadline.toString();
            } else {
                newTask.deadline = "undefined";
            }
            console.log("debug2" + newTask.deadline);
            fbMandatoryTasks.push(newTask);
            $scope.newTask = {};
            console.log("debug3");
        };

    })
}(hackgModule));  // モジュール変数を引数に設定
