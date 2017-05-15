////////////////////////////////////////////////////////////////////////////////
// COS 426 Assignement 4 stub                                                 //
// Particle Systems                                                           //
// Many ideas here are taken from SPARKS.js                                   //
////////////////////////////////////////////////////////////////////////////////

// TODO :
// - shader requires more exploration / better interface
// - change moving particle to setting it invisible in shader
// - initializers and particle engine must work with all the sahder supported attributes
// - incorporate gui controls

// Singleton Engine - we will have one particle engine per application,
// driving the entire application.
var ParticleEngine = ParticleEngine || new ( function() {
    //console.log("new particle engine");
    var _self      = this;

    // Instance variables - list of emitters, and global delta time
    _self._emitters   = [];
    _self._meshes     = [];
    _self._animations = [];
    _self._prev_t     = undefined;
    _self._cur_t      = undefined;
    _self._isRunning  = false;

    _self.addEmitter = function ( emitter ) {
        _self._emitters.push( emitter );
    };

    _self.removeEmitters = function() {
        _self._emitters = [];
    };

    _self.addMesh = function ( mesh ) {
        _self._meshes.push( mesh );
    };

    _self.removeMeshes = function() {
        _self._meshes = [];
    };

    _self.addAnimation = function ( animation ) {
        _self._animations.push( animation );
        animation.play()
    };

    _self.removeAnimations = function () {
        for ( var i = 0 ; i < _self._animations.length; ++i ) {
            _self._animations[i].isPlaying = false;
        }
        _self._animations = [];
    };

    _self.start = function () {
        _self._prev_t = Date.now();
        _self._cur_t  = Date.now();
        _self._isRunning = true;
    };

    _self.step = function () {
        // deal with time
        _self._cur_t  = Date.now();
        var elapsed  = (_self._cur_t - _self._prev_t) / 1000.0;
        _self._prev_t = _self._cur_t;
        if ( !_self._isRunning ) elapsed = 0.0;

        for ( var i = 0; i < _self._animations.length ; ++i ) {
            _self._animations[i].update( elapsed * 1000.0 );
        }

        for ( var i = 0 ; i < _self._emitters.length ; ++i ) {
            _self._emitters[i].update( elapsed );
        }

    };

    _self.stop = function () {
        _self._isRunning = false;
    },

    _self.pause = function () {
        if ( _self._isRunning ) {
            _self.stop();
        } else {
            _self.start();
        }
    };

    _self.restart = function () {
        _self.stop();
        for ( var i = 0 ; i < _self._emitters.length ; ++i ) {
            _self._emitters[i].restart();
        }
        _self.start();
    };

    _self.getDrawableParticles = function ( emitter_idx ) {
        return _self._emitters[emitter_idx].getDrawableParticles();
    }

    _self.getEmitters = function( ) {
        return _self._emitters;
    }

    return _self;
})();

