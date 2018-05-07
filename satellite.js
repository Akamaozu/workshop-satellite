require('dotenv').config();

var path = require('path'),
    supervisor = require('supe')({
      retries: process.env.CITIZEN_REVIVES_PER_DURATION,
      duration: process.env.CITIZEN_REVIVE_DURATION_MINS
    }),

    log_citizen_output_addon = require( 'supe-addon-log-citizen-output' ),
    log_citizen_lifecycle_addon = require( 'supe-addon-log-citizen-lifecycle' );

// load helpers to make supervising components easier
  supervisor.use( require( './utils/supervisor/prefix-output-with-timestamp' ) );
  supervisor.use( log_citizen_lifecycle_addon );
  supervisor.use( log_citizen_output_addon );

// register satellite component control code
  supervisor.register( 'brain', path.join( __dirname, '/components/brain.js' ) );
  supervisor.register( 'camera', path.join( __dirname, '/components/camera.js' ) );
  supervisor.register( 'storage', path.join( __dirname, '/components/storage.js' ) );
  supervisor.register( 'antenna', path.join( __dirname, '/components/antenna.js' ) );

// update env variables
  supervisor.noticeboard.watch( 'update-env-variables', 'do-update', function( msg ){

    var updates = msg.notice;

    if( Object.prototype.toString.call( updates ) !== '[object Object]' ) return;

    for( var key in updates ){
      if( !updates.hasOwnProperty(key) ) continue;
      if( typeof updates[key] !== 'string' ) continue;
      console.log( 'action=update-env-variable key=' + key + ' value=' + updates[ key ] );
      process.env[ key ] = updates[ key ];
    }
  });

// start components
  supervisor.start( 'brain' );
  supervisor.start( 'camera' );
  supervisor.start( 'storage' );
  supervisor.start( 'antenna' );