var citizen = require('supe'),
    socketio = require('socket.io-client')( 'https://torontojs-basestation.herokuapp.com/' ),
    verbose = process.env.ANTENNA_VERBOSE_LOGGING == 'true' || false;

socketio.emit( 'connection-status-request' );

socketio.on( 'connect', function(){
  socketio.emit( 'name', process.env.SATELLITE_NAME );
});

socketio.on( 'connection-status', function( is_connected ){

  if( verbose ){    
    if( is_connected ) console.log( 'connected to base station' );
    else console.log( 'disconnected from base station' );
  }

  citizen.noticeboard.notify( 'base-station-connection-status-update', { connected: is_connected });
});

citizen.noticeboard.watch( 'upload-file', 'send-to-base-station', function( msg ){

  var file = msg.notice,
      name = file.name,
      type = file.type,
      content = file.content;

  if( !name || !type || !content ) return;

  socketio.emit( 'file-upload', {
    name: name,
    type: type,
    content: content
  });

  if( verbose ) console.log( 'action=upload file=' + name );
  citizen.noticeboard.notify( 'file-uploaded', name );
});