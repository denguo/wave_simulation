var SystemSettings = SystemSettings || {};

////////////////////////////////////////////////////////////////////////////////
// Wave
////////////////////////////////////////////////////////////////////////////////

SystemSettings.wave = {

    // Particle Material
    particleMaterial :  new THREE.MeshLambertMaterial( { color:0x0077be, side: THREE.DoubleSide  } ),

    // Initializer
    initializerFunction : WaveInitializer,
    initializerSettings : {
        position: new THREE.Vector3 ( 0.0, -10.0, 0.0),
        color:    new THREE.Vector4 ( 0.0, 0.0, 0.0, 1.0 ),
        velocity: new THREE.Vector3 ( 0.0, 0.0, 0.0),
    },

    // Updater
    updaterFunction : WaveUpdater,
    updaterSettings : {
        externalForces : {
            gravity :     new THREE.Vector3( 0, 0, 0),
            attractors : [],
        },
        collidables: {
        },
    },

    // Scene
    maxParticles:  900,
    particlesFreq: 1000,
    createScene : function () {
        //var sphere_geo = new THREE.SphereGeometry( 50.0, 32, 32 );
        //var phong      = new THREE.MeshPhongMaterial( {color: 0x444444, emissive:0x442222, side: THREE.DoubleSide } );

        //Scene.addObject( new THREE.Mesh( sphere_geo, phong ) );

    },

    // Wave specific settings
    wave : true,
    width : 30,
    height : 30,
};
