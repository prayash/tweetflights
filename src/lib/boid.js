import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';

var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

// Based on http://www.openprocessing.org/visuals/?visualID=6910
class Boid {
  constructor() {
    var vector = new THREE.Vector3(),
      _acceleration,
      _width = 500,
      _height = 500,
      _depth = 200,
      _goal,
      _neighborhoodRadius = 100,
      _maxSpeed = 4,
      _maxSteerForce = 0.1,
      _avoidWalls = false;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    _acceleration = new THREE.Vector3();
    this.trail_initialized = false;

    // delay so trails grow organically
    setTimeout(() => {
      this.initTrail();
    }, 250);
  }

  initTrail() {
    // Create the line geometry used for storing verticies
    this.trail_geometry = new THREE.Geometry();
    for (var i = 0; i < 100; i++) {
      // must initialize it to the number of positions it will keep or it will throw an error
      this.trail_geometry.vertices.push(this.position.clone());
    }
    // Create the line mesh
    this.trail_line = new MeshLine();
    this.trail_line.setGeometry(this.trail_geometry, function(p) {
      return p;
    }); // makes width taper
    // Create the line material
    this.trail_material = new MeshLineMaterial({
      color: new THREE.Color("rgb(255, 2, 2)"),
      opacity: 1,
      resolution: resolution,
      sizeAttenuation: 1,
      lineWidth: 1,
      near: 1,
      far: 100000,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      transparent: false,
      side: THREE.DoubleSide
    });
    this.trail_mesh = new THREE.Mesh(this.trail_line.geometry, this.trail_material); // this syntax could definitely be improved!
    this.trail_mesh.frustumCulled = false;
    scene.add(this.trail_mesh);
    this.trail_initialized = true;
  };

  setGoal(target) {
    _goal = target;
  };

  setAvoidWalls(value) {
    _avoidWalls = value;
  };

  setWorldSize(width, height, depth) {
    _width = width;
    _height = height;
    _depth = depth;
  };

  run(boids) {
    if (_avoidWalls) {
      vector.set(-_width, this.position.y, this.position.z);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      vector.set(_width, this.position.y, this.position.z);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      vector.set(this.position.x, -_height, this.position.z);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      vector.set(this.position.x, _height, this.position.z);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      vector.set(this.position.x, this.position.y, -_depth);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      vector.set(this.position.x, this.position.y, _depth);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
    }/* else {
						this.checkBounds();
					}
					*/
    if (Math.random() > 0.5) {
      this.flock(boids);
    }
    this.move();
  };

  flock(boids) {
    if (_goal) {
      _acceleration.add(this.reach(_goal, 0.005));
    }
    _acceleration.add(this.alignment(boids));
    _acceleration.add(this.cohesion(boids));
    _acceleration.add(this.separation(boids));
  };

  move() {
    this.velocity.add(_acceleration);
    var l = this.velocity.length();
    if (l > _maxSpeed) {
      this.velocity.divideScalar(l / _maxSpeed);
    }
    this.position.add(this.velocity);
    _acceleration.set(0, 0, 0);
    // Advance the trail by one position
    if (this.trail_initialized)
      this.trail_line.advance(this.position);
    };

  checkBounds() {
    if (this.position.x > _width)
      this.position.x = -_width;
    if (this.position.x < -_width)
      this.position.x = _width;
    if (this.position.y > _height)
      this.position.y = -_height;
    if (this.position.y < -_height)
      this.position.y = _height;
    if (this.position.z > _depth)
      this.position.z = -_depth;
    if (this.position.z < -_depth)
      this.position.z = _depth;
    };

  //
  avoid(target) {
    var steer = new THREE.Vector3();
    steer.copy(this.position);
    steer.sub(target);
    steer.multiplyScalar(1 / this.position.distanceToSquared(target));
    return steer;
  };

  repulse(target) {
    var distance = this.position.distanceTo(target);
    if (distance < 150) {
      var steer = new THREE.Vector3();
      steer.subVectors(this.position, target);
      steer.multiplyScalar(0.5 / distance);
      _acceleration.add(steer);
    }
  };

  reach(target, amount) {
    var steer = new THREE.Vector3();
    steer.subVectors(target, this.position);
    steer.multiplyScalar(amount);
    return steer;
  };

  alignment(boids) {
    var boid,
      velSum = new THREE.Vector3(),
      count = 0;
    for (var i = 0, il = boids.length; i < il; i++) {
      if (Math.random() > 0.6)
        continue;
      boid = boids[i];
      distance = boid.position.distanceTo(this.position);
      if (distance > 0 && distance <= _neighborhoodRadius) {
        velSum.add(boid.velocity);
        count++;
      }
    }
    if (count > 0) {
      velSum.divideScalar(count);
      var l = velSum.length();
      if (l > _maxSteerForce) {
        velSum.divideScalar(l / _maxSteerForce);
      }
    }
    return velSum;
  };

  cohesion(boids) {
    var boid,
      distance,
      posSum = new THREE.Vector3(),
      steer = new THREE.Vector3(),
      count = 0;
    for (var i = 0, il = boids.length; i < il; i++) {
      if (Math.random() > 0.6)
        continue;
      boid = boids[i];
      distance = boid.position.distanceTo(this.position);
      if (distance > 0 && distance <= _neighborhoodRadius) {
        posSum.add(boid.position);
        count++;
      }
    }
    if (count > 0) {
      posSum.divideScalar(count);
    }
    steer.subVectors(posSum, this.position);
    var l = steer.length();
    if (l > _maxSteerForce) {
      steer.divideScalar(l / _maxSteerForce);
    }
    return steer;
  };

  separation(boids) {
    var boid,
      distance,
      posSum = new THREE.Vector3(),
      repulse = new THREE.Vector3();
    for (var i = 0, il = boids.length; i < il; i++) {
      if (Math.random() > 0.6)
        continue;
      boid = boids[i];
      distance = boid.position.distanceTo(this.position);
      if (distance > 0 && distance <= _neighborhoodRadius) {
        repulse.subVectors(this.position, boid.position);
        repulse.normalize();
        repulse.divideScalar(distance);
        posSum.add(repulse);
      }
    }
    return posSum;
  }
}
