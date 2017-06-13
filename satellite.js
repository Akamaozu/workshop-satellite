var supervisor = require('supe')({ retries: 3, duration: 3 }),
    path = require('path');

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