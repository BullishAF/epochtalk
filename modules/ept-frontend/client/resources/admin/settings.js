'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/admin/settings/', {}, {
      getTheme: {
        method: 'GET',
        url: '/api/admin/settings/theme'
      },
      setTheme: {
        method: 'PUT',
        url: '/api/admin/settings/theme'
      },
      previewTheme: {
        method: 'PUT',
        url: '/api/admin/settings/theme/preview'
      },
      resetTheme: {
        method: 'POST',
        url: '/api/admin/settings/theme'
      }
    });
  }
];
