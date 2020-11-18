import { vec2, shortestAngle } from '../../math'

export const Tail = ([ head, ...tail ], stiffness = 1) =>
    deltaTime => {
        for(let i = 0, node, prev = head; i < tail.length; prev = node, i++){
            node = tail[i]
            let dx = node.x - prev.x,
                dy = node.y - prev.y,
                distance = Math.sqrt(dx * dx + dy * dy) || 1e-6,
                factor = Math.min(1, deltaTime * 60) * stiffness * (1 / distance) * (distance - node.radius)
            node.rotation = Math.atan2(dy, dx)
            node.x -= dx * factor
            node.y -= dy * factor
        }
    }

export const axisAlignedRestriction = ({
    instance,
    target,
    horizontal = [0, 0],
    vertical = [0, 0],
    offset = [0, 0],
    attract = [0, 0]
}) => deltaTime => {
    let boundary,
        dx = instance.x - target.x - offset[0],
        dy = instance.y - target.y - offset[1]
    
    instance.x -= Math.min(1, 1e3 * deltaTime * attract[0]) * dx
    instance.y -= Math.min(1, 1e3 * deltaTime * attract[1]) * dy
    
    if(instance.x < (boundary = target.x + horizontal[0] + offset[0])) instance.x = boundary
    else if(instance.x > (boundary = target.x + horizontal[1] + offset[0])) instance.x = boundary
    
    if(instance.y < (boundary = target.y + vertical[0] + offset[1])) instance.y = boundary
    else if(instance.y > (boundary = target.y + vertical[1] + offset[1])) instance.y = boundary
}

export const resolveSoftConstraint = ({
    instance,
    target,
    offset,
    pivot,
    angleRange,
    stiffness
}) => deltaTime => {
    let position = vec2.rotate(offset, vec2.ZERO, target.rotation)
    vec2.add(position, target.coordinates, position)
    
    let distance = vec2.magnitude(pivot)
    
    let delta = vec2.subtract(instance.coordinates, position)
    let angle = Math.atan2(delta[1], delta[0])
    
    let rotation = target.rotation + Math.atan2(offset[1], offset[0])
    
    angle = rotation + Math.clamp(0.64 * shortestAngle(rotation, angle), angleRange[0], angleRange[1])
    
    let angleOffset = -Math.atan2(pivot[1], pivot[0])
    let deltaAngle = shortestAngle(instance.rotation - angleOffset, angle)
    deltaAngle *= Math.min(1, deltaTime * 60 * stiffness)
    angle = instance.rotation - angleOffset + deltaAngle
    
    instance.rotation = angle + angleOffset
    instance.x = position[0] + distance * Math.cos(angle)
    instance.y = position[1] + distance * Math.sin(angle)
}

export const resolveRigidConstraint = ({
    instance,
    target,
    offset = vec2.ZERO,
    angleOffset = 0
}) => {
    let position = vec2.rotate(offset, vec2.ZERO, target.rotation)
    vec2.add(position, target.coordinates, position)
    
    instance.rotation = angleOffset + target.rotation
    instance.x = position[0]
    instance.y = position[1]
}

export const checkBoundaries = (instance, stage) => (
    instance.coordinates[0] + (instance.boundingRadius || 0) > -0.5 * stage.width &&
    instance.coordinates[0] - (instance.boundingRadius || 0) < 0.75 * stage.width &&
    instance.coordinates[1] + (instance.boundingRadius || 0) > -0.5 * stage.height &&
    instance.coordinates[1] - (instance.boundingRadius || 0) < 0.5 * stage.height
)

export const calculateBoundingSphere = instance => 0.5 * instance.components
.filter(component => component.textureData)
.map(({ scaleX, scaleY, textureData: { width, height } }) => Math.min(scaleX * width, scaleY * height))
.reduce((max, size) => Math.max(max, size), 0)