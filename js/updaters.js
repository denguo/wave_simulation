/*
 * In this file you can specify all sort of updaters
 *  We provide an example of simple updater that updates pixel positions based on initial velocity and gravity
 */

////////////////////////////////////////////////////////////////////////////////
// Collisions
////////////////////////////////////////////////////////////////////////////////

var Collisions = Collisions || {};
var wave_reflect = 0;

// If we want to add objects into waves we might need to write a collision handler
Collisions.BouncePlane = function ( particleAttributes, alive, delta_t, plane,damping ) {
    var positions    = particleAttributes.position;
    var velocities   = particleAttributes.velocity;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;
        // ----------- STUDENT CODE BEGIN ------------
        var pos = getElement( i, positions );
        var vel = getElement( i, velocities );

        setElement( i, positions, pos );
        setElement( i, velocities, vel );
        // ----------- STUDENT CODE END ------------
    }
};

function WaveUpdater ( opts ) {
    this._opts = opts;
    this._s = 10.0;
    this._k_s = 0.55;
    return this;
}

WaveUpdater.prototype.updatePositions = function ( particleAttributes, alive, delta_t ) {
    var positions  = particleAttributes.position;
    var velocities = particleAttributes.velocity;
    ////console.log("in updatePositions: ", particleAttributes.wave_particles);

    // Wave Particles have following information:
    // (x,y) position, amplitude
    // So it is a Vector3
    var wave_particles = particleAttributes.wave_particles;

    ////console.log(wave_particles);
    ////console.log(wave_particles.array);
    // var w = wave_particles.array[0];

    var z_0 = -10; // initial height (TODO this is the base position in system settings; need some way to get this value)
    var radius = 20; // particle radius; TODO this could become a wave particle property (don't forget to increase itemsize!)

    // TODO these are consistent with those in system settings.  Need some way to fetch this directly from system settings....
    var width = 20;
    var height = 20;

    // TODO Add dispersion angle property to wave, requires also wave particle subdivision which is complicated...

    // Note that "x" usually refers to (x,y)
    // TODO velocity determined by forces on the water

    // Deviation field given x [vector2], the position (x,y) we are evaluating wave at
    var eta_z = function(x) {
      var sum = z_0;
      //console.log("about to start");
      for ( var i = 0; i < getLength(wave_particles); i++) {
        var w = getWaveParticle(i, wave_particles);
        if (w.alive === 0) continue; // particle is not alive
        var d = dev(x, w);
        // alert(d);
        // alert(sum);
        sum += d;
      }
      // alert(sum);
      //console.log(sum);
      return sum;
    }

    // Deviation function (transverse)
    // x [vector2] with (x,y)
    // particle [vector3] is wave particle (x,y pos and amplitude)
    var dev = function(x, w) {
      var a = w.amp; // amplitude
      var x_i = w.pos; //
      var u = x.clone().sub(x_i).length(); // dx = |x - x_i|
      // console.log(u);
      // alert(JSON.stringify(x) + ", " + JSON.stringify(x_i) + ", " + u + "; rect: " + (u/(2*radius))
      //    + ", dev: " + ((a/2.0) * (Math.cos((Math.PI*u) / radius) + 1) * rect(u / (2*radius))));
      return (a/2.0) * (Math.cos((Math.PI*u) / radius) + 1) * rect(u / (2*radius));
    }

    // Rectangle function, return 1 if num>0.5, 0.5 if num=0.5, 0 o/w
    var rect = function(num) {
      var a = Math.abs(num);
      return (a < 0.5) ? 1 : ( (a === 0.5) ? 0.5 : 0);
    }

    // Iterate through each surface particle (e.g. position on the water's surface)
    // Note these are NOT wave particles; these are what are actually being rendered
    for ( var i  = 0 ; i < alive.length ; ++i ) {
      // console.log(i);
        if ( !alive[i] ) continue;
        var p = getElement( i, positions );
        var v = getElement( i, velocities );

        var flat_pos = new THREE.Vector2(p.x, p.z); // note that we are letting p.z be 'y' coord

        var z = eta_z(flat_pos);
        p.y = z; // we are letting p.y be 'z' coord
        // alert(z);

        // update wave particles (they move based on wave velocity)
        for ( var j = 0; j < getLength(wave_particles); j++) {
          var w = getWaveParticle(j, wave_particles);
          if (w.alive === 0) continue; // dead particle
          // alert("old: " + JSON.stringify(w.pos));
          w.pos.add(w.vel.clone().multiplyScalar(delta_t));
          // alert("new: " + JSON.stringify(w.pos));
          // reflect if going out of bounds
          // We get these values based on initial (x,y) positions declared in Wave position initializer
          // Note again that by "x,y" it's really "x,z" in the initializer
          var minX = 100 - (width - 1)*10;
          var maxX = 100;
          var minY = 100 - (height - 1)*10;
          var maxY = 100;
          // alert(JSON.stringify(w.pos));
          // if (w.pos.x < minX || w.pos.x > maxX || w.pos.y < minY || w.pos.y > maxY) {
          //
          // }
          setWaveParticle(j, wave_particles, w);
          // var w2 = getWaveParticle(j, wave_particles);
          // alert("Regot particle " + JSON.stringify(w2));
        }

        // alert(JSON.stringify(p));
        setElement( i, positions, p );
        // var p2 = getElement(i, positions);
        // alert(JSON.stringify(p2));
    }

    // for (var x = 0; x < 20; x++) {
    //     for (var y = 0; y < 20; y++) {
    //         var i = 20*x + y;
    //
    //         if ( !alive[i] ) continue;
    //         var p = getElement( i, positions );
    //         var v = getElement( i, velocities );
    //         //var w = getElement( 0, wave_particles);
    //
    //
    //         if (y == 10) {
    //             var amp = 5.0;
    //             var radius = 200.0;
    //
    //             var z_pos = new THREE.Vector2(x, y);
    //             //var particle_pos = new THREE.Vector2(10, 10);
    //             var dx = z_pos.sub(w).length();
    //
    //             var rect;
    //             if (Math.abs(dx)/(2*radius) < 0.5) {
    //                 rect = 1;
    //             }
    //             else if (Math.abs(dx)/(2*radius) == 0.5) {
    //                 rect = 0.5;
    //             }
    //             else {
    //                 rect = 0;
    //             }
    //             var k = 500.0;
    //             var D = (amp/2)*(Math.cos((Math.PI*dx)/radius)+1)*rect;
    //             ////console.log(D);
    //             var diff = D - 4.96;
    //
    //             p.y = -10.0 +  k*diff;
    //         }
    //
    //
    //         setElement( i, positions, p );
    //
    //     }
    // }
    // if (wave_reflect) {
    //     wave_particles.array[0].y -= 0.2;
    // }
    // else {
    //     wave_particles.array[0].y += 0.2;
    // }
    //
    // if (wave_particles.array[0].y >= 20) {
    //     wave_reflect = 1;
    // }
    // else if (wave_particles.array[0].y <= 0) {
    //     wave_reflect = 0;
    // }

    //w.y += 1;
    //setElement( 0, wave_particles, w);
};

