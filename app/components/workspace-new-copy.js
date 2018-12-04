/*global _:false */
Encompass.WorkspaceNewCopyComponent = Ember.Component.extend(Encompass.CurrentUserMixin, Encompass.ErrorHandlingMixin, {
  elementId: 'workspace-new-copy',
  newWsConfig: null,
  workspaceToCopy: null,
  isUsingCustomConfig: false,
  customConfig: null,
  newWsName: null,
  newWsMode: null,
  newWsOwner: null,
  newWsPermissions: null,
  newFolderSetOptions: null,
  utils: Ember.inject.service('utility-methods'),
  currentStep: {
    value: 1,
    display: 'Choose Workspace to Copy',
  },

  copyConfig:
    {
      groupName: 'copyConfig',
      required: true,
      inputs: [
        {
          value: 'A',
          label: 'Shallow with Folder Structure',
        },
        {
          value: 'B',
          label: 'Shallow with No Folders',
        },
        {
          value: 'C',
          label: 'Full Deep Copy',
        },
        {
          value: 'D',
          label: 'Custom',
        }
      ]
    },

  modeInputs: function() {
    let res = {
      groupName: 'mode',
      required: true,
      inputs: [
        {
          value: 'private',
          label: 'Private',
        },
        {
          value: 'org',
          label: 'My Org',
        },
        {
          value: 'public',
          label: 'Public',
        },
      ]
    };

    if (this.get('currentUser.isStudent') || !this.get('currentUser.isAdmin') ) {
      return res;
    }

    res.inputs.push({
      value: 'internet',
      label: 'Internet',
    });
    return res;
  }.property('currentUser.isStudent', 'currentUser.isAdmin'),

  showSelectWorkspace: Ember.computed.equal('currentStep.value', 1),
  showSelectConfig: Ember.computed.equal('currentStep.value', 2),
  showOwnerSettings: Ember.computed.equal('currentStep.value', 3),
  showPermissions: Ember.computed.equal('currentStep.value', 4),
  showReview: Ember.computed.equal('currentStep.value', 5),

  didReceiveAttrs: function() {
    let hasWorkspaceToCopy = this.get('model.workspaceToCopy');
    if (hasWorkspaceToCopy) {
      return this.store.findRecord('workspace', hasWorkspaceToCopy)
      .then((workspace) => {
        this.set('workspaceToCopy', workspace);
        this.set('selectedWorkspace', workspace);
        this.set('fromWorkspaceList', true);
      });
    }
  },

  maxSteps: function() {
    return this.get('steps.length') - 1;
  }.property('steps'),

  isCopyingFolders: function() {
    const newWsConfig = this.get('newWsConfig');
    const utils = this.get('utils');
    const isCustomWithNoFolders = this.get('customConfig.folderOptions.none');

    // user has not picked a config yet
    if (utils.isNullOrUndefined(newWsConfig)) {
      return null;
    }

    // Shallow with no folders
    if (newWsConfig === 'B') {
      return false;
    }

    // custom config selected
    if (newWsConfig === 'D') {

      // none option selected
      if (isCustomWithNoFolders) {
        return false;
      }
    }
    return true;
  }.property('newWsConfig', 'customConfig.folderOptions.@each{all,includeStructureOnly,none}'),

  submissionThreads: function() {
    if (!this.get('submissions')) {
      return [];
    }
    const threads = Ember.Map.create();

    this.get('submissions')
      .sortBy('student')
      .getEach('student')
      .uniq()
      .forEach((student) => {
        if(!threads.has(student)) {
          const submissions = this.studentWork(student);
          threads.set(student, submissions);
        }
      });
    return threads;
  }.property('submissions.[]'),

  studentWork: function(student) {
    return this.get('submissions')
      .filterBy('student', student)
      .sortBy('createDate');

  },

  detailsItems: function() {
    return [
      {
        label: 'Workspace to Copy',
        displayValue: this.get('workspaceToCopy.name'),
        propName: 'workspaceToCopy',
        associatedStep: 1
      },
      {
        label: 'Selected Configuration',
        displayValue: this.get('selectedConfigDisplay'),
        propName: 'newWsConfig',
        associatedStep: 2
      },
      {
        label: 'New Workspace Name',
        displayValue: this.get('newWsName'),
        propName: 'newWsName',
        associatedStep: 3
      },
      {
        label: 'New Workspace Owner',
        displayValue: this.get('newWsOwner.username') || this.get('newWsOwner.name'),
        propName: 'owner',
        associatedStep: 3
      },
      {
        label: 'Privacy Setting',
        displayValue: this.get('modeDisplay'),
        propName: 'newWsMode',
        associatedStep: 3,
      },
    ];
  }.property('workspaceToCopy', 'newWsConfig', 'newWsName', 'newWsOwner', 'newWsMode'),

  selectedConfigDisplay: function() {
    if (_.isNull(this.get('newWsConfig'))) {
      return;
    }
    const hash = {
      A: 'Shallow with Folder Structure',
      B: 'Shallow with No Folders',
      C: 'Full Deep Copy',
      D: 'Custom'
    };
    return hash[this.get('newWsConfig')];
  }.property('newWsConfig'),

  steps: [
    {value: 0, display: ''},
    {
      value: 1,
      display: 'Choose Workspace to Copy',
      // constraints: {
      //   workspace: {
      //     presence: { allowEmpty: false }
      //   }
      // }
    },
     {
      value: 2,
      display: 'Choose Preset or Custom Configuration',

      // constraints: {
      //   selectedConfig: {
      //     presence: { allowEmpty: false }
      //   }
      // }
    },
   {
      value: 3,
      display: 'Choose Owner Settings',
      // constraints: {
      //   name: {
      //     presence: { allowEmpty: false },
      //     length: {
      //       maximum: 500
      //     }
      //   }
      // }

    },
   {
      value: 4,
      display: 'Customize Permissions',
    },
    {value: 5, display: 'Review', }
  ],

  // currentStepDisplay: function() {
  //   let currentStep = this.get('currentStep');


  //   // const hash = {
  //   //   1: 'Choose Workspace to Copy',
  //   //   2: 'Choose Preset or Custom Configuration',
  //   //   3: 'Give New Workspace a Name',
  //   //   4: 'Choose Owner',
  //   //   5: 'Choose Privacy Setting'

  //   // };
  //   return this.get('stepHash')[currentStep];

  // }.property('currentStep'),

  modeDisplay: function() {
    const hash = {
      private: 'Private' ,
      org: 'My Org',
      public: 'Public' ,
      internet: 'World Wide Web',
    };
    return hash[this.get('newWsMode')] || null;

  }.property('newWsMode'),

  formatPermissionsObjects() {
    const objects = this.get('newWsPermissions');

    if (this.get('utils').isNonEmptyArray(objects)) {
      return objects.map((obj) => {
        let user = obj.user;
        if (user && user.id) {
          obj.user = user.id;
        }
        return obj;
      });
    }
  },
  handleSubmissionsLoadingMessage: function() {
    const that = this;
    if (!this.get('loadingSubmissions')) {
      this.set('showLoadingSubmissions', false);
      return;
    }
    Ember.run.later(function() {
      if (that.isDestroyed || that.isDestroying) {
        return;
      }
      if (!that.get('loadingSubmissions')) {
        return;
      }
      that.set('showLoadingSubmissions', true);
    }, 500);

  }.observes('loadingSubmissions'),

  actions: {
    goToStep(stepValue) {
      if(!stepValue) {
        return;
      }
      this.set('currentStep', this.get('steps')[stepValue]);
    },

    // proceed() {
    //   const currentStep = this.get('currentStep');

    //   // do validation for particular input

    //   const value = this.get('currentStep.inputValue');
    //   const constraints = this.get('currentStep.constraints');
    //   let errors = window.validate(value, constraints);
    //   if (errors) {
    //     this.set('validationErrors', errors);
    //     return;
    //   }
    //   this.send('changeStep', 1);
    // },

    changeStep(direction) {
      let currentStep = this.get('currentStep.value');
      let maxStep = this.get('maxSteps');
      if (direction === 1) {
        if (currentStep === maxStep) {
          return;
        }
        this.set('currentStep', currentStep + 1);
        return;
      }

      if (direction === -1) {
        if (currentStep === 1) {
          return;
        }
        this.set('currentStep', this.get('steps')[currentStep - 1]);
      }
    },
    setOriginalWorkspace() {
      const workspace = this.get('selectedWorkspace');

      this.set('workspaceToCopy', workspace);
      this.set('defaultName', `Copy of ${workspace.get('name')}`);

      // start process of loading submissions - may need these for config step
      // for large workspaces(i.e. 1000+ submissions - this could take a long time)
      this.set('loadingSubmissions', true);
      this.get('workspaceToCopy.submissions').then((submissions) => {
        this.set('submissions', submissions);
        this.set('loadingSubmissions', false);
        this.set('currentStep', this.get('steps')[2]);
      })
      .catch((err) => {
        this.set('loadingSubmissions', false);
        this.handleErrors(err, 'loadSubmissionsError');
      });
    },

    setConfig(config, customConfig) {
      this.set('newWsConfig', config);
      if (customConfig) {
        this.set('customConfig', customConfig);
      }
      this.set('currentStep', this.get('steps')[3]);
    },
    setOwnerSettings(name, owner, mode, folderSetOptions) {
      this.set('newWsName', name);
      this.set('newWsOwner', owner);
      this.set('newWsMode', mode);
      this.set('newFolderSetOptions', folderSetOptions);

      this.set('currentStep', this.get('steps')[4]);

    },
    setPermissions(permissions) {
      this.set('newWsPermissions', permissions);
      this.set('currentStep', this.get('steps')[5]);
    },
    createCopyRequest() {
      const selectedConfig = this.get('newWsConfig');
      const owner = this.get('newWsOwner');
      const name = this.get('newWsName');
      const originalWsId = this.get('workspaceToCopy');
      const mode = this.get('newWsMode');

      const formattedPermissionObjects = this.formatPermissionsObjects(this.get('newWsPermissions'));

      let copyRequest;
      let requestSource;

      let base = {
        owner,
        name,
        originalWsId,
        mode,
        createDate: Date.now(),
        lastModifiedDate: Date.now(),
        createdBy: this.get('currentUser')
      };

      let folderSetOptions = this.get('newFolderSetOptions');

      if (!folderSetOptions.doCreateFolderSet) {
        delete folderSetOptions.name;
        delete folderSetOptions.privacySetting;
        if (!folderSetOptions.existingFolderSetToUse) {
          delete folderSetOptions.existingFolderSetToUse;
        }
      }

      let baseOptions = {
        submissionOptions : { all: true },
        folderOptions : {
          includeStructureOnly: true,
          folderSetOptions: this.get('newFolderSetOptions'),
          all: true
        },
        selectionOptions : { none: true },
        commentOptions : { none: true },
        responseOptions : {  none: true},
        permissionOptions: {
          permissionObjects: formattedPermissionObjects
        }
      };
        // basic shallow with folders

      if (selectedConfig === 'A') {
        requestSource = Object.assign(base, baseOptions);

      } else if (selectedConfig === 'B') {
        delete baseOptions.folderOptions.all;
        baseOptions.folderOptions.none = true;
        requestSource = Object.assign(base, baseOptions);
      } else if (selectedConfig === 'C') {
        baseOptions.folderOptions.includeStructureOnly = false;

        baseOptions.selectionOptions.all = true;
        delete baseOptions.selectionOptions.none;

        baseOptions.commentOptions.all = true;
        delete baseOptions.commentOptions.none;

        baseOptions.responseOptions.all = true;
        delete baseOptions.responseOptions.none;
        requestSource = Object.assign(base, baseOptions);
      } else if (selectedConfig === 'D') {
        const customConfig = this.get('customConfig');
        if (this.get('utils').isNonEmptyObject(customConfig)) {
          customConfig.folderOptions.folderSetOptions = folderSetOptions;
          requestSource = Object.assign(base, customConfig);
        } else {
          this.set('customConfigError', true);
          return;
        }
      }
      copyRequest = this.get('store').createRecord('copyWorkspaceRequest', requestSource);

      copyRequest.save()
        .then((result) => {
          const error = result.get('copyWorkspaceError');
          if (error) {
            this.set('copyWorkspaceError', error);
            return;
          }
          const createdWorkspace = result.get('createdWorkspace');

          if (createdWorkspace) {
            this.sendAction('toWorkspace', createdWorkspace);
          }
        })
        .catch((err) => {
          this.handleErrors(err, 'serverErrors');
        });

    }
  }
});