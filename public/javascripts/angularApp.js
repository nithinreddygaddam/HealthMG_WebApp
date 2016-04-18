angular.module('healthMG', ['ui.router'])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: '/home.html',
                    controller: 'MainCtrl'
                    //resolve: {
                    //  postPromise: ['posts', function(posts){
                    //    return posts.getAll();
                    //  }]
                    //}
                })
                //.state('posts', {
                //  url: '/posts/{id}',
                //  templateUrl: '/posts.html',
                //  controller: 'PostsCtrl',
                //  resolve: {
                //    post: ['$stateParams', 'posts', function($stateParams, posts) {
                //      return posts.get($stateParams.id);
                //    }]
                //  }
                //})
                .state('login', {
                    url: '/login',
                    templateUrl: '/login.html',
                    controller: 'AuthCtrl',
                    onEnter: ['$state', 'auth', function($state, auth){
                        if(auth.isLoggedIn()){
                            $state.go('home');
                        }
                    }]
                })
                .state('subscriber', {
                    url: '/subscriber',
                    templateUrl: '/subscriber.html',
                    controller: 'SubCtrl',
                    // resolve: {
                    //     subscription: ['$stateParams', 'subscriptions', function($stateParams, subscriptions) {
                    //         return subscriptions.get($stateParams.id);
                    //     }]
                    // }
                    resolve: {
                     postPromise: ['subscriptions', function(subscriptions){
                       return subscriptions.getAll();
                     }]
                    }
                })
                .state('publisher', {
                    url: '/publisher',
                    templateUrl: '/publisher.html',
                    controller: 'PubCtrl'

                })
                .state('register', {
                    url: '/register',
                    templateUrl: '/register.html',
                    controller: 'AuthCtrl',
                    onEnter: ['$state', 'auth', function($state, auth){
                        if(auth.isLoggedIn()){
                            $state.go('home');
                        }
                    }]
                });

            $urlRouterProvider.otherwise('home');
        }]);


angular.module('healthMG').factory('subscriptions', ['$http', 'auth', function($http, auth){
    var o = {
        subscriptions: []
    };

    // o.get = function(id) {
    //     return $http.get('/subscriptions/' + id).then(function(res){
    //         return res.data;
    //     });
    // };

    o.getAll = function() {
        return $http.get('/subscriptions').success(function(data){
            angular.copy(data, o.subscriptions);
        });
    };

    o.create = function(subscription) {
        return $http.post('/subscriptions', subscription, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            o.subscriptions.push(data);
            // })
            // .error(function(error) {
            //     $scope.error = error;
        });
    };

    return o;
}]);


angular.module('healthMG').controller('SubCtrl', [
    '$scope',
    'subscriptions',
    'auth',
    function($scope, subscriptions, auth){
        $scope.subscriptions = subscriptions.subscriptions;
        $scope.isLoggedIn = auth.isLoggedIn;
        var publisherID;

        $scope.addSubscription = function(){
            if($scope.publisherUsername === '') { return; }
            var currentUserID = auth.currentUserID();

            // publisherID = auth.publisherUserID($scope.publisherUsername)();
            //
            auth.publisherUserID($scope.publisherUsername, function(data) {
                publisherID = data._id;
                subscriptions.create({
                    status:     "Active",
                    publisher:  publisherID,
                    subscriber: currentUserID
                });
                $scope.publisherUsername = '';
            });

            // var currentUserID = auth.currentUserID();

            // $scope.publisherUserID = auth.publisherUserID($scope.publisherUsername);
            // var publisherUserID = auth.publisherUserID($scope.publisherUsername)();
            //var publisherUserID = publisherUser();

        };

    }]);

