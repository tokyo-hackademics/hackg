var hackgModule = angular.module('hackgApp', ['firebase'])
    .value('fbURL', 'https://hackg-db.firebaseIO.com/')
    .service('fbRef', function (fbURL) {
        return new Firebase(fbURL)
    });