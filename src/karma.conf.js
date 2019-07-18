// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    mime: {
      'text/x-typescript': ['ts','tsx']
    },
    basePath: '.',
    files: ['test/**/*.js'],
    frameworks: ['jasmine', 'mocha', 'chai', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-mocha'),
      require('karma-chai'),
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../coverage/Glossaire'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    browsers: ['ChromeHeadless'],
    customLaunchers:{
      Chrome:{
        base: 'ChromeHeadless',
        flags: ['--disable-translate', '--disable-extensions', '--headless', '--disable-gpu', '--remote-debugging-port=9223', '--no-sandbox']
      }
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    //browsers: ['ChromeHeadless'],
    singleRun: true,
    restartOnFileChange: false
  });
};