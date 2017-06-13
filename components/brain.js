var citizen = require('supe');

// take pics every 10 seconds
  setInterval( function(){

    console.log( 'initiating periodic snapshot' );
    citizen.mail.send({ to: 'camera' }, { action: 'take-picture' });

  }, 1000 * 10 );

// save all pictures taken by the camera
  citizen.noticeboard.watch( 'picture-taken', 'save-picture', function( msg ){

    var image = msg.notice;

    console.log( 'initiating picture storage' );

    citizen.mail.send({ to: 'storage' }, { 
    
      action: 'save-file',

      name: image.id + '.' + image.ext,
      content_type: image.content_type, 
      content: image.content,
    }); 
  });