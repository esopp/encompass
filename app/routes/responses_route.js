Encompass.ResponsesRoute = Encompass.AuthenticatedRoute.extend(Encompass.CurrentUserMixin, {
  model: function() {
    return this.get('store').query('responseThread', {
      threadType: 'all',
      page: 1,
    })
    .then((results) => {
      let meta = results.get('meta');
      console.log('result threads', meta);
      return {
        threads: results.toArray(),
        meta
      };
    });
  },
  actions: {
    toSubmissionResponse(subId) {
      this.transitionTo('responses.submission', subId);
    },
    toResponses() {
      this.refresh();
    },
    toResponse(submissionId, responseId) {
      this.transitionTo('responses.submission', submissionId, {queryParams: {responseId: responseId} });
    },
  }
});


