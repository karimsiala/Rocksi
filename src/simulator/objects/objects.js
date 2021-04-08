<<<<<<< HEAD
import { BoxBufferGeometry,
         MeshPhongMaterial,
         CylinderGeometry } from 'three';
=======
import * as THREE from 'three';
import { addMesh,
         remMesh,
         getMesh,
         moveMesh,
         rotMesh,
         addToTCP,
         remFromTCP } from '../scene';
<<<<<<< HEAD
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
=======
import { createBody, updateBodys } from '../physics';
>>>>>>> 3862ed5 (Started to add physics to the simulation. Not really working right now. Object pickup is broken, in this commit. Objects only fall if you move the camera, this is intentional.)

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import * as Blockly from 'blockly/core'

import { SimObject } from './simObject'

import { requestAF,
         getScene,
         getRobot,
         getControl } from '../scene';

import { getWorld } from '../physics';

let simObjects = [];

<<<<<<< HEAD
//Functions for creating meshes
function createBoxMesh(simObject) {
    const geometry = new BoxBufferGeometry( simObject.size.x,
                                            simObject.size.y,
                                            simObject.size.z,
                                            10,
                                            10);

    const material = new MeshPhongMaterial({ color: simObject.colour });
    return [geometry, material];
}

function createCylinderMesh(simObject) {
    simObject.geometry = new CylinderGeometry(.3,
                                                    0,
                                                        .5,
                                                        10);

    simObject.material = new MeshPhongMaterial({ color: simObject.colour });
    return [geometry, material];
}

function addGeometry(simObject) {
    switch (simObject.type) {
        case 'cube':
            const mesh = createBoxMesh(simObject);
            simObject.geometry = mesh[0];
            simObject.material = mesh[1];
            break;

        default:
            console.error('Unknown SimObject Type: ', simObject.type);
            break;
    }
}

export function addSimObject(blockUUID, fieldValues, pickedColour) {
    let newSimObject = new SimObject;
    newSimObject.name = blockUUID;
    console.log(pickedColour);
    if (fieldValues != undefined) {
        newSimObject.setFieldValues(fieldValues);
        newSimObject.updateFromFieldValues();
    }
    if (pickedColour != undefined) {
        newSimObject.colour = pickedColour;
        console.log(pickedColour);
    }
    addGeometry(newSimObject);
    setSpawnPosition(newSimObject);
    newSimObject.createBody();
    newSimObject.add();
    newSimObject.updateFieldValues();
    simObjects.push(newSimObject);
}

