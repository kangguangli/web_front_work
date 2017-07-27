var blocks = function(materials, name) {
    this.name = name;
    this.cube = new THREE.Mesh(new THREE.CubeGeometry(0.5, 0.5, 0.5), materials);
    this.cube.name = 'block';
    this.update = function(delta, now) {

    };
    this.setPos = function(_pos) {
        this.cube.position.copy(_pos);
    };
}

var grass_block_materials = [];
for (var i = 0; i < 2; i++)
    grass_block_materials.push(new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('resource/grass_side.png'),
    }));
grass_block_materials.push(new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('resource/grass_top.png'),
    color: 0x7FC14E,
}));
grass_block_materials.push(new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('resource/dirt.png'),
}));

for (var i = 0; i < 2; i++)
    grass_block_materials.push(new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('resource/grass_side.png'),
    }));

var log_oak_materials = ['resource/log_oak.png', 'resource/log_oak.png',
    'resource/log_oak_top.png', 'resource/log_oak_top.png',
    'resource/log_oak.png', 'resource/log_oak.png'
];
log_oak_materials.forEach(function(value, index) {
    log_oak_materials[index] = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture(log_oak_materials[index]),
    });
})

var cobble_stone_materials = ['resource/cobblestone.png', 'resource/cobblestone.png',
    'resource/cobblestone.png', 'resource/cobblestone.png',
    'resource/cobblestone.png', 'resource/cobblestone.png',
];
cobble_stone_materials.forEach(function(value, index) {
    cobble_stone_materials[index] = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture(cobble_stone_materials[index]),
    });
})

var generate_block = function(name) {
    switch (name) {
        case 'grass_block':
            return new blocks(grass_block_materials, 'grass_block');
        case 'log_oak':
            return new blocks(log_oak_materials, 'log_oak');
        case 'cobble_stone':
            return new blocks(cobble_stone_materials, 'cobble_stone');
        default:
            return undefined;
    };
}