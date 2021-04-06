import * as THREE from 'three';
import { addMesh,
         remMesh,
         getMesh,
         moveMesh,
         rotMesh,
         addToTCP } from '../scene';

// TODO: Error checking!

//This is not finished right now. Using global variables is not a good practice.
let simObjects = [];

//container for storing simObject properties
export class simObject {
    constructor(x, y, z, rotX, rotY, rotZ, name, type, attached) {
        this.name = 'default';
        this.type = 'cube';
        this.x = 3;
        this.y = 3;
        this.z = 0.25;
        this.rotX = 0;
        this.rotY = 0;
        this.rotZ = 0;
        this.sizeX = .5;
        this.sizeY = .5;
        this.sizeZ = .5;
        this.attached = false;
    }
}

//creates a three mesh from an simObject depending on simObject.type
function createMesh(simObject){
    //random colors for fancy cubes
    function randomColor() {
        const hexDigits = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += hexDigits[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    if(simObject.type === 'cube'){
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
        cubeMesh.position.z  = simObject.z;
        cubeMesh.scale.x = 0.1;
        cubeMesh.scale.y = 0.1;
        cubeMesh.scale.z = 0.1;
        cubeMesh.name = simObject.name;
        addMesh(cubeMesh);

    }

    if(simObject.type === 'cylinder'){
        const cylinderGeometry = new THREE.CylinderBufferGeometry(simObject.sizeX, simObject.sizeY, simObject.sizeZ, 10, 10);
        const cylinderMaterial = new THREE.MeshPhongMaterial({ color: randomColor() });
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinderMesh.castShadow = true;
        cylinderMesh.position.x  = simObject.x;
        cylinderMesh.position.y  = simObject.y;
        cylinderMesh.position.z  = simObject.z;
        cylinderMesh.name = simObject.name;
        addMesh(cylinderMesh);
    }
}

//removes the three mesh and creates a new one with the new type
export function changeSimObjectType(simObjectName, type){
    const idx = getSimObjectIdx(simObjects, simObjectName);
    simObjects[idx].type = type;
    remMesh(simObjects[idx]);
    createMesh(simObjects[idx]);
}

//Changes the position of a simObject and calls moveMesh with the new position.
//Note that the movement of the mesh is not animated.
//It will pop out and in of existence.
//We don't need an animation at this point.
export function changeSimObjectPosition(simObject){
    const idx = getSimObjectIdx(simObjects, simObject.name);
    simObjects[idx].x = simObject.x;
    simObjects[idx].y = simObject.y;
    simObjects[idx].z = simObject.z;
    moveMesh(simObjects[idx]);
}

export function changeSimObjectOrientation(simObject){
    const idx = getSimObjectIdx(simObjects, simObject.name);
    simObjects[idx].rotX = simObject.rotX;
    simObjects[idx].rotY = simObject.rotY;
    simObjects[idx].rotZ = simObject.rotZ;
    rotMesh(simObjects[idx]);
}

//Takes an array of blockly block uuids and turns them into simObjects
//and the corresponding three mesh with the same name.
//To do this it looks for the uuid in the simObjects array and if returned
//undefined it will add a new simObject and call createMesh. I do not think
//looking for an undefined is a good desing choice, but it is working as intended
export function addSimObjects(simObjectNames){
    for(let i = 0; i < simObjectNames.length; i++){
        if(simObjects.find(object => object.name === simObjectNames[i]) === undefined){
            let newSimObject = new simObject;
            newSimObject.name = simObjectNames[i];
            simObjects.push(newSimObject);
            createMesh(newSimObject);
        }
    }
}

//Removes the simObject from the simObjects array and calls remMesh
//I need to implement some form of error checking here.
export function remSimObjects(simObjectNames){
    for(let i = 0; i < simObjectNames.length; i++){
        for(let k = 0; k < simObjects.length; k++){
            if(simObjects[k].name == simObjectNames[i]){
                remMesh(simObjects[k]);
                simObjects.splice(k, 1);
            }
        }
    }
}

//Returns a list with all names of simObjects (the uuids of the blockly blocks)
//currently in the simObjects array
//I need to implement some form of error checking here.
export function getSimObjectsNames(){
    let simObjectsNames = [];
    simObjects.forEach(simObject => simObjectsNames.push(simObject.name));
    return simObjectsNames
}

export function getSimObject(simObjectName){
        const idx = getSimObjectIdx(simObjects, simObjectName);
        return simObjects[idx]
}

//Returns the index of a simObject in the simObjects array
//I need to implement some form of error checking here.
function getSimObjectIdx(simObjects, simObjectName){
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].name == simObjectName) return i;
    }
}


//Checks if the tcp is on top of an simObjects mesh. experimenting, Lukas
export function watchObjects(position, scene){
    //Look if something is already attached to the TCP
    if (isAttached() == false) {
        let meshes = [];
        for (let i = 0; i < simObjects.length; i++){
            const mesh = getMesh(simObjects[i]);
            if (mesh != undefined && mesh.parent === scene){
                meshes.push(mesh);
            }
        }
        for(let i = 0; i < meshes.length; i++){
            //console.log('Mesh is at: ', mesh.position);
            if (meshes[i].position.x >= position.x - 0.2
                && meshes[i].position.x <= position.x + 0.2){

                if (meshes[i].position.y >= position.y - 0.2
                    && meshes[i].position.y <= position.y + 0.2){

                    if (meshes[i].position.z >= position.z - 0.2
                        && meshes[i].position.z <= position.z + 0.2){

                        //Placeholder for gripper status
                        if (true){
                            //console.log('Mesh collision at position: ', position);
                            addToTCP(meshes[i]);
                            let attachedSimObject = getSimObject(meshes[i].name);
                            attachedSimObject.attached = true;
                        }
                    }
                }
            }
        }
    }
}

//Determin if a simobject is attached to the TCP
function isAttached(){
    let attached = false;
    for (let i = 0; i < simObjects.length; i++){
        if (simObjects[i].attached == true){
            attached = true;
        }
    }
    return attached;
}

//utils
//Random integers. They are essential.
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
