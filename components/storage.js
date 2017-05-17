var citizen = require('supe'),
    path = require('path'),
    fs_extra = require('fs-extra');

// handle incoming mail
  citizen.mail.receive( function( envelope, ack ){
    
    var mail = envelope.msg;

    switch( mail.action ){

      case 'save-file':

        var filename = mail.name,
            content = mail.content,
            type = mail.content_type || 'utf8';

        fs_extra.outputFile( path.join( 'storage', filename ), content, type, function( err ){

          if( err ) throw err;

          console.log( 'saved ' + filename );
          ack();
        });

      break;


      default:
        console.log( 'possibly malformed mail', envelope );
        ack();
      break;

    }
  });