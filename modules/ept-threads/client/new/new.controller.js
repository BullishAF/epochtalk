var slugify = require('slugify');

var controller = ['$anchorScroll', '$stateParams', '$location', 'Session', 'Threads', 'Posts', 'Alert', 'board', function($anchorScroll, $stateParams, $location, Session, Threads, Posts, Alert, board) {
    $anchorScroll();
    var ctrl = this;
    this.loggedIn = Session.isAuthenticated;
    this.exitEditor = false;
    this.dirtyEditor = false;
    this.resetEditor = true;
    this.pollValid = false;
    this.addPoll = false;
    this.poll = {};
    this.right_to_left = board.right_to_left;
    this.disableSelfMod = board.disable_selfmod;
    this.thread = {
      title: '',
      board_id: $stateParams.boardId,
      sticky: false,
      locked: false
    };
    this.poll = {
      question: '',
      answers: ['', '']
    };

    this.hasOptions = function() {
      if (this.canLock() || this.canSticky() || this.canModerate() || this.canCreatePoll()) {
        return true;
      }
      else { return false; }
    };

    this.canLock = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (!Session.hasPermission('threads.lock.allow')) { return false; }
      return true;
    };

    this.canSticky = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (!Session.hasPermission('threads.sticky.allow')) { return false; }
      return true;
    };

    this.canModerate = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (ctrl.disableSelfMod) { return false; }
      if (!Session.hasPermission('threads.moderated.allow')) { return false; }
      return true;
    };

    this.canCreatePoll = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (!Session.hasPermission('threads.createPoll.allow')) { return false; }
      return true;
    };

    this.canSave = function() {
      var text = ctrl.thread.body;
      var imgSrcRegex = /<img[^>]+src="((http:\/\/|https:\/\/|\/)[^">]+)"/g;
      var stripTagsRegex = /(<([^>]+)>)/ig;
      var images = imgSrcRegex.exec(text);
      text = text.replace(stripTagsRegex, '');
      text = text.trim();
      return text.length || images;
    };

    this.addPollAnswer = function() { ctrl.poll.answers.push(''); };
    this.removePollAnswer = function(index) { ctrl.poll.answers.splice(index, 1); };

    this.save = function() {
      ctrl.exitEditor = true;

      // append poll to thread
      if (ctrl.addPoll && ctrl.pollValid) { ctrl.thread.poll = ctrl.poll; }

      // slugify title
      var slug = slugify(slugify(ctrl.thread.title, { remove: /\*/g, lower: true }));
      // Handles slugs of foreign languages, these will get a random hash for their slug
      if (slug === '') { slug = Math.random().toString(36).substring(6);  }
      ctrl.thread.slug = slug;

      // create a new thread and post
      Threads.save(ctrl.thread).$promise
      .then(function(thread) {
        $location.path('/threads/' + thread.slug + '/posts');
        return Posts.updatePostDraft({ draft: null });
      })
      .catch(function(err) {
        ctrl.exitEditor = false;
        var error = 'Could not create thread: ' + err.data.message;
        if (err.status === 429) { error = 'New Thread Rate Limit Exceeded'; }
        Alert.error(error);
      });
    };
  }
];

// include the poll-creator directive
require('./../../../modules/ept-polls/poll_creator.directive');
require('./../../../modules/ept-posts/directives/editor.directive');
require('./../../../modules/ept-images/image-uploader.directive');

module.exports = angular.module('ept.newThread.ctrl', [])
.controller('NewThreadCtrl', controller);
