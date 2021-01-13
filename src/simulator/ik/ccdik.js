import { Vector3, Quaternion, Object3D } from 'three'

/*
 * Cyclic Coordinate Descent
 * Inspired by https://zalo.github.io/blog/inverse-kinematics/
 */
class CCDIK {
    constructor(scene, robot) {}

    solve(target, tip, joints, {
        iterations = 1,
        jointLimits = {},
        apply = false
    } = {}) {
        if (typeof joints === 'undefined') {
            joints = robot.arm.movable;
        }

        const orig = {};
        const solution = {};

        let targetPosition = new Vector3();
        let tipPosition = new Vector3();
        let deltaNormal = new Vector3();

        // Using a dummy object or pose always resulted in some slight difference to the actual robot, so
        // we're using the robot as our representation and then reset it to its original configuration later
        for (const joint of joints) {
            orig[joint.name] = joint.angle;
        }

        target.getWorldPosition(targetPosition);
        tip.getWorldPosition(tipPosition);

        for (let iter = 0; iter < iterations; iter++) {
            for (let i = joints.length - 1; i >= 0; i--) {
                const joint = joints[i];

                // Vector to the TCP and target from the joint's POV. This algorithm is iterative in the sense 
                // that we update the tip position after every joint adjustment. The solution won't be perfect
                // so running the solver again will improve on the previous solution.
            
                let tcpDirection = joint.worldToLocal(tipPosition.clone()).normalize();
                let targetDirection = joint.worldToLocal(targetPosition.clone()).normalize();

                // Project direction vectors onto the joint's rotation plane
                tcpDirection = tcpDirection.projectOnPlane(joint.axis);
                targetDirection = targetDirection.projectOnPlane(joint.axis);
                deltaNormal.crossVectors(tcpDirection, targetDirection).normalize();

                // Depending on which direction we have to turn, the rotation axes will be parallel or anti-parallel
                let alignment = deltaNormal.dot(joint.axis);
                let delta = Math.sign(alignment) * tcpDirection.angleTo(targetDirection);
                let angle = joint.angle + delta;

                // Alternative: more performant, less intuitive (see https://stackoverflow.com/a/33920320/2061551)
                // let v1 = new Vector3();
                // let v2 = new Vector3();
                // let delta = Math.atan2(v1.crossVectors(tcpDirection, targetDirection).dot(joint.axis),
                //     v2.copy(tcpDirection).dot(targetDirection));
                // let angle = joint.angle + delta;
                
                const limit = jointLimits[joint.name];
                if (limit) {
                    if ('lower' in limit && angle < limit['lower']) {
                        // delta = limit['lower'] - joint.angle;
                        angle = Math.max(limit['lower'], angle);
                    }
                    if ('upper' in limit && angle > limit['upper']) {
                        // delta = limit['upper'] - joint.angle;
                        angle = Math.min(limit['upper'], angle);
                    }
                }

                joint.setJointValue(angle);
                solution[joint.name] = angle;
            }
        }

        if (!apply) {
            for (const joint of joints) {
                joint.setJointValue(orig[joint.name]);
            }
        }

        return solution;
    }
};

export default CCDIK;
