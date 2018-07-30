module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // define source files and their destinations
    uglify: {
        files: {
            src: 'static/all.js',  // source files mask
            dest: 'static/',    // destination folder
            expand: true,    // allow dynamic building
            flatten: true,   // remove all unnecessary nesting
            ext: '.min.js'   // replace .js to .min.js
        }
    },
    cssmin: {
      files: {
        src: 'static/css/style.css',
        dest: 'static/',
        expand: true,
        flatten: true,
        ext: '.min.css'
      }
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['static/js/*.js'],
        dest: 'static/all.js'
      }
    },
    watch: {
        js:  { files: 'static/js/*.js', tasks: [ 'concat' ] },
    }
  });

  // load plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // register at least this one task
  grunt.registerTask('default', [ 'concat' ]);
  grunt.registerTask('prod', [ 'concat', 'uglify', 'cssmin' ]);
  grunt.registerTask('dev', [ 'concat', 'watch' ]);

};
