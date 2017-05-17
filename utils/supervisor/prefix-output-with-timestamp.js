var original_log = console.log;

module.exports = function(){  

  console.log = function(){

    var now = new Date(),
        year = now.getFullYear(),
        month = leftpad( now.getMonth() + 1 ),
        date = leftpad( now.getDate() ),
        hour = leftpad( now.getHours() ),
        minute = leftpad( now.getMinutes() ),
        second = leftpad( now.getSeconds() ),

        prefix = '[' + year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second + ']';

    if( typeof arguments[0] == 'string' && arguments[0][0] === '[' ){

      arguments[0] = prefix + arguments[0];
    }

    else {

      Array.prototype.unshift.call( arguments, prefix ); 
    }

    original_log.apply( null, arguments )
  }
} 

function leftpad( n ) {
  var tr = ( parseInt(n) < 10 ) ? '0' + n : n;
  return tr;
}