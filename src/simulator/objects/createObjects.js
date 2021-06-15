import { BoxBufferGeometry,
         MeshPhongMaterial,
         CylinderGeometry,
         SphereGeometry,
         Vector3,
         Mesh,
         LoadingManager,
         Object3D,
         Box3,
         Euler,
         Quaternion } from 'three';

import { Vec3 } from 'cannon-es';

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

import * as Blockly from 'blockly/core';

import { SimObject } from './simObject';

import { makeRock } from './rock';

import { requestAF,
         getScene,
         getRobot,
         getControl } from '../scene';

import { getWorld } from '../physics';

let simObjects = [];

//Functions for creating meshes
//Loader for stl
function loadShaft(simObject) {
    const filePath = '/models/simObject_shapes/shaft/shaft.stl';
    const loader = new STLLoader();
    const size = new Vector3();
    return new Promise((resolve) => {
        loader.load(
            filePath, (geometry) =>  {
            const material = new MeshPhongMaterial( { color: simObject.colour} );
            const mesh = new Mesh( geometry, material );
            mesh.scale.set(0.03, 0.03, 0.03);
            mesh.geometry.computeBoundingBox();
            mesh.geometry.center();
            const tmpBox = new Box3().setFromObject(mesh);
            tmpBox.getSize(size);
            console.log(size);
            simObject.size.copy(size);
            console.log(simObject.size);
            simObject.add( mesh );
        });
    });
}

//Simple box shape
function createBoxMesh(simObject) {
    const geometry = new BoxBufferGeometry( simObject.size.x,
                                            simObject.size.y,
                                            simObject.size.z,
                                            10,
                                            10);

    const material = new MeshPhongMaterial({ color: simObject.colour });
    const mesh = new Mesh(geometry, material);
    return mesh;
}

//Simple cylinder
function createCylinderMesh(simObject) {
    const cylinderMesh = new Mesh();
    cylinderMesh.geometry = new CylinderGeometry(.3, 0, .5, 10);
    cylinderMesh.material = new MeshPhongMaterial({ color: simObject.colour });
    return cylinderMesh;
}

function createSphereMesh(simObject) {
    const mesh = new Mesh();
    mesh.geometry = new SphereGeometry( simObject.size.z * 0.5, 32, 32 );
    mesh.material = new MeshPhongMaterial({ color: simObject.colour });
    return mesh;
}

//adds a geometry to a simObject
export function addGeometry(simObject) {
    const size = new Vector3();
    switch (simObject.shape) {
        case 'cube':
            simObject.size.copy(new Vector3(.5, .5, .5));
            const cubeMesh = createBoxMesh(simObject);
            const tmpCube = new Box3().setFromObject(cubeMesh);
            simObject.bodyShape = 'box';
            tmpCube.getSize(size);
            simObject.size.copy(size);
            simObject.add(cubeMesh);
            simObject.createBody(0.5, 2, 0.1);//mass, friction, restitution
            break;
        case 'rock':
            const rockMesh = makeRock(50, simObject.size.z, simObject.colour);
            rockMesh.geometry.computeBoundingBox();
            rockMesh.geometry.center();
            const tmpBox = new Box3().setFromObject(rockMesh);
            tmpBox.getSize(size);
            simObject.bodyShape = 'box';
            size.x += Math.random() * 0.001;
            size.y += Math.random() * 0.001;
            size.z += Math.random() * 0.001;
            simObject.size.copy(size);
            simObject.add(rockMesh);
            simObject.createBody(3, 2, 0.01);//mass, friction, restitution
            break;
        case 'sphere':
            const sphereMesh = createSphereMesh(simObject);
            sphereMesh.geometry.computeBoundingSphere();
            sphereMesh.geometry.computeBoundingBox();
            const tmp = new Box3().setFromObject(sphereMesh);
            tmp.getSize(size);
            console.log(size);
            simObject.size = size;
            simObject.radius = sphereMesh.geometry.boundingSphere.radius;
            simObject.bodyShape = 'sphere';
            simObject.add(sphereMesh);
            simObject.createBody(2.1, 1, 0.1);//mass, friction, restitution
            simObject.size.copy(size);
            break;
        case 'shaft':
            const assetPath = '/models/simObject_shapes/shaft/shaft.stl';
            loadAssetSTL(simObject, assetPath);
            break;
        case 'custom':
            loadUserSTL(simObject); //Body creation etc in event callback
            break;
        default:
            console.error('Unknown SimObject shape: ', simObject.shape);
            break;
    }
}

