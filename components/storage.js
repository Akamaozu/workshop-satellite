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
            type = mail.content_type || 'utf8',

            sender = envelope.from;

        fs_extra.outputFile( path.join( 'storage', filename ), content, type, function( err ){

          if( err ) throw err;

          citizen.noticeboard.notify( 'file-saved', { name: filename, requester: sender });
          console.log( 'action=save file=' + filename + ' requester=' + sender );

          ack();
        });

      break;

      case 'get-file':

      var filename = mail.name;

        if( !filename ){

          console.log( 'cannot retrieve file if name isn\'t specified', envelope );
          ack();
        }

        fs_extra.readFile( path.join( 'storage', filename ), function( err, content ){

          var response = { name: filename, success: false };

          if( err ) response.error = error.toString();

          else {

            response.success = true;
            response.content = content;
          }

          citizen.noticeboard.notify( 'get-file-result', response );
          console.log( 'action=get file=' + filename + ' requester=' + sender );
          ack();
        });

      break;

      case 'list-stored-files':

        fs_extra.readdir( 'storage', function( err, files ){

          var response = { success: false };

          if( !err ) response.files = files;

          citizen.noticeboard.notify( 'list-stored-files-result', response );
          console.log( 'action=list requester=' + sender );
          ack();
        });

      break;

      default:
        console.log( 'cannot properly process this mail: ', envelope );
        ack();
      break;
    }
  });