WaveUpdater.prototype.updateVelocities = function ( particleAttributes, alive, delta_t, width, height ) {
    var positions = particleAttributes.position;
    var velocities = particleAttributes.velocity;
    var gravity = this._opts.externalForces.gravity;
    var attractors = this._opts.externalForces.attractors;

    for ( var j = 0 ; j < height; ++j ) {
        for ( var i = 0 ; i < width ; ++i ) {
            var idx = j * width + i;

            // ----------- STUDENT CODE BEGIN ------------
            var p = getElement( idx, positions );
            var v = getElement( idx, velocities );

            // calculate forces on this node from neighboring springs
            // (using this.calcHooke()... )
            v.add(new THREE.Vector3(1, 0, 0));

            setElement( idx, velocities, v );
            // ----------- STUDENT CODE END ------------
        }
    }

};


WaveUpdater.prototype.collisions = function ( particleAttributes, alive, delta_t ) {
    if ( !this._opts.collidables ) {
        return;
    }
    if ( this._opts.collidables.bouncePlanes ) {
        for (var i = 0 ; i < this._opts.collidables.bouncePlanes.length ; ++i ) {
            var plane = this._opts.collidables.bouncePlanes[i].plane;
            var damping = this._opts.collidables.bouncePlanes[i].damping;
            Collisions.BouncePlane( particleAttributes, alive, delta_t, plane, damping );
        }
    }
};


WaveUpdater.prototype.update = function ( particleAttributes, alive, delta_t, width, height ) {

    this.updateVelocities( particleAttributes, alive, delta_t, width, height );
    this.updatePositions( particleAttributes, alive, delta_t, width, height );

    this.collisions( particleAttributes, alive, delta_t );

    // tell webGL these were updated
    particleAttributes.position.needsUpdate = true;
    particleAttributes.color.needsUpdate = true;
    particleAttributes.velocity.needsUpdate = true;
    particleAttributes.lifetime.needsUpdate = true;
    particleAttributes.size.needsUpdate = true;
}
