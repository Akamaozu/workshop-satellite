var supervisor = require('supe')({ retries: 3, duration: 3 }),
    path = require('path');

// load helpers to make supervising components easier
  supervisor.use( require( './utils/supervisor/prefix-output-with-timestamp' ) );
  supervisor.use( require( './utils/supervisor/log-citizen-lifecycle' ) );
  supervisor.use( require( './utils/supervisor/pipe-citizen-std-outputs' ) );

// register satellite component control code
  supervisor.register( 'camera', path.join( __dirname, '/components/camera.js' ) );
  supervisor.register( 'storage', path.join( __dirname, '/components/storage.js' ) );

// behavior
  
  // save pictures taken by the camera
    supervisor.noticeboard.watch( 'picture-taken', 'save-picture', function( msg ){

      var image = msg.notice,
          storage = supervisor.get( 'storage' );

      storage.mail.send({ 
      
        action: 'save-file',

        name: image.id + '.' + image.ext,
        content: image.content,
        content_type: 'binary' 
      }); 
    });

  // take pics every 10 seconds
    setInterval( function(){

      var camera = supervisor.get( 'camera' );
      camera.mail.send({ action: 'take-picture' });

    }, 1000 * 10 );

// start components
  supervisor.start( 'camera' );
  supervisor.start( 'storage' );