module.exports = function( supervisor ){

  supervisor.noticeboard.watch( 'citizen-started', 'log-to-stdio', function( msg ){

    var name = msg.notice.name;

    console.log( name + ' started' );
  });

  supervisor.noticeboard.watch( 'citizen-shutdown', 'log-to-stdio', function( msg ){

    var name = msg.notice.name;

    console.log( name + ' shutdown' );
  });

  supervisor.noticeboard.watch( 'citizen-crashed', 'log-to-stdio', function( msg ){

    var name = msg.notice.name;

    console.log( name + ' crashed' );
  });

  supervisor.noticeboard.watch( 'citizen-excessive-crash', 'log-to-stdio', function( msg ){

    var name = msg.notice.name;

    console.log( name + ' crashed excessively' );
  });
}