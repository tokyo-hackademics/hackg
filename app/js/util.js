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
    if(typeof prefix === 'undefined') {
        prefix = "";
    }else{
        prefix = prefix + "-"
    }
    var length = 8;
    var uid = prefix + Math.random().toString(36).slice(-length);
    return uid
}