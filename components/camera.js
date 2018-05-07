var citizen = require('supe'),
    Task = require('cjs-task'),
    request = require('request'),
    verbose = process.env.CAMERA_VERBOSE_LOGGING === 'true' || false,

    image_cache = [];

// handle incoming mail
  citizen.mail.receive( function( envelope, ack ){

    var mail = envelope.msg;

    switch( mail.action ){

      case 'take-picture':

        take_a_pic( function( err, image_metadata ){

          if( err ) throw err;
          
          if( verbose ) console.log( 'action=picture-taken file=' + image_metadata.id + '.' + image_metadata.ext );
          citizen.noticeboard.notify( 'picture-taken', image_metadata );
          ack();
        });

      break;

      default:
        console.log( 'possibly malformed mail', envelope );
        ack();
      break;
    }
  });

function take_a_pic( callback ){

  if( !callback || typeof callback !== 'function' ) callback = default_callback;

  var task = Task();

  task.step( 'ensure image cache is primed', function(){

    prime_image_cache( function( err, cached ){

      if( err ) return task.end( err );
      else task.next();
    });
  });

  task.step( 'select random image from cache', function(){

    if( image_cache.length == 0 ){

      // image cache should never be empty because previous step tries to prime it
      // if empty, there is no available pictures for camera subject settings

      // choices:

      // 1. shut camera down
      // process.exit();

      // 2. take any pictures instead of subject matter

      // a. log it
        console.log( '[warn] NO IMAGES FOUND FOR CURRENT CAMERA SUBJECT SETTINGS' );
        console.log( '[warn] QUERYSTRING: ' + process.env.CAMERA_SUBJECT_QUERYSTRING );
        console.log( '[warn] KEYWORDS: ' + process.env.CAMERA_SUBJECT_KEYWORDS );

      // b. remove subject settings
        console.log( '[info] REMOVING SUBJECT RESTRICTIONS FOR FUTURE ATTEMPTS' );

        citizen.noticeboard.notify( 'update-env-variables', {
          CAMERA_SUBJECT_QUERYSTRING: '',
          CAMERA_SUBJECT_KEYWORDS: ''
        });

      return task.end( new Error( 'no images found for current camera subject settings' ) );
    }

    var image_metadata = image_cache.splice( Math.floor( Math.random() * image_cache.length ), 1 );

    task.set( 'image-metadata', image_metadata[0] );
    task.next();
  });

  task.step( 'fetch image content from url', function(){

    var image_metadata = task.get( 'image-metadata' );

    request( image_metadata.url, { encoding: 'binary' }, function( err, resp, body ){

      if( err ) return task.end( err );

      image_metadata.content_type = 'binary';
      image_metadata.content = body;
      image_metadata.ext = 'jpg';
      
      task.set( 'image-metadata', image_metadata );
      task.next();
    });
  });

  task.callback( function( err ){

    var image_metadata = task.get( 'image-metadata' );

    if( err ){

      if( image_metadata ) image_cache.push( image_metadata );
      return callback( err );
    }

    else callback( null, image_metadata );
  });

  task.start();
}

function prime_image_cache( callback ){

  if( !callback || typeof callback !== 'function' ) callback = default_callback;

  var task = Task();

  task.set( 'total-cached', 0 );

  task.step( 'verify image cache is empty', function(){

    if( Object.prototype.toString.call( image_cache ) !== '[object Array]' ) image_cache = [];
    if( image_cache.length > 0 ) return task.end();

    task.next();
  });

  task.step( 'fetch image data', function(){

    request({

      url: 'https://images-api.nasa.gov/search',      
      qs: {
        q: process.env.CAMERA_SUBJECT_QUERYSTRING || 'surface',
        keywords: process.env.CAMERA_SUBJECT_KEYWORDS || 'mars, moon, jupiter',
        media_type: 'image'
      }

    }, function( err, res, body ){

      if( err ) return task.end( err );

      var images_metadata = JSON.parse( body ).collection.items;

      task.set( 'images-metadata', images_metadata );
      task.next();
    });
  });

  task.step( 'log image data analysis', function(){

    var images_metadata = task.get( 'images-metadata' ),
        keywords = [];

    images_metadata.forEach( function( item ){
      if( ! item.data[0].keywords ) return;

      item.data[0].keywords.forEach( function( keyword ){
        if( keywords.indexOf( keyword ) === -1 ) keywords.push( keyword );
      });
    });

    if( verbose ) console.log( 'image metadata cached. total=' + images_metadata.length + ' keywords=' + keywords.join( ', ' ) );

    task.next();
  });

  task.step( 'cache image data', function(){

    var total_cached = 0;

    task.get( 'images-metadata' ).forEach( function( image ){

      image_cache.push({

        id: image.data[0].nasa_id,
        url: image.links[0].href

      });

      total_cached += 1;
    });

    task.set( 'total-cached', total_cached );
    task.next();
  });

  task.callback( function( err ){

    if( err ) return callback( err );
    callback( null, task.get( 'total-cached' ) );
  });

  task.start();
}

function default_callback( error ){
  if( error ) throw error;
}