function loadAssetSTL(simObject, assetPath) {
    //const filePath = '/models/simObject_shapes/shaft/shaft.stl';
    const loader = new STLLoader();
    const size = new Vector3();
    loader.load(
        assetPath, (geometry) =>  {
        const material = new MeshPhongMaterial( { color: simObject.colour} );
        const mesh = new Mesh( geometry, material );
        mesh.scale.set(0.03, 0.03, 0.03);
        mesh.rotateX(Math.PI/2);
        mesh.geometry.computeBoundingBox();
        mesh.geometry.center();
        const tmpBox = new Box3().setFromObject(mesh);
        tmpBox.getSize(size);
        console.log(size);
        simObject.size.copy(size);
        console.log(simObject.size);
        simObject.add( mesh );
        simObject.bodyShape = 'cylinder';
        simObject.createBody(5, 2, 0.1);//mass, friction, restitution
        simObject.render();
        console.log(simObject);
    });
}

function loadUserSTL(simObject) {
    const upload = document.createElement('input');
    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
        const data = event.target.result;
        loadSTL(simObject, data);
    });

    upload.setAttribute('type', 'file');
    upload.setAttribute('accept', '.stl');
    upload.onchange = (fileSelectedEvent) => {
        try {
            const file = fileSelectedEvent.target.files[0];
            reader.readAsArrayBuffer(file);
        }
        catch (e) { console.log(e); }
    }
    document.body.appendChild(upload);
    upload.click();
    document.body.removeChild(upload);
}

function loadSTL(simObject, data){
    const geometry = new STLLoader().parse( data );
    const material = new MeshPhongMaterial({color: simObject.colour});
    const mesh = new Mesh();
    const size = new Vector3();
    const scaleFactor = simObject.defaultScaleFactor;
    mesh.geometry = geometry;
    mesh.material = material;
    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    mesh.geometry.computeBoundingBox();
    mesh.geometry.center();
    const tmpBox = new Box3().setFromObject(mesh);
    tmpBox.getSize(size);
    simObject.size.copy(size);
    simObject.add(mesh);
    simObject.bodyShape = 'box';
    simObject.createBody(5, 2, 0.1);
    simObject.render();
}

//Adds the simObject
export function addSimObject(blockUUID, fieldValues, pickedColour, shape) {
    let simObject = new SimObject;
    simObject.name = blockUUID;
    simObjects.push(simObject);
    simObject.shape = shape;
    if (pickedColour != undefined) {
        simObject.colour = pickedColour;
    }//else default is orange
    addGeometry(simObject);
    if (fieldValues != undefined) {
        simObject.setFieldValues(fieldValues);
        simObject.updateFromFieldValues();
    } else {
        simObject.setFieldValues(simObject.fieldValues);
        simObject.updateFromFieldValues();
    }
    simObject.addToScene();
    if (simObjects.length > 1) {
        placeCubes(simObject);
        simObject.updateFieldValues();
        simObject.updatePoseBlock();
    }
    simObject.checkCollision = true;
    simObject.updateBody();
}

//stacks cubes, until there are no more cubes to stack
export function placeCubes(simObject){
    let shift = 0;
    for (let k = 0; k < simObjects.length; k++) {
        if (simObject.position.distanceTo(simObjects[k].position)
                    < (simObject.size.z * .5)
                    && simObject.name != simObjects[k].name) {
            shift = simObject.size.z;
        }
    }
    console.log('shift', shift);
    if (shift > 0) {
        simObject.position.z = simObject.position.z + shift;
        return placeCubes(simObject);
    } else {
        return;
    }
}

//Removes the simObject from the simObjects array and from the threejs scene
export function remSimObjects(ids) {
    for (const id of ids) {
        const deletedSimObject = simObjects.find(simObject => simObject.name === id);
        const idx = simObjects.findIndex(simObject => simObject.name === id);
        if (deletedSimObject != undefined) {
            deletedSimObject.removeFromScene();
            simObjects.splice(idx, 1);
        }
    }
}

//reset all simObjects in the scene
export function resetAllSimObjects () {
    if (simObjects.length > 0) {
        for (const simObject of simObjects) {
            simObject.reset();
        }
    }
}

//transformControl event functions
//Lights simObjects on mouseover, is called in scene.js by mouseover
export function setSimObjectHighlight(raycaster) {
    const intersections = raycaster.intersectObjects(simObjects, true);
    const intersected = intersections.length > 0;
    const workspace = Blockly.getMainWorkspace();
    if (intersected) {
        const intersectedSimObj = intersections[0].object.parent;
        if (intersectedSimObj.highlighted != intersected) {
            intersectedSimObj.highlight(intersected);
            workspace.highlightBlock(intersectedSimObj.name);
            const limit = simObjects.length;
            for (let i = 0; i < limit; i++) {
                if (intersectedSimObj.name != simObjects[i].name) {
                    simObjects[i].highlight(false);
                }
            }
        }
    } else {
        const limit = simObjects.length;
        for (let i = 0; i < limit; i++) {
            simObjects[i].highlight(false);
            workspace.highlightBlock(null);
        }
    }
}

