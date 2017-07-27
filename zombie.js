var zombie = function(url_texture, crafts) {
    var _zombie = this;

    this.model = new THREEx.MinecraftChar(url_texture);
    this.head_anims = new THREEx.MinecraftCharHeadAnimations(this.model);
    this.body_anims = new THREEx.MinecraftCharBodyAnimations(this.model);
    this.head_anims.start('still');

    this.crafts = crafts;

    this.setPos = function(_pos) {
        this.model.root.position.copy(_pos);
    };

    this.state = {};
    this.state.forward = 'walk';
    this.speed = 2;
    this.angularSpeed = 0.2 * Math.PI * 2;
    this.jump_time = 0;
    this.jump_duration = 30;

    this.stateHandle = function(delta, now) {

        if (!hasProp(this.state)) {
            this.body_anims.start('stand');
            return;
        }

        dis = {};
        dis.x = dis.y = dis.z = 0;

        switch (this.state.jump) {
            case 'jump':
                this.body_anims.start('stand');
                if (!this.state.forward) {
                    this.state.forward_jump = 'jump';
                }
                this.state.jump = 'jumping';
                this.jump_time = 0;
                break;
            case 'jumping':
                if (this.jump_time < this.jump_duration) {
                    dis.y = 0.70 / this.jump_duration;
                    this.jump_time += 1;
                    if (this.state.forward) {
                        this.state.forward_jump = 'jump';
                    }
                } else {
                    this.state.jump = 'fall';
                    if (this.state.forward_jump) {
                        dis.z += 0.10;
                        this.state.forward_jump = '';
                    }
                }
                break;
            case 'fall':
                var willStop = 0;
                var target_block = null;
                var vertices = [];
                vertices = vertices.concat(this.model.legL.geometry.vertices);
                vertices = vertices.concat(this.model.legR.geometry.vertices);
                for (var v_index = 0; v_index < vertices.length; v_index++) {
                    var local_v = vertices[v_index];
                    var global_v = local_v.clone().applyMatrix4(this.model.root.matrix);
                    var direction_vector = global_v.sub(this.model.root.position);

                    var ray = new THREE.Raycaster(this.model.root.getWorldPosition(), direction_vector.clone().normalize());
                    var collision_results = ray.intersectObjects(this.crafts);
                    if (collision_results.length > 0 && collision_results[0].distance < direction_vector.length()) {
                        for (obj of collision_results) {
                            if (obj.distance >= direction_vector.length())
                                continue;
                            if (obj.object.position.y + 0.30 > this.model.root.position.y) {
                                if (obj.object.position.y > this.model.root.position.y) {
                                    willStop = -1;
                                    break;
                                }
                                willStop = 1;
                                target_block = obj.object;
                            }
                        }
                        if (willStop < 0) break;
                    }
                }
                if (willStop > 0) {
                    var thingInTop = false;
                    for (var obj of this.crafts) {
                        if (obj.position.equals(target_block.position.clone().add(new THREE.Vector3(0, 0.5, 0)))) {
                            thingInTop = true;
                            break;
                        }
                    }
                    if (!thingInTop) {
                        this.state.jump = '';
                        this.model.root.position.y = target_block.position.y + 0.25;
                        return;
                    }
                }
                if (this.model.root.position.y > 0) {
                    dis.y = -0.5 / this.jump_duration;
                } else {
                    this.model.root.position.y = 0;
                    this.state.jump = '';
                    return;
                }
                break;
            default:
                break;
        }

        if (!this.state.jump && this.state.forward) {
            dis.z += (this.state.forward === 'run') ? this.speed * delta * 2 : this.speed * delta;
            this.body_anims.start(this.state.forward);
        } else if (this.state.backward) {
            dis.z -= this.speed * delta;
            this.body_anims.start('walk');
        }

        if (!this.state.jump && this.state.rotation) {
            //dis.z = (this.state.forward === 'left') ? this.speed * delta : -this.speed * delta;
            this.model.root.rotation.y += ((this.state.rotation === 'left') ? this.angularSpeed * delta : -this.angularSpeed * delta);
        }

        var velocity = new THREE.Vector3(dis.x, dis.y, dis.z);
        var matrix = new THREE.Matrix4().makeRotationY(this.model.root.rotation.y);
        velocity.applyMatrix4(matrix);
        this.model.root.position.add(velocity);

    };

    this.collisionDectect = function() {

        function detect(_mesh) {
            for (var v_index = 0; v_index < _mesh.geometry.vertices.length; v_index++) {
                var local_v = _mesh.geometry.vertices[v_index];
                var global_v = local_v.clone().applyMatrix4(_mesh.matrixWorld);
                var direction_vector = global_v.sub(_mesh.getWorldPosition());

                var ray = new THREE.Raycaster(_mesh.getWorldPosition(), direction_vector.clone().normalize());
                var collision_results = ray.intersectObjects(_zombie.crafts);
                if (collision_results.length > 0 && collision_results[0].distance < direction_vector.length()) {
                    for (obj of collision_results) {
                        if (obj.distance >= direction_vector.length())
                            continue;
                        var forward = new THREE.Vector3(0, 0, 1);
                        forward.applyMatrix4(new THREE.Matrix4().makeRotationY(_zombie.model.root.rotation.y));
                        var dir = obj.object.position.clone().sub(_zombie.model.root.position);
                        dir.y = 0;
                        var isFront = dir.dot(forward);
                        isFront = (isFront > 0) ? true : false;

                        if ((_zombie.state.jump === 'jump' || _zombie.state.jump === 'jumping') &&
                            obj.object.position.y - 0.20 > _zombie.model.root.position.y + 1) {
                            _zombie.state.jump = 'fall';
                            return;
                        }

                        if (_zombie.state.forward && isFront &&
                            obj.object.position.y - 0.20 > _zombie.model.root.position.y &&
                            obj.object.position.y - 0.20 < _zombie.model.root.position.y + 1) {
                            _zombie.state.forward = '';
                            return;
                        }
                        if (_zombie.state.backward && !isFront &&
                            obj.object.position.y >= _zombie.model.root.position.y + 0.20 &&
                            obj.object.position.y - 0.20 < _zombie.model.root.position.y + 1) {
                            _zombie.state.backward = '';
                            return;
                        }
                    }
                }
            }
        }

        detect(this.model.legL);
        detect(this.model.legR);
        detect(this.model.body);
        detect(this.model.head);

        var willFall = true;
        var vertices = [];
        vertices = vertices.concat(this.model.legL.geometry.vertices);
        vertices = vertices.concat(this.model.legR.geometry.vertices);
        vertices = vertices.concat(this.model.body.geometry.vertices);
        vertices = vertices.concat(this.model.head.geometry.vertices);

        for (var v_index = 0; v_index < vertices.length; v_index++) {
            var local_v = vertices[v_index];
            var global_v = local_v.clone().applyMatrix4(this.model.root.matrix);
            var direction_vector = global_v.sub(this.model.root.position);

            var ray = new THREE.Raycaster(this.model.root.getWorldPosition(), direction_vector.clone().normalize());
            var collision_results = ray.intersectObjects(this.crafts);
            if (collision_results.length > 0 && collision_results[0].distance < direction_vector.length()) {
                for (obj of collision_results) {
                    if (obj.distance >= direction_vector.length())
                        continue;

                    if (this.state.jump || obj.object.position.y + 0.25 <= this.model.root.position.y)
                        willFall = false;
                }
            }
        }

        if (willFall && this.model.root.position.y > 0 && !this.state.jump) {
            this.state.jump = 'fall';
        }

    };

    this.update = function(delta, now) {
        _zombie.state.forward = 'walk';
        _zombie.collisionDectect();
        if (!_zombie.state.forward)
            _zombie.model.root.rotation.y += _zombie.angularSpeed * delta;
        _zombie.stateHandle(delta, now);
        _zombie.head_anims.update(delta, now);
        _zombie.body_anims.update(delta, now);
    }
}

var generate_zombie = function(_pos, crafts) {
    for (var obj of crafts) {
        if (obj.position.equals(_pos.clone().add(new THREE.Vector3(0, 0.5, 0))) ||
            obj.position.equals(_pos.clone().add(new THREE.Vector3(0, 1.0, 0))))
            return undefined;
    }

    var res = new zombie('resource/zombie.png', crafts);
    res.setPos(_pos.clone().add(new THREE.Vector3(0, 0.25, 0)));
    return res;
}