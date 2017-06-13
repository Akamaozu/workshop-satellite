var citizen = require('supe'),
    verbose = process.env.BRAIN_VERBOSE_LOGGING === 'true' || false;

// take pics periodically
  setInterval( function(){

    if( verbose ) console.log( 'initiating periodic snapshot' );
    citizen.mail.send({ to: 'camera' }, { action: 'take-picture' });

  }, 1000 * ( process.env.PERIODIC_PICTURE_TAKING_INTERVAL_SECS || 60 ) );

// save all pictures taken by the camera
  citizen.noticeboard.watch( 'picture-taken', 'save-picture', function( msg ){

    var image = msg.notice;

    if( verbose ) console.log( 'initiating picture storage' );

    citizen.mail.send({ to: 'storage' }, { 
    
      action: 'save-file',

      name: image.id + '.' + image.ext,
      content_type: image.content_type, 
      content: image.content,
    }); 
  });