export function setTCSimObjectsOnClick(raycaster) {
    const intersections = raycaster.intersectObjects(simObjects, true);
    const intersected = intersections.length > 0 && intersections[0].object.parent.highlighted;
    const scene = getScene();
    if (intersected) {
        const intersectedSimObj = intersections[0].object.parent;
        if (intersectedSimObj.control.visible != intersected) {
            if (intersectedSimObj.attached) {
                return;
            } else {
                intersectedSimObj.control.setMode('rotate');
                intersectedSimObj.control.visible = true;
                intersectedSimObj.control.enabled = true;
            }
        }
        const mode = intersectedSimObj.control.getMode();
        scene.remove(intersectedSimObj.control);
        if (mode == 'translate'){
            intersectedSimObj.control.setMode('rotate');
        }
        if (mode == 'rotate'){
            intersectedSimObj.control.setMode('translate');
        }
        scene.add(intersectedSimObj.control);

    } else {
        const limit = simObjects.length;
        for (let i = 0; i < limit; i++) {
            simObjects[i].control.visible = false;
            simObjects[i].control.enabled = false;
        }
    }
    requestAF();
}

//Functions for getting simObjects
export function getSimObjectsNames() {
    let simObjectsNames = [];
    simObjects.forEach(simObject => {simObjectsNames.push(simObject.name)});
    return simObjectsNames
}

//Returns all simObjects
export function getSimObjects() {
    let returnVal = undefined;
    if (simObjects.length > 0) {
        returnVal = simObjects;
    }
    return returnVal;
}

//Returns the simObject by name (the uuid of the blockly block)
export function getSimObject(simObjectName) {
    let returnVal = undefined;
        for (let i = 0; i < simObjects.length; i++) {
            if (simObjectName == simObjects[i].name) { returnVal = simObjects[i]; }
        }
     return returnVal;
}

//Returns the index of a simObject in the simObjects array
export function getSimObjectIdx(simObjectName) {
    let returnVal = undefined;
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].name == simObjectName){ returnVal = i; }
    }
    return returnVal;
}

//Returns the simObject to a corresponding threejs world position, with given accuracy
export function getSimObjectByPos(position, accuracy) {
    let returnVal = undefined;
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].position.distanceTo(position) <= accuracy) {
            returnVal = simObjects[i];
        }
    }
    return returnVal;
}

export function checkGripperOrientation(simObject, robot) {
    let returnVal = true;
    if (simObject != undefined) {
        const tcpQuat = new Quaternion();
        const simQuat = new Quaternion();
        const tcp = robot.tcp.object;
        const tcpUp = new Vector3(1, 0, 0);
        const simUp = new Vector3(1, 0, 0);
        simObject.getWorldQuaternion(simQuat);
        tcp.getWorldQuaternion(tcpQuat);
        tcpUp.applyQuaternion(tcpQuat);
        simUp.applyQuaternion(simQuat);
        console.log(robot.tcp.object);
        console.log(tcpUp);
        console.log(simUp);
    } else {
        returnVal = false;
    }
    return returnVal;
}

export function checkGrippable(simObject, robot) {
    let returnVal = true;
    return returnVal;
}
//Determin if a simobject is attached to the TCP
export function isAttached() {
    let attached = false;
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].attached == true) { attached = true; }
    }
    return attached;
}

//Return the first attached simObject
export function getAttachedObject() {
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].attached == true) { return simObjects[i] }
    }
}

//Utils
//Random integers. They are essential. Not uesed right now.
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

//random colours for fancy cubes
export function randomColour() {
    const hexDigits = '0123456789ABCDEF';
    let colour = '#';
    for (let i = 0; i < 6; i++) {
        colour += hexDigits[Math.floor(Math.random() * 16)];
    }
    return colour;
}

export function vector3ToVec3(vector3) {
    console.log(vector3);
    const result = new Vec3();
    result.x = vector3.x;
    result.y = vector3.y;
    result.z = vector3.z;
    return result;
}

export function vec3ToVector3(vec3) {
    const result = new Vector3();
    result.x = vec3.x;
    result.y = vec3.y;
    result.z = vec3.z;
    return result;
}
