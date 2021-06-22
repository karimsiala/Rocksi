import * as Blockly from "blockly";
import '@blockly/field-slider';
import { getSimObject,
         getSimObjectIdx,
         randomColour,
         isAttached } from "../../simulator/objects/createObjects";
import Simulation from "../../simulator/simulation";


const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];

Blockly.Blocks["gripper_open"] = {
	init: function () {
		this.jsonInit({
			type: "gripper_open",
			message0: "Greifer öffnen",
			previousStatement: null,
			nextStatement: null,
			style: 'objects_blocks',
			tooltip: "Öffnet den Greifer auf volle Weite",
			helpUrl: "",
		});
	},
};

Blockly.Blocks["gripper_close"] = {
	init: function () {
		this.jsonInit({
			type: "gripper_close",
			message0: "Greifer schließen",
			previousStatement: null,
			nextStatement: null,
			style: 'objects_blocks',
			tooltip: "Schließt den Greifer vollständig",
			helpUrl: "",
		});
	},
};

//simObjects stuff, Lukas

//The SimObject:
Blockly.Blocks['add_sim_object'] = {
	init: function () {
        this.jsonInit({
            type: "add_sim_object",
            message0: "Generiert einen %1",
            args0: [
                {
                    "type": "field_dropdown",
                    "name": "OBJECT_SHAPE",
                    "options": [
                        [
                            "Würfel",
                            "cube"
                        ],
                        [
                            "Kugel",
                            "sphere"
                        ],
                        [
                            "Stein",
                            "rock"
                        ],
                        [
                            "Welle",
                            "shaft"
                        ],
                        [
                            "Lade...",
                            "custom"
                        ],
                    ]
                },
            ],
            message1: "in der Farbe %1 ",
            args1: [
                {
                    type: "input_value",
                    name: "COLOUR",
                    check: "Colour",
                },
            ],
            message2: "an Position %1 ",
            args2:[
                {
                    type: "input_value",
                    name: "POSE",
                    check: "TaskspacePose",
                },
            ],
            message3: "in der Skalierung %1 ",
            args3:[
                {
                    type: "field_slider",
                    name: "SCALE",
                    value: 1,
                    min: 0.001,
                    max: 10,
                    precision: 0.001

                },
            ],
            inputsInline: false,
            previousStatement: null,
            nextStatement: null,
            style: 'objects_blocks',
            tooltip: "Fügt ein Objekt hinzu, diese wird zur Laufzeit erstellt.",
            helpUrl: "",
        });
    },

    getTaskspacePose: function () {
        let fieldValues = [];
        const simObject = getSimObject(this.id);
        if (simObject != undefined) {
            simObject.updateFieldValues();
            fieldValues = simObject.getFieldValues();
        }
        return fieldValues;
    },

    setTaskspacePose: function (pose) {
        const simObject = getSimObject(this.id);
        if (simObject !== undefined) {
            simObject.setFieldValues(pose);
            simObject.updateFromFieldValues();
            Simulation.instance.renderCallback();
        }
    },

	onchange: function (event) {
        const poseBlock = this.getInputTargetBlock('POSE');
        const colorBlock = this.getInputTargetBlock('COLOUR');

        if (poseBlock != null && event.blockId === poseBlock.id && fieldKeys.includes(event.name)) {
            let fieldValues = [];
            const simObject = getSimObject(this.id)
            for (let i = 0; i < fieldKeys.length; i++) {
                fieldValues.push(poseBlock.getFieldValue(fieldKeys[i]));
            }
            simObject.setFieldValues(fieldValues);
            simObject.updateFromFieldValues();
            simObject.render();
        }

        let simObject = getSimObject(this.id);
        if (!simObject) {
            return;
        }

        if (event.blockId === this.id && event.name == 'OBJECT_SHAPE') {
            simObject.changeShape(event.newValue);
        }

        if (event.blockId === this.id && event.name == 'SCALE') {
            simObject.setScale(event.newValue);
        }


        if (colorBlock != null) {
            let color = simObject.color;

            if (event.blockId === colorBlock.id) {
                if (colorBlock.type == 'colour_random') {
                    color = randomColour();
                }
                else if (colorBlock.type == 'colour_picker') {
                    color = colorBlock.getFieldValue('COLOUR');
                }
            }

            // Do this no matter what so the simObject updates its texture
            simObject.setColor(color);
            simObject.render();

            if (colorBlock.type == 'colour_random') {
                colorBlock.setColour(simObject.color);
            }
        }
    }
};

//The physics_done block
Blockly.Blocks["physics_done"] = {
	init: function () {
		this.jsonInit({
			type: "physics_done",
			message0: "Physiksimulation abgeschlossen?",
			output: "Boolean",
			style: 'objects_blocks',
			tooltip:
				"Gibt Wahr zurück solange sich noch Objekte bewegen (nicht der Roboter).",
			helpUrl: "",
		});
    }
}

//The is_attached block
Blockly.Blocks["is_attached"] = {
	init: function () {
		this.jsonInit({
			type: "is_attached",
			message0: "Gegriffen?",
			output: "Boolean",
			style: 'objects_blocks',
			tooltip:
				"Gibt Wahr zurück wenn der Roboter etwas gegriffen hat",
			helpUrl: "",
		});
    }
}
