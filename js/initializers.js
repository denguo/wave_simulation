/*
 * In this file you can specify all sort of initializers
 *  We provide an example of simple initializer that generates points withing a cube.
 */

////////////////////////////////////////////////////////////////////////////////
// Wave
////////////////////////////////////////////////////////////////////////////////

function WaveInitializer ( opts ) {
    this._opts = opts;
    return this;
};

WaveInitializer.prototype.initializePositions = function ( positions, toSpawn, width, height ) {
    var base_pos = this._opts.position;

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        var w = idx % width;
        var h = idx / height;
        var grid_pos = new THREE.Vector3( 50.0 - w * 5, 0.0, 50.0 - h * 5 );
        var pos = grid_pos.add( base_pos );
        setElement( idx, positions, pos );
    }
    positions.needUpdate = true;
}

WaveInitializer.prototype.initializeVelocities = function ( velocities, toSpawn) {
    var base_vel = this._opts.velocity;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        setElement( idx, velocities, base_vel  );
    }
    velocities.needUpdate = true;
}

WaveInitializer.prototype.initializeColors = function ( colors, toSpawn) {
    var base_col = this._opts.color;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        //var col = base_col;
        var col = new THREE.Vector4(0, 0, 0, 0);
        setElement( idx, colors, col );
    }
    colors.needUpdate = true;
}

WaveInitializer.prototype.initializeSizes = function ( sizes, toSpawn) {
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        setElement( idx, sizes, 1 );
    }
    sizes.needUpdate = true;
}

WaveInitializer.prototype.initializeLifetimes = function ( lifetimes, toSpawn) {
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        setElement( idx, lifetimes, Math.INFINITY );
    }
    lifetimes.needUpdate = true;
}

// hm for some reason this is being called multiple times. probabbly the wrong place to put this.
WaveInitializer.prototype.initializeWaveParticles = function (wave_particles, width, height) {
  // for (var i = 0; i < getLength(wave_particles); i++) {
  //   var w = getWaveParticle(i, wave_particles);
  //    if (i === 0) // just initialize a single particle
  //     w.alive = 1;
  //   w.pos = new THREE.Vector2( 100.0 - (i % width) * 10, 100.0 - (i / height) * 10 );
  //   w.amp = 10.0;
  //   w.vel = new THREE.Vector2(-5.0, 0.0);
  //   setWaveParticle(i, wave_particles, w);
  // }
  // console.log("inited wave particles");
}


WaveInitializer.prototype.initialize = function ( particleAttributes, toSpawn, width, height ) {

    // update required values
    this.initializePositions( particleAttributes.position, toSpawn, width, height );

    this.initializeVelocities( particleAttributes.velocity, toSpawn );

    this.initializeColors( particleAttributes.color, toSpawn );

    this.initializeLifetimes( particleAttributes.lifetime, toSpawn );

    this.initializeSizes( particleAttributes.size, toSpawn );

    this.initializeWaveParticles( particleAttributes.wave_particles, width, height);
    // mark normals to be updated
    particleAttributes["normal"].needsUpdate = true;

};
