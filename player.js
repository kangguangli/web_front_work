var player = function(url_texture, _camera, crafts) {
    var _player = this;

    this.model = new THREEx.MinecraftChar(url_texture);
    this.head_anims = new THREEx.MinecraftCharHeadAnimations(this.model);
    this.body_anims = new THREEx.MinecraftCharBodyAnimations(this.model);
    this.head_anims.start('still');

    this.crafts = crafts;

    this.keymap = {
        D: 68,
        d: 100,
        W: 87,
        w: 119,
        A: 65,
        a: 97,
        S: 83,
        s: 115,
        right: 39,
        up: 38,
        left: 37,
        down: 40,
        blank: ' '.charCodeAt(0),
    };

    this.model.root.position.set(0, 0, 0);
    this.model.head.add(_camera);
    this.camera = new PerspectiveControl(_camera, this);

    this.state = {};
    this.speed = 2;
    this.angularSpeed = 0.2 * Math.PI * 2;
    this.jump_time = 0;
    this.jump_duration = 30;

    this.keyUp = function(evt) {

        switch (evt.keyCode) {
            case _player.keymap.W:
            case _player.keymap.w:
            case _player.keymap.up:
                _player.state.forward = '';
                break;
            case _player.keymap.S:
            case _player.keymap.s:
            case _player.keymap.down:
                _player.state.backward = '';
                break;
            case _player.keymap.A:
            case _player.keymap.a:
            case _player.keymap.left:
                _player.state.rotation = '';
                break;
            case _player.keymap.D:
            case _player.keymap.d:
            case _player.keymap.right:
                _player.state.rotation = '';
                break;
            case _player.keymap.blank:
                //_player.state.jump = '';
                break;
            default:
                break;
        }
    };

    this.keyRealease = function(evt) {
        switch (evt.keyCode) {
            case _player.keymap.W:
            case _player.keymap.w:
            case _player.keymap.up:
                _player.state.forward = evt.shiftKey ? 'run' : 'walk';
                break;
            case _player.keymap.S:
            case _player.keymap.s:
            case _player.keymap.down:
                _player.state.backward = 'walk';
                break;
            case _player.keymap.A:
            case _player.keymap.a:
            case _player.keymap.left:
                _player.state.rotation = 'left';
                break;
            case _player.keymap.D:
            case _player.keymap.d:
            case _player.keymap.right:
                _player.state.rotation = 'right';
                break;
            case _player.keymap.blank:
                if (!_player.state.jump)
                    _player.state.jump = 'jump';
                break;
            default:
                break;
        }
    };

    this.leftClick = function(event) {
        var distance = 5;

        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), _player.camera.root);
        var results = raycaster.intersectObjects(_player.crafts);
        if (results.length > 0 && results[0].distance < 5) {
            if (results[0].object.name === 'block') {
                console.log('remove');
                _player.model.root.parent.remove(results[0].object);
                var index;
                for (index = 0; index < _player.crafts.length; index++)
                    if (_player.crafts[index] === results[0].object)
                        break;
                if (index < _player.crafts.length)
                    _player.crafts.splice(index, 1);
            }
        }

    };
    this.rightClick = function(event) {
        console.log('right_click');
        var distance = 5;

        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), _player.camera.root);
        var results = raycaster.intersectObjects(_player.crafts);
        if (results.length > 0 && results[0].distance < 5) {
            console.log('results[0]: ', results[0].object.name);
            if (results[0].object.name === 'block') {
                var _block = generate_block('grass_block');
                _block.setPos(results[0].object.getWorldPosition().add(results[0].face.normal.multiplyScalar(0.5)));
                _player.model.root.parent.add(_block.cube);
                _player.crafts.push(_block.cube);
                console.log('should be there ', _block.cube.position);
            }
        }

        event.cancelBubble = true;
        event.returnValue = false;
        return false; //remove context menu
    };

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
                    dis.y = 0.75 / this.jump_duration;
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
                var vertices = [];
                vertices = vertices.concat(this.model.legL.geometry.vertices);
                vertices = vertices.concat(this.model.legR.geometry.vertices);
                for (var v_index = 0; v_index < vertices.length; v_index++) {
                    var local_v = vertices[v_index];
                    var global_v = local_v.applyMatrix4(this.model.root.matrix);
                    var direction_vector = global_v.sub(this.model.root.position);

                    var ray = new THREE.Raycaster(this.model.root.getWorldPosition(), direction_vector.clone().normalize());
                    var collision_results = ray.intersectObjects(this.crafts);
                    if (collision_results.length > 0 && collision_results[0].distance < direction_vector.length()) {
                        if (collision_results[0].object.position.y + 0.25 >= this.model.root.position.y) {
                            console.log(collision_results[0].object.position.y + 0.25, this.model.root.position.y);
                            this.state.jump = '';
                            this.model.root.position.y = collision_results[0].object.position.y + 0.25;
                            return;
                        }
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

        var willFall = true;

        var vertices = [];
        vertices = vertices.concat(this.model.legL.geometry.vertices);
        vertices = vertices.concat(this.model.legR.geometry.vertices);
        vertices = vertices.concat(this.model.body.geometry.vertices);
        vertices = vertices.concat(this.model.head.geometry.vertices);
        vertices = vertices.concat(this.model.armL.geometry.vertices);
        vertices = vertices.concat(this.model.armR.geometry.vertices);
        for (var v_index = 0; v_index < vertices.length; v_index++) {
            var local_v = vertices[v_index];
            var global_v = local_v.applyMatrix4(this.model.root.matrix);
            var direction_vector = global_v.sub(this.model.root.position);

            var ray = new THREE.Raycaster(this.model.root.getWorldPosition(), direction_vector.clone().normalize());
            var collision_results = ray.intersectObjects(this.crafts);
            if (collision_results.length > 0 && collision_results[0].distance < direction_vector.length()) {
                for (obj of collision_results) {
                    var forward = new THREE.Vector3(0, 0, 1);
                    forward.applyMatrix4(new THREE.Matrix4().makeRotationY(_player.model.root.rotation.y));
                    var dir = obj.object.position.clone().sub(_player.model.root.position);
                    dir.y = 0;
                    var isFront = dir.dot(forward);
                    isFront = (isFront > 0) ? true : false;
                    if (this.state.jump || obj.object.position.y + 0.25 <= this.model.root.position.y)
                        willFall = false;

                    if (this.state.forward && isFront &&
                        obj.object.position.y - 0.25 >= this.model.root.position.y) {
                        this.state.forward = '';
                        console.log('f');
                        return;
                    }
                    if (this.state.backward && !isFront &&
                        obj.object.position.y >= this.model.root.position.y + 0.25) {
                        this.state.backward = '';
                        console.log('b');
                        return;
                    }
                }
            }
        }

        if (willFall && this.model.root.position.y > 0 && !this.state.jump)
            this.state.jump = 'fall';
    };

    this.update = function(delta, now) {
        this.collisionDectect();
        this.stateHandle(delta, now);
        this.head_anims.update(delta, now);
        this.body_anims.update(delta, now);
        this.camera.update(delta, now);
    };

    document.body.addEventListener('keyup', this.keyUp);
    document.body.addEventListener('keydown', this.keyRealease);
    document.body.addEventListener('click', this.leftClick);
    document.body.addEventListener('contextmenu', this.rightClick);
}


function hasProp(obj) {

    for (var p in obj) {
        if (obj[p]) return true;
    }

    return false;
}