
////////////////////////////////////////////////////////////////////////////////
// Utility function to accessing correct element in arrays                    //
////////////////////////////////////////////////////////////////////////////////

function getLength( attrib ) {
  return attrib.array.length / attrib.itemSize;
}

// wave has alive, (x,y) pos, amplitude, (x,y) vel (5 components)
function getWaveParticle( i, attrib ) {
  return {
    alive: attrib.array[6*i],
    pos: new THREE.Vector2(attrib.array[6*i + 1], attrib.array[6*i + 2]),
    amp: attrib.array[6*i + 3],
    vel: new THREE.Vector2(attrib.array[6*i + 4], attrib.array[6*i + 5]),
    disp: attrib.array[6*i + 6],
    neighbor: attrib.array[6*i + 7]
  }
}

function setWaveParticle(i, attrib, val) {
  attrib.array[6*i] = val.alive;
  attrib.array[6*i + 1] = val.pos.x;
  attrib.array[6*i + 2] = val.pos.y;
  attrib.array[6*i + 3] = val.amp;
  attrib.array[6*i + 4] = val.vel.x;
  attrib.array[6*i + 5] = val.vel.y;
  attrib.array[6*i + 6] = val.disp;
  attrib.array[6*i + 7] = val.neighbor;
}

function getElement ( i, attrib ) {
    if ( attrib.itemSize === 1 ) {

        return attrib.array[i];

    } else if ( attrib.itemSize === 2) {

        return new THREE.Vector2( attrib.array[ 2 * i     ],
                                  attrib.array[ 2 * i + 1 ] );

    } else if ( attrib.itemSize === 3 ) {

        return new THREE.Vector3( attrib.array[ 3 * i     ],
                                  attrib.array[ 3 * i + 1 ],
                                  attrib.array[ 3 * i + 2 ] );

    } else if ( attrib.itemSize === 4 ) {

        return new THREE.Vector4( attrib.array[ 4 * i     ],
                                  attrib.array[ 4 * i + 1 ],
                                  attrib.array[ 4 * i + 2 ],
                                  attrib.array[ 4 * i + 3 ] );

    } else {

        console.log( "Not handled attribute size for attribute: ", attrib );
        return undefined;

    }
};

function getGridElement ( i, j, width, attrib ) {
    var idx = j * width + i;
    if ( attrib.itemSize === 1 ) {

        return attrib.array[idx];

    } else if ( attrib.itemSize === 3 ) {

        return new THREE.Vector3( attrib.array[ 3 * idx     ],
                                  attrib.array[ 3 * idx + 1 ],
                                  attrib.array[ 3 * idx + 2 ] );

    } else if ( attrib.itemSize === 4 ) {

        return new THREE.Vector4( attrib.array[ 4 * idx     ],
                                  attrib.array[ 4 * idx + 1 ],
                                  attrib.array[ 4 * idx + 2 ],
                                  attrib.array[ 4 * idx + 3 ] );

    } else {

        console.log( "Not handled attribute size for attribute: ", attrib );
        return undefined;

    }
};

function setElement ( i, attrib, val ) {
    if ( attrib.itemSize === 1 ) {

        attrib.array[i] = val;

    } else if ( attrib.itemSize === 3 ) {

        attrib.array[ 3 * i     ] = val.x;
        attrib.array[ 3 * i + 1 ] = val.y;
        attrib.array[ 3 * i + 2 ] = val.z;

    } else if ( attrib.itemSize === 4 ) {

        attrib.array[ 4 * i     ] = val.x;
        attrib.array[ 4 * i + 1 ] = val.y;
        attrib.array[ 4 * i + 2 ] = val.z;
        attrib.array[ 4 * i + 3 ] = val.w;

    } else {

        console.log( "Not handled attribute size for attribute: ", attrib );
        return undefined;

    }
}

function setGridElement ( i, j, width, attrib, val ) {
    var idx = j * width + i;
    if ( attrib.itemSize === 1 ) {

        attrib.array[idx] = val;

    } else if ( attrib.itemSize === 3 ) {

        attrib.array[ 3 * idx     ] = val.x;
        attrib.array[ 3 * idx + 1 ] = val.y;
        attrib.array[ 3 * idx + 2 ] = val.z;

    } else if ( attrib.itemSize === 4 ) {

        attrib.array[ 4 * idx     ] = val.x;
        attrib.array[ 4 * idx + 1 ] = val.y;
        attrib.array[ 4 * idx + 2 ] = val.z;
        attrib.array[ 4 * idx + 3 ] = val.w;

    } else {

        console.log( "Not handled attribute size for attribute: ", attrib );
        return undefined;

    }
}

function killPartilce ( i, partilceAttributes, alive ) {
    alive[i] = false;
    setElement( i, partilceAttributes.position, new THREE.Vector3(-1e9) );
}
