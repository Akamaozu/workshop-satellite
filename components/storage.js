var citizen = require('supe'),
    path = require('path'),
    fs_extra = require('fs-extra'),
    verbose = process.env.STORAGE_VERBOSE_LOGGING == 'true' || false;

// handle incoming mail
  citizen.mail.receive( function( envelope, ack ){
    
    var mail = envelope.msg;

    switch( mail.action ){

      case 'save-file':

        var filename = mail.name,
            content = mail.content,
            type = mail.content_type || 'utf8',

            sender = envelope.from;

        fs_extra.outputFile( path.join( 'storage', filename ), content, type, function( err ){

          if( err ) throw err;

          if( verbose ) console.log( 'action=save file=' + filename + ' requester=' + sender );

          citizen.noticeboard.notify( 'file-saved', { name: filename, requester: sender });
          ack();
        });

      break;

      case 'get-file':

        var filename = mail.name;

        if( !filename ){

          console.log( 'cannot retrieve file if name isn\'t specified', envelope );
          ack();
        }

        fs_extra.readFile( path.join( 'storage', filename ), 'binary', function( err, content ){

          var response = { name: filename, success: false };

          if( err ) response.error = error.toString();

          else {

            response.success = true;
            response.content = content;
          }

          if( verbose ) console.log( 'action=get file=' + filename + ' requester=' + sender );

          citizen.noticeboard.notify( 'get-file-result', { name: filename, content: response, type: 'binary' });
          ack();
        });

      break;

      case 'list-stored-files':

        fs_extra.readdir( 'storage', function( err, files ){

          var response = { success: false };

          if( !err ){

            response.success = true;
            response.files = files;
            console.log( response );
          } 

          if( verbose ) console.log( 'action=list requester=' + sender );

          citizen.noticeboard.notify( 'list-stored-files-result', response );
          ack();
        });

      break;

      default:
        console.log( 'cannot properly process this mail: ', envelope );
        ack();
      break;
    }
  });