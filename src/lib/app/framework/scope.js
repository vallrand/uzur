import { combine, UniqueKey } from '../../util'

export default function(scope = UniqueKey()){
    return combine({}, this, {
        proxy: this,
        procedure: parameters => Object.assign(this.procedure(parameters), { [scope]: true }),
        create: parameters => Object.assign(this.create(parameters), { [scope]: true }),
        clear: this.clear.bind(this, item => item[scope])
    })
}