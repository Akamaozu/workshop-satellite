module.exports = function( supervisor ){

  supervisor.noticeboard.watch( 'citizen-output', 'pipe-to-console', function( msg ){

    var name = msg.notice.name,
        prefix = '[' + name + ']',
        output = msg.notice.output.trim();

    if( output[0] !== '[' ) prefix += ' ';
    
    console.log( prefix + output );
  });

  supervisor.noticeboard.watch( 'citizen-error', 'pipe-to-console', function( msg ){

    var name = msg.notice.name,
        prefix = '[' + name + ']',
        error = msg.notice.error.trim();

    if( error[0] !== '[' ) prefix += ' ';
    
    console.log( prefix + error );
  });

  supervisor.noticeboard.watch( 'citizen-excessive-crash', 'crash-supervisor', function( msg ){

    var name = msg.notice.name;

    console.log( '[error] stopped reviving "' + name + '" because it crashed excessively' );
  });
}