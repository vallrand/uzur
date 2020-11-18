export const Lifecycle = (facade, {
    health,
    maxHealth = health,
    update, filter
}) => ({ value }) => {
    const multiplier = filter ? filter() : 1
    health -= value * multiplier
    update(Math.max(0, health / maxHealth))
    if(health <= 0) facade.instance.handle('death')
    return health
}