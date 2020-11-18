import { vec2, normalizeAngle } from '../../math'

const DistanceConstraint = (nodeA, nodeB, {
    stiffness = 1,
    distribution = 1,
    distance = vec2.distance(nodeA.position, nodeB.position),
    minDistance = 0
}) => ({
    get nodeA(){ return nodeA },
    get nodeB(){ return nodeB },
    resolve: deltaTime => {
        let dx = nodeA.position[0] - nodeB.position[0]
        let dy = nodeA.position[1] - nodeB.position[1]
        let measuredDistance = Math.sqrt(dx * dx + dy * dy) || 1e-6
        if(minDistance > measuredDistance) return false
        let factor = deltaTime * (1 / measuredDistance) * (measuredDistance - distance) * stiffness
        nodeA.position[0] -= dx * factor * distribution
        nodeA.position[1] -= dy * factor * distribution
        nodeB.position[0] += dx * factor * (1 - distribution)
        nodeB.position[1] += dy * factor * (1 - distribution)
    }
})

const PinConstraint = (nodeA, {
    stiffness = 1,
    position = vec2.copy(nodeA.position)
}) => ({
    get nodeA(){ return nodeA },
    resolve: deltaTime => {
        const velocity = vec2.subtract(position, nodeA.position)
        vec2.scale(velocity, deltaTime * stiffness, velocity)
        vec2.add(nodeA.position, velocity, nodeA.position)
    }
})

const AngleConstraint = (nodeA, nodeB, nodeC, {
    stiffness = 1,
    threshold = 0,
    angle = vec2.angle(vec2.subtract(nodeA.position, nodeB.position),
                       vec2.subtract(nodeC.position, nodeB.position))
}) => ({
    get nodeA(){ return nodeA },
    get nodeB(){ return nodeB },
    get nodeC(){ return nodeC },
    resolve: deltaTime => {
        let measuredAngle = vec2.angle(
            vec2.subtract(nodeA.position, nodeB.position),
            vec2.subtract(nodeC.position, nodeB.position)
        )
        let difference = normalizeAngle(measuredAngle - angle)
        if(Math.abs(difference) < threshold) return false
        difference += difference < 0 ? threshold : -threshold
        difference *= deltaTime * stiffness
        
        //TODO add distribution
        //vec2.rotate(nodeA.position, nodeB.position, difference, nodeA.position)
        vec2.rotate(nodeC.position, nodeB.position, -difference, nodeC.position)
        
        ///vec2.rotate(nodeB.position, nodeA.position, difference, nodeB.position)
        //vec2.rotate(nodeB.position, nodeC.position, -difference, nodeB.position)
    }
})

const Node = (x, y, friction) => ({
    position: vec2(x, y),
    previousPosition: vec2(x, y),
    friction
})

const VerletSystem = ({
    friction = 0.9,
    relaxationSteps = 1
} = {}) => {
    const nodes = [],
          constraints = [],
          system = {
              get nodes(){ return nodes },
              get constraints(){ return constraints },
              add: (x, y, f = friction) => nodes.push(Node(x, y, f)),
              constraint: {
                  pin: (idx, position, stiffness = 1) => 
                      constraints.push(PinConstraint(nodes[idx], {
                          position, stiffness
                      })),
                  distance: (idx0, idx1, distance, stiffness = 1) => 
                      constraints.push(DistanceConstraint(nodes[idx0], nodes[idx1], {
                          distance, stiffness,
                      })),
                  angle: (idx0, idx1, idx2, angle, threshold, stiffness = 1) => 
                      constraints.push(AngleConstraint(nodes[idx0], nodes[idx1], nodes[idx2], {
                          angle, threshold, stiffness,
                      }))
              },
              integrate: deltaTime => {
                  const velocity = vec2()
                  for(let i = nodes.length - 1; i >= 0; i--){
                      let node = nodes[i]
                      vec2.subtract(node.position, node.previousPosition, velocity)
                      vec2.scale(velocity, node.friction, velocity)
                      vec2.copy(node.position, node.previousPosition)
                      vec2.add(node.position, velocity, node.position)
                  }
                  
                  for(let i = 0, step = 1/relaxationSteps; i < relaxationSteps; i++)
                      for(let j = 0; j < constraints.length; j++)
                          constraints[j].resolve(step)
              },
              applyTransform: transform => nodes.forEach(node => {
                  vec2.transform(node.position, transform, node.position)
                  vec2.copy(node.position, node.previousPosition)
              })
          }
    return system
}

export { VerletSystem }