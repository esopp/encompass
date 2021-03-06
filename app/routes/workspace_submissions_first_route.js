/**
  * # Workspace Submissions First Route
  * @description This route simply forwards the user to the first submission
  * @author Amir Tahvildaran, Daniel Kelly
  * @since 1.0.1
  */
Encompass.WorkspaceSubmissionsFirstRoute = Ember.Route.extend({
  utils: Ember.inject.service('utility-methods'),
  alert: Ember.inject.service('sweet-alert'),

  model: function(){
    return this.modelFor('workspace.submissions');
  },

  afterModel: function(submissions, transition) {
    let workspace = this.modelFor('workspace');
    if(submissions.get('length') > 0) {
      let sorted = submissions.sortBy('student', 'createDate');
      let firstStudent = sorted.get('firstObject.student');
      let lastRevision = sorted.getEach('student').lastIndexOf(firstStudent);

      this.transitionTo('workspace.submission', workspace, sorted.objectAt(lastRevision).get('id'));
    } else {
      // no work in workspace yet; transition to info page
      this.get('alert').showToast('info', 'Workspace does not have any submissions yet', 'bottom-end', 3000, false, null);

      this.transitionTo('workspace.info');
    }
  }

});