function Emitter ( opts ) {
    //console.log("emitter");
    // console.log ( "Emiiter", this );
    // initialize some base variables needed by emitter, that we will extract from options
    this._maxParticleCount     = undefined;
    this._particlesPerSecond   = undefined;
    this._initializer          = undefined;
    this._updater              = undefined;
    this._wave                = false;
    this._width                = undefined;
    this._height               = undefined;
    this._attributeInformation = {
        position:      3,
        velocity:      3,
        color:         4,
        size:          1,
        lifetime:      1,
    };

    // parse options
    for ( var option in opts ) {
        var value = opts[option];
        if ( option === "material" ) {
            this._material = value;
        } else if ( option === "maxParticles" ) {
            this._maxParticleCount = value;
        } else if ( option === "particlesFreq" ) {
            this._particlesPerSecond = value;
        } else if ( option === "initialize" ) {
            this._initializer = value;
        } else if ( option === "update" ) {
            this._updater = value;
        } else if ( option === "material" ) {
            this._material = value;
        } else if ( option === "wave" ) {
            this._wave = value;
        } else if ( option === "width" ) {
            this._width = value;
        } else if ( option === "height" ) {
            this._height = value;
        } else {
            console.log( "Unknown option " + option + "! Make sure to register it!" )
        }
    }

    if ( this._wave == true ) {
        this._maxParticleCount = this._width * this._height;
        this._particlesPerSecond = 1e8 * this._maxParticleCount;
    }

    // These are more internal variables that will be initialized based on parsed arguments.
    // For example, attributes given to THREE.BufferGeometry will depend on attributeInformation
    // variable.
    this._particles          = new THREE.BufferGeometry();
    this._initialized        = [];

    // Store indices of available particles - these are not initialized yet
    for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {
        this._initialized[i] = false;
    }

    // Allocate memory for the particles
    for ( var attributeKey in this._attributeInformation ) {
        // get info from attributeInformation, required to initialize correctly sized arrays
        var attributeLength = this._attributeInformation[ attributeKey ];
        var attributeArray = new Float32Array( this._maxParticleCount * attributeLength );

        // Since these are zero - initialized, they will appear in the scene.
        // By setting all to be negative infinity we will effectively remove these from rendering.
        // This is also how you "remove" dead particles
        for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {
            for ( var j = 0 ; j < attributeLength ; ++j ) {
                attributeArray[ attributeLength * i + j ] = 1e-9;
            }
        }

        this._particles.addAttribute( attributeKey, new THREE.BufferAttribute( attributeArray, attributeLength ) );
    }

    // in case of wave we need to describe to webGL how to render it.
    if( this._wave === true ) {

        // NOTE: We might want to do the following:
        // Treat particles as actual wave particles (since we can manipulate their position, velocity, etc.)
        // In this rendering section, create the mesh by doing the whole extended height field thing
        // ACTUALLY NVM.  We need the surface.

        var indices = new Uint16Array( (this._width - 1) * (this._height - 1) * 6 ); // 6 verts for 2 triangles
        var idx = 0;
        // Indices are indices for vertices (particles); there are w*h of them
        // And three verts make a triangle to render for the mesh
        for ( var i = 0 ; i < this._width - 1 ; i++ ) {
            for ( var j = 0 ; j < this._height - 1 ; j++ ) {
                indices[ 6 * idx + 0 ] = j * this._width + i;
                indices[ 6 * idx + 1 ] = (j + 1) * this._width + i;
                indices[ 6 * idx + 2 ] = j * this._width + i + 1;

                indices[ 6 * idx + 3 ] = (j + 1) * this._width + i;
                indices[ 6 * idx + 4 ] = (j + 1) * this._width + i + 1;
                indices[ 6 * idx + 5 ] = j * this._width + i + 1;

                idx += 1;
            }
        }
        this._particles.addAttribute( 'index', new THREE.BufferAttribute( indices, 3 ) );
        this._particles.computeVertexNormals();

        ///////////////////////////////////////////////////////////////////////
        // CREATE WAVE PARTICLE
        ///////////////////////////////////////////////////////////////////////

        // TODO find some way to make wave particles variable sized, or maybe very large so that we can generate/kill wave particles
        // Wave particles have properties: alive, (x,y) pos, amp, (x,y) vel -- 8 total (so far) -- TODO add radius?
        var wave_particles = new Float32Array( 4096 * 8);
        var wave_particles_attribute = new THREE.BufferAttribute(wave_particles, 8);

        // INTIIALIZE WAVE PARTICLE ATTRIBUTES
        for (var i = 0; i < getLength(wave_particles_attribute); i++) {
          var w = getWaveParticle(i, wave_particles_attribute);

          // Just init them in the same position as the surface particles
          w.alive = 0;
          w.pos = new THREE.Vector2( 100.0 - (i % this._width) * 10, 100.0 - (i / this._height) * 10 );
          w.amp = 30.0; // amplitude
          w.vel = new THREE.Vector2(0.0, -0.1); // This will make it roll from one side to the other
          w.disp = 0.0;
          w.neighbor = -1;

          setWaveParticle(i, wave_particles_attribute, w);
        }

        // initialize two particles - position 10 and 11
        var w_0 = getWaveParticle(0, wave_particles_attribute);
        w_0.alive = 1;
        w_0.pos = new THREE.Vector2( 100.0 - (10 % this._width) * 10, 100.0 - (10 / this._height) * 10 );
        w_0.vel = new THREE.Vector2(-0.0125, -0.25);
        w_0.neighbor = 1;
        setWaveParticle(0, wave_particles_attribute, w_0);

        var w_1 = getWaveParticle(1, wave_particles_attribute);
        w_1.alive = 1;
        w_1.pos = new THREE.Vector2( 100.0 - (11 % this._width) * 10, 100.0 - (11 / this._height) * 10 );
        w_1.vel = new THREE.Vector2(0.0125, -0.25);
        w_1.neighbor = 0;
        setWaveParticle(1, wave_particles_attribute, w_1);


        console.log("inited wave particles");
        this._particles.addAttribute( 'wave_particles', wave_particles_attribute);

        // 1-element array that keeps track of number of wave particles - 20 to start for now
        var n_wave_particles = new Uint16Array(1);
        n_wave_particles[0] = 2;
        console.log("initial number of wave particles: ", n_wave_particles);
        this._particles.addAttribute('n_wave_particles', new THREE.BufferAttribute(n_wave_particles, 1));
    }

    this._particleAttributes = this._particles.attributes; // for convenience / less writing / not sure / #badprogramming

    this._sorting = false;
    this._distances = [];
    this._backupArray = new Float32Array( this._maxParticleCount * 4 );

    // Create the drawable particles - this is the object that three.js will use to draw stuff onto screen
    if ( this._wave === true ) {
        this._drawableParticles = new THREE.Mesh( this._particles, this._material );
    } else {
        this._drawableParticles = new THREE.PointCloud( this._particles, this._material );
    }

    return this;
};

