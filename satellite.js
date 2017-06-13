require('dotenv').config();

var path = require('path'),
    supervisor = require('supe')({
      retries: process.env.CITIZEN_REVIVES_PER_DURATION,
      duration: process.env.CITIZEN_REVIVE_DURATION_MINS
    });

// load helpers to make supervising components easier
  supervisor.use( require( './utils/supervisor/prefix-output-with-timestamp' ) );
  supervisor.use( require( './utils/supervisor/log-citizen-lifecycle' ) );
  supervisor.use( require( './utils/supervisor/pipe-citizen-std-outputs' ) );

// register satellite component control code
  supervisor.register( 'brain', path.join( __dirname, '/components/brain.js' ) );
  supervisor.register( 'camera', path.join( __dirname, '/components/camera.js' ) );
  supervisor.register( 'storage', path.join( __dirname, '/components/storage.js' ) );

// start components
  supervisor.start( 'brain' );
  supervisor.start( 'camera' );
  supervisor.start( 'storage' );