# Simulating Ocean Waves using the Wave Particle Approach
Dennis Guo, Roland Fong, Shayan Monshizadeh

Inspired by the realistic wave rendering in the latest Disney Animated Feature, Moana, we decided to create a wave simulator for our project.  Wave and water simulation is a complex task with several different approaches, some of which have a physical basis. Our goal was to implement an efficient, physically-motivated wave with maximal realism that could be rendered at interactive rates.

Of the many approaches in the field of wave simulation, we found three that appealed to us: Simulating Ocean Water [Tessendorf 2008], Wave Particles [Yuksel 2007], and Dispersion Kernels [Canabal and Miraut 2016]. We ended up choosing Wave Particles because it best suited our design goals of a wave that was physically motivated, and easy to set up and manipulate. Simulating Ocean Water [Tessendorf 2001] focused on ocean wave lighting and rendering with a raytracer that we felt our laptops would not be adequate for, and Dispersion Kernels [Canabal and Miraut 2016] was too complicated mathematically.

The Wave Particle Model:  
The approach taken by Wave Particles [Yuksel 2007] and the one that we implemented represents the wave as a height field whose height is determined by the set of wave particles in existence.  At a particular position (x,y)in the height field, we can determine the height, z, by summing up the base height with each local deviation function associated with every wave particle in existence.  That is,
z = z0+iDi(x,t)
Where x=(x,y), the planar position.  This approach is efficient because its rendering time is contingent on the number of wave particles and not the number of particles in the height field, which is the visible wave surface. So if a vast body of water were being simulated the computation would only depend on the number of waves and not the water surface area
 The local deviation function within a certain radius of the particle can be approximated by a sine wave.  The approximation given by Yuksel et al. is
Di(x,t)=ai2(cos(|x-xi|ri)+1)(|x-xi|2ri)
Where aiis the amplitude associated with the particle, riis the radius it affects, xiis the wave particle’s (x,y) position, and (u)is the rectangle function, which is 1 for u < ½ and ½ for u=½ and 0 otherwise.  This ensures that the wave only affects particles within a certain distance.
To add realism, the paper also notes that water particles in real waves tend to follow a circular path.  This is because there is a longitudinal component to the wave.  We add this by modifying the (x,y)coordinates of the surface particles, that is
x'(x,t)=x+iDiL(x,t)
Where we have introduced a longitudinal deviation function DiL(x,t), defined as
DiL(x,t)=-sin(ui(x-xi)ri)(ui(x-xi)2ri)Di(x,t)ui
Where uiis the unit vector pointing in the direction of wave motion.  The equation was derived to ensure that the surface particles ultimately follow a circular path, and when the wave leaves, the particle ends up in the same spot.  This occasionally causes issues for long running simulations, where small errors in the sine function pile up and cause the surface particles to shift slightly after the wave leaves.  This could be ameliorated by periodically shifting the particles back when no wave is nearby.
To simulate waves that expand or contract, the paper introduces the concept of dispersion angles.  Dispersion angles track the distance between neighboring particles and when the particles get too far (e.g. more than half the particle radius) we subdivide them into new particles with a fraction of the amplitude and dispersion angle.
	This approach is limited to a surface wave and cannot simulate anything involving 3D flow since only a single height field is rendered and it does not contain information about volume.

Results:  
We attempt to simulate the wave using different initial positions to yield the results shown below:
Rolling wave from left to right
https://user-images.githubusercontent.com/12766954/30307188-3a3d1670-9731-11e7-9170-65166314d498.png
https://user-images.githubusercontent.com/12766954/30307185-3927cd3e-9731-11e7-9a8d-fe6f9cc1c648.png

Boundary conditions were naively handled by making the wave simply reflect from the side.  The effect of adding longitudinal waves is clearly seen in the third screenshot, where the tops are sharper because the wave is “rolling inwards” on itself.
Our implementation also supports multiple waves from multiple angles and velocities. As you can see below, the amplitudes combine to form a bigger wave once the two waves collide
https://user-images.githubusercontent.com/12766954/30307192-3c256636-9731-11e7-864e-c376e17c9f67.png
https://user-images.githubusercontent.com/12766954/30307193-3d397d14-9731-11e7-9c21-5e52a8725572.png

Expanding wave demonstrating dispersion angle implementation  (also shows water material)
The image below shows the wave starting from one corner of the ocean and moving to the other. This shows that the wave particle model adapts well to changes in position and velocity.
The wave widens over time and also gets smaller since it shrinks upon each subdivision.
https://user-images.githubusercontent.com/12766954/30307196-43592726-9731-11e7-9f78-5fc8c536028d.png
