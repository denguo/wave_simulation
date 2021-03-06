/*
 * In this file you can specify all sort of updaters
 *  We provide an example of simple updater that updates pixel positions based on initial velocity and gravity
 */

////////////////////////////////////////////////////////////////////////////////
// Collisions
////////////////////////////////////////////////////////////////////////////////

var Collisions = Collisions || {};
var wave_reflect = 0;
var first = true;


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
    var n_wave_particles = particleAttributes.n_wave_particles;

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
        p.y = z; // we are letting p.y be 'z' coord

        var xy = eta_xy(flat_pos, new THREE.Vector2(p.x, p.z));
        // p.x = xy.x;
        // p.z = xy.y;

        // update wave particles (they move based on wave velocity)
        var counter = 0;
        for ( var j = 0; j < getLength(wave_particles); j++) {
          var w = getWaveParticle(j, wave_particles);
          if (w.alive === 0) continue; // dead particle
          // alert("old: " + JSON.stringify(w.pos));
          w.pos.add(w.vel.clone().multiplyScalar(delta_t));


            // if (j % 2 == 1 ) {
            //     if (counter > 2) {
            //         w.alive = 0;
            //         setWaveParticle(j, wave_particles, w);
            //         continue;
            //     }
            //     //first = false;
            // }
            // counter++;

            // n = n_wave_particles.array[0];
            // if (n >= 4) {
            //     if (j == 2 || j == 3) {
            //         var neighbor = getWaveParticle(w.neighbor, wave_particles);
            //         neighbor.neighbor = -1;
            //         setWaveParticle(w.neighbor, wave_particles, neighbor);
            //         w.alive = 0;
            //         setWaveParticle(j, wave_particles, w);
            //         continue;
            //     }
            // }



          // TODO also might want some kind of amplitude attenuation
          w.amp = w.amp * 0.99995;
          if (w.amp < 0.1) {
            var neighbor = getWaveParticle(w.neighbor, wave_particles);
            neighbor.neighbor = -1;
            setWaveParticle(w.neighbor, wave_particles, neighbor);
            w.alive = 0;
            setWaveParticle(j, wave_particles, w);
          }

          // Boundary Handling:
          // We get these values based on initial (x,y) positions declared in Wave position initializer
          // Note again that by "x,y" it's really "x,z" in the actual particle coordinates
          var minX = 100 - (width - 1)*10 + 20;
          var maxX = 80;
          var minY = 100 - (height - 1)*10 + 20;
          var maxY = 80;
          // Naively just reflect it
          if (w.pos.x < minX || w.pos.x > maxX) {
            w.vel.x = -1 * w.vel.x;
          } else if (w.pos.y < minY || w.pos.y > maxY) {
            w.vel.y = -1 * w.vel.y;
          }
          setWaveParticle(j, wave_particles, w);
        }

        // subdivision and particle generation
        var n = n_wave_particles.array[0];

        if (n < 399) {
            var n_original = new Number(n);
            //console.log(n_original);
            for ( var j = 0; j < n_original; j++) {
                n = n_wave_particles.array[0];
                //console.log(n_original);
                var w = getWaveParticle(j, wave_particles);
                var neighbor = getWaveParticle(w.neighbor, wave_particles);

                var w_disp = w.pos.distanceTo(neighbor.pos);

                if (w_disp > radius) {
                    w.amp /= 2;
                    w.neighbor = n;
                    if (w.vel.x >= 0) {
                        w.vel = new THREE.Vector2(w.vel.x+.025, w.vel.y);
                    }
                    else {
                        w.vel = new THREE.Vector2(w.vel.x-0.025, w.vel.y);
                    }
                    setWaveParticle(j, wave_particles, w);

                    var vel_new;
                    if (w.vel.x >= 0) {
                        vel_new = new THREE.Vector2(-w.vel.x-0.025, w.vel.y);
                    }
                    else {
                        vel_new = new THREE.Vector2(-w.vel.x+0.025, w.vel.y);
                    }

                    var w_new = {
                        alive: 1,
                        pos: w.pos,
                        amp: w.amp,
                        vel: vel_new,
                        disp: w.disp,
                        neighbor: j
                    }
                    setWaveParticle(n, wave_particles, w_new);
                    n_wave_particles.array[0] += 1;
                }
            }
        }

          // if (n >= 399) {
          //     console.log("wave particle buffer full");
          // }

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
