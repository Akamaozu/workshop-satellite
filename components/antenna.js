var citizen = require('supe'),
    socketio = require('socket.io-client')( 'https://torontojs-basestation.herokuapp.com/' ),
    verbose = process.env.ANTENNA_VERBOSE_LOGGING == 'true' || false;
    var startTime = new Date()

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

  // set time
  setInterval( function(){

    if( verbose ) console.log( 'setting timestamp' );
    let dateDiff = (new Date()) - startTime;
    let minutes = Math.floor(dateDiff / (1000 * 60));
    dateDiff  = `${minutes} minutes`;
    socketio.emit('current-time',{dateDiff})
  }, 1000 *  5  );


citizen.noticeboard.watch( 'upload-file', 'send-to-base-station', function( msg ){

  var file = msg.notice,
      name = file.name,
      type = file.type,
      timestamp = new Date(),
      content = file.content;

  if( !name || !type || !content ) return;

  socketio.emit( 'file-upload', {
    name: name,
    type: type,
    timestamp,
    content: content
  });

  if( verbose ) console.log( 'action=upload file=' + name );
  citizen.noticeboard.notify( 'file-uploaded', name );
});