//.factory('posts', ['$http', 'auth', function($http, auth){
//  var o = {
//    posts: []
//  };
//
//  o.get = function(id) {
//    return $http.get('/posts/' + id).then(function(res){
//      return res.data;
//    });
//  };
//
//  o.getAll = function() {
//    return $http.get('/posts').success(function(data){
//      angular.copy(data, o.posts);
//    });
//  };
//
//  o.create = function(post) {
//    return $http.post('/posts', post, {
//      headers: {Authorization: 'Bearer '+auth.getToken()}
//    }).success(function(data){
//      o.posts.push(data);
//    });
//  };
//
//  o.upvote = function(post) {
//    return $http.put('/posts/' + post._id + '/upvote', {
//      headers: {Authorization: 'Bearer '+auth.getToken()}
//    }).success(function(data){
//      post.upvotes += 1;
//    });
//  };
//
//  o.addComment = function(id, comment) {
//    return $http.post('/posts/' + id + '/comments', comment, {
//      headers: {Authorization: 'Bearer '+auth.getToken()}
//    });
//  };
//
//  o.upvoteComment = function(post, comment) {
//    return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote', {
//      headers: {Authorization: 'Bearer '+auth.getToken()}
//    }).success(function(data){
//      comment.upvotes += 1;
//    });
//  };
//
//  return o;
//}])

// .controller('MainCtrl', [
// '$scope',
// 'posts',
// 'auth',
// function($scope, posts, auth){
//   $scope.test = 'Hello world!';
//
//   $scope.posts = posts.posts;
//   $scope.isLoggedIn = auth.isLoggedIn;
//
//   $scope.addPost = function(){
//     if($scope.title === '') { return; }
//     posts.create({
//       title: $scope.title,
//       link: $scope.link,
//     });
//     $scope.title = '';
//     $scope.link = '';
//   };
//
//   $scope.incrementUpvotes = function(post) {
//     posts.upvote(post);
//   };
//
// }])

//.controller('PostsCtrl', [
//'$scope',
//'posts',
//'post',
//'auth',
//function($scope, posts, post, auth){
//  $scope.post = post;
//  $scope.isLoggedIn = auth.isLoggedIn;
//
//  $scope.addComment = function(){
//    if($scope.body === '') { return; }
//    posts.addComment(post._id, {
//      body: $scope.body,
//      author: 'user',
//    }).success(function(comment) {
//      $scope.post.comments.push(comment);
//    });
//    $scope.body = '';
//  };
//
//  $scope.incrementUpvotes = function(comment){
//    posts.upvoteComment(post, comment);
//  };
//}])

angular.module('healthMG').factory('auth', ['$http', '$window', '$rootScope', function($http, $window, $rootScope){

    var auth = {
        saveToken: function (token){
            $window.localStorage['health-mg-token'] = token;
        },
        getToken: function (){
            return $window.localStorage['health-mg-token'];
        },
        isLoggedIn: function(){
            var token = auth.getToken();

            if(token){
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        },
        currentUser: function(){
            if(auth.isLoggedIn()){
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.username;
            }
        },
        currentAccount: function(){
            if(auth.isLoggedIn()){
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));
                return payload.account;
            }
        },
        currentUserID: function(){
            if(auth.isLoggedIn()){
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload._id;
            }
        },

        publisherUserID: function(username, callback){
                    $http.get('/publisher/' + username).success(function(response) {
                        callback && callback(response);
                    });
        },

        register: function(user){
            return $http.post('/register', user).success(function(data){
                auth.saveToken(data.token);
                //account = user.account;
            });

        },
        logIn: function(user){
            return $http.post('/login', user).success(function(data){
                auth.saveToken(data.token);
                //account = user.account;
            });
        },

        logOut: function(){
            $window.localStorage.removeItem('health-mg-token');
        }
    };

    return auth;

}]);


angular.module('healthMG').controller('PubCtrl', [
    '$scope',
    'auth',
    function($scope, auth){


    }]);

angular.module('healthMG').controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth){
        $scope.user = {};
        $scope.register = function(){
            auth.register($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $state.go('home');
            });
        };

        $scope.logIn = function(){
            auth.logIn($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                if($scope.user.account == 'subscriber'){
                    $state.go('subscriber');
                }
                else{
                    $state.go('publisher');
                }

            });
        };
    }]);

angular.module('healthMG').controller('NavCtrl', [
    '$scope',
    'auth',
    function($scope, auth){
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.currentAccount = auth.currentAccount;
        $scope.logOut = auth.logOut;
    }]);


