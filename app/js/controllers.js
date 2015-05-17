(function (module) {
    'use strict';

    module.controller('loginController', function ($scope, fbRef) {

        $scope.finishLoading = false;

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
            var movePage = function () {
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
                    location.href = 'teacher-page.html';
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
                    window.setTimeout(fbRef.onAuth(authDataCallback), 200)
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
                if ($scope.classUid) {
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
                        $scope.finishLoading = true;
                        $scope.$apply();
                    });
                } else {
                    $scope.finishLoading = true;
                    //$scope.$apply();
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
        $scope.limitNumTodoTask=3;
        $scope.limitNumDoneTask=3;
        $scope.selectedTaskTitle=null;
        $scope.selectedTaskId=null;
        $scope.orderByTaskStatus=false;
        $scope.usersHash = {};
        $scope.taskList = [];

        if (authData !== null) {
            console.log(authData);
            console.log(getName(authData));
            var fbUsers = fbRef.child("users/");
            var fbMandatoryTasks = fbRef.child("mandatoryTasks/");

            //ユーザ情報のハッシュ取得のためのonce関数
            fbUsers.on("value", function (data) {
                console.log("teacherPageController, fbUsers.on()");
                console.log(data.val());
                $scope.usersHash = data.val();
                $scope.$apply();
            });


            //タスク表示のためのon関数
            fbMandatoryTasks.on("child_added", function (data) {
                console.log(data.val());
                var task = data.val();
                task.uid = data.key();
                $scope.taskList.push(task);
                $scope.$apply();
            });

        }
        $scope.addTask = function () {
            console.log("execute addTask");
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
            newTask.isFinished = false;
            fbMandatoryTasks.child(uid).set(newTask);
            $scope.newTask = {};
            console.log("added newTask to mandatoryTasks");

            //生徒へのタスク情報追加
            var taskInfo = {};
            var date = new Date();
            taskInfo.uid = uid;
            taskInfo.finishDate = "undefined";
            taskInfo.point = newTask.point;
            for (var sid in $scope.studentList) {
                console.log(sid + ": " + $scope.studentList[sid]);
                fbUsers.child($scope.studentList[sid] + "/mandatoryTasks/" + taskInfo.uid).set(taskInfo);
            }
            console.log("added taskInfo to eacah users/mandatoryTasks");
        };

        //TodoタスクをクリックするとDoneTaskになる
        $scope.clickTodoTask = function () {
            console.log("clickTodoTask");
            for (var k in $scope.taskList) {
                var task = $scope.taskList[k];
                if (task.isFinished) {
                    console.log(task.uid + "= isFinished: true.");
                    console.log(task);
                    fbMandatoryTasks.child(task.uid)
                        .set({
                            title: task.title, addDate: task.addDate, deadline: task.deadline,
                            point: task.point, description: task.description, isFinished: task.isFinished
                        });
                }
            }
        };

        //DoneタスクをクリックするとTodoTaskになる
        $scope.clickDoneTask = function () {
            console.log("clickDoneTask");
            for (var k in $scope.taskList) {
                var task = $scope.taskList[k];
                if (!task.isFinished) {
                    console.log(task.uid + "= isFinished: false.");
                    fbMandatoryTasks.child(task.uid)
                        .set({
                            title: task.title, addDate: task.addDate, deadline: task.deadline,
                            point: task.point, description: task.description, isFinished: task.isFinished
                        });
                }
            }
        };

        //選択したタスクIDを取得してshowTaskProgressを呼ぶ
        $scope.selectTask = function (task) {
            console.log("select Task: "+task.uid);
            $scope.selectedTaskTitle=task.title;
            $scope.selectedTaskId=task.uid;
        };

        $scope.toggleTaskStatus = function () {
            console.log("toggleTaskStatus: " + $scope.orderByTaskStatus);
            $scope.orderByTaskStatus = !$scope.orderByTaskStatus;

        };

        $scope.toggleShowAllTodoTask = function () {
            console.log($scope.limitNumTodoTask);
            if ($scope.limitNumTodoTask !== 3) {
                $scope.limitNumTodoTask = 3;
            } else {
                $scope.limitNumTodoTask = 100;
            }
            $scope.$apply();
        };
        $scope.toggleShowAllDoneTask = function () {
            console.log($scope.limitNumDoneTask);
            if ($scope.limitNumDoneTask !== 3) {
                $scope.limitNumDoneTask = 3;
            } else {
                $scope.limitNumDoneTask = 100;
            }
            $scope.$apply();
        };


        $scope.hasTaskInProgress = function( user, value ){
            var mandatoryTasks = value['mandatoryTasks'];
            console.log("hasTaskInProgress: " + mandatoryTasks);
            return mandatoryTasks[$scope.selectedTaskId].finishDate === 'undefined' ? true : false;
        };


    })
}(hackgModule));  // モジュール変数を引数に設定

