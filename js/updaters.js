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
    var width = 30;
    var height = 30;

    // TODO Add dispersion angle property to wave, requires also wave particle subdivision which is complicated...

    // Deviation field given x [vector2], the position (x,y) we are evaluating wave at
    var eta_z = function(x) {
      var sum = z_0;
      //console.log("about to start");
      for ( var i = 0; i < getLength(wave_particles); i++) {
        var w = getWaveParticle(i, wave_particles);
        if (w.alive === 0) continue; // particle is not alive
        var d = (w.amp/2.0) * dev(x, w);
        sum += d;
      }
      return sum; // (z)
    }

    // deviation function in longitudinal direction; input is
    // original position (x,y), output is deviation in (x,y) directions
    var eta_xy = function(x, orig) {
      var sum = orig.clone();
      //console.log("about to start");
      for ( var i = 0; i < getLength(wave_particles); i++) {
        var w = getWaveParticle(i, wave_particles);
        if (w.alive === 0) continue; // particle is not alive
        var d = dev_long(x, w);
        sum.add(d);
      }
      // alert(JSON.stringify(sum));
      return sum; // (x,y)
    }

    // Deviation function (transverse)
    // x [vector2] with (x,y)
    // w is wave particle
    var dev = function(x, w) {
      var a = w.amp; // amplitude
      var x_i = new THREE.Vector2(w.pos.x, w.pos.y);
      var u = x.clone().sub(x_i).length(); // dx = |x - x_i|
      return (Math.cos((Math.PI*u) / radius) + 1) * rect(u / (2*radius));
    }

    // Deviation function (longitudinal)
    // x [vector2] with (x,y)
    // w is wave particle
    var dev_long = function(x, w) {
      var x_i = new THREE.Vector2(w.pos.x, w.pos.y);
      var u_i = w.vel.clone().normalize();
      return longitudinal(u_i.dot(x.clone().sub(x_i)), u_i).multiplyScalar(dev(x, w) / (w.amp / 2.0));
    }

    // longitudinal function taking some scalar u and returning a vector in direction of propogation (u_i)
    var longitudinal = function(u, u_i) {
      return u_i.clone().multiplyScalar(-1.0 * (Math.sin((Math.PI*u) / radius) + 1) * rect(u / (2*radius)));
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
        //console.log(z);
        p.y = z; // we are letting p.y be 'z' coord

        var xy = eta_xy(flat_pos, new THREE.Vector2(p.x, p.z));
        p.x = xy.x;
        p.z = xy.y;

        // update wave particles (they move based on wave velocity)
        for ( var j = 0; j < getLength(wave_particles); j++) {
          var w = getWaveParticle(j, wave_particles);
          if (w.alive === 0) continue; // dead particle
          // alert("old: " + JSON.stringify(w.pos));
          w.pos.add(w.vel.clone().multiplyScalar(delta_t));

          // TODO also might want some kind of amplitude attenuation
          // w.amp = w.amp * 0.9999;

          // Boundary Handling:
          // We get these values based on initial (x,y) positions declared in Wave position initializer
          // Note again that by "x,y" it's really "x,z" in the actual particle coordinates
          var minX = 50 - (width - 1)*5;
          var maxX = 50;
          var minY = 50 - (height - 1)*5;
          var maxY = 50;
          // Naively just reflect it
          if (w.pos.x < minX || w.pos.x > maxX) {
            w.vel.x = -1 * w.vel.x;
          } else if (w.pos.y < minY || w.pos.y > maxY) {
            w.vel.y = -1 * w.vel.y;
          }
          setWaveParticle(j, wave_particles, w);
        }

        setElement( i, positions, p );
    }
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
