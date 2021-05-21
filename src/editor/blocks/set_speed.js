import * as Blockly from "blockly";

Blockly.Blocks["set_speed"] = {
	init: function () {
		this.jsonInit({
			"type": "set_speed",
			"message0": "Geschwindigkeit %1 %2 %%",
			"args0": [
			  {
				"type": "field_dropdown",
				"name": "MOTION_TYPE",
				"options": [
					["Bewegung", "move"],
					["Greifer", "gripper"]
				]
			  },
			  {
				"type": "field_number",
				"name": "SPEED",
				"value": 50,
				"min": 1,
				"max": 100,
				"precision": 1
			  }
			],
			previousStatement: null,
			nextStatement: null,
			style: 'extras_blocks',
			"tooltip": "Ändere die Bewegungsgeschwindigkeit des Roboters.",
			"helpUrl": ""
		  });
	},
};

Blockly.JavaScript["set_speed"] = function (block) {
	var motion = block.getFieldValue('MOTION_TYPE');
	var speed = block.getFieldValue('SPEED');
	
	var code = 'robot("setParam", "velocity/' + motion + '", ' + speed/100 + ');';
	return code;
};