(function (module) {
    'use strict';
    module.controller('studentPageController', function ($scope, fbRef) {
        var authData = fbRef.getAuth();

        $scope.myselfInfo = {};
        $scope.tasksInfo = {};
        $scope.myTasksArray = [];

        if (authData !== null) {
            console.log(getName(authData));
            var fbMe = fbRef.child("users/" + authData.uid);
            var fbMyMandatoryTasks = fbRef.child("users/" + authData.uid + "/mandatoryTasks");
            var fbMandatoryTasks = fbRef.child("mandatoryTasks/");

            //児童自身の情報を取得
            fbMe.child("name").once("value", function (snap) {
                $scope.myselfInfo.name = snap.val();
            });
            fbMe.child("nameYomi").once("value", function (snap) {
                $scope.myselfInfo.nameYomi = snap.val();
            });

            //児童のタスク一覧を取得
            fbMyMandatoryTasks.on("value", function (snap) {
                $scope.myTasksArray = [];
                var taskHash = snap.val();
                for (var key in taskHash) {
                    $scope.myTasksArray.push(taskHash[key]);
                }
                calcPoints()
            });

            //タスク表示のためのon関数
            fbMandatoryTasks.once("value", function (snap) {
                $scope.tasksInfo = snap.val();
            });

        }

        $scope.finishTask = function (task) {
            //console.log("hoge");
            //console.log(task["uid"],"selected task uid");
            var taskUid = task["uid"];
            var todayStr = getTodayString();
            //console.log(todayStr)
            fbMyMandatoryTasks.child(taskUid + "/isFinished").set(true);
            fbMyMandatoryTasks.child(taskUid + "/finishDate").set(todayStr);
        };

        var calcPoints = function () {
            var totalExp = 0;
            var currentExp;
            var friendlyPoint = 0;
            var level;
            var currentTime = getTodayTime();
            var friendlyLimit = 1000 * 60 * 60 * 24 * 7; //1週間のミリ秒

            for (var i in $scope.myTasksArray) {
                var task = $scope.myTasksArray[i];
                //console.log(task);
                if (task.isFinished) {
                    totalExp += parseInt(task.point, 10);
                    console.log(totalExp, "totalExp")
                    //console.log(task.finishDate, "finishDate");

                    var finishDate = str2date(task.finishDate);
                    var finishTime = finishDate.getTime();
                    //note: timeはミリ秒
                    if ((currentTime - finishTime) < friendlyLimit) {
                        friendlyPoint += parseInt(task.point, 10);
                    }
                }
            }
            currentExp = totalExp % 10;
            level = Math.floor(totalExp / 10) + 1;

            $scope.totalExp = totalExp;
            $scope.currentExp = currentExp;
            $scope.friendlyPoint = friendlyPoint;
            $scope.level = level;
        };

        $scope.generateMessage = function () {
            var nMessages = 5;
            var index = Math.floor(Math.random() * (nMessages));
            //console.log("index", index);
            var messages = ["宿題がんばってるね！", "今日もがんばろうね", "今日はいいてんきだね！", "テストまえ、がんばろう！", "そとであそぼう"];
            var mes = messages[index];
            //console.log("messages[index]", mes);
            return mes;
        }
    })
}(hackgModule));  // モジュール変数を引数に設定
