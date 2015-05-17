function getName(authData) {
    if (authData == null) {
        return undefined
    }
    switch (authData.provider) {
        case 'password':
            return authData.password.email.replace(/@.*/, '');
        case 'twitter':
            return authData.twitter.displayName;
        case 'facebook':
            return authData.facebook.displayName;
    }
}

function getNewUid(prefix) {
    if (typeof prefix === 'undefined') {
        prefix = "";
    } else {
        prefix = prefix + "-"
    }
    var length = 8;
    var uid = prefix + Math.random().toString(36).slice(-length);
    return uid
}

var getUrlVars = function () {
    var vars = {};
    var param = location.search.substring(1).split('&');
    for (var i = 0; i < param.length; i++) {
        var keySearch = param[i].search(/=/);
        var key = '';
        if (keySearch != -1) key = param[i].slice(0, keySearch);
        var val = param[i].slice(param[i].indexOf('=', 0) + 1);
        if (key != '') vars[key] = decodeURI(val);
    }
    return vars;
}

var date2str = function (date){
    var str = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
    return str
}

var getTodayString = function(){
    var currentDateTime = new Date();
    return date2str(currentDateTime);
}

var str2date = function (str){
    var devided = str.split("-");
    var year = devided[0];
    var month = devided[1];
    var day = devided[2];
    var date = new Date(year, month, day);
    return date
}

var getTodayTime = function(){
    var currentDateTime = new Date();
    var dateStr = currentDateTime.getFullYear()+"-"+(currentDateTime.getMonth()+1)+"-"+currentDateTime.getDate();
    var currentDate = str2date(dateStr);
    return currentDate.getTime();
}