//Functions for positioning simObjects
function setSpawnPosition(simObject) {
    switch (simObject.type) {
        case 'cube':
            stackCubes(simObject);
            break;
=======
//container for storing simObject properties
//x, y, z, rotX, rotY, rotZ, name, type, attached
export class simObject {
    constructor() {
        this.name = 'default';
        this.type = 'cube';
        //this.position = new THREE.Vector3(3, 3, 0.25);
        this.x = 5;
        this.y = 5;
        this.z = 0;
        this.rotX = 0;
        this.rotY = 0;
        this.rotZ = 0;
        this.sizeX = .5;
        this.sizeY = .5;
        this.sizeZ = .5;
        this.attached = false;
    }
}

//Functions for creating meshes

//creates a three mesh from an simObject depending on simObject.type
function createMesh(simObject) {

    if (simObject.type === 'cube') {
        const cubeGeometry = new THREE.BoxBufferGeometry(simObject.sizeX * 10,
                                                         simObject.sizeY * 10,
                                                         simObject.sizeZ * 10,
                                                         10,
                                                         10);

        const cubeMaterial = new THREE.MeshPhongMaterial({ color: randomColor() });
        let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.castShadow = true;
        cubeMesh.position.x  = simObject.x;
        cubeMesh.position.y  = simObject.y;
        cubeMesh.position.z  = simObject.z + 0.25;
        cubeMesh.scale.x = 0.1;
        cubeMesh.scale.y = 0.1;
        cubeMesh.scale.z = 0.1;
        cubeMesh.name = simObject.name;
        addMesh(cubeMesh);
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)

        default:
            console.error('Unknown SimObject Type: ', simObject.type);
            break;
    }
}

function stackCubes(simObject){
    const shift = zShiftCubes(simObject);
    if (shift > 0) {
        simObject.spawnPosition.z = simObject.spawnPosition.z + shift;
        return stackCubes(simObject);
    } else { return; }
}

<<<<<<< HEAD
function zShiftCubes(simObject) {
    let returnVal = 0;
    for (let k = 0; k < simObjects.length; k++) {
        if (simObject.spawnPosition.distanceTo(simObjects[k].spawnPosition)
                    < (simObject.size.z * .5)) {
            returnVal = simObject.size.z;
        }
=======
    if (simObject.type === 'cylinder') {
        const cylinderGeometry = new THREE.CylinderBufferGeometry(simObject.sizeX,
                                                                  simObject.sizeY,
                                                                  simObject.sizeZ,
                                                                  10,
                                                                  10);

        const cylinderMaterial = new THREE.MeshPhongMaterial({ color: randomColor() });
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinderMesh.castShadow = true;
        cylinderMesh.position.x  = simObject.x;
        cylinderMesh.position.y  = simObject.y;
        cylinderMesh.position.z  = simObject.z;
        cylinderMesh.name = simObject.name;
        addMesh(cylinderMesh);
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
    }
    return returnVal;
}

<<<<<<< HEAD
//Removes the simObject from the simObjects array and from the threejs scene
export function remSimObjects(ids) {
    for (const id of ids) {
        const deletedSimObject = simObjects.find(simObject => simObject.name === id);
        const idx = simObjects.findIndex(simObject => simObject.name === id);
        if (deletedSimObject != undefined) {
            deletedSimObject.remove();
            simObjects.splice(idx, 1);
=======
//Functions for simObjects

//removes the three mesh and creates a new one with the new type
export function changeSimObjectType(simObjectName, type) {
    const idx = getSimObjectIdx(simObjects, simObjectName);
    simObjects[idx].type = type;
    remMesh(simObjects[idx]);
    createMesh(simObjects[idx]);
}

//Changes the position of a simObject and calls moveMesh with the new position.
//Note that the movement of the mesh is not animated.
//It will pop out and in of existence.
//We don't need an animation at this point.
export function changeSimObjectPosition(simObject) {
    const idx = getSimObjectIdx(simObjects, simObject.name);
    simObjects[idx].x = simObject.x;
    simObjects[idx].y = simObject.y;
    simObjects[idx].z = simObject.z;
    moveMesh(simObjects[idx]);
    updateBodys([simObjects[idx]])
}

export function changeSimObjectOrientation(simObject) {
    const idx = getSimObjectIdx(simObjects, simObject.name);
    simObjects[idx].rotX = simObject.rotX;
    simObjects[idx].rotY = simObject.rotY;
    simObjects[idx].rotZ = simObject.rotZ;
    rotMesh(simObjects[idx]);
    updateBodys([simObjects[idx]])
}

//Takes an array of blockly block uuids and turns them into simObjects
//and the corresponding three mesh with the same name.
//To do this it looks for the uuid in the simObjects array and if returned
//undefined it will add a new simObject and call createMesh. I do not think
//looking for an undefined is a good desing choice, but it is working as intended
export function addSimObjects(simObjectNames) {
    for (let i = 0; i < simObjectNames.length; i++) {
        if (simObjects.find(object => object.name === simObjectNames[i]) === undefined){
            let newSimObject = new simObject;
            newSimObject.name = simObjectNames[i];
            simObjects.push(newSimObject);
            createMesh(newSimObject);
<<<<<<< HEAD
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
=======
            createBody(newSimObject);
>>>>>>> 3862ed5 (Started to add physics to the simulation. Not really working right now. Object pickup is broken, in this commit. Objects only fall if you move the camera, this is intentional.)
        }
    }
}

<<<<<<< HEAD
export function resetAllSimObjects () {
    if (simObjects.length > 0) {
        for (const simObject of simObjects) {
            simObject.reset();
=======
//Removes the simObject from the simObjects array and calls remMesh
//I need to implement some form of error checking here.
export function remSimObjects(simObjectNames) {
    for (let i = 0; i < simObjectNames.length; i++) {
        for (let k = 0; k < simObjects.length; k++) {
            if (simObjects[k].name == simObjectNames[i]) {
                remMesh(simObjects[k]);
                simObjects.splice(k, 1);
            }
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
        }
    }
}

//transformControl event functions

//Called by mousemove in scene.js
export function setTCSimObjects(raycaster) {
    const intersections = raycaster.intersectObjects(simObjects);
    const intersected = intersections.length == 1;
    const workspace = Blockly.getMainWorkspace();
    if (intersected) {
        console.log('intersections.length', intersections.length);

        if (intersections[0].object.control.visible != intersected) {
            intersections[0].object.control.visible = intersected;
            const colour = intersections[0].object.material.color.getHex();
            intersections[0].object.material.emissive.setHex(colour);
            intersections[0].object.render();
            //Highlights the corresponding Blockly block.
            workspace.highlightBlock(intersections[0].object.name);
        }
    } else {
        for (const simObject of simObjects) {
            simObject.control.visible = false;
            simObject.material.emissive.setHex(0x000000);
            simObject.render();
            //Switches the highlighting of the corresponding Blockly block off.
            workspace.highlightBlock(null);
        }
    }
}

//Called by onClick in scene.js
export function setTCSimObjectsOnClick(raycaster) {
    const intersections = raycaster.intersectObjects(simObjects);
    const scene = getScene();
    for (let intersect of intersections) {
        const mode = intersect.object.control.getMode();
        scene.remove(intersect.object.control);
        if (mode == 'translate'){
            intersect.object.control.setMode('rotate');
        }
        if (mode == 'rotate'){
            intersect.object.control.setMode('translate');
        }
        scene.add(intersect.object.control);
        intersect.object.render();
    }
}

//Returns a list with all names of simObjects (the uuids of the blockly blocks)
//currently in the simObjects array
//I need to implement some form of error checking here.
export function getSimObjectsNames() {
    let simObjectsNames = [];
    simObjects.forEach(simObject => {simObjectsNames.push(simObject.name)});
    return simObjectsNames
}

//Returns all simObjects
export function getSimObjects() {
<<<<<<< HEAD
    let returnVal = undefined;
    if (simObjects.length > 0) {
        returnVal = simObjects;
    }
    return returnVal;
=======
        return simObjects
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
}

//Returns the simObject by name (the uuid of the blockly block)
export function getSimObject(simObjectName) {
<<<<<<< HEAD
    let returnVal = undefined;
        for (let i = 0; i < simObjects.length; i++) {
            if (simObjectName == simObjects[i].name) { returnVal = simObjects[i]; }
        }
     return returnVal;
}

//Returns the index of a simObject in the simObjects array
export function getSimObjectIdx(simObjectName) {
    let returnVal = undefined;
=======
        const idx = getSimObjectIdx(simObjects, simObjectName);
        return simObjects[idx]
}

//Returns the index of a simObject in the simObjects array
//I need to implement some form of error checking here.
function getSimObjectIdx(simObjects, simObjectName) {
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].name == simObjectName){ returnVal = i; }
    }
    return returnVal;
}

<<<<<<< HEAD
export function getSimObjectByPos(position, accuracy) {
    let returnVal = undefined;
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].position.distanceTo(position) <= accuracy) {
            returnVal = simObjects[i];
        }
    }
    return returnVal;
=======
//Functions for gripping

export function detachFromGripper(mesh) {
    console.log('> Object dropped!');
    getSimObject(mesh.name).attached = false;
    remFromTCP(mesh);
}

export function attachToGripper(mesh) {
    console.log('> Object gripped!');
    getSimObject(mesh.name).attached = true;
    addToTCP(mesh);
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
}

//Determin if a simobject is attached to the TCP
export function isAttached() {
    let attached = false;
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].attached == true) { attached = true; }
<<<<<<< HEAD
=======
    }
    return attached
}

//Return the first attached simObject
export function getAttachedObject() {
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].attached == true) { return simObjects[i] }
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
    }
}

<<<<<<< HEAD
//Return the first attached simObject
export function getAttachedObject() {
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].attached == true) { return simObjects[i] }
    }
}

//Utils
=======
//Utils

>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
//Random integers. They are essential.
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

//random colors for fancy cubes
<<<<<<< HEAD
export function randomColour() {
    const hexDigits = '0123456789ABCDEF';
    let colour = '#';
    for (let i = 0; i < 6; i++) {
        colour += hexDigits[Math.floor(Math.random() * 16)];
    }
    return colour;
=======
function randomColor() {
    const hexDigits = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += hexDigits[Math.floor(Math.random() * 16)];
    }
    return color;
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
}
