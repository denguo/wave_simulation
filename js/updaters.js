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

function ClothUpdater ( opts ) {
    this._opts = opts;
    this._s = 10.0;
    this._k_s = 0.55;
    return this;
}

ClothUpdater.prototype.updatePositions = function ( particleAttributes, alive, delta_t ) {
    var positions  = particleAttributes.position;
    var velocities = particleAttributes.velocity;
    //console.log("in updatePositions: ", particleAttributes.wave_particles);
    var wave_particles = particleAttributes.wave_particles;
    //console.log(wave_particles);
    //console.log(wave_particles.array);
    var w = wave_particles.array[0];

    for (var x = 0; x < 20; x++) {
        for (var y = 0; y < 20; y++) {
            var i = 20*x + y;

            if ( !alive[i] ) continue;
            var p = getElement( i, positions );
            var v = getElement( i, velocities );
            //var w = getElement( 0, wave_particles);


            if (y == 10) {
                var amp = 5.0;
                var radius = 200.0;

                var z_pos = new THREE.Vector2(x, y);
                //var particle_pos = new THREE.Vector2(10, 10);
                var dx = z_pos.sub(w).length();

                var rect;
                if (Math.abs(dx)/(2*radius) < 0.5) {
                    rect = 1;
                }
                else if (Math.abs(dx)/(2*radius) == 0.5) {
                    rect = 0.5;
                }
                else {
                    rect = 0;
                }
                var k = 500.0;
                var D = (amp/2)*(Math.cos((Math.PI*dx)/radius)+1)*rect;
                //console.log(D);
                var diff = D - 4.96;

                p.y = -10.0 +  k*diff;
            }


            setElement( i, positions, p );

        }
    }
    if (wave_reflect) {
        wave_particles.array[0].y -= 0.2;
    }
    else {
        wave_particles.array[0].y += 0.2;
    }

    if (wave_particles.array[0].y >= 20) {
        wave_reflect = 1;
    }
    else if (wave_particles.array[0].y <= 0) {
        wave_reflect = 0;
    }

    //w.y += 1;
    //setElement( 0, wave_particles, w);
};

ClothUpdater.prototype.updateVelocities = function ( particleAttributes, alive, delta_t, width, height ) {
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


ClothUpdater.prototype.collisions = function ( particleAttributes, alive, delta_t ) {
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


ClothUpdater.prototype.update = function ( particleAttributes, alive, delta_t, width, height ) {

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
