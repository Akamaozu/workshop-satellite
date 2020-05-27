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

// transmit stored files when connected to base station
  citizen.noticeboard.watch( 'base-station-connection-status-update', 'upload-stored-files', function( msg ){

    var data = msg.notice,
        list;

    if( data.connected ){

      if( verbose ) console.log( 'initiating storage upload' );
        
      citizen.noticeboard.watch( 'get-file-result', 'send-for-upload', function( msg ){

        var file = msg.notice;

        if( list.indexOf( file.name ) == -1 ) return;

        citizen.noticeboard.notify( 'upload-file', file );
        list.splice( list.indexOf( file.name ), 1 );
      });

      citizen.noticeboard.watch( 'list-stored-files-result', 'send-for-upload', function( msg ){

        var response = msg.notice;

        if( !response.success ) return;

        if( verbose ) console.log( 'fetching storage content for upload' );

        list = response.files;

        list.forEach( function( file ){
          citizen.mail.send({ to: 'storage' }, { action: 'get-file', name: file });
        });
      });

      citizen.noticeboard.watch( 'file-saved', 'send-for-upload', function( msg ){
        var file = msg.notice;

        list.push( file.name );
        citizen.mail.send({ to: 'storage' }, { action: 'get-file', name: file.name });
      });

      citizen.mail.send({ to: 'storage' }, { action: 'list-stored-files' });
    }

    else{

      citizen.noticeboard.ignore( 'file-saved', 'send-for-upload' );
      citizen.noticeboard.ignore( 'get-file-result', 'send-for-upload' );
      citizen.noticeboard.ignore( 'list-stored-files-result', 'send-for-upload' );
    } 
  });

// delete uploaded files
  citizen.noticeboard.watch( 'file-uploaded', 'delete-file', function( msg ){

    var filename = msg.notice;

    if( verbose ) console.log( 'initiating delete of uploaded file' );
    citizen.mail.send({ to: 'storage' }, { action: 'delete-file', name: filename });
  });