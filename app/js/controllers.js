(function (module) {
    'use strict';

    module.controller('loginController', function ($scope, fbRef) {

        var date = new Date();
        $scope.dateStr = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();

        $scope.isTeacher = false;

        $scope.isLogIn = function () {
            return $scope.authData !== null;
        };

        function authDataCallback(authData) {
            $scope.authData = authData;
            if (authData) {
                $scope.loginStatusMessage = "ログインしています！ uid is " + authData.uid + "";
                loadClassData(authData);
            } else {
                $scope.loginStatusMessage = "ログインしていません";
                loadClassData(null);

            }
            console.log($scope.loginStatusMessage);

            //isTeacherLogIn();

        }

        $scope.logOut = function () {
            fbRef.unauth();
            var movePage = function(){
                location.href = "student-login.html?class=" + $scope.classUid;
            };
            window.setTimeout(movePage(), 200);


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
                    window.setTimeout(fbRef.onAuth(authDataCallback), 200);
                    location.href = 'user-setting.html';
                }

            })
        };

        $scope.studentLogIn = function () {
            var uid = $scope.studentLoginInfo.uid;
            var password = $scope.studentLoginInfo.password;
            var email = $scope.usersData[uid]["email"];
            var loginInfo = {email: email, password: password};

            fbRef.authWithPassword(loginInfo, function (error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                } else {
                    console.log("Authenticated successfully with payload:", authData);
                    window.setTimeout(fbRef.onAuth(authDataCallback), 2000)
                    location.href = 'login-sample.html';
                }

            })
        };

        var getParam = getUrlVars();
        if (getParam.class !== null) {
            $scope.classUid = getParam.class;
            console.log("$scope.classUid", $scope.classUid);
        }

        //ユーザ認証した後に各種データを読み込む関数
        var loadClassData = function (authData) {

            var loadClassDataInner = function () {
                var fbClasses = fbRef.child("classes");
                if ($scope.classUid) {
                    fbClasses.once("value", function (data) {
                        $scope.classHash = data.val();
                        $scope.classUids = Object.keys($scope.classHash);
                        $scope.currentClassName = $scope.classHash[$scope.classUid]["name"];
                        //console.log("keys: ", Object.keys($scope.classHash));
                        //$scope.classKeys = data.val();
                        console.log(data.val());
                        $scope.$apply();
                    });
                }

                //ここまでに、$scope.classUidが定義されていないと行けない
                $scope.studentList = [];
                if ($scope.classUid !== null) {
                    var fbUsers = fbRef.child("users");
                    fbUsers.once("value", function (data) {
                        var usersData = data.val();
                        $scope.usersData = usersData;
                        var studentList = [];
                        for (var key in usersData) {
                            if (usersData[key]["class"] === $scope.classUid && !usersData[key]["isTeacher"]) {
                                studentList.push(key);
                            }
                        }
                        $scope.studentList = studentList;
                        $scope.$apply();
                    });
                }
            };

            if (authData !== null) {
                var fbMe = fbRef.child("users/" + authData.uid);
                var fbUsers = fbRef.child("users");

                fbMe.once("value", function (dataSnapShot) {
                    console.log("fbMe once: " + dataSnapShot.val()["class"]);
                    $scope.classUid = dataSnapShot.val()["class"];
                    $scope.isTeacher = dataSnapShot.val()["isTeacher"];
                    loadClassDataInner();
                });
            } else {
                loadClassDataInner();
            }
        };

        //fbRef.onAuth(authDataCallback);
        var authData = fbRef.getAuth();
        authDataCallback(authData);
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
            var newTask = $scope.newTask;
            fbTasks.push(newTask);
            $scope.newTask = {};
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
            fbUser.child("email").set(authData.password.email);
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
            
            //タスク表示のためのon関数
            fbMandatoryTasks.on("child_added", function(data){
                console.log(data.val());
                $scope.taskList.push(data.val());
                $scope.$apply();
            });

        }
        $scope.addTask = function () {
            console.log("debug1" + $scope.deadline);
            var uid = getNewUid();
            var newTask = $scope.newTask;
            newTask.addDate = $scope.dateStr;
            //deadlinがオブジェクトだった場合はDateオブジェクトとして処理（Safar対策）
            if (typeof($scope.deadline) === "object") {
                var year = $scope.deadline.getFullYear();
                var month = $scope.deadline.getMonth();
                var date = $scope.deadline.getDate();
                newTask.deadline = year + "-" + month + "-" + date;
            } else {
                newTask.deadline = "undefined";
            }
            console.log("debug2" + newTask.deadline);

            newTask.isFinished = false;
            fbMandatoryTasks.child(uid).set(newTask);
            $scope.newTask = {};
            console.log("debug3");

            //生徒へのタスク情報追加
            var taskInfo = {};
            var date = new Date();
            taskInfo.uid = uid;
            taskInfo.finishDate = "undefined";
            taskInfo.point = newTask.point;
            for (var sid in $scope.studentList) {
                console.log(sid + ": " + $scope.studentList[sid]);
                fbUsers.child($scope.studentList[sid] + "/mandatoryTasks/").push(taskInfo);
            }
        };

    })
}(hackgModule));  // モジュール変数を引数に設定