Emitter.prototype.restart = function() {
    //console.log("resart");
    for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {

        this._initialized[i] = 0;

    }

    for ( var attributeKey in this._particleAttributes ) {

        var attribute       = this._particleAttributes[attributeKey];
        var attributeArray  = attribute.array;
        var attributeLength = attribute.itemSize;

        for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {
            for ( var j = 0 ; j < attributeLength ; ++j ) {
                attributeArray[ attributeLength * i + j ] = 1e-9;
            }
        }

        attribute.needsUpdate = true;

    }
}

Emitter.prototype.update = function( delta_t ) {
    //console.log("update");
    // how many particles should we add?
    var toAdd = Math.floor( delta_t * this._particlesPerSecond );

    if ( toAdd > 0 ) {
        this._initializer.initialize ( this._particleAttributes, this.getSpawnable( toAdd ), this._width, this._height );
    }

    // add check for existence
    this._updater.update( this._particleAttributes, this._initialized, delta_t, this._width, this._height );

    // sorting -> Move it to camera update / loop update so that it is updated each time even if time is paused?
    if ( this._sorting === true ) {
        this.sortParticles();
    }

    // for visibility culling
    this._drawableParticles.geometry.computeBoundingSphere();

    // particle position change each frame so we need
    if ( this._wave === true ) {
        this._particles.computeVertexNormals();
    }
}


Emitter.prototype.enableSorting = function( val ) {
    this._sorting = val;
};

Emitter.prototype.getDrawableParticles = function () {
    return this._drawableParticles;
};

Emitter.prototype.sortParticles = function () {
    //console.log("sort");
    var positions  = this._particleAttributes.position;
    var cameraPosition = Renderer._camera.position;

    for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {
        var currentPosition =  getElement( i, positions );
        this._distances[i] = [cameraPosition.distanceToSquared( currentPosition ),i];
    }

    this._distances.sort( function( a, b ) { return a[0] < b[0] } );

    for ( var attributeKey in this._particleAttributes ) {

        var attributeLength = this._particleAttributes[ attributeKey ].itemSize;
        var attributeArray  = this._particleAttributes[ attributeKey ].array;

        for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {
            for ( var j = 0 ; j < attributeLength ; ++j ) {
                this._backupArray[4 * i + j ] = attributeArray[ attributeLength * this._distances[i][1] + j ]
            }
        }

        for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {
            for ( var j = 0 ; j < attributeLength ; ++j ) {
                attributeArray[ attributeLength * i + j ] = this._backupArray[4 * i + j ];
            }
        }
    }

    initialized_cpy = []
    for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {
        initialized_cpy[ i ] = this._initialized[ this._distances[i][1] ];
    }

    for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {
        this._initialized[ i ] = initialized_cpy[i];
    }
};

Emitter.prototype.getSpawnable = function ( toAdd ) {
    //console.log("spawn");
    var toSpawn = [];
    for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {

        if ( this._initialized[i] ) continue;
        if ( toSpawn.length >= toAdd ) break;
        this._initialized[i] = true;
        toSpawn.push(i);

    }

    return toSpawn;
};
