Encompass.ResponseStatusHelper = Ember.Helper.helper( function(args){
  let [ status ] = args;
  let statusMap = {
    'approved': 'Approved',
    'pendingApproval': 'Pending Approval',
    'needsRevisions': 'Needs Revisions',
    'superceded': 'Superceded',
    'draft': 'Draft',
  };
  return statusMap[status];
});